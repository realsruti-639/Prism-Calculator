export type RadixMode = 'DEC' | 'BIN' | 'OCT' | 'HEX';

export const RADIX_MODES: RadixMode[] = ['DEC', 'BIN', 'OCT', 'HEX'];

export const RADIX_BASE: Record<RadixMode, number> = { DEC: 10, BIN: 2, OCT: 8, HEX: 16 };

const BASE_PREFIX: Record<number, string> = { 2: '0b', 8: '0o', 16: '0x' };

const DIGIT_PATTERNS: Record<number, RegExp> = {
  2: /^[01]+/,
  8: /^[0-7]+/,
  16: /^[0-9a-fA-F]+/,
};

export function matchRadixDigits(input: string, base: number): string | null {
  const match = DIGIT_PATTERNS[base]?.exec(input);
  return match ? match[0] : null;
}

export function parseRadixDigits(digits: string, base: number): number {
  return Number(BigInt(`${BASE_PREFIX[base]}${digits}`));
}

export function toBaseDigits(value: number, base: number): string {
  return BigInt(Math.trunc(value)).toString(base).toUpperCase();
}

export function isInsertAllowed(text: string, mode: RadixMode): boolean {
  const base = RADIX_BASE[mode];
  if (/^[A-F]$/.test(text)) return base === 16;
  if (/^\d$/.test(text)) return Number(text) < base;
  if (text === '.') return base === 10;
  return true;
}
