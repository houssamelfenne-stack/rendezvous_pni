import React, { useState } from 'react';
import { useAppPreferences } from '../../context/AppPreferencesContext';
import { useAuth } from '../../hooks/useAuth';
import FormInput from '../common/FormInput';
import { User } from '../../types/User';
import { GENDER_OPTIONS } from '../../utils/genderOptions';

const ProfileForm: React.FC = () => {
    const { t } = useAppPreferences();
    const { user, updateUser } = useAuth();
    const [formData, setFormData] = useState({
        fullName: user?.fullName || '',
        gender: user?.gender || '',
        dateOfBirth: user?.dateOfBirth || '',
        nationalId: user?.nationalId || '',
        address: user?.address || '',
        phoneNumber: user?.phoneNumber || '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        updateUser({
            ...formData,
            gender: formData.gender as User['gender']
        });
    };

    return (
        <form onSubmit={handleSubmit}>
            <FormInput
                label={t('auth.fullName')}
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
            />
            <label className="form-input">
                <span>{t('auth.gender')}</span>
                <select name="gender" value={formData.gender} onChange={handleChange} required>
                    <option value="">{t('auth.selectGender')}</option>
                    {GENDER_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                            {t(`gender.${option.value}`)}
                        </option>
                    ))}
                </select>
            </label>
            <FormInput
                label={t('auth.dateOfBirth')}
                name="dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={handleChange}
                required
            />
            <FormInput
                label={t('auth.nationalId')}
                name="nationalId"
                value={formData.nationalId}
                onChange={handleChange}
                required
            />
            <FormInput
                label={t('auth.address')}
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
            />
            <FormInput
                label={t('auth.phoneNumber')}
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                required
            />
            <button type="submit">{t('auth.saveChanges')}</button>
        </form>
    );
};

export default ProfileForm;