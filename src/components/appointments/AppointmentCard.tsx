import React from 'react';
import { useAppPreferences } from '../../context/AppPreferencesContext';
import { Appointment } from '../../types/Appointment';
import { getChildColor } from '../../utils/appointmentVisuals';

interface AppointmentCardProps {
    appointment: Appointment;
}

const AppointmentCard: React.FC<AppointmentCardProps> = ({ appointment }) => {
    const { t } = useAppPreferences();
    const statusLabel = appointment.status === 'overdue'
        ? t('appointments.statusOverdue')
        : appointment.status === 'today'
            ? t('appointments.statusToday')
            : appointment.status === 'scheduled'
                ? t('appointments.statusScheduled')
                : appointment.status || t('appointments.statusScheduled');

    return (
        <div className={`appointment-card ${appointment.source === 'expected' ? 'appointment-card--expected' : 'appointment-card--saved'}`}>
            <div className="appointment-card__header">
                <h3>{appointment.vaccine || appointment.vaccineId}</h3>
                <span className="appointment-card__child-pill" style={{ backgroundColor: getChildColor(appointment.childId) }}>
                    {appointment.childName || `الطفل #${appointment.childId}`}
                </span>
            </div>
            <p>{t('appointments.date')}: {new Date(appointment.appointmentDate || appointment.date || '').toLocaleDateString()}</p>
            {appointment.time && <p>{t('appointments.time')}: {appointment.time}</p>}
            <p>{t('appointments.status')}: {statusLabel}</p>
            <p>{t('appointments.type')}: {appointment.source === 'expected' ? t('appointments.typeExpected') : t('appointments.typeSaved')}</p>
            {appointment.notes ? <p>{t('appointments.note')}: {appointment.source === 'expected' ? t('appointments.typeExpected') : appointment.notes}</p> : null}
        </div>
    );
};

export default AppointmentCard;