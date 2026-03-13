export interface Child {
    id: string;
    fullName: string;
    gender: 'male' | 'female' | 'other';
    dateOfBirth: string;
    nationalId?: string;
    address: string;
    phoneNumber: string;
}