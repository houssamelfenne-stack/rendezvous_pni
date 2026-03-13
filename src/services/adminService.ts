import api from './api';
import { Appointment } from '../types/Appointment';
import { Child } from '../types/Child';
import { User, UserRole } from '../types/User';

export interface AdminUser extends User {
    id: string;
    role: UserRole;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface AdminChild extends Child {
    userId: string;
    createdAt: string;
    updatedAt: string;
    user?: AdminUser | null;
}

export interface AdminAppointment extends Appointment {
    userId: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateAdminUserPayload {
    fullName: string;
    role: UserRole;
    gender: 'male' | 'female' | 'other';
    dateOfBirth: string;
    nationalId: string;
    address: string;
    phoneNumber: string;
    password: string;
    isActive?: boolean;
}

export interface CreateAdminChildPayload {
    fullName: string;
    gender: 'male' | 'female' | 'other';
    dateOfBirth: string;
    nationalId?: string;
    address: string;
    phoneNumber: string;
}

export const getAdminUsers = async (): Promise<AdminUser[]> => {
    const response = await api.get('/admin/users');
    return response.data;
};

export const createAdminUser = async (payload: CreateAdminUserPayload): Promise<AdminUser> => {
    const response = await api.post('/admin/users', payload);
    return response.data;
};

export const updateAdminUser = async (id: string, payload: Partial<CreateAdminUserPayload> & { isActive?: boolean }): Promise<AdminUser> => {
    const response = await api.put(`/admin/users/${id}`, payload);
    return response.data;
};

export const deleteAdminUser = async (id: string) => {
    await api.delete(`/admin/users/${id}`);
};

export const getAdminChildren = async (): Promise<AdminChild[]> => {
    const response = await api.get('/admin/children');
    return response.data;
};

export const createAdminChild = async (userId: string, payload: CreateAdminChildPayload): Promise<AdminChild> => {
    const response = await api.post(`/admin/users/${userId}/children`, payload);
    return response.data;
};

export const updateAdminChild = async (id: string, payload: Partial<CreateAdminChildPayload> & { userId?: string }): Promise<AdminChild> => {
    const response = await api.put(`/admin/children/${id}`, payload);
    return response.data;
};

export const deleteAdminChild = async (id: string) => {
    await api.delete(`/admin/children/${id}`);
};

export const getAdminAppointments = async (): Promise<AdminAppointment[]> => {
    const response = await api.get('/admin/appointments');
    return response.data;
};

export const updateAdminAppointment = async (id: string, payload: Partial<AdminAppointment>) => {
    const response = await api.put(`/admin/appointments/${id}`, payload);
    return response.data;
};

export const deleteAdminAppointment = async (id: string) => {
    await api.delete(`/admin/appointments/${id}`);
};