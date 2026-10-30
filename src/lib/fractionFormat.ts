import { formatNumber } from '@/lib/mathEngine';

export type NumberFormat = 'decimal' | 'fraction';

const MAX_DENOMINATOR = 10000;
const RELATIVE_TOLERANCE = 1e-12;
const MAX_STEPS = 32;
const MAX_EXACT_INTEGER = 1e15;

export function toFraction(value: number): string | null {
  if (!Number.isFinite(value)) return null;

  const magnitude = Math.abs(value);
  if (Number.isInteger(magnitude)) return magnitude < MAX_EXACT_INTEGER ? String(value) : null;

  const sign = value < 0 ? '-' : '';
  let remainder = magnitude;
  let previousNumerator = 1;
  let numeratorBefore = 0;
  let previousDenominator = 0;
  let denominatorBefore = 1;

  for (let step = 0; step < MAX_STEPS; step += 1) {
    const whole = Math.floor(remainder);
    const numerator = whole * previousNumerator + numeratorBefore;
    const denominator = whole * previousDenominator + denominatorBefore;
    if (denominator > MAX_DENOMINATOR) return null;

    if (Math.abs(magnitude - numerator / denominator) <= RELATIVE_TOLERANCE * magnitude) {
      return `${sign}${numerator}/${denominator}`;
    }

    numeratorBefore = previousNumerator;
    previousNumerator = numerator;
    denominatorBefore = previousDenominator;
    previousDenominator = denominator;

    const fractional = remainder - whole;
    if (fractional < RELATIVE_TOLERANCE) return null;
    remainder = 1 / fractional;
  }

  return null;
}

export function formatDisplayValue(
  value: number,
  format: NumberFormat,
): { text: string; isFractionUnavailable: boolean } {
  if (format === 'decimal') return { text: formatNumber(value), isFractionUnavailable: false };

  const fraction = toFraction(value);
  return fraction === null
    ? { text: formatNumber(value), isFractionUnavailable: true }
    : { text: fraction, isFractionUnavailable: false };
}
