const SUPERSCRIPT_DIGITS = ['⁰', '¹', '²', '³', '⁴', '⁵', '⁶', '⁷', '⁸', '⁹'];

export const MAX_FACTORIZABLE = Number.MAX_SAFE_INTEGER;

type PrimeFactor = { prime: number; exponent: number };

export function primeFactors(value: number): PrimeFactor[] {
  const factors: PrimeFactor[] = [];
  let remaining = value;

  for (let candidate = 2; candidate * candidate <= remaining; candidate += candidate === 2 ? 1 : 2) {
    let exponent = 0;
    while (remaining % candidate === 0) {
      remaining /= candidate;
      exponent += 1;
    }
    if (exponent > 0) factors.push({ prime: candidate, exponent });
  }

  if (remaining > 1) factors.push({ prime: remaining, exponent: 1 });
  return factors;
}

function toSuperscript(exponent: number): string {
  return String(exponent)
    .split('')
    .map((digit) => SUPERSCRIPT_DIGITS[Number(digit)])
    .join('');
}

export function formatFactorization(value: number): string {
  return primeFactors(value)
    .map(({ prime, exponent }) => (exponent === 1 ? `${prime}` : `${prime}${toSuperscript(exponent)}`))
    .join(' × ');
}
