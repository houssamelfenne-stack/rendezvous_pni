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
    const mergedAppointments = useMemo(() => mergeAppointmentsWithExpected(appointments, children), [appointments, children]);
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