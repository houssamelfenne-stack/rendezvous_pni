export interface VaccineDoseRecord {
    id: string;
    childId: string;
    antigen: string;
    offsetDays: number;
    completedDate: string;
    createdAt: string;
    updatedAt: string;
}

export interface VaccineDoseNotification {
    id: string;
    childId: string;
    childName: string;
    antigen: string;
    completedDate: string;
    createdAt: string;
    updatedAt: string;
}