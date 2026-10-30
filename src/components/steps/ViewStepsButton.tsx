import { ListChecks } from 'lucide-react';

type ViewStepsButtonProps = {
  onClick: () => void;
};

export function ViewStepsButton({ onClick }: ViewStepsButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group inline-flex items-center gap-2 rounded-full border border-prism/80 bg-prism/10 px-5 py-2.5 font-mono text-xs font-semibold uppercase tracking-widest text-prism shadow-[0_0_24px_-4px_rgb(var(--prism-rgb)/0.9)] transition hover:bg-prism/20 hover:shadow-[0_0_32px_-2px_rgb(var(--prism-rgb)/1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-cyan"
    >
      <ListChecks className="h-4 w-4 transition group-hover:scale-110" />
      [ View Solution Steps ]
    </button>
  );
}
