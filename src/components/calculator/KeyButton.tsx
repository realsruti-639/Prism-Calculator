import type { KeyVariant } from '@/components/calculator/keyLayout';
import { playChime, playKeyClick } from '@/lib/keySound';

type KeyButtonProps = {
  label: string;
  variant: KeyVariant;
  wide?: boolean;
  active?: boolean;
  disabled?: boolean;
  hint?: string;
  soundEnabled?: boolean;
  onActivate: () => void;
};

const BASE_CLASSES =
  'flex h-12 w-full items-center justify-center font-mono transition duration-150 ease-out active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-cyan focus-visible:ring-offset-2 focus-visible:ring-offset-ink-950 disabled:pointer-events-none disabled:opacity-25 disabled:shadow-none sm:h-14';

const VARIANT_CLASSES: Record<KeyVariant, string> = {
  digit:
    'rounded-full bg-ink-700/70 text-xl text-zinc-100 hover:bg-ink-700 hover:text-white',
  operator:
    'rounded-full bg-ink-800 text-xl text-neon-cyan ring-1 ring-inset ring-neon-cyan/25 hover:bg-ink-700 hover:ring-neon-cyan/60',
  scientific:
    'rounded-lg border border-prism/70 bg-ink-900/60 text-sm text-neon-cyan shadow-[0_0_14px_-6px_rgb(var(--prism-rgb)/0.8)] hover:border-prism hover:bg-prism/10 hover:shadow-[0_0_18px_-4px_rgb(var(--prism-rgb)/0.9)]',
  toggle:
    'rounded-lg border text-xs text-neon-cyan shadow-[0_0_14px_-6px_rgb(var(--prism-rgb)/0.8)] hover:bg-prism/10',
  equals:
    'rounded-full bg-neon-cyan text-lg font-semibold text-ink-950 shadow-[0_0_28px_-4px_rgba(46,230,246,0.9)] hover:brightness-110',
};

const TOGGLE_ACTIVE_CLASSES = 'border-neon-cyan bg-neon-cyan/10 text-neon-cyan';
const TOGGLE_IDLE_CLASSES = 'border-prism/70';

export function KeyButton({
  label,
  variant,
  wide = false,
  active = false,
  disabled = false,
  hint,
  soundEnabled = false,
  onActivate,
}: KeyButtonProps) {
  const variantClasses =
    variant === 'toggle'
      ? `${VARIANT_CLASSES.toggle} ${active ? TOGGLE_ACTIVE_CLASSES : TOGGLE_IDLE_CLASSES}`
      : VARIANT_CLASSES[variant];

  const handleClick = () => {
    if (soundEnabled) {
      if (variant === 'equals') playChime();
      else playKeyClick();
    }
    onActivate();
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      title={hint}
      aria-pressed={variant === 'toggle' ? active : undefined}
      className={`${BASE_CLASSES} ${variantClasses} ${wide ? 'col-span-4' : ''}`}
    >
      {label}
    </button>
  );
}
