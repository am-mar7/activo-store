'use client';

import { useEffect } from 'react';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { SettingsType } from '@/types/global';

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