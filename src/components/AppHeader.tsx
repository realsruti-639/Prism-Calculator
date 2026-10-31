import { SlidersHorizontal, Triangle } from 'lucide-react';
import { UserWidget } from '@/components/navigation/UserWidget';
import type { PrismAuth } from '@/hooks/usePrismAuth';

type AppHeaderProps = {
  auth: PrismAuth;
  onOpenAuth: () => void;
  onOpenPreferences: () => void;
};

export function AppHeader({ auth, onOpenAuth, onOpenPreferences }: AppHeaderProps) {
  return (
    <header className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-neon-cyan/40 bg-neon-cyan/10 shadow-[0_0_20px_-4px_rgba(46,230,246,0.6)]">
          <Triangle className="h-5 w-5 text-neon-cyan" strokeWidth={2.25} />
        </div>
        <span className="text-xl font-semibold tracking-tight text-zinc-50">Prism</span>
      </div>
      <div className="flex items-center gap-3">
        <p className="hidden text-sm text-zinc-400 lg:block">Arithmetic and scientific calculator</p>
        <UserWidget auth={auth} onOpenAuth={onOpenAuth} />
        <button
          type="button"
          onClick={onOpenPreferences}
          aria-label="Open preferences"
          className="flex h-9 items-center gap-2 rounded-lg border border-prism/60 px-3 text-sm text-prism transition hover:bg-prism/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-cyan"
        >
          <SlidersHorizontal className="h-4 w-4" />
          <span className="hidden sm:inline">Preferences</span>
        </button>
      </div>
    </header>
  );
}
