import { formatNumber } from '@/lib/mathEngine';
import type { Complex, EigenPair } from '@/lib/eigen';

type EigenResultViewProps = {
  pairs: EigenPair[];
  withVectors: boolean;
};

const SUBSCRIPT_DIGITS = ['₀', '₁', '₂', '₃', '₄', '₅', '₆', '₇', '₈', '₉'];

function subscriptIndex(index: number): string {
  return String(index)
    .split('')
    .map((digit) => SUBSCRIPT_DIGITS[Number(digit)])
    .join('');
}

function formatComplex(value: Complex): string {
  if (value.im === 0) return formatNumber(value.re);
  const imaginary = `${formatNumber(Math.abs(value.im))}i`;
  if (value.re === 0) return value.im < 0 ? `−${imaginary}` : imaginary;
  return `${formatNumber(value.re)} ${value.im < 0 ? '−' : '+'} ${imaginary}`;
}

function ColumnVector({ values }: { values: number[] }) {
  return (
    <div className="flex items-stretch">
      <span aria-hidden="true" className="w-2 rounded-l-md border-y border-l border-prism shadow-[-4px_0_12px_-6px_rgb(var(--prism-rgb)/0.8)]" />
      <div className="flex flex-col justify-center gap-1 px-3 py-1">
        {values.map((value, index) => (
          <span key={index} className="text-center font-mono text-sm text-zinc-100">
            {formatNumber(value)}
          </span>
        ))}
      </div>
      <span aria-hidden="true" className="w-2 rounded-r-md border-y border-r border-prism shadow-[4px_0_12px_-6px_rgb(var(--prism-rgb)/0.8)]" />
    </div>
  );
}

export function EigenResultView({ pairs, withVectors }: EigenResultViewProps) {
  return (
    <ol className="flex flex-col gap-3">
      {pairs.map((pair, index) => {
        const isComplex = pair.value.im !== 0;
        return (
          <li key={index} className="flex flex-col gap-3 rounded-xl border border-neon-cyan/20 bg-ink-900/60 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-mono text-base text-neon-cyan">
                λ{subscriptIndex(index + 1)} = {formatComplex(pair.value)}
                {pair.multiplicity > 1 && <span className="ml-2 text-xs text-zinc-400">×{pair.multiplicity}</span>}
              </p>
              {isComplex && (
                <span className="rounded-full border border-amber-400/60 px-2.5 py-0.5 text-xs font-medium text-amber-300">
                  Complex root
                </span>
              )}
            </div>

            {withVectors &&
              (isComplex || !pair.vectors ? (
                <p className="text-xs text-zinc-400">
                  {isComplex
                    ? 'Complex eigenvalues have no real eigenvector, so none is shown.'
                    : 'No eigenvector could be found for this value.'}
                </p>
              ) : (
                <div className="flex flex-wrap gap-5">
                  {pair.vectors.map((vector, vectorIndex) => (
                    <div key={vectorIndex} className="flex flex-col items-center gap-2">
                      <span className="font-mono text-xs text-neon-cyan/70">
                        v{subscriptIndex(vectorIndex + 1)}
                      </span>
                      <ColumnVector values={vector} />
                    </div>
                  ))}
                </div>
              ))}
          </li>
        );
      })}
    </ol>
  );
}
