import React from 'react';
import { Child } from '../../types/Child';
import { useAppPreferences } from '../../context/AppPreferencesContext';
import ChildCard from './ChildCard';

interface ChildListProps {
    children: Child[];
    onEditChild?: (childId: string, updatedData: Child) => void | Promise<void>;
    onDeleteChild?: (childId: string) => void | Promise<void>;
}

const ChildList: React.FC<ChildListProps> = ({ children, onEditChild, onDeleteChild }) => {
    const { t } = useAppPreferences();

    return (
        <div>
            <h2>{t('children.listTitle')}</h2>
            <div className="child-list">
                {children.length > 0 ? (
                    children.map(child => (
                        <ChildCard key={child.id} child={child} onEditChild={onEditChild} onDeleteChild={onDeleteChild} />
                    ))
                ) : (
                    <p>{t('children.empty')}</p>
                )}
            </div>
        </div>
    );
};

export default ChildList;