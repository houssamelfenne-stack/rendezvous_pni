import bcrypt from 'bcryptjs';
import { Response } from 'express';
import { createId, getDatabase } from '../storage/database';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { AppointmentRecord, ChildRecord, UserRecord } from '../types/entities';

const toPublicUser = (user: UserRecord) => {
    const { password: _password, ...publicUser } = user;
    return publicUser;
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

        const timestamp = new Date().toISOString();
        const newUser: UserRecord = {
            id: createId('user'),
            fullName,
            role: role === 'super-admin' ? 'super-admin' : 'user',
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
        const nextRole = req.body.role === 'super-admin' ? 'super-admin' : req.body.role === 'user' ? 'user' : currentUser.role;
        const nextIsActive = req.body.isActive === undefined ? currentUser.isActive : Boolean(req.body.isActive);

        if (req.user?.id === currentUser.id && nextRole !== 'super-admin') {
            return res.status(400).json({ message: 'Super-admin cannot remove their own super-admin role' });
        }

        if (req.user?.id === currentUser.id && !nextIsActive) {
            return res.status(400).json({ message: 'Super-admin cannot disable their own account' });
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
        res.status(200).json(toPublicUser(updatedUser));
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteAdminUser = async (req: AuthenticatedRequest, res: Response) => {
    try {
        if (req.user?.id === req.params.id) {
            return res.status(400).json({ message: 'Super-admin cannot delete their own account' });
        }

        const users = await getDatabase().usersStore.list();
        const targetUser = users.find((user) => user.id === req.params.id);

        if (!targetUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        await deleteUserCascade(req.params.id);
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

        if (!users.some((user) => user.id === userId)) {
            return res.status(404).json({ message: 'User not found' });
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
        res.status(204).send();
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getAdminAppointments = async (_req: AuthenticatedRequest, res: Response) => {
    try {
        const appointments = await getDatabase().appointmentsStore.list();
        res.status(200).json(appointments);
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
        res.status(204).send();
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};