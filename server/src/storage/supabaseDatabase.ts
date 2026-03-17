import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { AppointmentRecord, AuditLogRecord, ChildRecord, UserRecord, VaccineDoseRecord, VaccineRecord } from '../types/entities';
import { AppDatabase, EntityStore } from './types';

type RowMapper<T> = {
    fromRow: (row: Record<string, any>) => T;
    toRow: (row: T) => Record<string, any>;
};

const parseSchedule = (value: unknown): string[] => {
    if (Array.isArray(value)) {
        return value.map((entry) => String(entry));
    }

    if (typeof value === 'string') {
        try {
            const parsed = JSON.parse(value);
            if (Array.isArray(parsed)) {
                return parsed.map((entry) => String(entry));
            }
        } catch {
            return value.split('|').map((entry) => entry.trim()).filter(Boolean);
        }
    }

    return [];
};

const readTable = async (client: SupabaseClient, tableName: string) => {
    const { data, error } = await client.from(tableName).select('*');

    if (error) {
        throw new Error(error.message);
    }

    return data ?? [];
};

const saveTable = async <T>(client: SupabaseClient, tableName: string, mapper: RowMapper<T>, rows: T[]) => {
    const mappedRows = rows.map((row) => mapper.toRow(row));
    const existingRows = await readTable(client, tableName);
    const nextIds = new Set(mappedRows.map((row) => String(row.id)));
    const idsToDelete = existingRows
        .map((row) => String(row.id))
        .filter((id) => !nextIds.has(id));

    if (idsToDelete.length > 0) {
        const { error } = await client.from(tableName).delete().in('id', idsToDelete);

        if (error) {
            throw new Error(error.message);
        }
    }

    if (mappedRows.length > 0) {
        const { error } = await client.from(tableName).upsert(mappedRows, { onConflict: 'id' });

        if (error) {
            throw new Error(error.message);
        }
    }
};

const createStore = <T>(client: SupabaseClient, tableName: string, mapper: RowMapper<T>): EntityStore<T> => ({
    async list() {
        const rows = await readTable(client, tableName);
        return rows.map((row) => mapper.fromRow(row));
    },
    async save(rows) {
        await saveTable(client, tableName, mapper, rows);
    }
});

const usersMapper: RowMapper<UserRecord> = {
    fromRow: (row) => ({
        id: row.id,
        fullName: row.full_name,
        role: row.role === 'admin' || row.role === 'super-admin'
            ? 'admin'
            : row.role === 'health-center'
                ? 'health-center'
                : 'citizen',
        isActive: row.is_active !== false,
        gender: row.gender,
        dateOfBirth: row.date_of_birth,
        nationalId: row.national_id,
        address: row.address,
        phoneNumber: row.phone_number,
        password: row.password,
        createdAt: row.created_at,
        updatedAt: row.updated_at
    }),
    toRow: (row) => ({
        id: row.id,
        full_name: row.fullName,
        role: row.role,
        is_active: row.isActive,
        gender: row.gender,
        date_of_birth: row.dateOfBirth,
        national_id: row.nationalId,
        address: row.address,
        phone_number: row.phoneNumber,
        password: row.password,
        created_at: row.createdAt,
        updated_at: row.updatedAt
    })
};

const childrenMapper: RowMapper<ChildRecord> = {
    fromRow: (row) => ({
        id: row.id,
        userId: row.user_id,
        fullName: row.full_name,
        gender: row.gender,
        dateOfBirth: row.date_of_birth,
        nationalId: row.national_id,
        address: row.address,
        phoneNumber: row.phone_number,
        createdAt: row.created_at,
        updatedAt: row.updated_at
    }),
    toRow: (row) => ({
        id: row.id,
        user_id: row.userId,
        full_name: row.fullName,
        gender: row.gender,
        date_of_birth: row.dateOfBirth,
        national_id: row.nationalId,
        address: row.address,
        phone_number: row.phoneNumber,
        created_at: row.createdAt,
        updated_at: row.updatedAt
    })
};

const appointmentsMapper: RowMapper<AppointmentRecord> = {
    fromRow: (row) => ({
        id: row.id,
        userId: row.user_id,
        childId: row.child_id,
        appointmentDate: row.appointment_date,
        vaccineId: row.vaccine_id,
        notes: row.notes || undefined,
        status: row.status || undefined,
        notificationDate: row.notification_date || undefined,
        notificationSentAt: row.notification_sent_at || undefined,
        notificationMessage: row.notification_message || undefined,
        createdAt: row.created_at,
        updatedAt: row.updated_at
    }),
    toRow: (row) => ({
        id: row.id,
        user_id: row.userId,
        child_id: row.childId,
        appointment_date: row.appointmentDate,
        vaccine_id: row.vaccineId,
        notes: row.notes ?? null,
        status: row.status ?? null,
        notification_date: row.notificationDate ?? null,
        notification_sent_at: row.notificationSentAt ?? null,
        notification_message: row.notificationMessage ?? null,
        created_at: row.createdAt,
        updated_at: row.updatedAt
    })
};

const vaccinesMapper: RowMapper<VaccineRecord> = {
    fromRow: (row) => ({
        id: row.id,
        name: row.name,
        description: row.description,
        ageGroup: row.age_group,
        schedule: parseSchedule(row.schedule),
        createdAt: row.created_at,
        updatedAt: row.updated_at
    }),
    toRow: (row) => ({
        id: row.id,
        name: row.name,
        description: row.description,
        age_group: row.ageGroup,
        schedule: row.schedule,
        created_at: row.createdAt,
        updated_at: row.updatedAt
    })
};

const vaccineDosesMapper: RowMapper<VaccineDoseRecord> = {
    fromRow: (row) => ({
        id: row.id,
        userId: row.user_id,
        childId: row.child_id,
        antigen: row.antigen,
        offsetDays: Number(row.offset_days),
        completedDate: row.completed_date,
        createdAt: row.created_at,
        updatedAt: row.updated_at
    }),
    toRow: (row) => ({
        id: row.id,
        user_id: row.userId,
        child_id: row.childId,
        antigen: row.antigen,
        offset_days: row.offsetDays,
        completed_date: row.completedDate,
        created_at: row.createdAt,
        updated_at: row.updatedAt
    })
};

const auditLogsMapper: RowMapper<AuditLogRecord> = {
    fromRow: (row) => ({
        id: row.id,
        actorUserId: row.actor_user_id,
        actorRole: row.actor_role === 'admin' || row.actor_role === 'super-admin'
            ? 'admin'
            : row.actor_role === 'health-center'
                ? 'health-center'
                : 'citizen',
        action: row.action,
        entityType: row.entity_type,
        entityId: row.entity_id,
        message: row.message,
        createdAt: row.created_at
    }),
    toRow: (row) => ({
        id: row.id,
        actor_user_id: row.actorUserId,
        actor_role: row.actorRole,
        action: row.action,
        entity_type: row.entityType,
        entity_id: row.entityId,
        message: row.message,
        created_at: row.createdAt
    })
};

export const createSupabaseDatabase = (): AppDatabase => {
    const supabaseUrl = process.env.SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
        throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required for Supabase mode');
    }

    const client = createClient(supabaseUrl, serviceRoleKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    });

    return {
        async initialize() {
            const { error } = await client.from('users').select('id', { head: true, count: 'exact' });

            if (error) {
                throw new Error(error.message);
            }
        },
        usersStore: createStore(client, 'users', usersMapper),
        childrenStore: createStore(client, 'children', childrenMapper),
        appointmentsStore: createStore(client, 'appointments', appointmentsMapper),
        vaccinesStore: createStore(client, 'vaccines', vaccinesMapper),
        vaccineDosesStore: createStore(client, 'vaccine_doses', vaccineDosesMapper),
        auditLogsStore: createStore(client, 'audit_logs', auditLogsMapper)
    };
};