import React from 'react';
import { useAppPreferences } from '../../context/AppPreferencesContext';
import { Appointment } from '../../types/Appointment';
import AppointmentCard from './AppointmentCard';

interface AppointmentListProps {
    appointments: Appointment[];
    loading: boolean;
    error: string | null;
    title?: string;
    emptyMessage?: string;
}

const AppointmentList: React.FC<AppointmentListProps> = ({ appointments, loading, error, title, emptyMessage }) => {
    const { t } = useAppPreferences();

    if (loading) {
        return <div>{t('appointments.loading')}</div>;
    }

    if (error) {
        return <div>{t('appointments.error', { error: t(error) })}</div>;
    }

    return (
        <div>
            <h2>{title || t('appointments.listTitleDefault')}</h2>
            {appointments.length === 0 ? (
                <p>{emptyMessage || t('appointments.emptyDefault')}</p>
            ) : (
                <div className="appointment-card-list">
                    {appointments.map(appointment => (
                        <AppointmentCard key={appointment.id} appointment={appointment} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default AppointmentList;