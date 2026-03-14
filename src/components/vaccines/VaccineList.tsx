import React from 'react';
import { useAppPreferences } from '../../context/AppPreferencesContext';
import { Vaccine } from '../../types/Vaccine';

interface VaccineListProps {
    vaccines: Vaccine[];
}

const VaccineList: React.FC<VaccineListProps> = ({ vaccines }) => {
    const { t } = useAppPreferences();

    return (
        <div>
            <h2>{t('vaccineList.title')}</h2>
            <ul>
                {vaccines.map((vaccine) => (
                    <li key={vaccine.id}>
                        <h3>{vaccine.name}</h3>
                        <p>{vaccine.description}</p>
                        <p>{t('vaccineList.recommendedAge')}: {vaccine.recommendedAge || vaccine.ageGroup}</p>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default VaccineList;