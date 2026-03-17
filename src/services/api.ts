import axios from 'axios';
import { authService } from './authService';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
    const currentUser = authService.getStoredUser();

    if (currentUser?.token) {
        config.headers = {
            ...config.headers,
            Authorization: `Bearer ${currentUser.token}`,
        };
    }

    return config;
});

// User authentication
export const registerUser = async (userData: unknown) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
};

export const loginUser = async (credentials: unknown) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
};

// Children management
export const addChild = async (childData: unknown) => {
    const response = await api.post('/children', childData);
    return response.data;
};

export const getChildren = async () => {
    const response = await api.get('/children');
    return response.data;
};

export const editChild = async (childId: string, childData: unknown) => {
    const response = await api.put(`/children/${childId}`, childData);
    return response.data;
};

export const deleteChild = async (childId: string) => {
    const response = await api.delete(`/children/${childId}`);
    return response.data;
};

// Appointment management
export const scheduleAppointment = async (appointmentData: unknown) => {
    const response = await api.post('/appointments', appointmentData);
    return response.data;
};

export const getAppointments = async () => {
    const response = await api.get('/appointments');
    return response.data;
};

export const editAppointment = async (appointmentId: string, appointmentData: unknown) => {
    const response = await api.put(`/appointments/${appointmentId}`, appointmentData);
    return response.data;
};

export const cancelAppointment = async (appointmentId: string) => {
    const response = await api.delete(`/appointments/${appointmentId}`);
    return response.data;
};

// Vaccine management
export const getVaccines = async () => {
    const response = await api.get('/vaccines');
    return response.data;
};

export default api;