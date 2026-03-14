import { Pool } from 'pg';
import { AppointmentRecord, AuditLogRecord, ChildRecord, UserRecord, VaccineDoseRecord, VaccineRecord } from '../types/entities';
import { defaultVaccines } from './shared';
import { AppDatabase, EntityStore } from './types';

type RowMapper<T> = {
    fromRow: (row: any) => T;
    toRow: (row: T) => Record<string, unknown>;
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

const createStore = <T>(pool: Pool, tableName: string, mapper: RowMapper<T>): EntityStore<T> => ({
    async list() {
        const result = await pool.query(`SELECT * FROM ${tableName}`);
        return result.rows.map((row) => mapper.fromRow(row));
    },
    async save(rows) {
        const client = await pool.connect();

        try {
            await client.query('BEGIN');
            await client.query(`TRUNCATE TABLE ${tableName} RESTART IDENTITY CASCADE`);

            for (const entry of rows) {
                const row = mapper.toRow(entry);
                const columns = Object.keys(row);
                const values = Object.values(row);
                const placeholders = columns.map((_, index) => `$${index + 1}`);

                await client.query(
                    `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES (${placeholders.join(', ')})`,
                    values
                );
            }

            await client.query('COMMIT');
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
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
        schedule: JSON.stringify(row.schedule),
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

export const createPostgresDatabase = (): AppDatabase => {
    const connectionString = process.env.DATABASE_URL;

    if (!connectionString) {
        throw new Error('DATABASE_URL is required for PostgreSQL mode');
    }

    const pool = new Pool({
        connectionString,
        ssl: process.env.DATABASE_SSL === 'false' ? false : { rejectUnauthorized: false }
    });

    return {
        async initialize() {
            await pool.query(`
                CREATE TABLE IF NOT EXISTS users (
                    id TEXT PRIMARY KEY,
                    full_name TEXT NOT NULL,
                    role TEXT NOT NULL DEFAULT 'user',
                    is_active BOOLEAN NOT NULL DEFAULT true,
                    gender TEXT NOT NULL,
                    date_of_birth TEXT NOT NULL,
                    national_id TEXT NOT NULL UNIQUE,
                    address TEXT NOT NULL,
                    phone_number TEXT NOT NULL,
                    password TEXT NOT NULL,
                    created_at TEXT NOT NULL,
                    updated_at TEXT NOT NULL
                )
            `);

            await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'user'`);
            await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true`);

            await pool.query(`
                CREATE TABLE IF NOT EXISTS children (
                    id TEXT PRIMARY KEY,
                    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                    full_name TEXT NOT NULL,
                    gender TEXT NOT NULL,
                    date_of_birth TEXT NOT NULL,
                    national_id TEXT NOT NULL,
                    address TEXT NOT NULL,
                    phone_number TEXT NOT NULL,
                    created_at TEXT NOT NULL,
                    updated_at TEXT NOT NULL
                )
            `);

            await pool.query(`
                CREATE TABLE IF NOT EXISTS vaccines (
                    id TEXT PRIMARY KEY,
                    name TEXT NOT NULL,
                    description TEXT NOT NULL,
                    age_group TEXT NOT NULL,
                    schedule JSONB NOT NULL,
                    created_at TEXT NOT NULL,
                    updated_at TEXT NOT NULL
                )
            `);

            await pool.query(`
                CREATE TABLE IF NOT EXISTS appointments (
                    id TEXT PRIMARY KEY,
                    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                    child_id TEXT NOT NULL REFERENCES children(id) ON DELETE CASCADE,
                    appointment_date TEXT NOT NULL,
                    vaccine_id TEXT NOT NULL REFERENCES vaccines(id) ON DELETE RESTRICT,
                    notes TEXT,
                    status TEXT,
                    notification_date TEXT,
                    notification_sent_at TEXT,
                    notification_message TEXT,
                    created_at TEXT NOT NULL,
                    updated_at TEXT NOT NULL
                )
            `);

            await pool.query(`ALTER TABLE appointments ADD COLUMN IF NOT EXISTS notification_date TEXT`);
            await pool.query(`ALTER TABLE appointments ADD COLUMN IF NOT EXISTS notification_sent_at TEXT`);
            await pool.query(`ALTER TABLE appointments ADD COLUMN IF NOT EXISTS notification_message TEXT`);

            await pool.query(`
                CREATE TABLE IF NOT EXISTS vaccine_doses (
                    id TEXT PRIMARY KEY,
                    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                    child_id TEXT NOT NULL REFERENCES children(id) ON DELETE CASCADE,
                    antigen TEXT NOT NULL,
                    offset_days INTEGER NOT NULL,
                    completed_date TEXT NOT NULL,
                    created_at TEXT NOT NULL,
                    updated_at TEXT NOT NULL,
                    UNIQUE (user_id, child_id, antigen, offset_days)
                )
            `);

            await pool.query(`
                CREATE TABLE IF NOT EXISTS audit_logs (
                    id TEXT PRIMARY KEY,
                    actor_user_id TEXT NOT NULL,
                    actor_role TEXT NOT NULL,
                    action TEXT NOT NULL,
                    entity_type TEXT NOT NULL,
                    entity_id TEXT NOT NULL,
                    message TEXT NOT NULL,
                    created_at TEXT NOT NULL
                )
            `);

            const vaccineCountResult = await pool.query('SELECT COUNT(*)::int AS count FROM vaccines');
            const vaccineCount = Number(vaccineCountResult.rows[0]?.count || 0);

            if (vaccineCount === 0) {
                for (const vaccine of defaultVaccines) {
                    await pool.query(
                        `INSERT INTO vaccines (id, name, description, age_group, schedule, created_at, updated_at)
                         VALUES ($1, $2, $3, $4, $5::jsonb, $6, $7)`,
                        [
                            vaccine.id,
                            vaccine.name,
                            vaccine.description,
                            vaccine.ageGroup,
                            JSON.stringify(vaccine.schedule),
                            vaccine.createdAt,
                            vaccine.updatedAt
                        ]
                    );
                }
            }
        },
        usersStore: createStore(pool, 'users', usersMapper),
        childrenStore: createStore(pool, 'children', childrenMapper),
        appointmentsStore: createStore(pool, 'appointments', appointmentsMapper),
        vaccinesStore: createStore(pool, 'vaccines', vaccinesMapper),
        vaccineDosesStore: createStore(pool, 'vaccine_doses', vaccineDosesMapper),
        auditLogsStore: createStore(pool, 'audit_logs', auditLogsMapper)
    };
};