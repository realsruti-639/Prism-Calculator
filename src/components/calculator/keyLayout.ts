import type { KeyAction } from '@/lib/calculatorReducer';
import type { CalculusKind } from '@/lib/calculus';
import { RADIX_MODES, type RadixMode } from '@/lib/radix';

export type KeyVariant = 'digit' | 'operator' | 'scientific' | 'toggle' | 'equals';

export type KeyDefinition = {
  label: string;
  action: KeyAction;
  variant: KeyVariant;
  wide?: boolean;
  hint?: string;
  requiresDecimal?: boolean;
};

function insertKey(label: string, variant: KeyVariant, text: string = label): KeyDefinition {
  return { label, action: { type: 'insert', text }, variant };
}

function scientificKey(label: string, text: string = label): KeyDefinition {
  return { ...insertKey(label, 'scientific', text), requiresDecimal: true };
}

export const BASE_KEYS: KeyDefinition[] = RADIX_MODES.map(
  (mode: RadixMode): KeyDefinition => ({
    label: mode,
    action: { type: 'setRadix', radix: mode },
    variant: 'toggle',
  }),
);

export const MEMORY_KEYS: KeyDefinition[] = [
  { label: 'M+', action: { type: 'memoryAdd' }, variant: 'scientific' },
  { label: 'M-', action: { type: 'memorySubtract' }, variant: 'scientific' },
  { label: 'MR', action: { type: 'memoryRecall' }, variant: 'scientific' },
  { label: 'MC', action: { type: 'memoryClear' }, variant: 'scientific' },
  { label: 'GT', action: { type: 'grandTotal' }, variant: 'scientific' },
  { label: 'S↔D', action: { type: 'toggleFormat' }, variant: 'toggle', requiresDecimal: true },
];

export const UTILITY_KEYS: KeyDefinition[] = [
  {
    ...scientificKey('nPr', 'nPr'),
    hint: 'n nPr r: ordered arrangements of r items from n',
  },
  {
    ...scientificKey('nCr', 'nCr'),
    hint: 'n nCr r: unordered groupings of r items from n',
  },
  {
    label: 'FACT',
    action: { type: 'factorize' },
    variant: 'scientific',
    requiresDecimal: true,
    hint: 'Prime factorization of the whole number on screen',
  },
];

export const CONSTANT_KEYS: KeyDefinition[] = [
  { ...scientificKey('c', '(299792458)'), hint: 'Speed of light (m/s)' },
  { ...scientificKey('h', '(6.62607015×10^(−34))'), hint: "Planck's constant (J·s)" },
  { ...scientificKey('NA', '(6.02214076×10^23)'), hint: "Avogadro's number (mol⁻¹)" },
  { ...scientificKey('G', '(6.67430×10^(−11))'), hint: 'Gravitational constant (m³·kg⁻¹·s⁻²)' },
];

export type CalculusKey = { label: string; kind: CalculusKind; hint: string };

export const CALCULUS_KEYS: CalculusKey[] = [
  { label: 'd/dx', kind: 'derivative', hint: 'Derivative of f(x) at x = a' },
  { label: '∫', kind: 'integral', hint: 'Definite integral of f(x) from a to b' },
  { label: '∑', kind: 'summation', hint: 'Sum of f(x) for x from a to b' },
];

export const HEX_KEYS: KeyDefinition[] = ['A', 'B', 'C', 'D', 'E', 'F'].map((letter) => insertKey(letter, 'scientific'));

export const SCIENTIFIC_KEYS: KeyDefinition[] = [
  scientificKey('x^y', '^'),
  scientificKey('√', '√('),
  scientificKey('ln', 'ln('),
  scientificKey('log', 'log('),
  scientificKey('10^x', '10^('),
  scientificKey('e^x', 'e^('),
  scientificKey('log₂', 'log2('),
  scientificKey('∛', '∛('),
  scientificKey('sin', 'sin('),
  scientificKey('cos', 'cos('),
  scientificKey('tan', 'tan('),
  { label: 'Rad/Deg', action: { type: 'toggleAngle' }, variant: 'toggle', requiresDecimal: true },
  scientificKey('sin⁻¹', 'asin('),
  scientificKey('cos⁻¹', 'acos('),
  scientificKey('tan⁻¹', 'atan('),
  scientificKey('π'),
  scientificKey('x²', '^2'),
  scientificKey('x³', '^3'),
  scientificKey('x!', '!'),
  scientificKey('e'),
  scientificKey('1/x', '1÷('),
  scientificKey('|x|', 'abs('),
  scientificKey('Ans'),
  scientificKey('%'),
];

export const NUMPAD_KEYS: KeyDefinition[] = [
  { label: 'AC', action: { type: 'clear' }, variant: 'scientific' },
  { label: 'DEL', action: { type: 'delete' }, variant: 'scientific' },
  insertKey('(', 'scientific'),
  insertKey(')', 'scientific'),
  insertKey('7', 'digit'),
  insertKey('8', 'digit'),
  insertKey('9', 'digit'),
  insertKey('÷', 'operator'),
  insertKey('4', 'digit'),
  insertKey('5', 'digit'),
  insertKey('6', 'digit'),
  insertKey('×', 'operator'),
  insertKey('1', 'digit'),
  insertKey('2', 'digit'),
  insertKey('3', 'digit'),
  insertKey('−', 'operator'),
  insertKey('0', 'digit'),
  insertKey('.', 'digit'),
  { label: '±', action: { type: 'toggleSign' }, variant: 'operator' },
  insertKey('+', 'operator'),
  { label: '=', action: { type: 'equals' }, variant: 'equals', wide: true },
];
