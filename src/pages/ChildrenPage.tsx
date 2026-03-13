import React, { useState } from 'react';
import { useAppPreferences } from '../context/AppPreferencesContext';
import { useChildren } from '../hooks/useChildren';
import AddChildForm from '../components/children/AddChildForm';
import ChildList from '../components/children/ChildList';

const ChildrenPage: React.FC = () => {
    const { children, addChild, editChild, removeChild } = useChildren();
    const { t } = useAppPreferences();
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <main className="page">
            <div className="content-card">
                <div className="children-page__header">
                    <h1>{t('children.pageTitle')}</h1>
                    <button
                        type="button"
                        className="children-page__add-btn"
                        onClick={() => setIsModalOpen(true)}
                        aria-label={t('children.addButton')}
                    >
                        <span aria-hidden="true">+</span>
                        <span>{t('children.addButton')}</span>
                    </button>
                </div>

                <ChildList children={children} onEditChild={editChild} onDeleteChild={removeChild} />
            </div>

            {isModalOpen && (
                <div
                    className="children-modal-backdrop"
                    onClick={(e) => { if (e.target === e.currentTarget) setIsModalOpen(false); }}
                >
                    <div className="children-modal" role="dialog" aria-modal="true">
                        <div className="children-modal__header">
                            <h2>{t('children.addButton')}</h2>
                            <button
                                type="button"
                                className="children-modal__close"
                                onClick={() => setIsModalOpen(false)}
                                aria-label={t('children.closeModal')}
                            >
                                ✕
                            </button>
                        </div>
                        <AddChildForm
                            onClose={() => setIsModalOpen(false)}
                            onSubmitChild={async (childData) => {
                                await addChild(childData);
                                setIsModalOpen(false);
                            }}
                        />
                    </div>
                </div>
            )}
        </main>
    );
};

export default ChildrenPage;
