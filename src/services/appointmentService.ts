import api from './api';
import { Appointment } from '../types/Appointment';

export const createAppointment = async (appointmentData: Appointment) => {
    const payload = {
        ...appointmentData,
        appointmentDate: appointmentData.appointmentDate || appointmentData.date || '',
    };
    const response = await api.post('/appointments', payload);
    return response.data;
};

export const getAppointments = async () => {
    const response = await api.get('/appointments');
    return response.data;
};

export const getAppointmentById = async (id: string) => {
    const response = await api.get(`/appointments/${id}`);
    return response.data;
};

export const updateAppointment = async (id: string, appointmentData: Appointment) => {
    const response = await api.put(`/appointments/${id}`, appointmentData);
    return response.data;
};

export const deleteAppointment = async (id: string) => {
    const response = await api.delete(`/appointments/${id}`);
    return response.data;
};