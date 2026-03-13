import { Request, Response } from 'express';
import { createId, getDatabase } from '../storage/database';
import { VaccineRecord } from '../types/entities';

// Get all vaccines
export const getVaccines = async (req: Request, res: Response) => {
    try {
        const vaccines = await getDatabase().vaccinesStore.list();
        res.status(200).json(vaccines);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching vaccines', error });
    }
};

// Add a new vaccine
export const addVaccine = async (req: Request, res: Response) => {
    const { name, description, ageGroup, schedule } = req.body;

    try {
        const vaccinesStore = getDatabase().vaccinesStore;
        const vaccines = await vaccinesStore.list();
        const timestamp = new Date().toISOString();
        const newVaccine: VaccineRecord = {
            id: createId('vaccine'),
            name,
            description,
            ageGroup,
            schedule: Array.isArray(schedule) ? schedule : String(schedule || '').split(',').map((entry) => entry.trim()).filter(Boolean),
            createdAt: timestamp,
            updatedAt: timestamp
        };

        vaccines.push(newVaccine);
        await vaccinesStore.save(vaccines);
        res.status(201).json(newVaccine);
    } catch (error) {
        res.status(500).json({ message: 'Error adding vaccine', error });
    }
};

// Update a vaccine
export const updateVaccine = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { name, description, ageGroup, schedule } = req.body;

    try {
        const vaccinesStore = getDatabase().vaccinesStore;
        const vaccines = await vaccinesStore.list();
        const vaccineIndex = vaccines.findIndex((entry) => entry.id === id);

        if (vaccineIndex === -1) {
            return res.status(404).json({ message: 'Vaccine not found' });
        }

        const updatedVaccine = {
            ...vaccines[vaccineIndex],
            name,
            description,
            ageGroup,
            schedule: Array.isArray(schedule) ? schedule : String(schedule || '').split(',').map((entry) => entry.trim()).filter(Boolean),
            updatedAt: new Date().toISOString()
        };

        vaccines[vaccineIndex] = updatedVaccine;
        await vaccinesStore.save(vaccines);
        res.status(200).json(updatedVaccine);
    } catch (error) {
        res.status(500).json({ message: 'Error updating vaccine', error });
    }
};

// Delete a vaccine
export const deleteVaccine = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        const vaccinesStore = getDatabase().vaccinesStore;
        const vaccines = await vaccinesStore.list();
        await vaccinesStore.save(vaccines.filter((entry) => entry.id !== id));
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: 'Error deleting vaccine', error });
    }
};