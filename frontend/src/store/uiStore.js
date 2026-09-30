'use client';
import { create } from 'zustand';

export const useUiStore = create((set, get) => ({
  sidebarOpen: false,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebar: (v) => set({ sidebarOpen: v }),

  // visitor location: filled from the browser (header), city can also be picked by hand
  city: '',
  cityManual: false,
  userPos: null,
  locationReady: false,
  setCity: (city) => set({ city, cityManual: true }),
  setDetectedCity: (city) => { if (!get().cityManual && city) set({ city }); },
  setUserPos: (userPos) => set({ userPos }),
  setLocationReady: (locationReady) => set({ locationReady }),

  dismissedBanners: [],
  dismissBanner: (id) => set((s) => ({ dismissedBanners: [...s.dismissedBanners, id] })),
}));
