import { formatDisplayValue, type NumberFormat } from '@/lib/fractionFormat';
import type { AngleMode } from '@/lib/mathEngine';
import { RADIX_BASE, toBaseDigits, type RadixMode } from '@/lib/radix';

type DisplayProps = {
  input: string;
  result: number | null;
  preview: number | null;
  factorization: string | null;
  error: string | null;
  angle: AngleMode;
  numberFormat: NumberFormat;
  radix: RadixMode;
};

type FormattedMain = { text: string; isFractionUnavailable: boolean };

function formatMainValue(value: number, numberFormat: NumberFormat, radix: RadixMode): FormattedMain {
  if (radix !== 'DEC') return { text: toBaseDigits(value, RADIX_BASE[radix]), isFractionUnavailable: false };
  return formatDisplayValue(value, numberFormat);
}

export function Display({
  input,
  result,
  preview,
  factorization,
  error,
  angle,
  numberFormat,
  radix,
}: DisplayProps) {
  const mainValue = result ?? preview;
  const isOutputShown = result !== null || factorization !== null;

  let formatted: FormattedMain | null = null;
  if (factorization !== null) formatted = { text: factorization, isFractionUnavailable: false };
  else if (mainValue !== null) formatted = formatMainValue(mainValue, numberFormat, radix);

  const mainText = formatted?.text ?? '0';
  const mainSize = factorization !== null ? 'text-3xl sm:text-5xl' : 'text-5xl sm:text-6xl lg:text-7xl';

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex shrink-0 items-center gap-2">
          <span className="rounded-md border border-neon-cyan/30 px-2 py-0.5 font-mono text-[11px] tracking-widest text-neon-cyan/80">
            {angle === 'rad' ? 'RAD' : 'DEG'}
          </span>
          <span className="glow-text font-mono text-[11px] font-semibold tracking-widest text-neon-cyan">
            [{radix}]
          </span>
        </div>
        <p className="min-w-0 truncate text-right font-mono text-lg text-neon-cyan/70 sm:text-2xl" aria-live="polite">
          {input || ' '}
        </p>
      </div>

      <div className="min-h-[5.5rem] text-right">
        {error ? (
          <p role="alert" className="font-mono text-lg text-rose-400 sm:text-xl">
            {error}
          </p>
        ) : (
          <>
            <p
              key={mainText}
              className={`animate-result-in break-all font-mono leading-tight ${mainSize} ${
                isOutputShown ? 'glow-text text-neon-cyan' : 'text-neon-cyan/50'
              }`}
            >
              {mainText}
            </p>
            {formatted?.isFractionUnavailable && (
              <p className="mt-1 text-xs text-zinc-500">No exact fraction, showing decimal</p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
