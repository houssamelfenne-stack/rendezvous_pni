import React, { useState, useEffect } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { Child } from '../../types/Child';
import { useAppPreferences } from '../../context/AppPreferencesContext';
import { updateChild } from '../../services/childService';
import FormInput from '../common/FormInput';
import { GENDER_OPTIONS } from '../../utils/genderOptions';

const EditChildForm: React.FC = () => {
    const { t } = useAppPreferences();
    const { id } = useParams<{ id: string }>();
    const history = useHistory();
    const [child, setChild] = useState<Child | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchChild = async () => {
            try {
                const response = await fetch(`/api/children/${id}`);
                const data = await response.json();
                setChild(data);
            } catch (err) {
                setError('children.fetchChildError');
            } finally {
                setLoading(false);
            }
        };

        fetchChild();
    }, [id]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        if (child) {
            setChild({ ...child, [e.target.name]: e.target.value });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (child) {
            try {
                await updateChild(child.id, child);
                history.push('/children');
            } catch (err) {
                setError('children.updateChildInfoError');
            }
        }
    };

    if (loading) return <div>{t('appointments.loading')}</div>;
    if (error) return <div>{t(error)}</div>;

    return (
        <form onSubmit={handleSubmit}>
            <h2>{t('children.pageTitle')}</h2>
            <FormInput
                label={t('auth.fullName')}
                name="fullName"
                value={child?.fullName || ''}
                onChange={handleChange}
                required
            />
            <label className="form-input">
                <span>{t('children.gender')}</span>
                <select name="gender" value={child?.gender || ''} onChange={handleChange} required>
                    <option value="">{t('auth.selectGender')}</option>
                    {GENDER_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                            {t(`gender.${option.value}`)}
                        </option>
                    ))}
                </select>
            </label>
            <FormInput
                label={t('children.birthDate')}
                name="dateOfBirth"
                type="date"
                value={child?.dateOfBirth || ''}
                onChange={handleChange}
                required
            />
            <FormInput
                label={t('children.nationalId')}
                name="nationalId"
                value={child?.nationalId || ''}
                onChange={handleChange}
                required
            />
            <FormInput
                label={t('children.address')}
                name="address"
                value={child?.address || ''}
                onChange={handleChange}
                required
            />
            <FormInput
                label={t('children.phone')}
                name="phoneNumber"
                value={child?.phoneNumber || ''}
                onChange={handleChange}
                required
            />
            <button type="submit">{t('auth.saveChanges')}</button>
        </form>
    );
};

export default EditChildForm;