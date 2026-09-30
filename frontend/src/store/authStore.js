'use client';
import { create } from 'zustand';
import { authApi } from '@/services';
import { setSession, clearSession, getStoredUser, getAccessToken } from '@/lib/token';
import { STAFF_ROLES, ROLES } from '@/lib/constants';

export const useAuthStore = create((set, get) => ({
  user: null,
  status: 'idle', // idle | loading | authenticated | guest
  hydrated: false,

  hydrate: async () => {
    if (get().hydrated) return get().user;
    const cached = getStoredUser();
    if (cached) set({ user: cached, status: 'authenticated' });
    if (!getAccessToken()) {
      set({ user: null, status: 'guest', hydrated: true });
      return null;
    }
    try {
      const user = await authApi.me();
      setSession({ user });
      set({ user, status: 'authenticated', hydrated: true });
      return user;
    } catch {
      clearSession();
      set({ user: null, status: 'guest', hydrated: true });
      return null;
    }
  },

  login: async (email, password) => {
    set({ status: 'loading' });
    try {
      const data = await authApi.login({ email, password });
      setSession(data);
      set({ user: data.user, status: 'authenticated', hydrated: true });
      return data.user;
    } catch (e) {
      set({ status: 'guest' });
      throw e;
    }
  },

  register: async (payload) => {
    const data = await authApi.register(payload);
    setSession(data);
    set({ user: data.user, status: 'authenticated', hydrated: true });
    return data.user;
  },

  // password reset returns a fresh session — adopt it so the user lands signed in
  adoptSession: (data) => {
    setSession(data);
    set({ user: data.user, status: 'authenticated', hydrated: true });
    return data.user;
  },

  requestOtp: (identifier) => authApi.requestOtp({ identifier }),

  // name is only used when the identifier has no account yet — the API creates one
  verifyOtp: async (identifier, otp, name) => {
    const data = await authApi.verifyOtp({ identifier, otp, name });
    setSession(data);
    set({ user: data.user, status: 'authenticated', hydrated: true });
    return data.user;
  },

  logout: async () => {
    try { await authApi.logout(); } catch {}
    clearSession();
    set({ user: null, status: 'guest', hydrated: true });
  },

  refreshUser: async () => {
    const user = await authApi.me();
    setSession({ user });
    set({ user });
    return user;
  },
}));

export const isStaff = (user) => !!user && STAFF_ROLES.includes(user.role);
export const isSuperAdmin = (user) => user?.role === ROLES.SUPERADMIN;
export const homeFor = (user) => (isStaff(user) ? '/admin' : '/dashboard');

// Route-level capability map. Mirrors the RBAC on the Express routes exactly.
export const CAN = {
  clinics: { view: STAFF_ROLES, write: [ROLES.SUPERADMIN], edit: [ROLES.SUPERADMIN, ROLES.CLINIC_ADMIN] },
  specialities: { view: STAFF_ROLES, write: [ROLES.SUPERADMIN] },
  doctors: { view: STAFF_ROLES, write: [ROLES.SUPERADMIN, ROLES.CLINIC_ADMIN] },
  slots: { view: [ROLES.SUPERADMIN, ROLES.CLINIC_ADMIN, ROLES.RECEPTIONIST], write: [ROLES.SUPERADMIN, ROLES.CLINIC_ADMIN, ROLES.RECEPTIONIST] },
  appointments: { view: STAFF_ROLES, write: STAFF_ROLES },
  payments: { view: STAFF_ROLES, collect: [ROLES.SUPERADMIN, ROLES.CLINIC_ADMIN, ROLES.RECEPTIONIST] },
  patients: { view: STAFF_ROLES, write: STAFF_ROLES },
  prescriptions: { view: STAFF_ROLES, write: [ROLES.SUPERADMIN, ROLES.CLINIC_ADMIN, ROLES.DOCTOR] },
  videos: { view: STAFF_ROLES, write: [ROLES.SUPERADMIN, ROLES.CLINIC_ADMIN, ROLES.DOCTOR] },
  coupons: { view: [ROLES.SUPERADMIN, ROLES.CLINIC_ADMIN], write: [ROLES.SUPERADMIN, ROLES.CLINIC_ADMIN] },
  reports: { view: [ROLES.SUPERADMIN, ROLES.CLINIC_ADMIN], write: [] },
  audit: { view: [ROLES.SUPERADMIN, ROLES.CLINIC_ADMIN], write: [] },
  staff: { view: [ROLES.SUPERADMIN, ROLES.CLINIC_ADMIN], write: [ROLES.SUPERADMIN, ROLES.CLINIC_ADMIN] },
  cms: { view: [ROLES.SUPERADMIN], write: [ROLES.SUPERADMIN] },
  cmsPages: { view: [ROLES.SUPERADMIN], write: [ROLES.SUPERADMIN] },
  headerNotifications: { view: [ROLES.SUPERADMIN], write: [ROLES.SUPERADMIN] },
  settings: { view: [ROLES.SUPERADMIN], write: [ROLES.SUPERADMIN] },
  contact: { view: [ROLES.SUPERADMIN, ROLES.CLINIC_ADMIN], write: [ROLES.SUPERADMIN, ROLES.CLINIC_ADMIN] },
};

export const can = (user, resource, action = 'view') => {
  const rule = CAN[resource];
  if (!rule || !user) return false;
  const list = rule[action] || [];
  return list.includes(user.role);
};
