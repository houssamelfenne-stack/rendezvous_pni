export type UserRole = 'citizen' | 'health-center' | 'admin';

export interface UserRecord {
    id: string;
    fullName: string;
    role: UserRole;
    isActive: boolean;
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
    notificationDate?: string;
    notificationSentAt?: string;
    notificationMessage?: string;
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

export interface AuditLogRecord {
    id: string;
    actorUserId: string;
    actorRole: UserRole;
    action: string;
    entityType: 'user' | 'child' | 'appointment' | 'system';
    entityId: string;
    message: string;
    createdAt: string;
}

export interface DatabaseShape {
    users: UserRecord[];
    children: ChildRecord[];
    appointments: AppointmentRecord[];
    vaccines: VaccineRecord[];
    vaccineDoses: VaccineDoseRecord[];
    auditLogs: AuditLogRecord[];
}