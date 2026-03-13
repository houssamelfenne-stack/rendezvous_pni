import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { usersStore } from '../storage/excelDatabase';
import { UserRecord } from '../types/entities';

interface AuthenticatedRequest extends Request {
    user?: UserRecord;
}

export const authenticate = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as { id: string };
        const user = usersStore.list().find((entry) => entry.id === decoded.id);

        if (!user) {
            return res.status(401).json({ message: 'Invalid token.' });
        }

        req.user = user;
        next();
    } catch (error) {
        res.status(400).json({ message: 'Invalid token.' });
    }
};

export default authenticate;