import React from 'react';
import { Vaccine } from '../../types/Vaccine';

interface VaccineListProps {
    vaccines: Vaccine[];
}

const VaccineList: React.FC<VaccineListProps> = ({ vaccines }) => {
    return (
        <div>
            <h2>Available Vaccines</h2>
            <ul>
                {vaccines.map((vaccine) => (
                    <li key={vaccine.id}>
                        <h3>{vaccine.name}</h3>
                        <p>{vaccine.description}</p>
                        <p>Recommended Age: {vaccine.recommendedAge || vaccine.ageGroup}</p>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default VaccineList;