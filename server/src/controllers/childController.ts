import { Request, Response } from 'express';
import { createId, getDatabase } from '../storage/database';
import { ChildRecord, UserRecord } from '../types/entities';

interface AuthenticatedRequest extends Request {
    user?: UserRecord;
}

// Create a new child
export const addChild = async (req: AuthenticatedRequest, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const childrenStore = getDatabase().childrenStore;
        const children = await childrenStore.list();
        const timestamp = new Date().toISOString();
        const child: ChildRecord = {
            id: createId('child'),
            userId: req.user.id,
            fullName: req.body.fullName,
            gender: req.body.gender,
            dateOfBirth: req.body.dateOfBirth,
            nationalId: req.body.nationalId,
            address: req.body.address,
            phoneNumber: req.body.phoneNumber,
            createdAt: timestamp,
            updatedAt: timestamp
        };

        children.push(child);
        await childrenStore.save(children);
        res.status(201).json(child);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

// Get all children
export const getChildren = async (req: AuthenticatedRequest, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const children = (await getDatabase().childrenStore.list()).filter((child) => child.userId === req.user?.id);
        res.status(200).json(children);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// Get a child by ID
export const getChildById = async (req: AuthenticatedRequest, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const child = (await getDatabase().childrenStore.list()).find((entry) => entry.id === req.params.id && entry.userId === req.user?.id);
        if (!child) {
            return res.status(404).json({ message: 'Child not found' });
        }
        res.status(200).json(child);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// Update a child by ID
export const updateChild = async (req: AuthenticatedRequest, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const childrenStore = getDatabase().childrenStore;
        const children = await childrenStore.list();
        const childIndex = children.findIndex((entry) => entry.id === req.params.id && entry.userId === req.user?.id);

        if (childIndex === -1) {
            return res.status(404).json({ message: 'Child not found' });
        }

        const child = {
            ...children[childIndex],
            ...req.body,
            userId: req.user.id,
            updatedAt: new Date().toISOString()
        };

        children[childIndex] = child;
        await childrenStore.save(children);
        if (!child) {
            return res.status(404).json({ message: 'Child not found' });
        }
        res.status(200).json(child);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

// Delete a child by ID
export const deleteChild = async (req: AuthenticatedRequest, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const childrenStore = getDatabase().childrenStore;
        const children = await childrenStore.list();
        const child = children.find((entry) => entry.id === req.params.id && entry.userId === req.user?.id);
        if (!child) {
            return res.status(404).json({ message: 'Child not found' });
        }

        await childrenStore.save(children.filter((entry) => !(entry.id === req.params.id && entry.userId === req.user?.id)));
        res.status(204).send();
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};