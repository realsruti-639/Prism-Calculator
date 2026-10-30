import { useEffect } from 'react';
import { X } from 'lucide-react';
import { THEMES, type Preferences, type ThemeId } from '@/lib/preferences';

type PreferencesDialogProps = {
  preferences: Preferences;
  onChange: (patch: Partial<Preferences>) => void;
  onClose: () => void;
};

export function PreferencesDialog({ preferences, onChange, onClose }: PreferencesDialogProps) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const selectTheme = (theme: ThemeId) => onChange({ theme });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/75 p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="preferences-title"
        onClick={(event) => event.stopPropagation()}
        className="w-full max-w-md rounded-3xl border border-prism/40 bg-ink-900 p-6 shadow-[0_0_60px_-20px_rgb(var(--prism-rgb)/0.45)] sm:p-7"
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 id="preferences-title" className="font-mono text-sm tracking-widest text-prism glow-text">
            PREFERENCES
          </h2>
          <button
            type="button"
            aria-label="Close preferences"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-prism/70 text-neon-cyan transition hover:bg-prism/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-cyan"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <section className="flex flex-col gap-3">
          <h3 className="text-xs uppercase tracking-widest text-neon-cyan/70">Theme</h3>
          <div className="grid grid-cols-2 gap-3">
            {THEMES.map((option) => {
              const isActive = option.id === preferences.theme;
              return (
                <button
                  key={option.id}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => selectTheme(option.id)}
                  className={`flex items-center gap-3 rounded-xl border px-3 py-3 text-left text-sm transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-cyan ${
                    isActive
                      ? 'border-prism bg-prism/10 text-zinc-50 shadow-[0_0_18px_-6px_rgb(var(--prism-rgb)/0.9)]'
                      : 'border-zinc-700 text-zinc-300 hover:border-prism/60 hover:text-zinc-100'
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className="h-5 w-5 shrink-0 rounded-full ring-2 ring-inset ring-white/20"
                    style={{ backgroundColor: option.swatch, boxShadow: `0 0 12px ${option.swatch}` }}
                  />
                  {option.label}
                </button>
              );
            })}
          </div>
        </section>

        <section className="mt-7 flex items-center justify-between gap-4 border-t border-prism/20 pt-6">
          <div className="flex flex-col gap-1">
            <h3 className="text-xs uppercase tracking-widest text-neon-cyan/70">Key sounds</h3>
            <p className="text-xs text-zinc-500">A mechanical click on each key and a chime on equals.</p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={preferences.soundEnabled}
            aria-label="Key sounds"
            onClick={() => onChange({ soundEnabled: !preferences.soundEnabled })}
            className={`relative h-7 w-12 shrink-0 rounded-full border transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-cyan ${
              preferences.soundEnabled ? 'border-prism bg-prism/30' : 'border-zinc-600 bg-ink-950'
            }`}
          >
            <span
              className={`absolute top-0.5 h-5 w-5 rounded-full bg-zinc-100 transition-all duration-200 ${
                preferences.soundEnabled ? 'left-6' : 'left-0.5'
              }`}
            />
          </button>
        </section>
      </div>
    </div>
  );
}
