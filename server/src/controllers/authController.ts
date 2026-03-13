import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { createId, usersStore } from '../storage/excelDatabase';
import { UserRecord } from '../types/entities';

interface AuthenticatedRequest extends Request {
    user?: UserRecord;
}

const register = async (req: Request, res: Response) => {
    const { fullName, gender, dateOfBirth, nationalId, address, phoneNumber, password } = req.body;

    try {
        const users = usersStore.list();
        const existingUser = users.find((user) => user.nationalId === nationalId);

        if (existingUser) {
            return res.status(409).json({ message: 'User already exists' });
        }

        const timestamp = new Date().toISOString();
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser: UserRecord = {
            id: createId('user'),
            fullName,
            gender,
            dateOfBirth,
            nationalId,
            address,
            phoneNumber,
            password: hashedPassword,
            createdAt: timestamp,
            updatedAt: timestamp
        };

        users.push(newUser);
        usersStore.save(users);
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error registering user', error });
    }
};

const login = async (req: Request, res: Response) => {
    const { nationalId, password } = req.body;

    try {
        const users = usersStore.list();
        const user = users.find((entry) => entry.nationalId === nationalId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });
        const { password: _password, ...publicUser } = user;
        res.status(200).json({ token, ...publicUser });
    } catch (error) {
        res.status(500).json({ message: 'Error logging in', error });
    }
};

const getProfile = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const currentUser = req.user;

        if (!currentUser) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const { password, ...user } = currentUser;
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching user profile', error });
    }
};

export { register, login, getProfile };