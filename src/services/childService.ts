import api from './api';
import { Child } from '../types/Child';

const API_URL = '/children';

// Function to add a new child
export const addChild = async (childData: Child) => {
    const response = await api.post(API_URL, childData);
    return response.data;
};

// Function to get all children for a user
export const getChildren = async () => {
    const response = await api.get(API_URL);
    return response.data;
};

// Function to update child's information
export const updateChild = async (childId: string, childData: Child) => {
    const response = await api.put(`${API_URL}/${childId}`, childData);
    return response.data;
};

// Function to delete a child
export const deleteChild = async (childId: string) => {
    const response = await api.delete(`${API_URL}/${childId}`);
    return response.data;
};