import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useHistory } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useAppPreferences } from '../../context/AppPreferencesContext';
import FormInput from '../common/FormInput';

const LoginForm: React.FC = () => {
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
            history.replace('/');
        } catch (err) {
            setError(getLoginErrorMessage(err));
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <h2>{t('auth.loginTitle')}</h2>
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
    );
};

export default LoginForm;