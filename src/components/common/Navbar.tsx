import React, { useEffect, useMemo, useState } from 'react';
import { NavLink, useHistory } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useAppPreferences } from '../../context/AppPreferencesContext';
import { useAppointments } from '../../hooks/useAppointments';
import { getMyVaccineDoseNotifications } from '../../services/vaccineService';
import { VaccineDoseNotification } from '../../types/VaccineDose';
import platformLogo from '../../assets/logo-main.png';

interface NavbarNotificationItem {
    id: string;
    appointmentDate: string;
    message: string;
    reminderDate: string;
    tone: 'alert' | 'warn' | 'ok';
}

const getSeenNotificationsStorageKey = (userId: string) => `notifications-seen:${userId}`;

const Navbar: React.FC = () => {
    const { isAuthenticated, isAdmin, logout, user } = useAuth();
    const { theme, toggleLanguage, toggleTheme, t } = useAppPreferences();
    const history = useHistory();
    const { appointments } = useAppointments(isAuthenticated);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [doseNotifications, setDoseNotifications] = useState<VaccineDoseNotification[]>([]);
    const [seenNotificationIds, setSeenNotificationIds] = useState<string[]>([]);

    useEffect(() => {
        if (!isAuthenticated || !user?.nationalId) {
            setSeenNotificationIds([]);
            return;
        }

        try {
            const savedValue = localStorage.getItem(getSeenNotificationsStorageKey(user.nationalId));
            setSeenNotificationIds(savedValue ? JSON.parse(savedValue) : []);
        } catch {
            setSeenNotificationIds([]);
        }
    }, [isAuthenticated, user?.nationalId]);

    useEffect(() => {
        const loadDoseNotifications = async () => {
            if (!isAuthenticated || user?.role !== 'citizen') {
                setDoseNotifications([]);
                return;
            }

            try {
                const nextNotifications = await getMyVaccineDoseNotifications();
                setDoseNotifications(nextNotifications);
            } catch {
                setDoseNotifications([]);
            }
        };

        void loadDoseNotifications();
    }, [isAuthenticated, user?.role]);

    const todayKey = useMemo(() => new Date().toISOString().slice(0, 10), []);
    const notifications = useMemo<NavbarNotificationItem[]>(() => {
        const appointmentNotifications = appointments
            .filter((appointment) => Boolean(appointment.appointmentDate || appointment.date))
            .map((appointment) => {
                const appointmentDate = appointment.appointmentDate || appointment.date || '';
                const reminderDate = appointment.notificationDate || appointmentDate;
                const isOverdue = appointmentDate < todayKey;
                const isToday = appointmentDate === todayKey;
                const shouldDisplay = Boolean(appointment.notificationSentAt) || Boolean(reminderDate && reminderDate <= todayKey) || isOverdue || isToday;

                return {
                    id: appointment.id,
                    appointmentDate,
                    shouldDisplay,
                    message: appointment.notificationMessage
                        ? appointment.notificationMessage
                        : isOverdue
                            ? t('nav.notificationOverdue', { name: appointment.childName || appointment.childId })
                            : isToday
                                ? t('nav.notificationToday', { name: appointment.childName || appointment.childId })
                                : t('nav.notificationUpcoming', { name: appointment.childName || appointment.childId }),
                    reminderDate,
                    tone: (isOverdue ? 'alert' : isToday ? 'warn' : 'ok') as 'alert' | 'warn' | 'ok'
                };
            })
            .filter((notification) => notification.shouldDisplay)
            .map(({ shouldDisplay: _shouldDisplay, ...notification }) => notification);

        const completedDoseNotifications = doseNotifications.map((notification) => ({
            id: notification.id,
            appointmentDate: notification.completedDate,
            reminderDate: notification.completedDate,
            message: t('nav.notificationDoseCompleted', {
                name: notification.childName,
                dose: notification.antigen,
                date: notification.completedDate
            }),
            tone: 'ok' as const
        }));

        return [...completedDoseNotifications, ...appointmentNotifications]
            .sort((left, right) => (right.reminderDate || right.appointmentDate).localeCompare(left.reminderDate || left.appointmentDate))
            .slice(0, 10);
    }, [appointments, doseNotifications, t, todayKey]);

    const unseenNotifications = notifications.filter((notification) => !seenNotificationIds.includes(notification.id));
    const notificationsCount = unseenNotifications.length;

    const persistSeenNotifications = (nextSeenIds: string[]) => {
        setSeenNotificationIds(nextSeenIds);

        if (user?.nationalId) {
            localStorage.setItem(getSeenNotificationsStorageKey(user.nationalId), JSON.stringify(nextSeenIds));
        }
    };

    const handleNotificationsToggle = () => {
        if (isNotificationsOpen) {
            const nextSeenIds = Array.from(new Set([...seenNotificationIds, ...notifications.map((notification) => notification.id)]));
            persistSeenNotifications(nextSeenIds);
            setIsNotificationsOpen(false);
            return;
        }

        setIsNotificationsOpen(true);
    };

    const handleLogout = () => {
        logout();
        history.push('/login');
    };

    return (
        <header className="site-header">
            <nav className="navbar" aria-label={t('nav.mainAriaLabel')}>
                <div className="navbar__brand">
                    <img className="navbar__logo" src={platformLogo} alt={t('nav.title')} />
                    <div className="navbar__brand-copy">
                        <h1 className="navbar__title">{t('nav.title')}</h1>
                        <span className="navbar__subtitle">{t('nav.subtitle')}</span>
                    </div>
                </div>

                <div className="navbar__links">
                    <NavLink exact to="/" className="nav-link" activeClassName="nav-link--cta">
                        {t('nav.home')}
                    </NavLink>
                    <NavLink to="/vaccines" className="nav-link" activeClassName="nav-link--cta">
                        {t('nav.vaccines')}
                    </NavLink>
                    <button type="button" className="nav-link navbar__utility-button" onClick={toggleLanguage}>
                        {t('nav.languageToggle')}
                    </button>
                    <button
                        type="button"
                        className="nav-link navbar__utility-button"
                        aria-label={theme === 'light' ? t('nav.themeToggleDark') : t('nav.themeToggleLight')}
                        onClick={toggleTheme}
                    >
                        {theme === 'light' ? '🌙' : '☀️'}
                    </button>
                    {isAuthenticated ? (
                        <>
                            {user?.role === 'citizen' ? (
                                <>
                                    <NavLink to="/children" className="nav-link" activeClassName="nav-link--cta">
                                        {t('nav.children')}
                                    </NavLink>
                                    <NavLink to="/appointments" className="nav-link" activeClassName="nav-link--cta">
                                        {t('nav.appointments')}
                                    </NavLink>
                                </>
                            ) : null}
                            {user?.role === 'health-center' ? (
                                <NavLink to="/health-center" className="nav-link" activeClassName="nav-link--cta">
                                    {t('nav.healthCenter')}
                                </NavLink>
                            ) : null}
                            <NavLink to="/profile" className="nav-link" activeClassName="nav-link--cta">
                                {t('nav.profile')}
                            </NavLink>
                            {isAdmin ? (
                                <NavLink to="/admin" className="nav-link" activeClassName="nav-link--cta">
                                    {t('nav.admin')}
                                </NavLink>
                            ) : null}
                            <div className="navbar__notifications">
                                <button
                                    type="button"
                                    className="nav-link navbar__notification-button"
                                    aria-label={t('nav.notifications')}
                                    onClick={handleNotificationsToggle}
                                >
                                    <span className="navbar__notification-icon" aria-hidden="true">🔔</span>
                                    {notificationsCount > 0 ? <span className="navbar__notification-badge">{notificationsCount}</span> : null}
                                </button>
                                {isNotificationsOpen ? (
                                    <div className="navbar__notification-panel">
                                        <h3>{t('nav.notifications')}</h3>
                                        {notificationsCount === 0 ? (
                                            <p className="page-copy">{t('nav.noNotifications')}</p>
                                        ) : (
                                            <div className="navbar__notification-list">
                                                {notifications.map((notification) => (
                                                    <div key={notification.id} className={`navbar__notification-item navbar__notification-item--${notification.tone}`}>
                                                        <strong>{notification.message}</strong>
                                                        <span>{notification.reminderDate || notification.appointmentDate}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ) : null}
                            </div>
                        </>
                    ) : null}
                    {isAuthenticated ? (
                        <>
                            <div className="navbar__welcome-pill">
                                {t('nav.welcomeUser', { name: user?.fullName || '' })}
                            </div>
                            <button type="button" className="nav-link nav-link--cta navbar__action" onClick={handleLogout}>
                                {t('nav.logout')}
                            </button>
                        </>
                    ) : (
                        <>
                            <NavLink to="/register" className="nav-link" activeClassName="nav-link--cta">
                                {t('nav.register')}
                            </NavLink>
                            <NavLink to="/login" className="nav-link nav-link--cta" activeClassName="nav-link--cta">
                                {t('nav.login')}
                            </NavLink>
                        </>
                    )}
                </div>
            </nav>
        </header>
    );
};

export default Navbar;