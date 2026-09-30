const { generateDaySlots } = require('../src/utils/slotGenerator');

describe('generateDaySlots', () => {
  it('splits a shift into back-to-back slots', () => {
    const slots = generateDaySlots('09:00', '10:00', 15);
    expect(slots).toHaveLength(4);
    expect(slots[0]).toEqual({ startTime: '09:00', endTime: '09:15' });
    expect(slots[3]).toEqual({ startTime: '09:45', endTime: '10:00' });
  });

  it('never creates a slot that runs past the end of the shift', () => {
    const slots = generateDaySlots('09:00', '09:50', 20);
    expect(slots).toHaveLength(2);
    expect(slots[slots.length - 1].endTime).toBe('09:40');
  });

  it('handles shifts that cross the hour and pads times to HH:mm', () => {
    const slots = generateDaySlots('09:50', '10:30', 10);
    expect(slots.map((s) => s.startTime)).toEqual(['09:50', '10:00', '10:10', '10:20']);
  });

  it('returns nothing when the shift is shorter than one slot', () => {
    expect(generateDaySlots('09:00', '09:10', 15)).toEqual([]);
  });

  it('returns nothing for an inverted shift', () => {
    expect(generateDaySlots('18:00', '09:00', 15)).toEqual([]);
  });
});
