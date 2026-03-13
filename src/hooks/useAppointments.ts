import { useState, useEffect } from 'react';
import { Appointment } from '../types/Appointment';
import { getAppointments, createAppointment, deleteAppointment } from '../services/appointmentService';

const useAppointments = (enabled = true) => {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!enabled) {
            setAppointments([]);
            setLoading(false);
            setError(null);
            return;
        }

        const fetchAppointments = async () => {
            try {
                setLoading(true);
                const data = await getAppointments();
                setAppointments(data);
                setError(null);
            } catch (err) {
                setError('Failed to fetch appointments');
            } finally {
                setLoading(false);
            }
        };

        fetchAppointments();
    }, [enabled]);

    const addAppointment = async (appointment: Appointment) => {
        try {
            const newAppointment = await createAppointment(appointment);
            setAppointments((prev) => [...prev, newAppointment]);
        } catch (err) {
            setError('Failed to create appointment');
        }
    };

    const removeAppointment = async (id: string) => {
        try {
            await deleteAppointment(id);
            setAppointments((prev) => prev.filter((appointment) => appointment.id !== id));
        } catch (err) {
            setError('Failed to delete appointment');
        }
    };

    return {
        appointments,
        loading,
        error,
        addAppointment,
        removeAppointment,
    };
};

export default useAppointments;
export { useAppointments };