import React from 'react';
import { Link } from 'react-router-dom';
import { useAppPreferences } from '../../context/AppPreferencesContext';

const Sidebar: React.FC = () => {
    const { t } = useAppPreferences();

    return (
        <div className="sidebar">
            <h2>{t('nav.title')}</h2>
            <ul>
                <li>
                    <Link to="/dashboard">{t('sidebar.dashboard')}</Link>
                </li>
                <li>
                    <Link to="/children">{t('sidebar.manageChildren')}</Link>
                </li>
                <li>
                    <Link to="/appointments">{t('nav.appointments')}</Link>
                </li>
                <li>
                    <Link to="/vaccine-schedule">{t('sidebar.vaccineSchedule')}</Link>
                </li>
                <li>
                    <Link to="/profile">{t('nav.profile')}</Link>
                </li>
                <li>
                    <Link to="/logout">{t('nav.logout')}</Link>
                </li>
            </ul>
        </div>
    );
};

export default Sidebar;