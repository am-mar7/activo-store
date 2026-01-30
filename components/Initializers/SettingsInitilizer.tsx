'use client';

import { useEffect } from 'react';
import { useSettingsStore, SettingsType } from '@/stores/useSettingsStore';

interface SettingsInitializerProps {
  settings: SettingsType;
}

export function SettingsInitializer({ settings }: SettingsInitializerProps) {
  useEffect(() => {
    if (settings) {
      useSettingsStore.getState().setSettings(settings);
    }
  }, [settings]);

  return null;
}