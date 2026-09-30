import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const inr = (n) =>
  typeof n === 'number' ? `₹${n.toLocaleString('en-IN')}` : '₹0';

export const toDateKey = (d) => {
  const dt = d instanceof Date ? d : new Date(d);
  const off = dt.getTimezoneOffset();
  return new Date(dt.getTime() - off * 60000).toISOString().slice(0, 10);
};

export const prettyDate = (v) => {
  if (!v) return '—';
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return String(v);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

export const prettyDateTime = (v) => {
  if (!v) return '—';
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return String(v);
  return d.toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

export const to12h = (hhmm) => {
  if (!hhmm) return '';
  const [h, m] = hhmm.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hr = h % 12 === 0 ? 12 : h % 12;
  return `${String(hr).padStart(2, '0')}:${String(m).padStart(2, '0')} ${ampm}`;
};

export const initials = (name = '') =>
  name.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase();

export const titleCase = (s = '') =>
  String(s ?? '')
    .replace(/[_-]/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());

export const slugify = (s = '') =>
  s.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-');

// Backend hands out paths like /files/... — make them open against the API host, not the page origin.
export const fileUrl = (url) => {
  if (!url) return '';
  if (/^(https?:)?\/\//i.test(url)) return url;
  const origin = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1').replace(/\/api\/v\d+\/?$/, '');
  return `${origin}${url.startsWith('/') ? '' : '/'}${url}`;
};

export const idOf = (v) => (v && typeof v === 'object' ? v._id : v) || '';

export const getErr = (e) =>
  e?.response?.data?.message || e?.response?.data?.error || e?.message || 'Something went wrong';


export const youtubeId = (url) => {
  const m = String(url || '').match(/(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([\w-]{11})/i);
  return m ? m[1] : null;
};

// YouTube link -> embeddable URL (watch, youtu.be, shorts, live, embed). null if not YouTube.
export const youtubeEmbedUrl = (url) => {
  if (!url) return null;
  const m = String(url).match(
    /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([\w-]{11})/i
  );
  return m ? `https://www.youtube.com/embed/${m[1]}` : null;
};
