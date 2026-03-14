import React, { useMemo, useState } from 'react';
import { useAppPreferences } from '../context/AppPreferencesContext';
import AppointmentList from '../components/appointments/AppointmentList';
import AppointmentCalendar from '../components/appointments/AppointmentCalendar';
import { useAppointments } from '../hooks/useAppointments';
import { useChildren } from '../hooks/useChildren';
import { mergeAppointmentsWithExpected } from '../utils/appointmentPlanner';

const getCurrentMonthKey = () => new Date().toISOString().slice(0, 7);

const AppointmentsPage: React.FC = () => {
    const { t } = useAppPreferences();
    const { appointments, loading, error } = useAppointments();
    const { children, loading: childrenLoading, error: childrenError } = useChildren();
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [activeMonth, setActiveMonth] = useState(getCurrentMonthKey());
    const todayKey = new Date().toISOString().slice(0, 10);
    const mergedAppointments = useMemo(() => mergeAppointmentsWithExpected(appointments, children), [appointments, children]);
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
    const filteredAppointments = useMemo(() => {
        return mergedAppointments.filter((appointment) => {
            const appointmentDate = appointment.appointmentDate || appointment.date || '';

            if (selectedDate) {
                return appointmentDate === selectedDate;
            }

            return appointmentDate.startsWith(activeMonth);
        });
    }, [activeMonth, mergedAppointments, selectedDate]);

    const listTitle = selectedDate
        ? t('appointments.listTitleDay', { day: selectedDate })
        : t('appointments.listTitleMonth', { month: activeMonth });

    const emptyMessage = selectedDate
        ? t('appointments.emptyDay')
        : t('appointments.emptyMonth');

    return (
        <main className="page">
            <div className="content-card">
            <h1>{t('appointments.pageTitle')}</h1>
            {activeAlerts.length > 0 ? (
                <section className="appointment-alerts appointment-alerts--page">
                    <div className="appointment-alerts__header">
                        <h2>{t('appointments.alertsTitle')}</h2>
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
            <AppointmentCalendar
                appointments={mergedAppointments}
                selectedDate={selectedDate}
                onSelectionChange={({ selectedDate: nextSelectedDate, activeMonth: nextActiveMonth }) => {
                    setSelectedDate(nextSelectedDate);
                    setActiveMonth(nextActiveMonth);
                }}
            />
            <AppointmentList
                appointments={filteredAppointments}
                loading={loading || childrenLoading}
                error={error || childrenError}
                title={listTitle}
                emptyMessage={emptyMessage}
            />
            </div>
        </main>
    );
};

export default AppointmentsPage;