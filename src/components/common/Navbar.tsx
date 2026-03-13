import React, { useMemo, useState } from 'react';
import { NavLink, useHistory } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useAppPreferences } from '../../context/AppPreferencesContext';
import { useAppointments } from '../../hooks/useAppointments';
import platformLogo from '../../assets/logo-main.png';


const Navbar: React.FC = () => {
    const { isAuthenticated, logout, user } = useAuth();
    const { language, theme, toggleLanguage, toggleTheme, t } = useAppPreferences();
    const history = useHistory();
    const { appointments } = useAppointments(isAuthenticated);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

    const todayKey = useMemo(() => new Date().toISOString().slice(0, 10), []);
    const notifications = useMemo(() => {
        return appointments
            .filter((appointment) => Boolean(appointment.appointmentDate || appointment.date))
            .map((appointment) => {
                const appointmentDate = appointment.appointmentDate || appointment.date || '';
                const isOverdue = appointmentDate < todayKey;
                const isToday = appointmentDate === todayKey;

                return {
                    id: appointment.id,
                    appointmentDate,
                    message: isOverdue
                        ? t('nav.notificationOverdue', { name: appointment.childName || appointment.childId })
                        : isToday
                            ? t('nav.notificationToday', { name: appointment.childName || appointment.childId })
                            : t('nav.notificationUpcoming', { name: appointment.childName || appointment.childId }),
                    tone: isOverdue ? 'alert' : isToday ? 'warn' : 'ok'
                };
            })
            .filter((notification) => notification.tone !== 'ok' || notification.appointmentDate <= todayKey)
            .sort((left, right) => left.appointmentDate.localeCompare(right.appointmentDate))
            .slice(0, 6);
    }, [appointments, todayKey, t]);

    const notificationsCount = notifications.length;

    const handleLogout = () => {
        logout();
        history.push('/login');
    };

    return (
        <header className="site-header">
            <nav className="navbar" aria-label="التنقل الرئيسي">
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
                            <NavLink to="/children" className="nav-link" activeClassName="nav-link--cta">
                                {t('nav.children')}
                            </NavLink>
                            <NavLink to="/appointments" className="nav-link" activeClassName="nav-link--cta">
                                {t('nav.appointments')}
                            </NavLink>
                            <NavLink to="/profile" className="nav-link" activeClassName="nav-link--cta">
                                {t('nav.profile')}
                            </NavLink>
                            <div className="navbar__notifications">
                                <button
                                    type="button"
                                    className="nav-link navbar__notification-button"
                                    aria-label={t('nav.notifications')}
                                    onClick={() => setIsNotificationsOpen((currentValue) => !currentValue)}
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
                                                        <span>{notification.appointmentDate}</span>
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