import { useState, useEffect } from 'react';
import { Child } from '../types/Child';
import { getChildren, addChild, updateChild, deleteChild } from '../services/childService';

const useChildren = (enabled: boolean = true) => {
    const [children, setChildren] = useState<Child[]>([]);
    const [loading, setLoading] = useState<boolean>(enabled);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!enabled) {
            setChildren([]);
            setError(null);
            setLoading(false);
            return;
        }

        const fetchChildren = async () => {
            try {
                setLoading(true);
                const fetchedChildren = await getChildren();
                setChildren(fetchedChildren);
            } catch (err) {
                setError('children.fetchErrorShort');
            } finally {
                setLoading(false);
            }
        };

        fetchChildren();
    }, [enabled]);

    const addNewChild = async (childData: Child) => {
        try {
            const newChild = await addChild(childData);
            setChildren((prev) => [...prev, newChild]);
        } catch (err) {
            setError('children.addErrorShort');
        }
    };

    const editChild = async (childId: string, updatedData: Child) => {
        try {
            const updatedChild = await updateChild(childId, updatedData);
            setChildren((prev) => prev.map(child => (child.id === childId ? updatedChild : child)));
        } catch (err) {
            setError('children.updateErrorShort');
        }
    };

    const removeChild = async (childId: string) => {
        try {
            await deleteChild(childId);
            setChildren((prev) => prev.filter(child => child.id !== childId));
        } catch (err) {
            setError('children.deleteErrorShort');
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