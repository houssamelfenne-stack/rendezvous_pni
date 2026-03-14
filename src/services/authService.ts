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
        localStorage.setItem('user', JSON.stringify(user));
        return;
    }

    localStorage.removeItem('user');
};

export const registerUser = async (userData: RegisterUserData) => {
    const response = await axios.post(`${API_URL}register`, userData);
    return response.data;
};

export const login = async (nationalId: string, password: string) => {
    const credentials: LoginCredentials = { nationalId, password };
    const response = await axios.post(`${API_URL}login`, credentials);
    const user: User = {
        nationalId,
        password,
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

export const getCurrentUser = (): User | null => {
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
        password: parsedUser.password,
        token: parsedUser.token
    };
};

export const authService = {
    register: registerUser,
    login,
    logout,
    getCurrentUser,
};

export default authService;