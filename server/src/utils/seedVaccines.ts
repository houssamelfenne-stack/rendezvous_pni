import { createId, vaccinesStore } from '../storage/excelDatabase';
import { VaccineRecord } from '../types/entities';

const seedVaccines = async () => {
    const timestamp = new Date().toISOString();
    const vaccines: VaccineRecord[] = [
        {
            id: createId('vaccine'),
            name: 'BCG',
            description: 'Bacillus Calmette-Guérin vaccine for tuberculosis.',
            ageGroup: 'Birth',
            schedule: ['At birth'],
            createdAt: timestamp,
            updatedAt: timestamp
        },
        {
            id: createId('vaccine'),
            name: 'Hepatitis B',
            description: 'Vaccine to prevent hepatitis B infection.',
            ageGroup: 'Birth',
            schedule: ['At birth', '1 month', '6 months'],
            createdAt: timestamp,
            updatedAt: timestamp
        },
        {
            id: createId('vaccine'),
            name: 'DTP',
            description: 'Diphtheria, Tetanus, and Pertussis vaccine.',
            ageGroup: '2 months',
            schedule: ['2 months', '4 months', '6 months'],
            createdAt: timestamp,
            updatedAt: timestamp
        },
        {
            id: createId('vaccine'),
            name: 'Polio',
            description: 'Inactivated poliovirus vaccine.',
            ageGroup: '2 months',
            schedule: ['2 months', '4 months', '6 months'],
            createdAt: timestamp,
            updatedAt: timestamp
        },
        {
            id: createId('vaccine'),
            name: 'MMR',
            description: 'Measles, Mumps, and Rubella vaccine.',
            ageGroup: '12 months',
            schedule: ['12 months', '4 years'],
            createdAt: timestamp,
            updatedAt: timestamp
        },
        {
            id: createId('vaccine'),
            name: 'Varicella',
            description: 'Chickenpox vaccine.',
            ageGroup: '12 months',
            schedule: ['12 months', '4 years'],
            createdAt: timestamp,
            updatedAt: timestamp
        },
        {
            id: createId('vaccine'),
            name: 'Hepatitis A',
            description: 'Vaccine to prevent hepatitis A infection.',
            ageGroup: '1 year',
            schedule: ['1 year', '2 years'],
            createdAt: timestamp,
            updatedAt: timestamp
        }
    ];

    try {
        vaccinesStore.save(vaccines);
        console.log('Vaccines seeded successfully!');
    } catch (error) {
        console.error('Error seeding vaccines:', error);
    }
};

export default seedVaccines;