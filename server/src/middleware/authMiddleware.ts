import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { getDatabase } from '../storage/database';
import { UserRecord, UserRole } from '../types/entities';

export interface AuthenticatedRequest extends Request {
    user?: UserRecord;
}

export const authenticate = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as { id: string };
        const user = (await getDatabase().usersStore.list()).find((entry) => entry.id === decoded.id);

        if (!user) {
            return res.status(401).json({ message: 'Invalid token.' });
        }

        if (!user.isActive) {
            return res.status(403).json({ message: 'Account disabled.' });
        }

        req.user = user;
        next();
    } catch (error) {
        res.status(400).json({ message: 'Invalid token.' });
    }
};

export const requireRoles = (...roles: UserRole[]) => {
    return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Forbidden' });
        }

        next();
    };
};

export default authenticate;