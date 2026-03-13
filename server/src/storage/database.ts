import {
    appointmentsStore as excelAppointmentsStore,
    childrenStore as excelChildrenStore,
    initializeExcelDatabase,
    usersStore as excelUsersStore,
    vaccineDosesStore as excelVaccineDosesStore,
    vaccinesStore as excelVaccinesStore
} from './excelDatabase';
import { createId } from './shared';
import { AppDatabase } from './types';

let activeDatabase: AppDatabase | null = null;

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
    }
});

export const initializeDatabase = async () => {
    if (!activeDatabase) {
        activeDatabase = createExcelDatabase();
    }

    await activeDatabase.initialize();
    return activeDatabase;
};

export const getDatabase = () => {
    if (!activeDatabase) {
        throw new Error('Database has not been initialized');
    }

    return activeDatabase;
};

export { createId };