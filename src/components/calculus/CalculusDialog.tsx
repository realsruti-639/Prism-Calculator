import { useState, type FormEvent } from 'react';
import { X } from 'lucide-react';
import { solveCalculus, type CalculusKind, type CalculusResult, type CalculusSolution } from '@/lib/calculus';
import { SolutionStepsModal } from '@/components/steps/SolutionStepsModal';
import { ViewStepsButton } from '@/components/steps/ViewStepsButton';
import { formatNumber } from '@/lib/mathEngine';

type CalculusDialogProps = {
  kind: CalculusKind;
  onClose: () => void;
  onResult: (result: CalculusResult) => void;
};

type TemplateConfig = {
  title: string;
  glyph: string;
  expressionLabel: string;
  expressionHint: string;
  startLabel: string;
  endLabel?: string;
  defaultStart: string;
  defaultEnd: string;
};

const TEMPLATES: Record<CalculusKind, TemplateConfig> = {
  derivative: {
    title: 'Derivative',
    glyph: 'd/dx',
    expressionLabel: 'f(x)',
    expressionHint: 'Example: x^2 + sin(x)',
    startLabel: 'At x =',
    defaultStart: '1',
    defaultEnd: '',
  },
  integral: {
    title: 'Definite integral',
    glyph: '∫',
    expressionLabel: 'f(x) dx',
    expressionHint: 'Example: x^2 or e^(-x^2)',
    startLabel: 'Lower',
    endLabel: 'Upper',
    defaultStart: '0',
    defaultEnd: '1',
  },
  summation: {
    title: 'Summation',
    glyph: '∑',
    expressionLabel: 'f(x)',
    expressionHint: 'x is the index. Example: 1/x^2',
    startLabel: 'Start',
    endLabel: 'End',
    defaultStart: '1',
    defaultEnd: '10',
  },
};

const FIELD_CLASSES =
  'w-full rounded-xl border border-neon-cyan/30 bg-ink-950 px-3 py-2.5 font-mono text-zinc-100 transition placeholder:text-zinc-600 focus:border-prism focus:outline-none focus:ring-2 focus:ring-prism/30';

type LimitFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
};

function LimitField({ label, value, onChange }: LimitFieldProps) {
  return (
    <label className="flex w-full flex-col gap-1.5">
      <span className="text-center text-[11px] uppercase tracking-widest text-neon-cyan/70">{label}</span>
      <input
        type="text"
        inputMode="decimal"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={`${FIELD_CLASSES} text-center`}
      />
    </label>
  );
}

export function CalculusDialog({ kind, onClose, onResult }: CalculusDialogProps) {
  const template = TEMPLATES[kind];
  const [expression, setExpression] = useState('');
  const [start, setStart] = useState(template.defaultStart);
  const [end, setEnd] = useState(template.defaultEnd);
  const [message, setMessage] = useState<string | null>(null);
  const [solution, setSolution] = useState<CalculusSolution | null>(null);
  const [stepsOpen, setStepsOpen] = useState(false);

  const editField = (setter: (value: string) => void) => (value: string) => {
    setter(value);
    setSolution(null);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      setSolution(solveCalculus({ kind, expression, start, end }));
      setMessage(null);
    } catch (error) {
      setSolution(null);
      setMessage(error instanceof Error ? error.message : 'Calculation failed');
    }
  };

  const glyphClasses =
    kind === 'derivative'
      ? 'font-mono text-2xl leading-none text-prism drop-shadow-[0_0_10px_rgb(var(--prism-rgb)/0.7)]'
      : 'font-mono text-6xl leading-none text-prism drop-shadow-[0_0_12px_rgb(var(--prism-rgb)/0.7)]';

  return (
    <>
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/75 p-4 backdrop-blur-sm" onClick={onClose}>
      <form
        role="dialog"
        aria-modal="true"
        aria-labelledby="calculus-title"
        onSubmit={handleSubmit}
        onClick={(event) => event.stopPropagation()}
        className="w-full max-w-md rounded-3xl border border-prism/40 bg-ink-900 p-6 shadow-[0_0_60px_-20px_rgb(var(--prism-rgb)/0.45)] sm:p-7"
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 id="calculus-title" className="font-mono text-sm tracking-widest text-prism glow-text">
            {template.title.toUpperCase()}
          </h2>
          <button
            type="button"
            aria-label="Close calculus template"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-prism/70 text-neon-cyan transition hover:bg-prism/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-cyan"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="grid grid-cols-[6rem_1fr] items-center gap-4 rounded-2xl border border-prism/20 bg-ink-950 p-4 sm:gap-5">
          <div className="flex flex-col items-center gap-2">
            {template.endLabel && <LimitField label={template.endLabel} value={end} onChange={editField(setEnd)} />}
            <span aria-hidden="true" className={glyphClasses}>
              {template.glyph}
            </span>
            <LimitField label={template.startLabel} value={start} onChange={editField(setStart)} />
          </div>

          <label className="flex flex-col gap-2">
            <span className="text-xs uppercase tracking-widest text-neon-cyan/70">{template.expressionLabel}</span>
            <input
              type="text"
              value={expression}
              onChange={(event) => editField(setExpression)(event.target.value)}
              autoFocus
              className={FIELD_CLASSES}
            />
            <span className="text-xs text-zinc-500">{template.expressionHint}</span>
          </label>
        </div>

        <div className="mt-6 flex min-h-[1.5rem] items-center">
          {message && (
            <p role="alert" className="text-sm text-rose-400">
              {message}
            </p>
          )}
        </div>

        {solution && (
          <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-prism/30 bg-ink-950 p-5">
            <span className="font-mono text-xs uppercase tracking-widest text-neon-cyan/70">{solution.result.label}</span>
            <p key={solution.result.value} className="animate-result-in break-all text-right font-mono text-3xl text-neon-cyan glow-text">
              {formatNumber(solution.result.value)}
            </p>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <ViewStepsButton onClick={() => setStepsOpen(true)} />
              <button
                type="button"
                onClick={() => onResult(solution.result)}
                className="rounded-full border border-neon-cyan/40 px-4 py-2 text-xs font-medium text-neon-cyan transition hover:bg-neon-cyan/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-cyan"
              >
                Send to display
              </button>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-neon-cyan/30 px-5 py-2.5 text-sm font-medium text-zinc-300 transition hover:border-neon-cyan/60 hover:text-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-cyan"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="rounded-full border border-prism/70 bg-prism/10 px-6 py-2.5 text-sm font-semibold tracking-wide text-prism shadow-[0_0_18px_-6px_rgb(var(--prism-rgb)/0.9)] transition hover:bg-prism/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-cyan"
          >
            Calculate
          </button>
        </div>
      </form>
    </div>
    {solution && stepsOpen && <SolutionStepsModal steps={solution.steps} onClose={() => setStepsOpen(false)} />}
    </>
  );
}
