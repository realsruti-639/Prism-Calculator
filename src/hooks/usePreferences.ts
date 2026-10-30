import { useEffect, useState } from 'react';
import { loadPreferences, savePreferences, type Preferences } from '@/lib/preferences';

export function usePreferences() {
  const [preferences, setPreferences] = useState<Preferences>(loadPreferences);

  useEffect(() => {
    document.documentElement.dataset.theme = preferences.theme;
    savePreferences(preferences);
  }, [preferences]);

  const updatePreferences = (patch: Partial<Preferences>) => {
    setPreferences((current) => ({ ...current, ...patch }));
  };

  return { preferences, updatePreferences };
}
