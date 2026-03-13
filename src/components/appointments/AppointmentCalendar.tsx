import React from 'react';
import { Calendar } from 'react-calendar';
import { Appointment } from '../../types/Appointment';
import { Value } from 'react-calendar/dist/cjs/shared/types';
import { useAppPreferences } from '../../context/AppPreferencesContext';
import { getChildColor } from '../../utils/appointmentVisuals';
import 'react-calendar/dist/Calendar.css';
import './AppointmentCalendar.css';

interface AppointmentCalendarProps {
    appointments: Appointment[];
    selectedDate?: string | null;
    onSelectionChange?: (selection: { selectedDate: string | null; activeMonth: string }) => void;
}

const formatDateKey = (value: Date) => {
    const day = String(value.getDate()).padStart(2, '0');
    const month = String(value.getMonth() + 1).padStart(2, '0');
    const year = value.getFullYear();

    return `${year}-${month}-${day}`;
};

const formatMonthKey = (value: Date) => {
    const month = String(value.getMonth() + 1).padStart(2, '0');
    return `${value.getFullYear()}-${month}`;
};

const AppointmentCalendar: React.FC<AppointmentCalendarProps> = ({ appointments, selectedDate = null, onSelectionChange }) => {
    const { language, t } = useAppPreferences();
    const today = React.useMemo(() => new Date(), []);
    const [date, setDate] = React.useState<Date | null>(today);
    const [activeMonth, setActiveMonth] = React.useState<Date>(today);
    const appointmentsByDate = appointments.reduce<Record<string, Appointment[]>>((accumulator, appointment) => {
        const sourceDate = appointment.appointmentDate || appointment.date;

        if (!sourceDate) {
            return accumulator;
        }

        if (!accumulator[sourceDate]) {
            accumulator[sourceDate] = [];
        }

        accumulator[sourceDate].push(appointment);
        return accumulator;
    }, {});

    const visibleChildren = Array.from(
        new Map(
            appointments
                .filter((appointment) => appointment.childName)
                .map((appointment) => [appointment.childId, appointment.childName || appointment.childId])
        ).entries()
    ).slice(0, 8);

    const handleDateChange = (newDate: Value) => {
        if (newDate instanceof Date) {
            setDate(newDate);
            onSelectionChange?.({
                selectedDate: formatDateKey(newDate),
                activeMonth: formatMonthKey(activeMonth)
            });
            return;
        }

        if (Array.isArray(newDate) && newDate[0] instanceof Date) {
            setDate(newDate[0]);
            onSelectionChange?.({
                selectedDate: formatDateKey(newDate[0]),
                activeMonth: formatMonthKey(activeMonth)
            });
        }
    };

    const handleActiveStartDateChange = ({ activeStartDate }: { activeStartDate: Date | null }) => {
        if (!activeStartDate) {
            return;
        }

        setActiveMonth(activeStartDate);
        setDate(activeStartDate);
        onSelectionChange?.({
            selectedDate: null,
            activeMonth: formatMonthKey(activeStartDate)
        });
    };

    const resetToMonthView = () => {
        onSelectionChange?.({
            selectedDate: null,
            activeMonth: formatMonthKey(activeMonth)
        });
    };

    return (
        <div className="appointment-calendar">
            <h2>{t('appointments.calendarTitle')}</h2>
            <div className="appointment-calendar__toolbar">
                <p className="page-copy">
                    {selectedDate ? t('appointments.dayView', { day: selectedDate }) : t('appointments.monthView', { month: formatMonthKey(activeMonth) })}
                </p>
                {selectedDate ? (
                    <button type="button" className="button button--secondary appointment-calendar__reset" onClick={resetToMonthView}>
                        {t('appointments.backToMonth')}
                    </button>
                ) : null}
            </div>
            <Calendar
                locale={language === 'ar' ? 'ar-MA' : 'fr-FR'}
                onChange={handleDateChange}
                value={date}
                onActiveStartDateChange={handleActiveStartDateChange}
                tileClassName={({ date: tileDate, view }) => {
                    if (view !== 'month') {
                        return undefined;
                    }

                    return appointmentsByDate[formatDateKey(tileDate)]?.length ? 'appointment-calendar__tile appointment-calendar__tile--has-events' : undefined;
                }}
                tileContent={({ date: tileDate, view }) => {
                    if (view !== 'month') {
                        return null;
                    }

                    const dayAppointments = appointmentsByDate[formatDateKey(tileDate)] || [];

                    if (!dayAppointments.length) {
                        return null;
                    }

                    return (
                        <div className="appointment-calendar__chips">
                            {dayAppointments.slice(0, 2).map((appointment) => (
                                <span
                                    key={appointment.id}
                                    className="appointment-calendar__chip"
                                    style={{ backgroundColor: getChildColor(appointment.childId) }}
                                    title={`${appointment.vaccine || appointment.vaccineId} - ${appointment.childName || appointment.childId}`}
                                >
                                    {appointment.vaccine || appointment.vaccineId}
                                </span>
                            ))}
                            {dayAppointments.length > 2 ? (
                                <span className="appointment-calendar__chip appointment-calendar__chip--more">...</span>
                            ) : null}
                        </div>
                    );
                }}
            />
            <div className="appointment-calendar__legend">
                {visibleChildren.map(([childId, childName]) => (
                    <span key={childId}><i className="appointment-calendar__legend-dot" style={{ backgroundColor: getChildColor(childId) }} /> {childName}</span>
                ))}
            </div>
        </div>
    );
};

export default AppointmentCalendar;