import React, { useState } from 'react';
import { useAppPreferences } from '../../context/AppPreferencesContext';
import FormInput from '../common/FormInput';
import { Child } from '../../types/Child';
import { GENDER_OPTIONS } from '../../utils/genderOptions';

interface AddChildFormProps {
    onClose?: () => void;
    initialData?: Partial<Child>;
    onSubmitChild?: (childData: Child) => void | Promise<void>;
    submitLabel?: string;
}

const AddChildForm: React.FC<AddChildFormProps> = ({ onClose, initialData, onSubmitChild, submitLabel }) => {
    const { t } = useAppPreferences();
    const [childData, setChildData] = useState({
        fullName: initialData?.fullName || '',
        gender: initialData?.gender || '',
        dateOfBirth: initialData?.dateOfBirth || '',
        address: initialData?.address || '',
        phoneNumber: initialData?.phoneNumber || ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setChildData({ ...childData, [name]: value });
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const nextChildData: Child = {
            id: initialData?.id || '',
            fullName: childData.fullName,
            gender: childData.gender as Child['gender'],
            dateOfBirth: childData.dateOfBirth,
            nationalId: initialData?.nationalId || '',
            address: childData.address,
            phoneNumber: childData.phoneNumber,
        };

        if (onSubmitChild) {
            await onSubmitChild(nextChildData);
        }

        setChildData({
            fullName: '',
            gender: '',
            dateOfBirth: '',
            address: '',
            phoneNumber: ''
        });
        if (onClose) onClose();
    };

    return (
        <form onSubmit={handleSubmit}>
            <FormInput
                label={t('auth.fullName')}
                name="fullName"
                value={childData.fullName}
                onChange={handleChange}
                required
            />
            <label className="form-input">
                <span>{t('children.gender')}</span>
                <select name="gender" value={childData.gender} onChange={handleChange} required>
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
                value={childData.dateOfBirth}
                onChange={handleChange}
                required
            />
            <FormInput
                label={t('children.address')}
                name="address"
                value={childData.address}
                onChange={handleChange}
                required
            />
            <FormInput
                label={t('children.phone')}
                name="phoneNumber"
                value={childData.phoneNumber}
                onChange={handleChange}
                required
            />
            <div className="add-child-form__actions">
                {onClose && (
                    <button type="button" className="button button--secondary" onClick={onClose}>
                        {t('children.cancel')}
                    </button>
                )}
                <button type="submit">{submitLabel || t('children.addButton')}</button>
            </div>
        </form>
    );
};

export default AddChildForm;
