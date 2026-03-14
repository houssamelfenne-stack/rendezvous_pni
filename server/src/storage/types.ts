import { AppointmentRecord, AuditLogRecord, ChildRecord, UserRecord, VaccineDoseRecord, VaccineRecord } from '../types/entities';

export interface EntityStore<T> {
    list(): Promise<T[]>;
    save(rows: T[]): Promise<void>;
}

export interface AppDatabase {
    initialize(): Promise<void>;
    usersStore: EntityStore<UserRecord>;
    childrenStore: EntityStore<ChildRecord>;
    appointmentsStore: EntityStore<AppointmentRecord>;
    vaccinesStore: EntityStore<VaccineRecord>;
    vaccineDosesStore: EntityStore<VaccineDoseRecord>;
    auditLogsStore: EntityStore<AuditLogRecord>;
}