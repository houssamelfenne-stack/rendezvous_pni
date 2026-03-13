export const DEFAULT_PNI_BIRTH_DATE = '1998-01-01';

export interface PniDoseDefinition {
    antigen: string;
    ageLabel: string;
    offsetDays: number;
    note?: string;
}

export interface PniDoseScheduleEntry extends PniDoseDefinition {
    scheduledDate: string;
    scheduledDateIso: string;
}

export const PNI_DOSE_DEFINITIONS: PniDoseDefinition[] = [
    { antigen: 'HB1n', ageLabel: 'الولادة', offsetDays: 0, note: 'إذا أُعطيت جرعة التهاب الكبد B عند الولادة.' },
    { antigen: 'HB1', ageLabel: 'الولادة', offsetDays: 0, note: 'تستعمل إذا لم تُعط جرعة الولادة.' },
    { antigen: 'BCG', ageLabel: 'الولادة', offsetDays: 0 },
    { antigen: 'VPO0', ageLabel: 'الولادة', offsetDays: 0 },
    { antigen: 'VPO1', ageLabel: '4 أسابيع', offsetDays: 28 },
    { antigen: 'Penta1', ageLabel: '4 أسابيع', offsetDays: 28 },
    { antigen: 'Rota1', ageLabel: '4 أسابيع', offsetDays: 28 },
    { antigen: 'Pneumo1', ageLabel: '8 أسابيع', offsetDays: 56, note: 'مطابق لـ PCV1 في الجدول المرجعي.' },
    { antigen: 'VPO2', ageLabel: '10 أسابيع', offsetDays: 70 },
    { antigen: 'Penta2', ageLabel: '10 أسابيع', offsetDays: 70 },
    { antigen: 'Rota2', ageLabel: '10 أسابيع', offsetDays: 70 },
    { antigen: 'VPO3', ageLabel: '12 أسابيع', offsetDays: 84 },
    { antigen: 'Penta3', ageLabel: '12 أسابيع', offsetDays: 84 },
    { antigen: 'Rota3', ageLabel: '12 أسابيع', offsetDays: 84 },
    { antigen: 'VPI1', ageLabel: '12 أسابيع', offsetDays: 84 },
    { antigen: 'Pneumo2', ageLabel: '16 أسبوعا', offsetDays: 112, note: 'مطابق لـ PCV2 في الجدول المرجعي.' },
    { antigen: 'Pneumo3', ageLabel: '18 أسبوعا', offsetDays: 126, note: 'مطابق لـ PCV3 في الجدول المرجعي.' },
    { antigen: 'VPI2', ageLabel: '9 أشهر', offsetDays: 273 },
    { antigen: 'RR1', ageLabel: '9 أشهر', offsetDays: 273 },
    { antigen: 'Pneumo4', ageLabel: '12 شهرا', offsetDays: 365, note: 'مطابق لـ PCV4 في الجدول المرجعي.' },
    { antigen: 'Rappel VPO1', ageLabel: '18 شهرا', offsetDays: 547, note: 'جرعة التذكير الموافقة لـ VPO4.' },
    { antigen: 'Rappel DTC1', ageLabel: '18 شهرا', offsetDays: 547 },
    { antigen: 'RR2', ageLabel: '18 شهرا', offsetDays: 547 },
    { antigen: 'Rappel VPO2', ageLabel: '5 سنوات', offsetDays: 1825, note: 'جرعة التذكير الموافقة لـ VPO5.' },
    { antigen: 'Rappel DTC2', ageLabel: '5 سنوات', offsetDays: 1825 },
    { antigen: 'HPV', ageLabel: '11 سنة', offsetDays: 4015 }
];

const parseBirthDate = (birthDate: string): Date => {
    const [year, month, day] = birthDate.split('-').map(Number);

    if (!year || !month || !day) {
        throw new Error('Invalid birth date');
    }

    return new Date(year, month - 1, day);
};

const addDays = (date: Date, days: number): Date => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
};

const formatDate = (date: Date): string => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
};

const formatIsoDate = (date: Date): string => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    return `${year}-${month}-${day}`;
};

export const buildPniSchedule = (birthDate: string): PniDoseScheduleEntry[] => {
    const baseDate = parseBirthDate(birthDate);

    return PNI_DOSE_DEFINITIONS.map((dose) => ({
        ...dose,
        scheduledDate: formatDate(addDays(baseDate, dose.offsetDays)),
        scheduledDateIso: formatIsoDate(addDays(baseDate, dose.offsetDays))
    }));
};