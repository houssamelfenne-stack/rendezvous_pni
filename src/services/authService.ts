import axios from 'axios';
import { LoginCredentials, RegisterUserData, User } from '../types/User';

const API_URL = `${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/auth/`;

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
    return rawUser ? JSON.parse(rawUser) as User : null;
};

export const authService = {
    register: registerUser,
    login,
    logout,
    getCurrentUser,
};

export default authService;