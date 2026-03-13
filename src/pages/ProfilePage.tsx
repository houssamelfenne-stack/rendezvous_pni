import React from 'react';
import { useAppPreferences } from '../context/AppPreferencesContext';
import { useAuth } from '../hooks/useAuth';
import ProfileForm from '../components/auth/ProfileForm';

const ProfilePage: React.FC = () => {
    const { user } = useAuth();
    const { t } = useAppPreferences();

    return (
        <main className="page">
            <div className="content-card">
            <h1>{t('auth.profileTitle')}</h1>
            {user ? (
                <ProfileForm />
            ) : (
                <p className="empty-state">{t('auth.profileLoginRequired')}</p>
            )}
            </div>
        </main>
    );
};

export default ProfilePage;