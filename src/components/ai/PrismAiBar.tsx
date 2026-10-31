import { useState, type FormEvent } from 'react';
import { Sparkles } from 'lucide-react';
import { MatrixResultPanel } from '@/components/matrix/MatrixResultPanel';
import { useAiUsage } from '@/hooks/useAiUsage';
import { usePaywall } from '@/hooks/usePaywall';
import { AI_FREE_DAILY_LIMIT } from '@/lib/aiUsage';
import type { CalculusResult } from '@/lib/calculus';
import { formatNumber } from '@/lib/mathEngine';
import { interpretCommand, type PrismIntent } from '@/lib/prismAi';

type PrismAiBarProps = {
  onLoadExpression: (expression: string) => void;
  onShowResult: (result: CalculusResult) => void;
};

function IntentStatus({ intent, onShowResult }: { intent: PrismIntent; onShowResult: (result: CalculusResult) => void }) {
  if (intent.kind === 'error') {
    return (
      <p role="alert" className="text-sm text-rose-400">
        {intent.message}
      </p>
    );
  }
  if (intent.kind === 'expression') {
    return (
      <p className="font-mono text-sm text-neon-cyan">
        Pushed to the display: <span className="break-all">{intent.expression}</span>
      </p>
    );
  }
  if (intent.kind === 'calculus') {
    const { result } = intent.solution;
    return (
      <p className="font-mono text-sm text-neon-cyan">
        Shown on the display: {result.label} = {formatNumber(result.value)}
      </p>
    );
  }
  return (
    <MatrixResultPanel
      outcome={intent.outcome}
      onUseOnDisplay={(outcome) => onShowResult({ label: outcome.label, value: outcome.value })}
    />
  );
}

export function PrismAiBar({ onLoadExpression, onShowResult }: PrismAiBarProps) {
  const [text, setText] = useState('');
  const [intent, setIntent] = useState<PrismIntent | null>(null);
  const { isPro, openPaywall } = usePaywall();
  const aiUsage = useAiUsage();
  const remainingRuns = Math.max(AI_FREE_DAILY_LIMIT - aiUsage.count, 0);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isPro && remainingRuns === 0) {
      openPaywall('Unlimited Prism-AI');
      return;
    }
    aiUsage.recordRun();
    const next = interpretCommand(text);
    setIntent(next);
    if (next.kind === 'expression') onLoadExpression(next.expression);
    if (next.kind === 'calculus') onShowResult(next.solution.result);
  };

  return (
    <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-prism/30 bg-ink-950/80 p-4">
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-prism" />
        <span className="font-mono text-xs uppercase tracking-widest text-prism">Prism-AI</span>
        <span className="text-xs text-zinc-500">Describe a calculation in plain words</span>
        {!isPro && (
          <span className="ml-auto whitespace-nowrap font-mono text-xs text-zinc-400">
            {remainingRuns} of {AI_FREE_DAILY_LIMIT} free runs left today
          </span>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          aria-label="Prism-AI command"
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="derivative of x^2 at 3"
          spellCheck={false}
          autoComplete="off"
          className="min-w-0 flex-1 rounded-xl border border-prism/40 bg-ink-900 px-4 py-2.5 font-mono text-sm text-zinc-100 placeholder:text-zinc-600 transition focus:border-prism focus:outline-none focus:ring-2 focus:ring-prism/30"
        />
        <button
          type="submit"
          className="rounded-xl border border-prism/70 bg-prism/10 px-4 py-2.5 text-sm font-semibold text-prism shadow-[0_0_18px_-6px_rgb(var(--prism-rgb)/0.9)] transition hover:bg-prism/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-cyan"
        >
          Run
        </button>
      </form>

      {intent && <IntentStatus intent={intent} onShowResult={onShowResult} />}
    </div>
  );
}
