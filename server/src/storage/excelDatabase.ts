import fs from 'fs';
import path from 'path';
import XLSX from 'xlsx';
import { AppointmentRecord, AuditLogRecord, ChildRecord, DatabaseShape, UserRecord, VaccineDoseRecord, VaccineRecord } from '../types/entities';
import { defaultVaccines } from './shared';

type SheetName = 'users' | 'children' | 'appointments' | 'vaccines' | 'vaccineDoses' | 'auditLogs';

const dataDirectory = path.resolve(__dirname, '../../data');
const workbookPath = path.join(dataDirectory, 'vaccination-data.xlsx');

const sheetNames: Record<SheetName, string> = {
    users: 'Users',
    children: 'Children',
    appointments: 'Appointments',
    vaccines: 'Vaccines',
    vaccineDoses: 'VaccineDoses',
    auditLogs: 'AuditLogs'
};

const normalizeUser = (record: Partial<UserRecord>): UserRecord => ({
    id: String(record.id || createId('user')),
    fullName: String(record.fullName || ''),
    role: (() => {
        const rawRole = String((record as Partial<UserRecord> & { role?: string }).role || '');

        if (rawRole === 'admin' || rawRole === 'super-admin') {
            return 'admin';
        }

        if (rawRole === 'health-center') {
            return 'health-center';
        }

        return 'citizen';
    })(),
    isActive: record.isActive === false ? false : true,
    gender: (record.gender === 'male' || record.gender === 'female' || record.gender === 'other' ? record.gender : 'other'),
    dateOfBirth: String(record.dateOfBirth || ''),
    nationalId: String(record.nationalId || ''),
    address: String(record.address || ''),
    phoneNumber: String(record.phoneNumber || ''),
    password: String(record.password || ''),
    createdAt: String(record.createdAt || new Date().toISOString()),
    updatedAt: String(record.updatedAt || new Date().toISOString())
});

const normalizeVaccine = (record: Partial<VaccineRecord>): VaccineRecord => ({
    id: String(record.id || createId('vaccine')),
    name: String(record.name || ''),
    description: String(record.description || ''),
    ageGroup: String(record.ageGroup || ''),
    schedule: Array.isArray(record.schedule)
        ? record.schedule.map((entry) => String(entry))
        : String(record.schedule || '')
            .split('|')
            .map((entry) => entry.trim())
            .filter(Boolean),
    createdAt: String(record.createdAt || new Date().toISOString()),
    updatedAt: String(record.updatedAt || new Date().toISOString())
});

const createWorkbook = () => {
    const workbook = XLSX.utils.book_new();
    const seed: DatabaseShape = {
        users: [],
        children: [],
        appointments: [],
        vaccines: defaultVaccines,
        vaccineDoses: [],
        auditLogs: []
    };

    (Object.keys(sheetNames) as SheetName[]).forEach((sheetKey) => {
        const rows = seed[sheetKey].map((row) => serialize(sheetKey, row));
        const worksheet = XLSX.utils.json_to_sheet(rows);
        XLSX.utils.book_append_sheet(workbook, worksheet, sheetNames[sheetKey]);
    });

    XLSX.writeFile(workbook, workbookPath);
};

const ensureWorkbook = () => {
    if (!fs.existsSync(dataDirectory)) {
        fs.mkdirSync(dataDirectory, { recursive: true });
    }

    if (!fs.existsSync(workbookPath)) {
        createWorkbook();
    }
};

const serialize = (sheet: SheetName, row: any) => {
    if (sheet === 'vaccines') {
        return {
            ...row,
            schedule: Array.isArray(row.schedule) ? row.schedule.join('|') : row.schedule
        };
    }

    return row;
};

const deserialize = <T>(sheet: SheetName, row: any): T => {
    if (sheet === 'users') {
        return normalizeUser(row) as unknown as T;
    }

    if (sheet === 'vaccines') {
        return normalizeVaccine(row) as unknown as T;
    }

    return row as T;
};

const readWorkbook = () => {
    ensureWorkbook();
    return XLSX.readFile(workbookPath);
};

const writeWorkbook = (workbook: XLSX.WorkBook) => {
    XLSX.writeFile(workbook, workbookPath);
};

export const createId = (prefix: string) => `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

export const initializeExcelDatabase = () => {
    ensureWorkbook();
};

export const readSheet = <T>(sheet: SheetName): T[] => {
    const workbook = readWorkbook();
    const worksheet = workbook.Sheets[sheetNames[sheet]];

    if (!worksheet) {
        return [];
    }

    const rows = XLSX.utils.sheet_to_json<any>(worksheet, { defval: '' });
    return rows.map((row) => deserialize<T>(sheet, row));
};

export const writeSheet = <T>(sheet: SheetName, rows: T[]) => {
    const workbook = readWorkbook();
    const serializedRows = rows.map((row) => serialize(sheet, row));
    const worksheet = XLSX.utils.json_to_sheet(serializedRows);
    workbook.Sheets[sheetNames[sheet]] = worksheet;

    if (!workbook.SheetNames.includes(sheetNames[sheet])) {
        workbook.SheetNames.push(sheetNames[sheet]);
    }

    writeWorkbook(workbook);
};

export const usersStore = {
    list: () => readSheet<UserRecord>('users'),
    save: (rows: UserRecord[]) => writeSheet('users', rows)
};

export const childrenStore = {
    list: () => readSheet<ChildRecord>('children'),
    save: (rows: ChildRecord[]) => writeSheet('children', rows)
};

export const appointmentsStore = {
    list: () => readSheet<AppointmentRecord>('appointments'),
    save: (rows: AppointmentRecord[]) => writeSheet('appointments', rows)
};

export const vaccinesStore = {
    list: () => readSheet<VaccineRecord>('vaccines'),
    save: (rows: VaccineRecord[]) => writeSheet('vaccines', rows)
};

export const vaccineDosesStore = {
    list: () => readSheet<VaccineDoseRecord>('vaccineDoses'),
    save: (rows: VaccineDoseRecord[]) => writeSheet('vaccineDoses', rows)
};

export const auditLogsStore = {
    list: () => readSheet<AuditLogRecord>('auditLogs'),
    save: (rows: AuditLogRecord[]) => writeSheet('auditLogs', rows)
};