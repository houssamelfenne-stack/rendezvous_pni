import axios from 'axios';
import { LoginCredentials, RegisterUserData, User } from '../types/User';

const API_URL = `${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/auth/`;

const normalizeUserRole = (role?: string): User['role'] => {
    if (role === 'admin' || role === 'super-admin') {
        return 'admin';
    }

    if (role === 'health-center') {
        return 'health-center';
    }

    return 'citizen';
};

const persistUser = (user: User | null) => {
    if (user) {
        const { password: _password, ...safeUser } = user;
        localStorage.setItem('user', JSON.stringify(safeUser));
        return;
    }

    localStorage.removeItem('user');
};

const readStoredUser = (): User | null => {
    const rawUser = localStorage.getItem('user');

    if (!rawUser) {
        return null;
    }

    const parsedUser = JSON.parse(rawUser) as Partial<User>;
    return {
        fullName: parsedUser.fullName || '',
        role: normalizeUserRole(parsedUser.role),
        isActive: parsedUser.isActive !== false,
        gender: (parsedUser.gender || 'other') as User['gender'],
        dateOfBirth: parsedUser.dateOfBirth || '',
        nationalId: parsedUser.nationalId || '',
        address: parsedUser.address || '',
        phoneNumber: parsedUser.phoneNumber || '',
        token: parsedUser.token
    };
};

export const registerUser = async (userData: RegisterUserData) => {
    const response = await axios.post(`${API_URL}register`, userData);
    return response.data;
};

export const login = async (nationalId: string, password: string) => {
    const credentials: LoginCredentials = { nationalId, password };
    const response = await axios.post(`${API_URL}login`, credentials);
    const user: User = {
        nationalId: response.data.nationalId || nationalId,
        token: response.data.token,
        fullName: response.data.fullName || '',
        role: normalizeUserRole(response.data.role),
        isActive: response.data.isActive !== false,
        gender: (response.data.gender || 'other') as User['gender'],
        dateOfBirth: response.data.dateOfBirth || '',
        address: response.data.address || '',
        phoneNumber: response.data.phoneNumber || ''
    };

    persistUser(user);
    return user;
};

export const logout = () => {
    persistUser(null);
};

export const getStoredUser = (): User | null => {
    return readStoredUser();
};

export const getCurrentUser = async (): Promise<User | null> => {
    const storedUser = readStoredUser();

    if (!storedUser) {
        return null;
    }

    if (!storedUser.token) {
        return storedUser;
    }

    try {
        const response = await axios.get(`${API_URL}profile`, {
            headers: {
                Authorization: `Bearer ${storedUser.token}`,
            },
        });

        const user: User = {
            fullName: response.data.fullName || storedUser.fullName,
            role: normalizeUserRole(response.data.role || storedUser.role),
            isActive: response.data.isActive !== false,
            gender: (response.data.gender || storedUser.gender || 'other') as User['gender'],
            dateOfBirth: response.data.dateOfBirth || storedUser.dateOfBirth,
            nationalId: response.data.nationalId || storedUser.nationalId,
            address: response.data.address || storedUser.address,
            phoneNumber: response.data.phoneNumber || storedUser.phoneNumber,
            token: storedUser.token
        };

        persistUser(user);
        return user;
    } catch (_error) {
        persistUser(null);
        return null;
    }
};

export const authService = {
    register: registerUser,
    login,
    logout,
    getStoredUser,
    getCurrentUser,
};

export default authService;