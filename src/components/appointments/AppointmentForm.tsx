import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useAppPreferences } from '../../context/AppPreferencesContext';
import { createAppointment } from '../../services/appointmentService';
import FormInput from '../common/FormInput';

const AppointmentForm: React.FC = () => {
    const { t } = useAppPreferences();
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
            setError(t('appointmentForm.errorCreate'));
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <h2>{t('appointmentForm.title')}</h2>
            {error && <p className="error">{error}</p>}
            <FormInput
                label={t('appointmentForm.date')}
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
            />
            <FormInput
                label={t('appointmentForm.time')}
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                required
            />
            <FormInput
                label={t('appointmentForm.childId')}
                type="text"
                value={childId}
                onChange={(e) => setChildId(e.target.value)}
                required
            />
            <button type="submit">{t('appointmentForm.submit')}</button>
        </form>
    );
};

export default AppointmentForm;