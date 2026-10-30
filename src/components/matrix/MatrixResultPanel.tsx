import { EigenResultView } from '@/components/matrix/EigenResultView';
import { formatNumber } from '@/lib/mathEngine';
import type { MatrixOutcome } from '@/lib/matrix';

type MatrixResultPanelProps = {
  outcome: MatrixOutcome;
  onUseOnDisplay: (outcome: Extract<MatrixOutcome, { kind: 'scalar' }>) => void;
};

export function MatrixResultPanel({ outcome, onUseOnDisplay }: MatrixResultPanelProps) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-neon-cyan/25 bg-ink-950 p-5">
      <div className="flex items-center justify-between gap-3">
        <span className="font-mono text-xs uppercase tracking-widest text-neon-cyan/70">{outcome.label}</span>
        {outcome.kind === 'scalar' && (
          <button
            type="button"
            onClick={() => onUseOnDisplay(outcome)}
            className="rounded-full border border-neon-cyan/40 px-4 py-1.5 text-xs font-medium text-neon-cyan transition hover:bg-neon-cyan/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-cyan"
          >
            Send to display
          </button>
        )}
      </div>

      {outcome.kind === 'scalar' && (
        <p key={outcome.value} className="animate-result-in break-all text-right font-mono text-4xl text-neon-cyan glow-text">
          {formatNumber(outcome.value)}
        </p>
      )}

      {outcome.kind === 'matrix' && (
        <div
          role="group"
          aria-label={`${outcome.label} result`}
          className="grid gap-2 self-center rounded-xl border border-neon-cyan/50 px-3 py-2 shadow-[0_0_20px_-10px_rgba(46,230,246,0.8)]"
          style={{ gridTemplateColumns: `repeat(${outcome.values[0].length}, minmax(0, 1fr))` }}
        >
          {outcome.values.map((row, rowIndex) =>
            row.map((value, colIndex) => (
              <span key={`${rowIndex}-${colIndex}`} className="min-w-0 truncate px-1 text-center font-mono text-sm text-neon-cyan">
                {formatNumber(value)}
              </span>
            )),
          )}
        </div>
      )}

      {outcome.kind === 'eigen' && <EigenResultView pairs={outcome.analysis.pairs} withVectors={outcome.withVectors} />}
    </div>
  );
}
