export const GENDER_OPTIONS = [
    { value: 'male' },
    { value: 'female' }
] as const;

export const getGenderLabel = (gender: string, language: 'ar' | 'fr' = 'ar'): string => {
    if (gender === 'male') {
        return language === 'ar' ? 'ذكر' : 'Garçon';
    }

    if (gender === 'female') {
        return language === 'ar' ? 'أنثى' : 'Fille';
    }

    return gender;
};