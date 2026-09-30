export const SLOTS = [
  { key: 'morning', label: 'Morning' },
  { key: 'afternoon', label: 'Afternoon' },
  { key: 'evening', label: 'Evening' },
  { key: 'night', label: 'Night' },
];
export const FOODS = [
  { key: 'before', label: 'Before food' },
  { key: 'after', label: 'After food' },
  { key: 'with', label: 'With food' },
];
export const emptyMedicine = () => ({ name: '', dosage: '', timings: [], food: '', durationDays: '', instructions: '' });
