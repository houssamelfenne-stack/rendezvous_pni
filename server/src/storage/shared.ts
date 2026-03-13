import { VaccineRecord } from '../types/entities';

export const createId = (prefix: string) => `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

export const defaultVaccines: VaccineRecord[] = [
    {
        id: 'vaccine-bcg',
        name: 'BCG',
        description: 'لقاح ضد السل يعطى عند الولادة.',
        ageGroup: 'حديثو الولادة',
        schedule: ['عند الولادة'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        id: 'vaccine-pentavalent',
        name: 'Pentavalent',
        description: 'لقاح مركب ضد عدة أمراض في الجرعات الأولى.',
        ageGroup: 'الرضع',
        schedule: ['شهران', '4 أشهر', '6 أشهر'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        id: 'vaccine-mmr',
        name: 'MMR',
        description: 'لقاح الحصبة والنكاف والحصبة الألمانية.',
        ageGroup: 'الأطفال',
        schedule: ['9 أشهر', '18 شهراً'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    }
];