import React, { useState } from 'react';
import axios from 'axios';
import { useHistory } from 'react-router-dom';
import { registerUser } from '../services/authService';
import { useAppPreferences } from '../context/AppPreferencesContext';
import FormInput from '../components/common/FormInput';
import { GENDER_OPTIONS } from '../utils/genderOptions';

const RegisterPage: React.FC = () => {
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

    const mapRegistrationMessage = (message?: string) => {
        if (!message) {
            return t('auth.registerRetry');
        }

        if (message === 'User already exists') {
            return t('auth.registerExists');
        }

        if (message === 'Error registering user') {
            return t('auth.registerServerError');
        }

        return message;
    };

    const mapValidationMessage = (message?: string) => {
        if (!message) {
            return null;
        }

        if (message === 'Full name is required') {
            return t('auth.validation.fullNameRequired');
        }

        if (message === 'Gender must be male, female, or other') {
            return t('auth.validation.genderInvalid');
        }

        if (message === 'Date of birth must be a valid date') {
            return t('auth.validation.birthDateInvalid');
        }

        if (message === 'National ID number is required') {
            return t('auth.validation.nationalIdRequired');
        }

        if (message === 'Address is required') {
            return t('auth.validation.addressRequired');
        }

        if (message === 'Phone number must be valid') {
            return t('auth.validation.phoneInvalid');
        }

        if (message === 'Password must be at least 6 characters long') {
            return t('auth.validation.passwordShort');
        }

        return message;
    };

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
                .map((entry) => mapValidationMessage(entry.msg))
                .filter(Boolean)
                .join(' ');
        }

        return mapRegistrationMessage(responseData.message);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            await registerUser({ fullName, gender: gender as 'male' | 'female' | 'other', dateOfBirth, nationalId, address, phoneNumber, password });
            history.push('/login');
        } catch (err) {
            setError(getRegistrationErrorMessage(err));
        }
    };

    return (
        <main className="page auth-layout">
        <div className="register-page auth-card">
            <h2>{t('auth.registerTitle')}</h2>
            <p className="page-copy">{t('auth.registerIntro')}</p>
            <p className="page-copy">{t('auth.citizenOnlyNotice')}</p>
            <div className="auth-role-grid">
                <article className="auth-role-card auth-role-card--citizen">
                    <strong>{t('role.citizen')}</strong>
                    <span>{t('auth.roleCitizenDesc')}</span>
                </article>
                <article className="auth-role-card auth-role-card--center">
                    <strong>{t('role.health-center')}</strong>
                    <span>{t('auth.roleHealthCenterDesc')}</span>
                </article>
                <article className="auth-role-card auth-role-card--admin">
                    <strong>{t('role.admin')}</strong>
                    <span>{t('auth.roleAdminDesc')}</span>
                </article>
            </div>
            {error && <p className="error">{error}</p>}
            <form onSubmit={handleSubmit}>
                <FormInput label={t('auth.fullName')} value={fullName} onChange={(e) => setFullName(e.target.value)} required />
                <label className="form-input">
                    <span>{t('auth.gender')}</span>
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
                <FormInput label={t('auth.nationalId')} value={nationalId} onChange={(e) => setNationalId(e.target.value)} required />
                <FormInput label={t('auth.address')} value={address} onChange={(e) => setAddress(e.target.value)} required />
                <FormInput label={t('auth.phoneNumber')} value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} required />
                <FormInput label={t('auth.password')} type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                <button type="submit">{t('auth.registerButton')}</button>
            </form>
        </div>
        </main>
    );
};

export default RegisterPage;