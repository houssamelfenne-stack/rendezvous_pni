const CHILD_COLOR_PALETTE = [
    '#0f766e',
    '#d97706',
    '#b91c1c',
    '#2563eb',
    '#7c3aed',
    '#0891b2',
    '#65a30d',
    '#c2410c'
];

export const getChildColor = (childId: string) => {
    const hash = childId.split('').reduce((total, character) => total + character.charCodeAt(0), 0);
    return CHILD_COLOR_PALETTE[hash % CHILD_COLOR_PALETTE.length];
};