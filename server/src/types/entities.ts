export interface UserRecord {
    id: string;
    fullName: string;
    gender: 'male' | 'female' | 'other';
    dateOfBirth: string;
    nationalId: string;
    address: string;
    phoneNumber: string;
    password: string;
    createdAt: string;
    updatedAt: string;
}

export interface ChildRecord {
    id: string;
    userId: string;
    fullName: string;
    gender: string;
    dateOfBirth: string;
    nationalId: string;
    address: string;
    phoneNumber: string;
    createdAt: string;
    updatedAt: string;
}

export interface AppointmentRecord {
    id: string;
    userId: string;
    childId: string;
    appointmentDate: string;
    vaccineId: string;
    notes?: string;
    status?: string;
    createdAt: string;
    updatedAt: string;
}

export interface VaccineRecord {
    id: string;
    name: string;
    description: string;
    ageGroup: string;
    schedule: string[];
    createdAt: string;
    updatedAt: string;
}

export interface VaccineDoseRecord {
    id: string;
    userId: string;
    childId: string;
    antigen: string;
    offsetDays: number;
    completedDate: string;
    createdAt: string;
    updatedAt: string;
}

export interface DatabaseShape {
    users: UserRecord[];
    children: ChildRecord[];
    appointments: AppointmentRecord[];
    vaccines: VaccineRecord[];
    vaccineDoses: VaccineDoseRecord[];
}