export const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US');
};

export const parseDate = (dateString: string): Date => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
        throw new Error('Invalid date format');
    }
    return date;
};

export const isDateInFuture = (date: Date): boolean => {
    return date > new Date();
};

export const getDaysBetweenDates = (startDate: Date, endDate: Date): number => {
    const oneDay = 24 * 60 * 60 * 1000;
    return Math.round((endDate.getTime() - startDate.getTime()) / oneDay);
};