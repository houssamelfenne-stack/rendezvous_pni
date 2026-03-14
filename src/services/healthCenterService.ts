import api from './api';
import { AdminAppointment, AdminChild, AdminVaccineDose } from './adminService';

export interface HealthCenterAppointmentPayload {
    childId: string;
    vaccineId: string;
    appointmentDate: string;
    notes?: string;
    status?: string;
    notificationDate?: string;
    notificationMessage?: string;
}

export const getHealthCenterChildren = async (): Promise<AdminChild[]> => {
    const response = await api.get('/health-center/children');
    return response.data;
};

export const getHealthCenterAppointments = async (): Promise<AdminAppointment[]> => {
    const response = await api.get('/health-center/appointments');
    return response.data;
};

export const getHealthCenterVaccineDoses = async (): Promise<AdminVaccineDose[]> => {
    const response = await api.get('/health-center/vaccine-doses');
    return response.data;
};

export const createHealthCenterAppointment = async (payload: HealthCenterAppointmentPayload): Promise<AdminAppointment> => {
    const response = await api.post('/health-center/appointments', payload);
    return response.data;
};

export const updateHealthCenterAppointment = async (id: string, payload: Partial<HealthCenterAppointmentPayload>): Promise<AdminAppointment> => {
    const response = await api.put(`/health-center/appointments/${id}`, payload);
    return response.data;
};

export const notifyHealthCenterAppointment = async (id: string, payload?: Pick<HealthCenterAppointmentPayload, 'notificationDate' | 'notificationMessage'>): Promise<AdminAppointment> => {
    const response = await api.post(`/health-center/appointments/${id}/notify`, payload || {});
    return response.data;
};
