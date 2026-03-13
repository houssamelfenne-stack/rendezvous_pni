import React from 'react';
import { useAppPreferences } from '../../context/AppPreferencesContext';

const Footer: React.FC = () => {
    const { t } = useAppPreferences();

    return (
        <footer className="site-footer">
            <div className="site-footer__inner">
                <p className="site-footer__text">
                    &copy; {new Date().getFullYear()} {t('footer.text')}
                </p>
            </div>
        </footer>
    );
};

export default Footer;