import bcrypt from 'bcryptjs';
import { Response } from 'express';
import { createId, getDatabase } from '../storage/database';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { AppointmentRecord, AuditLogRecord, ChildRecord, UserRecord } from '../types/entities';

const mapAppointmentsWithRelations = async (appointments: AppointmentRecord[]) => {
    const database = getDatabase();
    const [children, users, vaccines] = await Promise.all([
        database.childrenStore.list(),
        database.usersStore.list(),
        database.vaccinesStore.list()
    ]);

    const childrenById = new Map(children.map((child) => [child.id, child]));
    const usersById = new Map(users.map((user) => [user.id, toPublicUser(user)]));
    const vaccinesById = new Map(vaccines.map((vaccine) => [vaccine.id, vaccine]));

    return appointments.map((appointment) => {
        const child = childrenById.get(appointment.childId);
        const user = child ? usersById.get(child.userId) : usersById.get(appointment.userId);
        const vaccine = vaccinesById.get(appointment.vaccineId);

        return {
            ...appointment,
            childName: child?.fullName,
            user,
            userName: user?.fullName,
            vaccine: vaccine?.name
        };
    });
};

const toPublicUser = (user: UserRecord) => {
    const { password: _password, ...publicUser } = user;
    return publicUser;
};

const appendAuditLog = async (
    req: AuthenticatedRequest,
    entityType: AuditLogRecord['entityType'],
    entityId: string,
    action: string,
    message: string
) => {
    if (!req.user) {
        return;
    }

    const database = getDatabase();
    const auditLogs = await database.auditLogsStore.list();
    const nextLog: AuditLogRecord = {
        id: createId('audit'),
        actorUserId: req.user.id,
        actorRole: req.user.role,
        action,
        entityType,
        entityId,
        message,
        createdAt: new Date().toISOString()
    };

    await database.auditLogsStore.save([nextLog, ...auditLogs].slice(0, 500));
};

const deleteUserCascade = async (userId: string) => {
    const database = getDatabase();
    const users = await database.usersStore.list();
    const children = await database.childrenStore.list();
    const appointments = await database.appointmentsStore.list();
    const vaccineDoses = await database.vaccineDosesStore.list();

    const childIds = new Set(children.filter((child) => child.userId === userId).map((child) => child.id));

    await database.usersStore.save(users.filter((user) => user.id !== userId));
    await database.childrenStore.save(children.filter((child) => child.userId !== userId));
    await database.appointmentsStore.save(appointments.filter((appointment) => appointment.userId !== userId && !childIds.has(appointment.childId)));
    await database.vaccineDosesStore.save(vaccineDoses.filter((dose) => dose.userId !== userId && !childIds.has(dose.childId)));
};

const deleteChildCascade = async (childId: string) => {
    const database = getDatabase();
    const children = await database.childrenStore.list();
    const appointments = await database.appointmentsStore.list();
    const vaccineDoses = await database.vaccineDosesStore.list();

    await database.childrenStore.save(children.filter((child) => child.id !== childId));
    await database.appointmentsStore.save(appointments.filter((appointment) => appointment.childId !== childId));
    await database.vaccineDosesStore.save(vaccineDoses.filter((dose) => dose.childId !== childId));
};

export const getAdminUsers = async (_req: AuthenticatedRequest, res: Response) => {
    try {
        const users = await getDatabase().usersStore.list();
        res.status(200).json(users.map(toPublicUser));
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const createAdminUser = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { fullName, gender, dateOfBirth, nationalId, address, phoneNumber, password, role } = req.body;

        if (!fullName || !gender || !dateOfBirth || !nationalId || !address || !phoneNumber || !password) {
            return res.status(400).json({ message: 'Missing required user fields' });
        }

        const usersStore = getDatabase().usersStore;
        const users = await usersStore.list();

        if (users.some((user) => user.nationalId === nationalId)) {
            return res.status(409).json({ message: 'User already exists' });
        }

        const nextRole = role === 'admin' || role === 'health-center' ? role : 'citizen';
        const timestamp = new Date().toISOString();
        const newUser: UserRecord = {
            id: createId('user'),
            fullName,
            role: nextRole,
            isActive: req.body.isActive === false ? false : true,
            gender,
            dateOfBirth,
            nationalId,
            address,
            phoneNumber,
            password: await bcrypt.hash(password, 10),
            createdAt: timestamp,
            updatedAt: timestamp
        };

        await usersStore.save([...users, newUser]);
        await appendAuditLog(req, 'user', newUser.id, 'create-user', `Created ${newUser.role} account for ${newUser.fullName}`);
        res.status(201).json(toPublicUser(newUser));
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const updateAdminUser = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const usersStore = getDatabase().usersStore;
        const users = await usersStore.list();
        const userIndex = users.findIndex((user) => user.id === req.params.id);

        if (userIndex === -1) {
            return res.status(404).json({ message: 'User not found' });
        }

        const currentUser = users[userIndex];
        const nextRole = req.body.role === 'admin' || req.body.role === 'health-center' || req.body.role === 'citizen'
            ? req.body.role
            : currentUser.role;
        const nextIsActive = req.body.isActive === undefined ? currentUser.isActive : Boolean(req.body.isActive);

        if (req.user?.id === currentUser.id && nextRole !== 'admin') {
            return res.status(400).json({ message: 'Admin cannot remove their own admin role' });
        }

        if (req.user?.id === currentUser.id && !nextIsActive) {
            return res.status(400).json({ message: 'Admin cannot disable their own account' });
        }

        const updatedUser: UserRecord = {
            ...currentUser,
            ...req.body,
            role: nextRole,
            isActive: nextIsActive,
            password: req.body.password ? await bcrypt.hash(req.body.password, 10) : currentUser.password,
            updatedAt: new Date().toISOString()
        };

        users[userIndex] = updatedUser;
        await usersStore.save(users);
        await appendAuditLog(req, 'user', updatedUser.id, 'update-user', `Updated user ${updatedUser.fullName}`);
        res.status(200).json(toPublicUser(updatedUser));
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteAdminUser = async (req: AuthenticatedRequest, res: Response) => {
    try {
        if (req.user?.id === req.params.id) {
            return res.status(400).json({ message: 'Admin cannot delete their own account' });
        }

        const users = await getDatabase().usersStore.list();
        const targetUser = users.find((user) => user.id === req.params.id);

        if (!targetUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        await deleteUserCascade(req.params.id);
        await appendAuditLog(req, 'user', req.params.id, 'delete-user', `Deleted user ${targetUser.fullName}`);
        res.status(204).send();
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getAdminChildren = async (_req: AuthenticatedRequest, res: Response) => {
    try {
        const database = getDatabase();
        const [children, users] = await Promise.all([database.childrenStore.list(), database.usersStore.list()]);
        const usersById = new Map(users.map((user) => [user.id, toPublicUser(user)]));

        res.status(200).json(children.map((child) => ({
            ...child,
            user: usersById.get(child.userId) || null
        })));
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const createAdminChild = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.params.userId;
        const database = getDatabase();
        const users = await database.usersStore.list();

        const targetUser = users.find((user) => user.id === userId);

        if (!targetUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (targetUser.role !== 'citizen') {
            return res.status(400).json({ message: 'Children can only be assigned to citizen accounts' });
        }

        const childrenStore = database.childrenStore;
        const children = await childrenStore.list();
        const timestamp = new Date().toISOString();
        const child: ChildRecord = {
            id: createId('child'),
            userId,
            fullName: req.body.fullName,
            gender: req.body.gender,
            dateOfBirth: req.body.dateOfBirth,
            nationalId: req.body.nationalId,
            address: req.body.address,
            phoneNumber: req.body.phoneNumber,
            createdAt: timestamp,
            updatedAt: timestamp
        };

        await childrenStore.save([...children, child]);
        await appendAuditLog(req, 'child', child.id, 'create-child', `Created child ${child.fullName}`);
        res.status(201).json(child);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const updateAdminChild = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const childrenStore = getDatabase().childrenStore;
        const children = await childrenStore.list();
        const childIndex = children.findIndex((child) => child.id === req.params.id);

        if (childIndex === -1) {
            return res.status(404).json({ message: 'Child not found' });
        }

        const updatedChild: ChildRecord = {
            ...children[childIndex],
            ...req.body,
            userId: req.body.userId || children[childIndex].userId,
            updatedAt: new Date().toISOString()
        };

        children[childIndex] = updatedChild;
        await childrenStore.save(children);
        await appendAuditLog(req, 'child', updatedChild.id, 'update-child', `Updated child ${updatedChild.fullName}`);
        res.status(200).json(updatedChild);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteAdminChild = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const children = await getDatabase().childrenStore.list();

        if (!children.some((child) => child.id === req.params.id)) {
            return res.status(404).json({ message: 'Child not found' });
        }

        await deleteChildCascade(req.params.id);
        await appendAuditLog(req, 'child', req.params.id, 'delete-child', `Deleted child ${req.params.id}`);
        res.status(204).send();
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getAdminAppointments = async (_req: AuthenticatedRequest, res: Response) => {
    try {
        const appointments = await getDatabase().appointmentsStore.list();
        res.status(200).json(await mapAppointmentsWithRelations(appointments));
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getAdminVaccineDoses = async (_req: AuthenticatedRequest, res: Response) => {
    try {
        const vaccineDoses = await getDatabase().vaccineDosesStore.list();
        res.status(200).json(vaccineDoses);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getAdminAuditLogs = async (_req: AuthenticatedRequest, res: Response) => {
    try {
        const logs = await getDatabase().auditLogsStore.list();
        res.status(200).json(logs);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const updateAdminAppointment = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const appointmentsStore = getDatabase().appointmentsStore;
        const appointments = await appointmentsStore.list();
        const appointmentIndex = appointments.findIndex((appointment) => appointment.id === req.params.id);

        if (appointmentIndex === -1) {
            return res.status(404).json({ message: 'Appointment not found' });
        }

        const updatedAppointment: AppointmentRecord = {
            ...appointments[appointmentIndex],
            ...req.body,
            appointmentDate: req.body.appointmentDate || req.body.date || appointments[appointmentIndex].appointmentDate,
            updatedAt: new Date().toISOString()
        };

        appointments[appointmentIndex] = updatedAppointment;
        await appointmentsStore.save(appointments);
        await appendAuditLog(req, 'appointment', updatedAppointment.id, 'update-appointment', `Updated appointment ${updatedAppointment.id} to ${updatedAppointment.status || 'scheduled'}`);
        res.status(200).json(updatedAppointment);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteAdminAppointment = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const appointmentsStore = getDatabase().appointmentsStore;
        const appointments = await appointmentsStore.list();

        if (!appointments.some((appointment) => appointment.id === req.params.id)) {
            return res.status(404).json({ message: 'Appointment not found' });
        }

        await appointmentsStore.save(appointments.filter((appointment) => appointment.id !== req.params.id));
        await appendAuditLog(req, 'appointment', req.params.id, 'delete-appointment', `Deleted appointment ${req.params.id}`);
        res.status(204).send();
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const createHealthCenterAppointment = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { childId, vaccineId, appointmentDate, notes, status, notificationDate, notificationMessage } = req.body;

        if (!childId || !vaccineId || !appointmentDate) {
            return res.status(400).json({ message: 'childId, vaccineId and appointmentDate are required' });
        }

        const database = getDatabase();
        const [children, vaccines, appointments] = await Promise.all([
            database.childrenStore.list(),
            database.vaccinesStore.list(),
            database.appointmentsStore.list()
        ]);

        const child = children.find((entry) => entry.id === childId);
        if (!child) {
            return res.status(404).json({ message: 'Child not found' });
        }

        const vaccine = vaccines.find((entry) => entry.id === vaccineId);
        if (!vaccine) {
            return res.status(404).json({ message: 'Vaccine not found' });
        }

        const timestamp = new Date().toISOString();
        const appointment: AppointmentRecord = {
            id: createId('appointment'),
            userId: child.userId,
            childId,
            appointmentDate,
            vaccineId,
            notes,
            status: status || 'scheduled',
            notificationDate: notificationDate || undefined,
            notificationSentAt: undefined,
            notificationMessage: notificationMessage || undefined,
            createdAt: timestamp,
            updatedAt: timestamp
        };

        await database.appointmentsStore.save([...appointments, appointment]);
        await appendAuditLog(req, 'appointment', appointment.id, 'create-health-center-appointment', `Scheduled vaccination appointment for child ${child.fullName}`);
        const [enrichedAppointment] = await mapAppointmentsWithRelations([appointment]);
        res.status(201).json(enrichedAppointment);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const updateHealthCenterAppointment = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const database = getDatabase();
        const appointmentsStore = database.appointmentsStore;
        const appointments = await appointmentsStore.list();
        const appointmentIndex = appointments.findIndex((appointment) => appointment.id === req.params.id);

        if (appointmentIndex === -1) {
            return res.status(404).json({ message: 'Appointment not found' });
        }

        const currentAppointment = appointments[appointmentIndex];
        const nextVaccineId = req.body.vaccineId || currentAppointment.vaccineId;
        const vaccines = await database.vaccinesStore.list();

        if (!vaccines.some((entry) => entry.id === nextVaccineId)) {
            return res.status(404).json({ message: 'Vaccine not found' });
        }

        const updatedAppointment: AppointmentRecord = {
            ...currentAppointment,
            ...req.body,
            vaccineId: nextVaccineId,
            appointmentDate: req.body.appointmentDate || req.body.date || currentAppointment.appointmentDate,
            notificationDate: req.body.notificationDate === '' ? undefined : req.body.notificationDate ?? currentAppointment.notificationDate,
            notificationMessage: req.body.notificationMessage === '' ? undefined : req.body.notificationMessage ?? currentAppointment.notificationMessage,
            updatedAt: new Date().toISOString()
        };

        appointments[appointmentIndex] = updatedAppointment;
        await appointmentsStore.save(appointments);
        await appendAuditLog(req, 'appointment', updatedAppointment.id, 'update-health-center-appointment', `Updated health-center appointment ${updatedAppointment.id}`);
        const [enrichedAppointment] = await mapAppointmentsWithRelations([updatedAppointment]);
        res.status(200).json(enrichedAppointment);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const notifyHealthCenterAppointment = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const appointmentsStore = getDatabase().appointmentsStore;
        const appointments = await appointmentsStore.list();
        const appointmentIndex = appointments.findIndex((appointment) => appointment.id === req.params.id);

        if (appointmentIndex === -1) {
            return res.status(404).json({ message: 'Appointment not found' });
        }

        const now = new Date();
        const currentAppointment = appointments[appointmentIndex];
        const updatedAppointment: AppointmentRecord = {
            ...currentAppointment,
            notificationDate: req.body.notificationDate || currentAppointment.notificationDate || now.toISOString().slice(0, 10),
            notificationSentAt: now.toISOString(),
            notificationMessage: req.body.notificationMessage || currentAppointment.notificationMessage || 'يرجى الحضور إلى المركز الصحي في موعد التلقيح المحدد.',
            updatedAt: now.toISOString()
        };

        appointments[appointmentIndex] = updatedAppointment;
        await appointmentsStore.save(appointments);
        await appendAuditLog(req, 'appointment', updatedAppointment.id, 'notify-health-center-appointment', `Sent vaccination reminder for appointment ${updatedAppointment.id}`);
        const [enrichedAppointment] = await mapAppointmentsWithRelations([updatedAppointment]);
        res.status(200).json(enrichedAppointment);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};