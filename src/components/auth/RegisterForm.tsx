import React, { useState } from 'react';
import axios from 'axios';
import { useHistory } from 'react-router-dom';
import { registerUser } from '../../services/authService';
import { useAppPreferences } from '../../context/AppPreferencesContext';
import FormInput from '../common/FormInput';
import { User } from '../../types/User';
import { GENDER_OPTIONS } from '../../utils/genderOptions';

const RegisterForm: React.FC = () => {
    const { t } = useAppPreferences();
    const [fullName, setFullName] = useState('');
    const [gender, setGender] = useState('');
    const [dateOfBirth, setDateOfBirth] = useState('');
    const [nationalId, setNationalId] = useState('');
    const [address, setAddress] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const history = useHistory();

    const getRegistrationErrorMessage = (err: unknown) => {
        if (!axios.isAxiosError(err)) {
            return t('auth.registerErrorGeneric');
        }

        if (!err.response) {
            return t('auth.registerServiceUnavailable');
        }

        const responseData = err.response.data as {
            message?: string;
            errors?: Array<{ msg?: string }>;
        };

        if (responseData.errors?.length) {
            return responseData.errors
                .map((entry) => entry.msg)
                .filter(Boolean)
                .join(' ');
        }

        return responseData.message || t('auth.registerRetry');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            await registerUser({ fullName, gender: gender as User['gender'], dateOfBirth, nationalId, address, phoneNumber, password });
            history.push('/login');
        } catch (err) {
            setError(getRegistrationErrorMessage(err));
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <h2>{t('auth.registerTitle')}</h2>
            {error && <p className="error">{error}</p>}
            <FormInput label={t('auth.fullName')} value={fullName} onChange={(e) => setFullName(e.target.value)} required />
            <label>
                {t('auth.gender')}
                <select value={gender} onChange={(e) => setGender(e.target.value)} required>
                    <option value="">{t('auth.selectGender')}</option>
                    {GENDER_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                            {t(`gender.${option.value}`)}
                        </option>
                    ))}
                </select>
            </label>
            <FormInput label={t('auth.dateOfBirth')} type="date" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} required />
            <FormInput label={t('auth.nationalId')} value={nationalId} onChange={(e) => setNationalId(e.target.value)} placeholder={t('auth.nationalIdPlaceholder')} required />
            <FormInput label={t('auth.address')} value={address} onChange={(e) => setAddress(e.target.value)} required />
            <FormInput label={t('auth.phoneNumber')} type="tel" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} required />
            <FormInput label={t('auth.password')} type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder={t('auth.passwordPlaceholder')} required />
            <button type="submit">{t('auth.registerButton')}</button>
        </form>
    );
};

export default RegisterForm;