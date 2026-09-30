import { create } from 'zustand';
import { authApi } from '../services';
import { loadSession, saveSession, clearSession, setOnSessionLost } from '../lib/api';
import { getFcmToken, registerDevice, unregisterDevice } from '../lib/push';

export const useAuthStore = create((set, get) => ({
  user: null,
  hydrated: false,

  hydrate: async () => {
    const { user, accessToken } = await loadSession();
    set({ user: accessToken ? user : null, hydrated: true });
    if (accessToken) {
      // refresh the profile in the background; a dead session clears itself
      authApi.me()
        .then((u) => { set({ user: u }); saveSession({ user: u }); })
        .catch(() => {});
    }
  },

  adopt: async (data) => {
    await saveSession(data);
    set({ user: data.user });
    // the push token is per install, so it is attached to whoever just signed in
    getFcmToken()
      .then((token) => registerDevice(token))
      .catch(() => {});
    return data.user;
  },

  login: async (email, password) => {
    const data = await authApi.login({ email, password });
    return get().adopt(data);
  },

  register: async (payload) => {
    const data = await authApi.register(payload);
    return get().adopt(data);
  },

  requestOtp: (identifier) => authApi.requestOtp({ identifier }),

  // name is only used when the number has no account — the API creates one
  verifyOtp: async (identifier, otp, name) => {
    const data = await authApi.verifyOtp({ identifier, otp, name });
    return get().adopt(data);
  },

  refreshUser: async () => {
    try {
      const u = await authApi.me();
      set({ user: u });
      await saveSession({ user: u });
      return u;
    } catch {
      return null;
    }
  },

  logout: async () => {
    await unregisterDevice();
    try { await authApi.logout(); } catch {}
    await clearSession();
    set({ user: null });
  },

  forceSignOut: async () => {
    await clearSession();
    set({ user: null });
  },
}));

// a refresh failure inside the axios instance drops the user here too
setOnSessionLost(() => useAuthStore.getState().forceSignOut());
