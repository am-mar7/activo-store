import { SettingsType } from "@/types/global";
import { create } from "zustand";

interface SettingsStore {
  settings: SettingsType | null;
  setSettings: (settings: SettingsType) => void;
  
  // Getters for specific sections
  getShipping: () => SettingsType['shipping'] | null;
  getHeroSection: () => SettingsType['heroSection'] | null;
  getTopBanner: () => SettingsType['topBanner'] | null;
  getCheckout: () => SettingsType['checkout'] | null;
  getMaintenance: () => SettingsType['maintenance'] | null;
  
  // Helper methods
  isMaintenanceMode: () => boolean;
  isTopBannerActive: () => boolean;
}

export const useSettingsStore = create<SettingsStore>()((set, get) => ({
  settings: null,

  setSettings: (settings) => set({ settings }),

  getShipping: () => {
    return get().settings?.shipping ?? null;
  },

  getHeroSection: () => {
    return get().settings?.heroSection ?? null;
  },

  getTopBanner: () => {
    return get().settings?.topBanner ?? null;
  },

  getCheckout: () => {
    return get().settings?.checkout ?? null;
  },

  getMaintenance: () => {
    return get().settings?.maintenance ?? null;
  },

  isMaintenanceMode: () => {
    const settings = get().settings;
    return settings?.maintenance?.enabled ?? false;
  },

  isTopBannerActive: () => {
    const settings = get().settings;
    if (!settings?.topBanner?.enabled) return false;

    const now = new Date();
    const startsAt = settings.topBanner.startsAt
      ? new Date(settings.topBanner.startsAt)
      : null;
    const endsAt = settings.topBanner.endsAt
      ? new Date(settings.topBanner.endsAt)
      : null;

    if (startsAt && now < startsAt) return false;
    if (endsAt && now > endsAt) return false;

    return true;
  },
}));