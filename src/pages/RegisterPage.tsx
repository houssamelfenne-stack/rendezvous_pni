import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { registerUser } from '../services/authService';
import { useAppPreferences } from '../context/AppPreferencesContext';
import FormInput from '../components/common/FormInput';
import { GENDER_OPTIONS } from '../utils/genderOptions';

const RegisterPage: React.FC = () => {
    const { language, t } = useAppPreferences();
    const [fullName, setFullName] = useState('');
    const [gender, setGender] = useState('');
    const [dateOfBirth, setDateOfBirth] = useState('');
    const [nationalId, setNationalId] = useState('');
    const [address, setAddress] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const history = useHistory();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await registerUser({ fullName, gender: gender as 'male' | 'female' | 'other', dateOfBirth, nationalId, address, phoneNumber, password });
            history.push('/login');
        } catch (err) {
            setError('تعذر إنشاء الحساب. راجع البيانات ثم أعد المحاولة.');
        }
    };

    return (
        <main className="page auth-layout">
        <div className="register-page auth-card">
            <h2>{t('auth.registerTitle')}</h2>
            <p className="page-copy">{t('auth.registerIntro')}</p>
            {error && <p className="error">{error}</p>}
            <form onSubmit={handleSubmit}>
                <FormInput label={t('auth.fullName')} value={fullName} onChange={(e) => setFullName(e.target.value)} required />
                <label className="form-input">
                    <span>{t('auth.gender')}</span>
                    <select value={gender} onChange={(e) => setGender(e.target.value)} required>
                        <option value="">{t('auth.selectGender')}</option>
                        {GENDER_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                                {language === 'ar' ? t(`gender.${option.value}`) : t(`gender.${option.value}`)}
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