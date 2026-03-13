import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useHistory } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAppPreferences } from '../context/AppPreferencesContext';
import FormInput from '../components/common/FormInput';

const LoginPage: React.FC = () => {
    const { login, isAuthenticated } = useAuth();
    const { t } = useAppPreferences();
    const [nationalId, setNationalId] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const history = useHistory();

    useEffect(() => {
        if (isAuthenticated) {
            history.replace('/');
        }
    }, [history, isAuthenticated]);

    const getLoginErrorMessage = (err: unknown) => {
        if (!axios.isAxiosError(err)) {
            return 'تعذر تسجيل الدخول. حاول مرة أخرى.';
        }

        if (!err.response) {
            return 'خدمة تسجيل الدخول غير متاحة حالياً. تأكد من تشغيل الخادم ثم أعد المحاولة.';
        }

        const responseData = err.response.data as { message?: string };
        return responseData.message || 'تعذر تسجيل الدخول. تحقق من رقم البطاقة الوطنية وكلمة المرور.';
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            await login(nationalId, password);
            history.replace('/');
        } catch (err) {
            setError(getLoginErrorMessage(err));
        }
    };

    return (
        <main className="page auth-layout">
            <div className="login-page auth-card">
            <h2>{t('auth.loginTitle')}</h2>
            <p className="page-copy">{t('auth.loginIntro')}</p>
            <form onSubmit={handleSubmit}>
                {error && <p className="error">{error}</p>}
                <FormInput
                    label={t('auth.nationalId')}
                    value={nationalId}
                    onChange={(e) => setNationalId(e.target.value)}
                    placeholder={t('auth.nationalIdPlaceholder')}
                    required
                />
                <FormInput
                    label={t('auth.password')}
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t('auth.passwordPlaceholder')}
                    required
                />
                <button type="submit">{t('auth.loginButton')}</button>
            </form>
            </div>
        </main>
    );
};

export default LoginPage;