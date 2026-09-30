export const inr = (n) =>
  typeof n === 'number' ? `₹${n.toLocaleString('en-IN')}` : '₹0';

export const pad = (n) => String(n).padStart(2, '0');

export const toDateKey = (d) => {
  const date = d instanceof Date ? d : new Date(d);
  if (Number.isNaN(date.getTime())) return '';
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

export const to12h = (hhmm) => {
  if (!hhmm) return '';
  const [h, m] = String(hhmm).split(':').map(Number);
  const suffix = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${pad(hour)}:${pad(m || 0)} ${suffix}`;
};

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const prettyDate = (value) => {
  if (!value) return '';
  const d = new Date(typeof value === 'string' && value.length === 10 ? `${value}T00:00:00` : value);
  if (Number.isNaN(d.getTime())) return '';
  return `${DAYS[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
};

export const shortDate = (value) => {
  const d = new Date(typeof value === 'string' && value.length === 10 ? `${value}T00:00:00` : value);
  if (Number.isNaN(d.getTime())) return '';
  return `${d.getDate()} ${MONTHS[d.getMonth()]}`;
};

export const prettyDateTime = (value) => {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return `${prettyDate(d)} · ${to12h(`${pad(d.getHours())}:${pad(d.getMinutes())}`)}`;
};

export const weekdayShort = (dateKey) => {
  const d = new Date(`${dateKey}T00:00:00`);
  return DAYS[d.getDay()];
};

export const initials = (name = '') =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

export const titleCase = (s = '') =>
  String(s)
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());

export const idOf = (v) => (v && typeof v === 'object' ? v._id || '' : v || '');

export const getErr = (e) =>
  e?.response?.data?.message || e?.message || 'Something went wrong';

export const addDays = (dateKey, n) => {
  const d = new Date(`${dateKey}T00:00:00`);
  d.setDate(d.getDate() + n);
  return toDateKey(d);
};

export const nextDays = (count, from = new Date()) => {
  const out = [];
  for (let i = 0; i < count; i += 1) {
    const d = new Date(from);
    d.setDate(d.getDate() + i);
    out.push(toDateKey(d));
  }
  return out;
};
