import { VaccineRecord } from '../types/entities';
import { AppDatabase } from './types';

export const createId = (prefix: string) => `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

const timestamp = () => new Date().toISOString();

export const defaultVaccines: VaccineRecord[] = [
    {
        id: 'vaccine-hepatitis-b',
        name: 'Hepatitis B (HB)',
        description: 'Birth dose or catch-up dose within the first four weeks when HBn was not administered at birth.',
        ageGroup: 'Birth / first 4 weeks',
        schedule: ['At birth (HBn)', 'Within first 4 weeks (HB1)'],
        createdAt: timestamp(),
        updatedAt: timestamp()
    },
    {
        id: 'vaccine-bcg',
        name: 'BCG',
        description: 'Tuberculosis vaccine administered within the first four weeks after birth.',
        ageGroup: 'First 4 weeks',
        schedule: ['Within first 4 weeks after birth'],
        createdAt: timestamp(),
        updatedAt: timestamp()
    },
    {
        id: 'vaccine-oral-polio',
        name: 'Oral Polio',
        description: 'Oral polio vaccination series according to the national schedule.',
        ageGroup: 'First 4 weeks to 5 years',
        schedule: ['Within first 4 weeks (VPO0)', '8 weeks (VPO1)', '12 weeks (VPO2)', '16 weeks (VPO3)', '18 months (VPO4)', '5 years (VPO5)'],
        createdAt: timestamp(),
        updatedAt: timestamp()
    },
    {
        id: 'vaccine-pentavalent',
        name: 'Pentavalent',
        description: 'DTC-Hib-HB pentavalent series.',
        ageGroup: '8 to 16 weeks',
        schedule: ['8 weeks (Penta1)', '12 weeks (Penta2)', '16 weeks (Penta3)'],
        createdAt: timestamp(),
        updatedAt: timestamp()
    },
    {
        id: 'vaccine-pcv',
        name: 'Pneumococcal (PCV)',
        description: 'Pneumococcal conjugate vaccination series.',
        ageGroup: '10 weeks to 12 months',
        schedule: ['10 weeks (PCV1)', '16 weeks (PCV2)', '18 weeks (PCV3)', '12 months (PCV4)'],
        createdAt: timestamp(),
        updatedAt: timestamp()
    },
    {
        id: 'vaccine-rotavirus',
        name: 'Rotavirus',
        description: 'Rotavirus vaccination series.',
        ageGroup: '8 to 16 weeks',
        schedule: ['8 weeks (Rota1)', '12 weeks (Rota2)', '16 weeks (Rota3)'],
        createdAt: timestamp(),
        updatedAt: timestamp()
    },
    {
        id: 'vaccine-vpi',
        name: 'Inactivated Polio (VPI)',
        description: 'Inactivated poliovirus booster doses.',
        ageGroup: '12 weeks and 9 months',
        schedule: ['12 weeks (VPI1)', '9 months (VPI2)'],
        createdAt: timestamp(),
        updatedAt: timestamp()
    },
    {
        id: 'vaccine-rr',
        name: 'Rougeole Rubeole (RR)',
        description: 'Measles and rubella vaccination series.',
        ageGroup: '9 to 18 months',
        schedule: ['9 months (RR1)', '18 months (RR2)'],
        createdAt: timestamp(),
        updatedAt: timestamp()
    },
    {
        id: 'vaccine-dtc',
        name: 'Diphtheria Tetanus Coqueluche (DTC)',
        description: 'DTC booster doses.',
        ageGroup: '18 months to 5 years',
        schedule: ['18 months (DTC1)', '5 years (DTC2)'],
        createdAt: timestamp(),
        updatedAt: timestamp()
    },
    {
        id: 'vaccine-hpv',
        name: 'HPV',
        description: 'Human papillomavirus vaccine.',
        ageGroup: '11 years',
        schedule: ['11 years'],
        createdAt: timestamp(),
        updatedAt: timestamp()
    }
];

const normalizeValue = (value: string) => value.trim().toLowerCase();

export const ensureDefaultVaccines = async (database: AppDatabase) => {
    const vaccines = await database.vaccinesStore.list();
    const existingIds = new Set(vaccines.map((vaccine) => vaccine.id));
    const existingNames = new Set(vaccines.map((vaccine) => normalizeValue(vaccine.name)));
    const missingVaccines = defaultVaccines.filter((vaccine) => !existingIds.has(vaccine.id) && !existingNames.has(normalizeValue(vaccine.name)));

    if (missingVaccines.length === 0) {
        return;
    }

    await database.vaccinesStore.save([...vaccines, ...missingVaccines]);
};