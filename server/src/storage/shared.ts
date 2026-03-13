import { VaccineRecord } from '../types/entities';

export const createId = (prefix: string) => `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

export const defaultVaccines: VaccineRecord[] = [
    {
        id: 'vaccine-bcg',
        name: 'BCG',
        description: 'لقاح ضد السل يعطى خلال أول 4 أسابيع بعد الولادة.',
        ageGroup: 'حديثو الولادة',
        schedule: ['خلال أول 4 أسابيع بعد الولادة'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        id: 'vaccine-pentavalent',
        name: 'Pentavalent',
        description: 'لقاح مركب ضد عدة أمراض في الجرعات الأولى.',
        ageGroup: 'الرضع',
        schedule: ['8 أسابيع', '12 أسبوعاً', '16 أسبوعاً'],
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