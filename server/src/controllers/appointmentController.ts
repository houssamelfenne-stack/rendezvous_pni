import { Request, Response } from 'express';
import { createId, getDatabase } from '../storage/database';
import { AppointmentRecord, UserRecord } from '../types/entities';

interface AuthenticatedRequest extends Request {
    user?: UserRecord;
}

// Create a new appointment
export const createAppointment = async (req: AuthenticatedRequest, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const database = getDatabase();
        const children = await database.childrenStore.list();
        const vaccines = await database.vaccinesStore.list();
        const child = children.find((entry) => entry.id === req.body.childId && entry.userId === req.user?.id);
        const vaccine = vaccines.find((entry) => entry.id === req.body.vaccineId);

        if (!child) {
            return res.status(400).json({ message: 'Invalid childId' });
        }

        if (!vaccine) {
            return res.status(400).json({ message: 'Invalid vaccineId' });
        }

        const appointmentsStore = database.appointmentsStore;
        const appointments = await appointmentsStore.list();
        const timestamp = new Date().toISOString();
        const appointment: AppointmentRecord = {
            id: createId('appointment'),
            userId: req.user.id,
            childId: req.body.childId,
            appointmentDate: req.body.appointmentDate || req.body.date,
            vaccineId: req.body.vaccineId,
            notes: req.body.notes,
            status: req.body.status || 'scheduled',
            createdAt: timestamp,
            updatedAt: timestamp
        };

        appointments.push(appointment);
    await appointmentsStore.save(appointments);
        res.status(201).json(appointment);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

// Get all appointments
export const getAppointments = async (req: AuthenticatedRequest, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const appointments = (await getDatabase().appointmentsStore.list()).filter((entry) => entry.userId === req.user?.id);
        res.status(200).json(appointments);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// Get a specific appointment by ID
export const getAppointmentById = async (req: AuthenticatedRequest, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const appointment = (await getDatabase().appointmentsStore.list()).find((entry) => entry.id === req.params.id && entry.userId === req.user?.id);
        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }
        res.status(200).json(appointment);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// Update an appointment by ID
export const updateAppointment = async (req: AuthenticatedRequest, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const appointmentsStore = getDatabase().appointmentsStore;
        const appointments = await appointmentsStore.list();
        const appointmentIndex = appointments.findIndex((entry) => entry.id === req.params.id && entry.userId === req.user?.id);

        if (appointmentIndex === -1) {
            return res.status(404).json({ message: 'Appointment not found' });
        }

        const appointment = {
            ...appointments[appointmentIndex],
            ...req.body,
            appointmentDate: req.body.appointmentDate || req.body.date || appointments[appointmentIndex].appointmentDate,
            updatedAt: new Date().toISOString()
        };

        appointments[appointmentIndex] = appointment;
        await appointmentsStore.save(appointments);
        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }
        res.status(200).json(appointment);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

// Delete an appointment by ID
export const deleteAppointment = async (req: AuthenticatedRequest, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const appointmentsStore = getDatabase().appointmentsStore;
        const appointments = await appointmentsStore.list();
        const appointment = appointments.find((entry) => entry.id === req.params.id && entry.userId === req.user?.id);
        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }

        await appointmentsStore.save(appointments.filter((entry) => !(entry.id === req.params.id && entry.userId === req.user?.id)));
        res.status(204).send();
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};