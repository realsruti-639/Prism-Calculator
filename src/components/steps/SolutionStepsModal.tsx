import { useEffect } from 'react';
import { X } from 'lucide-react';
import type { SolutionSteps } from '@/lib/solutionSteps';

type SolutionStepsModalProps = {
  steps: SolutionSteps;
  onClose: () => void;
};

type PhaseSection = { heading: string; lines: string[] };

function LineList({ lines }: { lines: string[] }) {
  return (
    <ul className="flex flex-col gap-2">
      {lines.map((line, index) => (
        <li key={index} className="break-words rounded-lg bg-ink-900/70 px-3 py-2 font-mono text-sm text-zinc-200">
          {line}
        </li>
      ))}
    </ul>
  );
}

export function SolutionStepsModal({ steps, onClose }: SolutionStepsModalProps) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const phases: PhaseSection[] = [
    { heading: 'Phase 1 · Setup', lines: steps.setup },
    { heading: 'Phase 2 · Derivation', lines: steps.derivation },
    { heading: 'Phase 3 · Result', lines: steps.result },
  ];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-ink-950/85 p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="steps-title"
        onClick={(event) => event.stopPropagation()}
        className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-prism/60 bg-ink-900 shadow-[0_0_80px_-16px_rgb(var(--prism-rgb)/0.7)]"
      >
        <div className="flex items-start justify-between gap-4 border-b border-prism/25 px-6 py-5 sm:px-7">
          <div className="flex flex-col gap-1">
            <span className="text-xs uppercase tracking-widest text-neon-cyan/70">Solution steps</span>
            <h2 id="steps-title" className="text-lg font-semibold text-zinc-50">
              {steps.title}
            </h2>
          </div>
          <button
            type="button"
            aria-label="Close solution steps"
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-prism/70 text-neon-cyan transition hover:bg-prism/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-cyan"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex flex-col gap-6 overflow-y-auto px-6 py-6 sm:px-7">
          {phases.map((phase) => (
            <section key={phase.heading} className="flex flex-col gap-3">
              <h3 className="font-mono text-xs uppercase tracking-widest text-prism">{phase.heading}</h3>
              {phase.lines.length > 0 ? <LineList lines={phase.lines} /> : <p className="text-sm text-zinc-500">Nothing to show.</p>}
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
