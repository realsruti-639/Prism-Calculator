import { LogIn, LogOut, SlidersHorizontal, Triangle } from 'lucide-react';

type AppHeaderProps = {
  accountEmail: string | null;
  onOpenAuth: () => void;
  onSignOut: () => void;
  onOpenPreferences: () => void;
};

const HEADER_BUTTON =
  'flex h-9 items-center gap-2 rounded-lg border px-3 text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-cyan';

export function AppHeader({ accountEmail, onOpenAuth, onSignOut, onOpenPreferences }: AppHeaderProps) {
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
        {accountEmail ? (
          <>
            <span className="hidden max-w-[12rem] truncate text-sm text-zinc-400 md:block" title={accountEmail}>
              {accountEmail}
            </span>
            <button
              type="button"
              onClick={onSignOut}
              className={`${HEADER_BUTTON} border-zinc-600 text-zinc-300 hover:border-zinc-400 hover:text-zinc-100`}
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={onOpenAuth}
            className={`${HEADER_BUTTON} border-neon-cyan/50 text-neon-cyan hover:bg-neon-cyan/10`}
          >
            <LogIn className="h-4 w-4" />
            <span className="hidden sm:inline">Sign in</span>
          </button>
        )}
        <button
          type="button"
          onClick={onOpenPreferences}
          aria-label="Open preferences"
          className={`${HEADER_BUTTON} border-prism/60 text-prism hover:bg-prism/10`}
        >
          <SlidersHorizontal className="h-4 w-4" />
          <span className="hidden sm:inline">Preferences</span>
        </button>
      </div>
    </header>
  );
}
