import React, { useMemo } from 'react';
import { useAppPreferences } from '../context/AppPreferencesContext';
import { useAuth } from '../hooks/useAuth';
import AppointmentCalendar from '../components/appointments/AppointmentCalendar';
import ChildList from '../components/children/ChildList';
import { useChildren } from '../hooks/useChildren';
import { useAppointments } from '../hooks/useAppointments';
import { mergeAppointmentsWithExpected } from '../utils/appointmentPlanner';

const DashboardPage: React.FC = () => {
    const { user } = useAuth();
    const { t } = useAppPreferences();
    const { children } = useChildren();
    const { appointments } = useAppointments();
    const mergedAppointments = useMemo(() => mergeAppointmentsWithExpected(appointments, children), [appointments, children]);

    return (
        <main className="page">
            <div className="content-card">
                <h1>{t('appointments.welcome', { name: user?.fullName || '' })}</h1>
                <h2>{t('dashboard.appointments')}</h2>
                <AppointmentCalendar appointments={mergedAppointments} />
                <h2>{t('dashboard.children')}</h2>
                <ChildList children={children} />
            </div>
        </main>
    );
};

export default DashboardPage;