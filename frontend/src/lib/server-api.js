// Server-side fetch helper for public pages. No auth, tolerant of a cold backend.
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export async function sfetch(path, { revalidate = 60, fallback = null } = {}) {
  try {
    const res = await fetch(`${API_URL}${path}`, {
      next: { revalidate },
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) return fallback;
    const json = await res.json();
    return json?.data ?? fallback;
  } catch {
    return fallback;
  }
}

export const sList = (path, opts) => sfetch(path, { fallback: [], ...opts });
export const sOne = (path, opts) => sfetch(path, { fallback: null, ...opts });
