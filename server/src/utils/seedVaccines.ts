import { createId, getDatabase } from '../storage/database';
import { VaccineRecord } from '../types/entities';

const seedVaccines = async () => {
    const timestamp = new Date().toISOString();
    const vaccines: VaccineRecord[] = [
        {
            id: createId('vaccine'),
            name: 'Hepatitis B (HB)',
            description: 'Birth dose when available or catch-up dose within the first four weeks after birth.',
            ageGroup: 'Birth / first 4 weeks',
            schedule: ['At birth (HB1n)', 'Within first 4 weeks (HB1)'],
            createdAt: timestamp,
            updatedAt: timestamp
        },
        {
            id: createId('vaccine'),
            name: 'BCG',
            description: 'Bacillus Calmette-Guérin vaccine for tuberculosis.',
            ageGroup: 'First 4 weeks',
            schedule: ['Within first 4 weeks after birth'],
            createdAt: timestamp,
            updatedAt: timestamp
        },
        {
            id: createId('vaccine'),
            name: 'Oral Polio',
            description: 'Oral polio vaccination series according to the national schedule.',
            ageGroup: 'First 4 weeks to 5 years',
            schedule: ['Within first 4 weeks (VPO0)', '8 weeks (VPO1)', '12 weeks (VPO2)', '16 weeks (VPO3)', '18 months (VPO4)', '5 years (VPO5)'],
            createdAt: timestamp,
            updatedAt: timestamp
        },
        {
            id: createId('vaccine'),
            name: 'Pentavalent',
            description: 'DTC-Hib-HB pentavalent series.',
            ageGroup: '8 weeks',
            schedule: ['8 weeks', '12 weeks', '16 weeks'],
            createdAt: timestamp,
            updatedAt: timestamp
        },
        {
            id: createId('vaccine'),
            name: 'Pneumococcal (PCV)',
            description: 'Pneumococcal conjugate vaccination series.',
            ageGroup: '10 weeks',
            schedule: ['10 weeks (PCV1)', '18 weeks (PCV2)', '6 months (PCV3)', '12 months (PCV4)'],
            createdAt: timestamp,
            updatedAt: timestamp
        },
        {
            id: createId('vaccine'),
            name: 'Rotavirus',
            description: 'Rotavirus vaccination series.',
            ageGroup: '8 weeks',
            schedule: ['8 weeks (Rota1)', '12 weeks (Rota2)', '16 weeks (Rota3)'],
            createdAt: timestamp,
            updatedAt: timestamp
        },
        {
            id: createId('vaccine'),
            name: 'Inactivated Polio (VPI)',
            description: 'Inactivated poliovirus booster doses.',
            ageGroup: '16 weeks',
            schedule: ['16 weeks (VPI1)', '9 months (VPI2)'],
            createdAt: timestamp,
            updatedAt: timestamp
        },
        {
            id: createId('vaccine'),
            name: 'Rougeole, Rubéole (RR)',
            description: 'Measles and rubella vaccination series.',
            ageGroup: '9 months',
            schedule: ['9 months (RR1)', '18 months (RR2)'],
            createdAt: timestamp,
            updatedAt: timestamp
        },
        {
            id: createId('vaccine'),
            name: 'Diphtheria, Tetanus, Coqueluche (DTC)',
            description: 'DTC booster doses.',
            ageGroup: '18 months',
            schedule: ['18 months (DTC1)', '5 years (DTC2)'],
            createdAt: timestamp,
            updatedAt: timestamp
        },
        {
            id: createId('vaccine'),
            name: 'HPV',
            description: 'Human papillomavirus vaccine.',
            ageGroup: '11 years',
            schedule: ['11 years'],
            createdAt: timestamp,
            updatedAt: timestamp
        }
    ];

    try {
        await getDatabase().vaccinesStore.save(vaccines);
        console.log('Vaccines seeded successfully!');
    } catch (error) {
        console.error('Error seeding vaccines:', error);
    }
};

export default seedVaccines;