import { useState, useEffect, useCallback } from 'react';
import { getSettings, updateSettings, Settings } from '../lib/storage';

export function useSettings() {
  const [settings, setSettings] = useState<Settings | null>(null);

  useEffect(() => {
    getSettings().then(setSettings);
  }, []);

  const update = useCallback(async (patch: Partial<Settings>) => {
    const updated = await updateSettings(patch);
    setSettings(updated);
    return updated;
  }, []);

  return { settings, update };
}
