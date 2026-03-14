import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useHistory } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAppPreferences } from '../context/AppPreferencesContext';
import FormInput from '../components/common/FormInput';
import { authService } from '../services/authService';

const LoginPage: React.FC = () => {
    const { login, isAuthenticated, user } = useAuth();
    const { t } = useAppPreferences();
    const [nationalId, setNationalId] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const history = useHistory();

    useEffect(() => {
        if (isAuthenticated) {
            if (user?.role === 'admin') {
                history.replace('/admin');
                return;
            }

            if (user?.role === 'health-center') {
                history.replace('/health-center');
                return;
            }

            history.replace('/dashboard');
        }
    }, [history, isAuthenticated, user]);

    const getLoginErrorMessage = (err: unknown) => {
        if (!axios.isAxiosError(err)) {
            return t('auth.loginErrorGeneric');
        }

        if (!err.response) {
            return t('auth.loginServiceUnavailable');
        }

        const responseData = err.response.data as { message?: string };
        return responseData.message || t('auth.loginInvalidCredentials');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            await login(nationalId, password);
            const currentUser = authService.getCurrentUser();

            if (currentUser?.role === 'admin') {
                history.replace('/admin');
            } else if (currentUser?.role === 'health-center') {
                history.replace('/health-center');
            } else {
                history.replace('/dashboard');
            }
        } catch (err) {
            setError(getLoginErrorMessage(err));
        }
    };

    return (
        <main className="page auth-layout">
            <div className="login-page auth-card">
            <h2>{t('auth.loginTitle')}</h2>
            <p className="page-copy">{t('auth.loginIntro')}</p>
            <div className="auth-role-grid">
                <article className="auth-role-card auth-role-card--citizen">
                    <strong>{t('role.citizen')}</strong>
                    <span>{t('auth.loginRoleCitizenDesc')}</span>
                </article>
                <article className="auth-role-card auth-role-card--center">
                    <strong>{t('role.health-center')}</strong>
                    <span>{t('auth.loginRoleHealthCenterDesc')}</span>
                </article>
                <article className="auth-role-card auth-role-card--admin">
                    <strong>{t('role.admin')}</strong>
                    <span>{t('auth.loginRoleAdminDesc')}</span>
                </article>
            </div>
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