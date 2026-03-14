export type UserRole = 'citizen' | 'health-center' | 'admin';

export interface User {
    fullName: string;
    role?: UserRole;
    isActive?: boolean;
    gender: 'male' | 'female' | 'other';
    dateOfBirth: string;
    nationalId: string;
    address: string;
    phoneNumber: string;
    password?: string;
    token?: string;
}

export interface RegisterUserData extends User {
    password: string;
}

export interface LoginCredentials {
    nationalId: string;
    password: string;
}