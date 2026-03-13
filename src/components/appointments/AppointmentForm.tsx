import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { createAppointment } from '../../services/appointmentService';
import FormInput from '../common/FormInput';

const AppointmentForm: React.FC = () => {
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [childId, setChildId] = useState('');
    const [error, setError] = useState('');
    const history = useHistory();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            await createAppointment({
                id: '',
                childId,
                appointmentDate: date,
                vaccineId: '',
                time,
                date,
                status: 'scheduled'
            });
            history.push('/appointments');
        } catch (err) {
            setError('Failed to create appointment. Please try again.');
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <h2>Schedule Appointment</h2>
            {error && <p className="error">{error}</p>}
            <FormInput
                label="Date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
            />
            <FormInput
                label="Time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                required
            />
            <FormInput
                label="Child ID"
                type="text"
                value={childId}
                onChange={(e) => setChildId(e.target.value)}
                required
            />
            <button type="submit">Schedule Appointment</button>
        </form>
    );
};

export default AppointmentForm;