import { Appointment } from '../types/Appointment';
import { Child } from '../types/Child';
import { buildPniSchedule, normalizePniAntigen } from './pniSchedule';

const getTodayIso = () => new Date().toISOString().slice(0, 10);

const deriveStatus = (appointmentDate: string) => {
    const todayIso = getTodayIso();

    if (appointmentDate < todayIso) {
        return 'overdue';
    }

    if (appointmentDate === todayIso) {
        return 'today';
    }

    return 'scheduled';
};

const toLookupKey = (appointment: Pick<Appointment, 'childId' | 'appointmentDate' | 'vaccine' | 'vaccineId'>) => {
    return [
        appointment.childId,
        appointment.appointmentDate,
        normalizePniAntigen(appointment.vaccine || appointment.vaccineId || '')
    ].join('::');
};

export const buildExpectedAppointments = (children: Child[]): Appointment[] => {
    return children.flatMap((child) => {
        return buildPniSchedule(child.dateOfBirth).map((dose) => ({
            id: `expected-${child.id}-${dose.antigen}-${dose.offsetDays}`,
            childId: child.id,
            childName: child.fullName,
            appointmentDate: dose.scheduledDateIso,
            vaccineId: dose.antigen,
            vaccine: dose.antigen,
            status: deriveStatus(dose.scheduledDateIso),
            notes: 'موعد مفترض آلياً حسب تاريخ الازدياد',
            source: 'expected' as const
        }));
    });
};

export const mergeAppointmentsWithExpected = (savedAppointments: Appointment[], children: Child[]): Appointment[] => {
    const childNameById = new Map(children.map((child) => [child.id, child.fullName]));
    const normalizedSavedAppointments = savedAppointments.map((appointment) => ({
        ...appointment,
        childName: appointment.childName || childNameById.get(appointment.childId) || appointment.childName,
        status: appointment.status || deriveStatus(appointment.appointmentDate || appointment.date || ''),
        source: 'saved' as const
    }));

    const savedKeys = new Set(normalizedSavedAppointments.map((appointment) => toLookupKey({
        childId: appointment.childId,
        appointmentDate: appointment.appointmentDate || appointment.date || '',
        vaccine: appointment.vaccine,
        vaccineId: appointment.vaccineId
    })));

    const expectedAppointments = buildExpectedAppointments(children).filter((appointment) => !savedKeys.has(toLookupKey(appointment)));

    return [...normalizedSavedAppointments, ...expectedAppointments].sort((left, right) => {
        const leftDate = left.appointmentDate || left.date || '';
        const rightDate = right.appointmentDate || right.date || '';

        if (leftDate === rightDate) {
            return (left.childName || '').localeCompare(right.childName || '');
        }

        return leftDate.localeCompare(rightDate);
    });
};