'use client';
import Cookies from 'js-cookie';
import { COOKIE } from './constants';

// Tokens live in cookies so Next.js middleware (server side) can gate routes.
// A mirror copy goes into sessionStorage for same-tab fast reads.
const opts = {
  expires: 7,
  sameSite: 'lax',
  secure: typeof window !== 'undefined' && window.location.protocol === 'https:',
  path: '/',
};

const ss = {
  get: (k) => {
    try { return sessionStorage.getItem(k); } catch { return null; }
  },
  set: (k, v) => { try { sessionStorage.setItem(k, v); } catch {} },
  del: (k) => { try { sessionStorage.removeItem(k); } catch {} },
};

export const getAccessToken = () => Cookies.get(COOKIE.ACCESS) || ss.get(COOKIE.ACCESS) || null;
export const getRefreshToken = () => Cookies.get(COOKIE.REFRESH) || ss.get(COOKIE.REFRESH) || null;
export const getRole = () => Cookies.get(COOKIE.ROLE) || null;

export const getStoredUser = () => {
  const raw = ss.get(COOKIE.USER) || Cookies.get(COOKIE.USER);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
};

export function setSession({ accessToken, refreshToken, user }) {
  if (accessToken) { Cookies.set(COOKIE.ACCESS, accessToken, opts); ss.set(COOKIE.ACCESS, accessToken); }
  if (refreshToken) { Cookies.set(COOKIE.REFRESH, refreshToken, opts); ss.set(COOKIE.REFRESH, refreshToken); }
  if (user) {
    Cookies.set(COOKIE.ROLE, user.role, opts);
    const slim = JSON.stringify({
      _id: user._id, name: user.name, email: user.email, phone: user.phone,
      role: user.role, clinics: user.clinics || [], doctorProfile: user.doctorProfile || null,
    });
    ss.set(COOKIE.USER, slim);
  }
}

export function clearSession() {
  [COOKIE.ACCESS, COOKIE.REFRESH, COOKIE.ROLE, COOKIE.USER].forEach((k) => {
    Cookies.remove(k, { path: '/' });
    ss.del(k);
  });
}
