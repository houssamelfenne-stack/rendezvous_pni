export interface Vaccine {
    id: string;
    name: string;
    description: string;
    ageGroup: string;
    schedule: string[];
    recommendedAge?: string;
    sideEffects?: string[];
}