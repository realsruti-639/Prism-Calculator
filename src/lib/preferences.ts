export const THEMES = [
  { id: 'prism-magenta', label: 'Prism Magenta', swatch: '#ff3fcb' },
  { id: 'cyber-amber', label: 'Cyber-Amber', swatch: '#ffb020' },
  { id: 'toxic-green', label: 'Toxic-Green', swatch: '#7cff3a' },
  { id: 'synthwave-purple', label: 'Synthwave-Purple', swatch: '#b066ff' },
] as const;

export type ThemeId = (typeof THEMES)[number]['id'];

export type Preferences = { theme: ThemeId; soundEnabled: boolean };

export const DEFAULT_PREFERENCES: Preferences = { theme: 'prism-magenta', soundEnabled: false };

const STORAGE_KEY = 'prism-calculator-preferences';

export function loadPreferences(): Preferences {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw === null) return DEFAULT_PREFERENCES;
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null) return DEFAULT_PREFERENCES;
    const { theme, soundEnabled } = parsed as Record<string, unknown>;
    const isKnownTheme = THEMES.some((option) => option.id === theme);
    return {
      theme: isKnownTheme ? (theme as ThemeId) : DEFAULT_PREFERENCES.theme,
      soundEnabled: soundEnabled === true,
    };
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

export function savePreferences(preferences: Preferences): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
  } catch {
    return;
  }
}
