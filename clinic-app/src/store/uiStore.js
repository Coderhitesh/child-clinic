import { create } from 'zustand';
import { STORAGE } from '../lib/constants';
import { plainGet, plainSet } from '../lib/storage';
import { appConfigApi } from '../services';
import { currentVersion, platform } from '../lib/version';

export const useUiStore = create((set) => ({
  onboarded: null, // null until read from storage
  settings: null, // website settings (site name, contact, socials)
  appConfig: null, // maintenance + version rules from the server
  location: null, // { lat, lng } once the person allows it
  locationAsked: false,

  loadOnboarded: async () => {
    const v = await plainGet(STORAGE.ONBOARDED);
    set({ onboarded: v === '1' });
    return v === '1';
  },

  completeOnboarding: async () => {
    await plainSet(STORAGE.ONBOARDED, '1');
    set({ onboarded: true });
  },

  setSettings: (settings) => set({ settings }),
  setAppConfig: (appConfig) => set({ appConfig }),

  // read on every launch, and again whenever the maintenance screen retries
  refreshAppConfig: async () => {
    try {
      const cfg = await appConfigApi.get({ platform, version: currentVersion });
      set({ appConfig: cfg });
      return cfg;
    } catch {
      return null;
    }
  },
  setLocation: (location) => set({ location, locationAsked: true }),
  markLocationAsked: () => set({ locationAsked: true }),
}));
