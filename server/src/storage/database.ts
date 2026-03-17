import {
    auditLogsStore as excelAuditLogsStore,
    appointmentsStore as excelAppointmentsStore,
    childrenStore as excelChildrenStore,
    initializeExcelDatabase,
    usersStore as excelUsersStore,
    vaccineDosesStore as excelVaccineDosesStore,
    vaccinesStore as excelVaccinesStore
} from './excelDatabase';
import { createPostgresDatabase } from './postgresDatabase';
import { createSupabaseDatabase } from './supabaseDatabase';
import { createId, ensureDefaultVaccines } from './shared';
import { AppDatabase } from './types';
import { ensureSuperAdminAccount } from '../utils/bootstrapSuperAdmin';

let activeDatabase: AppDatabase | null = null;
let activeDatabaseProvider: 'excel' | 'postgres' | 'supabase' | null = null;

const createExcelDatabase = (): AppDatabase => ({
    async initialize() {
        initializeExcelDatabase();
    },
    usersStore: {
        async list() {
            return excelUsersStore.list();
        },
        async save(rows) {
            excelUsersStore.save(rows);
        }
    },
    childrenStore: {
        async list() {
            return excelChildrenStore.list();
        },
        async save(rows) {
            excelChildrenStore.save(rows);
        }
    },
    appointmentsStore: {
        async list() {
            return excelAppointmentsStore.list();
        },
        async save(rows) {
            excelAppointmentsStore.save(rows);
        }
    },
    vaccinesStore: {
        async list() {
            return excelVaccinesStore.list();
        },
        async save(rows) {
            excelVaccinesStore.save(rows);
        }
    },
    vaccineDosesStore: {
        async list() {
            return excelVaccineDosesStore.list();
        },
        async save(rows) {
            excelVaccineDosesStore.save(rows);
        }
    },
    auditLogsStore: {
        async list() {
            return excelAuditLogsStore.list();
        },
        async save(rows) {
            excelAuditLogsStore.save(rows);
        }
    }
});

const resolveDatabaseProvider = (): 'excel' | 'postgres' | 'supabase' => {
    const configuredProvider = process.env.STORAGE_PROVIDER?.trim().toLowerCase();
    const hasSupabaseCredentials = Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);

    if (configuredProvider === 'supabase') {
        if (!hasSupabaseCredentials) {
            throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required when STORAGE_PROVIDER=supabase');
        }

        return 'supabase';
    }

    if (configuredProvider === 'postgres') {
        if (!process.env.DATABASE_URL) {
            throw new Error('DATABASE_URL is required when STORAGE_PROVIDER=postgres');
        }

        return 'postgres';
    }

    if (configuredProvider === 'excel') {
        return 'excel';
    }

    if (hasSupabaseCredentials) {
        return 'supabase';
    }

    if (process.env.DATABASE_URL) {
        return 'postgres';
    }

    return 'excel';
};

export const initializeDatabase = async () => {
    if (!activeDatabase) {
        activeDatabaseProvider = resolveDatabaseProvider();
        activeDatabase = activeDatabaseProvider === 'postgres'
            ? createPostgresDatabase()
            : activeDatabaseProvider === 'supabase'
                ? createSupabaseDatabase()
                : createExcelDatabase();
    }

    await activeDatabase.initialize();
    await ensureDefaultVaccines(activeDatabase);
    await ensureSuperAdminAccount(activeDatabase);
    return activeDatabase;
};

export const getDatabase = () => {
    if (!activeDatabase) {
        throw new Error('Database has not been initialized');
    }

    return activeDatabase;
};

export const getDatabaseProvider = () => {
    if (!activeDatabaseProvider) {
        throw new Error('Database has not been initialized');
    }

    return activeDatabaseProvider;
};

export { createId };