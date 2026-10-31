import { useEffect, useRef, useState } from 'react';
import { ChevronDown, LogIn, LogOut } from 'lucide-react';
import type { PrismAuth } from '@/hooks/usePrismAuth';

type UserWidgetProps = {
  auth: PrismAuth;
  onOpenAuth: () => void;
};

function initialsFor(email: string): string {
  const local = email.split('@')[0] ?? '';
  const parts = local.split(/[._-]+/).filter(Boolean);
  const initials = parts.length >= 2 ? `${parts[0][0]}${parts[1][0]}` : local.slice(0, 2);
  return initials.toUpperCase() || '?';
}

export function UserWidget({ auth, onOpenAuth }: UserWidgetProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const handlePointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setMenuOpen(false);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [menuOpen]);

  if (auth.isLoading) {
    return <div aria-hidden="true" className="h-9 w-9 animate-pulse rounded-full border border-zinc-700 bg-zinc-800/60" />;
  }

  if (!auth.user) {
    return (
      <button
        type="button"
        onClick={onOpenAuth}
        className="flex h-9 items-center gap-2 rounded-lg border border-neon-cyan/60 px-3 text-sm font-medium text-neon-cyan shadow-[0_0_18px_-6px_rgba(46,230,246,0.9)] transition hover:bg-neon-cyan/10 hover:shadow-[0_0_26px_-4px_rgba(46,230,246,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-cyan"
      >
        <LogIn className="h-4 w-4" />
        Sign In
      </button>
    );
  }

  const email = auth.user.email ?? '';

  return (
    <div ref={containerRef} className="relative flex items-center gap-2">
      {auth.isPro && (
        <span className="rounded-full border border-prism/70 bg-prism/10 px-2.5 py-0.5 font-mono text-[11px] font-semibold uppercase tracking-widest text-prism shadow-[0_0_14px_-3px_rgb(var(--prism-rgb)/0.9)]">
          Pro
        </span>
      )}
      <button
        type="button"
        aria-label="Account menu"
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen((open) => !open)}
        className="flex items-center gap-1.5 rounded-full border border-prism/60 p-0.5 pr-2 transition hover:border-prism hover:bg-prism/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-cyan"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-prism/20 font-mono text-xs font-semibold text-prism">
          {initialsFor(email)}
        </span>
        <ChevronDown className={`h-3.5 w-3.5 text-zinc-400 transition ${menuOpen ? 'rotate-180' : ''}`} />
      </button>

      {menuOpen && (
        <div
          role="menu"
          className="animate-result-in absolute right-0 top-12 z-40 w-64 rounded-2xl border border-zinc-800 bg-zinc-950/80 p-4 shadow-2xl backdrop-blur-md"
        >
          <p className="truncate text-sm text-zinc-200" title={email}>
            {email}
          </p>
          <p className="mt-1 text-xs text-zinc-500">{auth.isPro ? 'Prism Pro' : 'Prism Base'}</p>
          {auth.planFailed && <p className="mt-2 text-xs text-rose-400">Couldn't load your plan. Try signing in again.</p>}
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setMenuOpen(false);
              void auth.signOut();
            }}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-full border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-200 transition hover:border-prism/70 hover:text-prism focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-cyan"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}
