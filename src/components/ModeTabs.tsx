import { ArrowRightLeft, Calculator, TrendingUp, type LucideIcon } from 'lucide-react';

export type ViewMode = 'standard' | 'graphing';

type ModeTabsProps = {
  mode: ViewMode;
  onModeChange: (mode: ViewMode) => void;
  onOpenConverter: () => void;
};

const TABS: { id: ViewMode; label: string; icon: LucideIcon }[] = [
  { id: 'standard', label: 'Standard', icon: Calculator },
  { id: 'graphing', label: 'Graphing', icon: TrendingUp },
];

export function ModeTabs({ mode, onModeChange, onOpenConverter }: ModeTabsProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div role="tablist" aria-label="Calculator view" className="inline-flex rounded-full border border-prism/50 bg-ink-900/80 p-1">
        {TABS.map(({ id, label, icon: Icon }) => {
          const isActive = mode === id;
          return (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onModeChange(id)}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-cyan ${
                isActive
                  ? 'bg-neon-cyan/15 text-neon-cyan shadow-[0_0_18px_-6px_rgba(46,230,246,0.9)]'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={onOpenConverter}
        className="inline-flex items-center gap-2 rounded-full border border-prism/70 bg-ink-900/80 px-4 py-2 font-mono text-xs tracking-widest text-neon-cyan shadow-[0_0_14px_-6px_rgb(var(--prism-rgb)/0.8)] transition hover:border-prism hover:bg-prism/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-cyan"
      >
        <ArrowRightLeft className="h-4 w-4" />
        CONVERT
      </button>
    </div>
  );
}
