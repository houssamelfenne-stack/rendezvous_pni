import React, { useState } from 'react';
import { useAppPreferences } from '../../context/AppPreferencesContext';
import { Child } from '../../types/Child';
import { getGenderLabel } from '../../utils/genderOptions';
import AddChildForm from './AddChildForm';

interface ChildCardProps {
    child: Child;
    onEditChild?: (childId: string, updatedData: Child) => void | Promise<void>;
    onDeleteChild?: (childId: string) => void | Promise<void>;
}

const ChildCard: React.FC<ChildCardProps> = ({ child, onEditChild, onDeleteChild }) => {
    const { language, t } = useAppPreferences();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    const handleDelete = async () => {
        setIsMenuOpen(false);

        if (!onDeleteChild) {
            return;
        }

        if (!window.confirm(t('children.deleteConfirm'))) {
            return;
        }

        await onDeleteChild(child.id);
    };

    return (
        <div className="child-card">
            <div className="child-card__header">
                <h3>{child.fullName}</h3>
                {onEditChild && onDeleteChild ? (
                    <div className="child-card__menu-wrap">
                        <button
                            type="button"
                            className="child-card__menu-button"
                            aria-label={t('children.actions')}
                            onClick={() => setIsMenuOpen((currentValue) => !currentValue)}
                        >
                            ...
                        </button>
                        {isMenuOpen ? (
                            <div className="child-card__menu">
                                <button
                                    type="button"
                                    className="child-card__menu-item"
                                    onClick={() => {
                                        setIsEditing(true);
                                        setIsMenuOpen(false);
                                    }}
                                >
                                    {t('children.edit')}
                                </button>
                                <button type="button" className="child-card__menu-item child-card__menu-item--danger" onClick={handleDelete}>
                                    {t('children.delete')}
                                </button>
                            </div>
                        ) : null}
                    </div>
                ) : null}
            </div>
            {isEditing && onEditChild ? (
                <div className="child-card__edit-panel">
                    <AddChildForm
                        initialData={child}
                        submitLabel={t('children.save')}
                        onClose={() => setIsEditing(false)}
                        onSubmitChild={async (updatedChild) => {
                            await onEditChild(child.id, { ...updatedChild, id: child.id });
                            setIsEditing(false);
                        }}
                    />
                </div>
            ) : (
                <>
                    <p>{t('children.gender')}: {getGenderLabel(child.gender, language)}</p>
                    <p>{t('children.birthDate')}: {new Date(child.dateOfBirth).toLocaleDateString(language === 'ar' ? 'ar-MA' : 'fr-FR')}</p>
                    <p>{t('children.address')}: {child.address}</p>
                    <p>{t('children.phone')}: {child.phoneNumber}</p>
                </>
            )}
        </div>
    );
};

export default ChildCard;