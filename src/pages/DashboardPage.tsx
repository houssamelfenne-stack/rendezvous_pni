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
    const todayKey = new Date().toISOString().slice(0, 10);
    const activeAlerts = useMemo(() => {
        return appointments
            .filter((appointment) => {
                const status = appointment.status || 'scheduled';
                const reminderDate = appointment.notificationDate || appointment.appointmentDate || appointment.date || '';

                if (status === 'completed' || status === 'cancelled') {
                    return false;
                }

                return Boolean(appointment.notificationSentAt) || Boolean(reminderDate && reminderDate <= todayKey);
            })
            .sort((left, right) => (left.notificationDate || left.appointmentDate).localeCompare(right.notificationDate || right.appointmentDate));
    }, [appointments, todayKey]);

    return (
        <main className="page">
            <div className="content-card">
                <h1>{t('appointments.welcome', { name: user?.fullName || '' })}</h1>
                {activeAlerts.length > 0 ? (
                    <section className="appointment-alerts">
                        <div className="appointment-alerts__header">
                            <h2>{t('dashboard.alertsTitle')}</h2>
                            <span className="status-pill status-pill--warn">{activeAlerts.length}</span>
                        </div>
                        <div className="appointment-alerts__list">
                            {activeAlerts.map((appointment) => (
                                <article key={appointment.id} className="appointment-alert-card appointment-alert-card--active">
                                    <strong>{appointment.notificationMessage || t('appointments.attendPrompt')}</strong>
                                    <span>{appointment.childName || appointment.childId} • {appointment.vaccine || appointment.vaccineId}</span>
                                    <span>{t('appointments.date')}: {appointment.appointmentDate}</span>
                                    {appointment.notificationDate ? <span>{t('appointments.notificationDate')}: {appointment.notificationDate}</span> : null}
                                </article>
                            ))}
                        </div>
                    </section>
                ) : null}
                <h2>{t('dashboard.appointments')}</h2>
                <AppointmentCalendar appointments={mergedAppointments} />
                <h2>{t('dashboard.children')}</h2>
                <ChildList children={children} />
            </div>
        </main>
    );
};

export default DashboardPage;