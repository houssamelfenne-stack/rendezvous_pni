import React, { useState } from 'react';
import axios from 'axios';
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

    const mapRegistrationMessage = (message?: string) => {
        if (!message) {
            return 'تعذر إنشاء الحساب. راجع البيانات ثم أعد المحاولة.';
        }

        if (message === 'User already exists') {
            return 'يوجد حساب مسجل بهذا الرقم الوطني من قبل.';
        }

        if (message === 'Error registering user') {
            return 'حدث خطأ أثناء إنشاء الحساب. أعد المحاولة بعد قليل.';
        }

        return message;
    };

    const mapValidationMessage = (message?: string) => {
        if (!message) {
            return null;
        }

        if (message === 'Full name is required') {
            return 'الاسم الكامل مطلوب.';
        }

        if (message === 'Gender must be male, female, or other') {
            return 'يرجى اختيار النوع بشكل صحيح.';
        }

        if (message === 'Date of birth must be a valid date') {
            return 'تاريخ الازدياد غير صالح.';
        }

        if (message === 'National ID number is required') {
            return 'رقم البطاقة الوطنية مطلوب.';
        }

        if (message === 'Address is required') {
            return 'العنوان مطلوب.';
        }

        if (message === 'Phone number must be valid') {
            return 'رقم الهاتف غير صالح.';
        }

        if (message === 'Password must be at least 6 characters long') {
            return 'كلمة المرور يجب أن تتكون من 6 أحرف على الأقل.';
        }

        return message;
    };

    const getRegistrationErrorMessage = (err: unknown) => {
        if (!axios.isAxiosError(err)) {
            return 'تعذر إنشاء الحساب. حاول مرة أخرى.';
        }

        if (!err.response) {
            return 'خدمة التسجيل غير متاحة حالياً. تأكد من تشغيل الخادم ثم أعد المحاولة.';
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