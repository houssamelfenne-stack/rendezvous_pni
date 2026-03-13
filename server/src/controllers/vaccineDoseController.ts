import { Request, Response } from 'express';
import { childrenStore, createId, vaccineDosesStore } from '../storage/excelDatabase';
import { UserRecord, VaccineDoseRecord } from '../types/entities';

interface AuthenticatedRequest extends Request {
    user?: UserRecord;
}

export const getChildVaccineDoses = (req: AuthenticatedRequest, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const child = childrenStore.list().find((entry) => entry.id === req.params.childId && entry.userId === req.user?.id);

        if (!child) {
            return res.status(404).json({ message: 'Child not found' });
        }

        const records = vaccineDosesStore.list().filter((entry) => entry.userId === req.user?.id && entry.childId === req.params.childId);
        return res.status(200).json(records);
    } catch (error: any) {
        return res.status(500).json({ message: error.message });
    }
};

export const upsertChildVaccineDose = (req: AuthenticatedRequest, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const { antigen, offsetDays, completedDate } = req.body as {
            antigen?: string;
            offsetDays?: number;
            completedDate?: string;
        };

        if (!antigen || typeof offsetDays !== 'number') {
            return res.status(400).json({ message: 'antigen and offsetDays are required' });
        }

        const child = childrenStore.list().find((entry) => entry.id === req.params.childId && entry.userId === req.user?.id);

        if (!child) {
            return res.status(404).json({ message: 'Child not found' });
        }

        const records = vaccineDosesStore.list();
        const recordIndex = records.findIndex(
            (entry) => entry.userId === req.user?.id && entry.childId === req.params.childId && entry.antigen === antigen && entry.offsetDays === offsetDays
        );

        if (!completedDate) {
            if (recordIndex >= 0) {
                records.splice(recordIndex, 1);
                vaccineDosesStore.save(records);
            }

            return res.status(200).json({ removed: true });
        }

        const timestamp = new Date().toISOString();

        if (recordIndex >= 0) {
            const updatedRecord: VaccineDoseRecord = {
                ...records[recordIndex],
                completedDate,
                updatedAt: timestamp
            };
            records[recordIndex] = updatedRecord;
            vaccineDosesStore.save(records);
            return res.status(200).json(updatedRecord);
        }

        const newRecord: VaccineDoseRecord = {
            id: createId('vaccineDose'),
            userId: req.user.id,
            childId: req.params.childId,
            antigen,
            offsetDays,
            completedDate,
            createdAt: timestamp,
            updatedAt: timestamp
        };

        records.push(newRecord);
        vaccineDosesStore.save(records);
        return res.status(201).json(newRecord);
    } catch (error: any) {
        return res.status(500).json({ message: error.message });
    }
};