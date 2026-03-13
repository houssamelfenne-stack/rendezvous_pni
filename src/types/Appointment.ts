export interface Appointment {
    id: string;
    childId: string;
    appointmentDate: string;
    vaccineId: string;
    notes?: string;
    status?: string;
    childName?: string;
    vaccine?: string;
    date?: string;
    time?: string;
    source?: 'saved' | 'expected';
}