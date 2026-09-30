import { inr, to12h, toDateKey, initials, titleCase, slugify, idOf, getErr } from '@/lib/utils';

describe('inr', () => {
  it('formats with Indian grouping', () => {
    expect(inr(1200)).toBe('₹1,200');
    expect(inr(150000)).toBe('₹1,50,000');
  });
  it('falls back to zero for anything that is not a number', () => {
    expect(inr(undefined)).toBe('₹0');
    expect(inr('600')).toBe('₹0');
  });
});

describe('to12h', () => {
  it('converts 24h times', () => {
    expect(to12h('09:05')).toBe('09:05 AM');
    expect(to12h('13:30')).toBe('01:30 PM');
  });
  it('handles both midnights', () => {
    expect(to12h('00:00')).toBe('12:00 AM');
    expect(to12h('12:00')).toBe('12:00 PM');
  });
  it('returns an empty string for no input', () => {
    expect(to12h('')).toBe('');
  });
});

describe('toDateKey', () => {
  it('returns a local YYYY-MM-DD key, not a UTC-shifted one', () => {
    const d = new Date(2026, 0, 5, 23, 30); // 5 Jan, late evening local time
    expect(toDateKey(d)).toBe('2026-01-05');
  });
  it('accepts a date string', () => {
    expect(toDateKey('2026-03-17T10:00:00')).toBe('2026-03-17');
  });
});

describe('small helpers', () => {
  it('initials takes at most two letters', () => {
    expect(initials('Anaya Sharma')).toBe('AS');
    expect(initials('Dr. Ravi Kumar Singh')).toBe('DR');
    expect(initials('')).toBe('');
  });

  it('titleCase expands snake and kebab case', () => {
    expect(titleCase('pay_at_clinic')).toBe('Pay At Clinic');
    expect(titleCase('no-show')).toBe('No Show');
  });

  it('slugify strips punctuation and collapses spaces', () => {
    expect(slugify('  Child & Adolescent Care!  ')).toBe('child-adolescent-care');
  });

  it('idOf unwraps a populated document or passes an id through', () => {
    expect(idOf({ _id: 'abc', name: 'Clinic' })).toBe('abc');
    expect(idOf('abc')).toBe('abc');
    expect(idOf(null)).toBe('');
  });
});

describe('getErr', () => {
  it('prefers the API message', () => {
    expect(getErr({ response: { data: { message: 'Slot already booked' } } })).toBe('Slot already booked');
  });
  it('falls back to the thrown message, then a default', () => {
    expect(getErr(new Error('Network Error'))).toBe('Network Error');
    expect(getErr({})).toBe('Something went wrong');
  });
});
