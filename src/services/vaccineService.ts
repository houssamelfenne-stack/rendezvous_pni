import api from './api';
import { Vaccine } from '../types/Vaccine';
import { VaccineDoseNotification, VaccineDoseRecord } from '../types/VaccineDose';

const API_URL = '/vaccines';

export const getVaccines = async (): Promise<Vaccine[]> => {
    const response = await api.get<Vaccine[]>(API_URL);
    return response.data;
};

export const getVaccineById = async (id: string): Promise<Vaccine> => {
    const response = await api.get<Vaccine>(`${API_URL}/${id}`);
    return response.data;
};

export const createVaccine = async (vaccine: Vaccine): Promise<Vaccine> => {
    const response = await api.post<Vaccine>(API_URL, vaccine);
    return response.data;
};

export const updateVaccine = async (id: string, vaccine: Vaccine): Promise<Vaccine> => {
    const response = await api.put<Vaccine>(`${API_URL}/${id}`, vaccine);
    return response.data;
};

export const deleteVaccine = async (id: string): Promise<void> => {
    await api.delete(`${API_URL}/${id}`);
};

export const getChildVaccineDoses = async (childId: string): Promise<VaccineDoseRecord[]> => {
    const response = await api.get<VaccineDoseRecord[]>(`/vaccine-doses/child/${childId}`);
    return response.data;
};

export const saveChildVaccineDose = async (
    childId: string,
    doseData: { antigen: string; offsetDays: number; completedDate: string }
): Promise<VaccineDoseRecord | { removed: true }> => {
    const response = await api.put<VaccineDoseRecord | { removed: true }>(`/vaccine-doses/child/${childId}`, doseData);
    return response.data;
};

export const getMyVaccineDoseNotifications = async (): Promise<VaccineDoseNotification[]> => {
    const response = await api.get<VaccineDoseNotification[]>('/vaccine-doses/notifications');
    return response.data;
};