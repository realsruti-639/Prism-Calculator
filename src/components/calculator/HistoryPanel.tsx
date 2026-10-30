import { useState } from 'react';
import { CircleAlert, Clock, RotateCcw, X } from 'lucide-react';
import type { HistoryStatus } from '@/hooks/useCalculationHistory';
import type { HistoryEntry } from '@/lib/calculationHistory';

type HistoryPanelProps = {
  entries: HistoryEntry[];
  status: HistoryStatus;
  actionError: string | null;
  onRecall: (expression: string) => void;
  onRemove: (id: string) => void;
  onClear: () => void;
  onRetry: () => void;
};

function formatTimestamp(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function HistoryPanel({
  entries,
  status,
  actionError,
  onRecall,
  onRemove,
  onClear,
  onRetry,
}: HistoryPanelProps) {
  const [confirmingClear, setConfirmingClear] = useState(false);

  const handleClear = () => {
    onClear();
    setConfirmingClear(false);
  };

  const renderBody = () => {
    if (status === 'loading') {
      return <p className="px-3 py-8 text-center text-sm text-zinc-400">Loading your history...</p>;
    }

    if (status === 'error') {
      return (
        <div className="flex flex-col items-center gap-3 px-3 py-8 text-center">
          <CircleAlert className="h-6 w-6 text-rose-400" />
          <p className="text-sm text-zinc-300">Couldn't load your history.</p>
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex items-center gap-2 rounded-full border border-neon-cyan/40 px-4 py-1.5 text-sm text-neon-cyan transition hover:bg-neon-cyan/10"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Try again
          </button>
        </div>
      );
    }

    if (entries.length === 0) {
      return (
        <div className="flex flex-col items-center gap-3 px-3 py-10 text-center">
          <Clock className="h-6 w-6 text-zinc-500" />
          <p className="text-sm text-zinc-400">Your calculations will appear here.</p>
        </div>
      );
    }

    return (
      <ul className="flex flex-col gap-1">
        {entries.map((entry) => (
          <li
            key={entry.id}
            className="group relative rounded-xl border border-transparent transition hover:border-neon-cyan/20 hover:bg-ink-800/70"
          >
            <button
              type="button"
              onClick={() => onRecall(entry.expression)}
              className="block w-full rounded-xl px-3 py-3 pr-10 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-cyan"
            >
              <p className="truncate font-mono text-sm text-zinc-300">{entry.expression}</p>
              <div className="mt-1 flex items-center justify-between gap-3">
                <span className="text-[11px] text-zinc-500">{formatTimestamp(entry.createdAt)}</span>
                <span className="font-mono text-base text-neon-cyan">{entry.result}</span>
              </div>
            </button>
            <button
              type="button"
              aria-label="Delete calculation"
              onClick={() => onRemove(entry.id)}
              className="absolute right-2 top-2 rounded-md p-1.5 text-zinc-500 opacity-0 transition hover:text-prism focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-cyan group-hover:opacity-100"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <aside className="flex min-h-0 flex-col rounded-3xl border border-neon-cyan/15 bg-ink-900/80 p-5 backdrop-blur lg:sticky lg:top-6 lg:max-h-[calc(100vh-3rem)]">
      <header className="flex items-center justify-between gap-3 pb-4">
        <h2 className="text-sm font-semibold tracking-wide text-zinc-100">Calculation History</h2>
        {entries.length > 0 &&
          (confirmingClear ? (
            <div className="flex items-center gap-2 text-xs">
              <button
                type="button"
                onClick={handleClear}
                className="rounded-full border border-rose-400/60 px-3 py-1 text-rose-300 transition hover:bg-rose-400/10"
              >
                Confirm
              </button>
              <button
                type="button"
                onClick={() => setConfirmingClear(false)}
                className="rounded-full px-3 py-1 text-zinc-400 transition hover:text-zinc-100"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmingClear(true)}
              className="rounded-full px-3 py-1 text-xs text-zinc-400 transition hover:text-neon-cyan"
            >
              Clear all
            </button>
          ))}
      </header>

      {actionError && (
        <p role="alert" className="mb-3 rounded-lg border border-rose-400/30 bg-rose-400/10 px-3 py-2 text-xs text-rose-300">
          {actionError}
        </p>
      )}

      <div className="min-h-0 flex-1 overflow-y-auto pr-1">{renderBody()}</div>
    </aside>
  );
}
