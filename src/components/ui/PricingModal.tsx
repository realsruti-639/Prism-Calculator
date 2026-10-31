import { Check, X } from 'lucide-react';

type PricingModalProps = {
  featureName: string;
  onClose: () => void;
};

const BASE_FEATURES = [
  'Standard and scientific calculator',
  '2D graphing with pan and zoom',
  'Unit converter and matrix basics',
  'Calculation history saved on this device',
  'Prism-AI with 5 runs per day',
];

const PRO_FEATURES = [
  'Everything in Prism Base',
  'Step-by-step calculus and matrix solutions',
  'Interactive 3D surface plotting',
  'Adjustable 3D mesh up to 40 x 40',
  'Unlimited Prism-AI commands',
  'Calculation history synced across devices',
];

function FeatureList({ items, tone }: { items: string[]; tone: 'base' | 'pro' }) {
  return (
    <ul className="flex flex-col gap-3">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-3 text-sm text-zinc-300">
          <Check className={`mt-0.5 h-4 w-4 shrink-0 ${tone === 'pro' ? 'text-prism' : 'text-neon-cyan'}`} />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export function PricingModal({ featureName, onClose }: PricingModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-zinc-950/80 p-4 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="pricing-title"
        onClick={(event) => event.stopPropagation()}
        className="w-full max-w-3xl rounded-3xl border border-zinc-800 bg-ink-900 p-6 shadow-2xl sm:p-8"
      >
        <div className="mb-8 flex items-start justify-between gap-4">
          <div className="flex flex-col gap-2">
            <h2 id="pricing-title" className="font-mono text-sm tracking-widest text-prism glow-text">
              CHOOSE YOUR PLAN
            </h2>
            <p className="text-sm text-zinc-400">
              <span className="text-zinc-200">{featureName}</span> is available with Prism Pro.
            </p>
          </div>
          <button
            type="button"
            aria-label="Close pricing"
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-zinc-700 text-zinc-300 transition hover:border-zinc-500 hover:text-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-cyan"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div className="flex flex-col gap-6 rounded-2xl border border-zinc-800 bg-ink-950/80 p-6">
            <div className="flex flex-col gap-2">
              <span className="font-mono text-xs uppercase tracking-widest text-zinc-400">Prism Base</span>
              <p className="flex items-baseline gap-1">
                <span className="text-4xl font-semibold text-zinc-50">$0</span>
                <span className="text-sm text-zinc-500">forever</span>
              </p>
            </div>
            <FeatureList items={BASE_FEATURES} tone="base" />
            <button
              type="button"
              disabled
              className="mt-auto rounded-full border border-zinc-700 px-5 py-2.5 text-sm font-medium text-zinc-400"
            >
              Your current plan
            </button>
          </div>

          <div className="relative flex flex-col gap-6 rounded-2xl border border-prism/80 bg-ink-950/80 p-6 shadow-[0_0_40px_-12px_rgb(var(--prism-rgb)/0.8)]">
            <span className="absolute -top-3 right-6 rounded-full border border-prism/70 bg-ink-900 px-3 py-0.5 font-mono text-[11px] uppercase tracking-widest text-prism">
              Recommended
            </span>
            <div className="flex flex-col gap-2">
              <span className="font-mono text-xs uppercase tracking-widest text-prism">Prism Pro</span>
              <p className="flex items-baseline gap-1">
                <span className="text-4xl font-semibold text-zinc-50">$4.99</span>
                <span className="text-sm text-zinc-500">per month</span>
              </p>
            </div>
            <FeatureList items={PRO_FEATURES} tone="pro" />
            <div className="mt-auto flex flex-col gap-2">
              <button
                type="button"
                disabled
                className="rounded-full border border-prism/60 bg-prism/10 px-5 py-2.5 text-sm font-semibold text-prism disabled:cursor-not-allowed disabled:opacity-70"
              >
                Upgrade coming soon
              </button>
              <p className="text-center text-xs text-zinc-500">Upgrades are not available yet. Your free plan keeps working.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
