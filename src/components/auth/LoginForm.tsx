import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useHistory } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import FormInput from '../common/FormInput';

const LoginForm: React.FC = () => {
    const { login, isAuthenticated } = useAuth();
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
        <form onSubmit={handleSubmit}>
            <h2>تسجيل الدخول</h2>
            {error && <p className="error">{error}</p>}
            <FormInput
                label="رقم البطاقة الوطنية"
                value={nationalId}
                onChange={(e) => setNationalId(e.target.value)}
                placeholder="مثال: AB123456"
                required
            />
            <FormInput
                label="كلمة المرور"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="أدخل كلمة المرور"
                required
            />
            <button type="submit">دخول</button>
        </form>
    );
};

export default LoginForm;