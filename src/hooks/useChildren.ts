import { useState, useEffect } from 'react';
import { Child } from '../types/Child';
import { getChildren, addChild, updateChild, deleteChild } from '../services/childService';

const useChildren = () => {
    const [children, setChildren] = useState<Child[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchChildren = async () => {
            try {
                const fetchedChildren = await getChildren();
                setChildren(fetchedChildren);
            } catch (err) {
                setError('Failed to fetch children data');
            } finally {
                setLoading(false);
            }
        };

        fetchChildren();
    }, []);

    const addNewChild = async (childData: Child) => {
        try {
            const newChild = await addChild(childData);
            setChildren((prev) => [...prev, newChild]);
        } catch (err) {
            setError('Failed to add child');
        }
    };

    const editChild = async (childId: string, updatedData: Child) => {
        try {
            const updatedChild = await updateChild(childId, updatedData);
            setChildren((prev) => prev.map(child => (child.id === childId ? updatedChild : child)));
        } catch (err) {
            setError('Failed to update child');
        }
    };

    const removeChild = async (childId: string) => {
        try {
            await deleteChild(childId);
            setChildren((prev) => prev.filter(child => child.id !== childId));
        } catch (err) {
            setError('Failed to delete child');
        }
    };

    return {
        children,
        loading,
        error,
        addChild: addNewChild,
        addNewChild,
        editChild,
        removeChild,
    };
};

export default useChildren;
export { useChildren };