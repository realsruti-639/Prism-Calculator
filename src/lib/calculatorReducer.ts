import type { NumberFormat } from '@/lib/fractionFormat';
import {
  evaluateExpression,
  formatNumber,
  toInputLiteral,
  toPlainDecimal,
  type AngleMode,
  type EvaluationContext,
} from '@/lib/mathEngine';
import { formatFactorization, MAX_FACTORIZABLE } from '@/lib/primeFactorization';
import { isInsertAllowed, RADIX_BASE, toBaseDigits, type RadixMode } from '@/lib/radix';

export type KeyAction =
  | { type: 'insert'; text: string }
  | { type: 'equals' }
  | { type: 'clear' }
  | { type: 'delete' }
  | { type: 'toggleSign' }
  | { type: 'toggleAngle' }
  | { type: 'toggleFormat' }
  | { type: 'setRadix'; radix: RadixMode }
  | { type: 'factorize' }
  | { type: 'memoryAdd' }
  | { type: 'memorySubtract' }
  | { type: 'memoryRecall' }
  | { type: 'memoryClear' }
  | { type: 'grandTotal' };

export type CalculatorAction =
  | KeyAction
  | { type: 'recall'; expression: string }
  | { type: 'showResult'; expression: string; value: number };

export type CompletedCalculation = { expression: string; result: string };

export type CalculatorState = {
  input: string;
  result: number | null;
  factorization: string | null;
  error: string | null;
  ans: number;
  angle: AngleMode;
  numberFormat: NumberFormat;
  radix: RadixMode;
  memory: number;
  grandTotal: number;
  completed: CompletedCalculation | null;
};

export const initialCalculatorState: CalculatorState = {
  input: '',
  result: null,
  factorization: null,
  error: null,
  ans: 0,
  angle: 'rad',
  numberFormat: 'decimal',
  radix: 'DEC',
  memory: 0,
  grandTotal: 0,
  completed: null,
};

const BINARY_OPERATOR_TEXT = new Set(['+', '−', '×', '÷', '^', 'nPr', 'nCr']);
const DELETABLE_TOKEN = /Ans$|nPr$|nCr$|pi$|sqrt\($|cbrt\($|[\s\S]$/;
const DECIMAL_TRAILING_NUMBER = /(\(−)?(\d*\.?\d+)$/;
const RADIX_TRAILING_NUMBER = /(\(−)?([0-9A-Fa-f]+)$/;
const FACTORIZE_RECALL = /^FACT\((\d+)\)$/;

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Syntax error';
}

function evaluationContext(state: CalculatorState): EvaluationContext {
  return { angle: state.angle, ans: state.ans, base: RADIX_BASE[state.radix] };
}

export function currentValue(state: CalculatorState): number | null {
  if (state.factorization !== null) return null;
  if (state.result !== null) return state.result;
  if (state.input.trim() === '') return null;
  return evaluateExpression(state.input, evaluationContext(state));
}

function isOutputShown(state: CalculatorState): boolean {
  return state.result !== null || state.factorization !== null;
}

function carryPrefix(state: CalculatorState): string {
  if (state.result === null) return '';
  return state.radix === 'DEC' ? 'Ans' : toBaseDigits(state.result, RADIX_BASE[state.radix]);
}

function toggleTrailingSign(input: string, base: number): string {
  const pattern = base === 10 ? DECIMAL_TRAILING_NUMBER : RADIX_TRAILING_NUMBER;
  const match = pattern.exec(input);
  if (!match) return `(−${input}`;
  const start = match.index;
  const digits = match[2];
  const isNegated = match[1] !== undefined;
  const prefix = input.slice(0, start);
  return isNegated ? `${prefix}${digits}` : `${prefix}(−${digits}`;
}

function appendValue(state: CalculatorState, value: number): CalculatorState {
  const base = isOutputShown(state) ? '' : state.input;
  return {
    ...state,
    input: base + toInputLiteral(value, RADIX_BASE[state.radix]),
    result: null,
    factorization: null,
    error: null,
  };
}

function adjustMemory(state: CalculatorState, direction: 1 | -1): CalculatorState {
  try {
    const value = currentValue(state);
    if (value === null) return state;
    return { ...state, memory: state.memory + direction * value, error: null };
  } catch (error) {
    return { ...state, error: errorMessage(error) };
  }
}

function factorize(state: CalculatorState, value: number): CalculatorState {
  if (!Number.isInteger(value) || value < 2) {
    return { ...state, result: null, factorization: null, error: 'Enter a whole number of 2 or more' };
  }
  if (value > MAX_FACTORIZABLE) {
    return { ...state, result: null, factorization: null, error: 'Number too large to factor' };
  }
  return {
    ...state,
    input: `FACT(${value})`,
    result: null,
    factorization: formatFactorization(value),
    error: null,
    completed: null,
  };
}

export function calculatorReducer(state: CalculatorState, action: CalculatorAction): CalculatorState {
  switch (action.type) {
    case 'insert': {
      if (!isInsertAllowed(action.text, state.radix)) return state;
      if (!isOutputShown(state)) return { ...state, input: state.input + action.text, error: null };
      const prefix = BINARY_OPERATOR_TEXT.has(action.text) ? carryPrefix(state) : '';
      return { ...state, input: prefix + action.text, result: null, factorization: null, error: null };
    }

    case 'equals': {
      if (isOutputShown(state) || state.input.trim() === '') return state;
      try {
        const value = evaluateExpression(state.input, evaluationContext(state));
        const result = formatNumber(value);
        return {
          ...state,
          result: value,
          factorization: null,
          error: null,
          ans: value,
          grandTotal: state.grandTotal + value,
          completed: { expression: state.input, result },
        };
      } catch (error) {
        return { ...state, result: null, factorization: null, error: errorMessage(error), completed: null };
      }
    }

    case 'clear':
      return {
        ...initialCalculatorState,
        ans: state.ans,
        angle: state.angle,
        numberFormat: state.numberFormat,
        radix: state.radix,
        memory: state.memory,
      };

    case 'delete': {
      if (state.factorization !== null) {
        return { ...state, input: '', result: null, factorization: null, error: null };
      }
      if (state.result !== null) return { ...state, result: null, error: null };
      return { ...state, input: state.input.replace(DELETABLE_TOKEN, ''), error: null };
    }

    case 'toggleSign': {
      if (state.factorization !== null) return state;
      if (state.result !== null) {
        return { ...state, input: `(−${carryPrefix(state)})`, result: null, error: null };
      }
      return { ...state, input: toggleTrailingSign(state.input, RADIX_BASE[state.radix]), error: null };
    }

    case 'toggleAngle':
      return { ...state, angle: state.angle === 'rad' ? 'deg' : 'rad' };

    case 'toggleFormat':
      return { ...state, numberFormat: state.numberFormat === 'decimal' ? 'fraction' : 'decimal' };

    case 'setRadix': {
      if (action.radix === state.radix) return state;
      let value: number | null;
      try {
        value = currentValue(state);
      } catch (error) {
        return { ...state, error: errorMessage(error) };
      }
      const base = RADIX_BASE[action.radix];
      const input = value === null ? '' : base === 10 ? toPlainDecimal(value) : toBaseDigits(value, base);
      return { ...state, radix: action.radix, input, result: null, factorization: null, error: null };
    }

    case 'factorize': {
      if (state.radix !== 'DEC') return state;
      let value: number | null;
      try {
        value = currentValue(state);
      } catch (error) {
        return { ...state, error: errorMessage(error) };
      }
      if (value === null) return state;
      const next = factorize(state, value);
      if (next.factorization === null) return next;
      return { ...next, completed: { expression: next.input, result: next.factorization } };
    }

    case 'memoryAdd':
      return adjustMemory(state, 1);

    case 'memorySubtract':
      return adjustMemory(state, -1);

    case 'memoryRecall':
      return appendValue(state, state.memory);

    case 'memoryClear':
      return { ...state, memory: 0 };

    case 'grandTotal':
      return appendValue(state, state.grandTotal);

    case 'showResult':
      return {
        ...state,
        input: action.expression,
        result: action.value,
        factorization: null,
        error: null,
        ans: action.value,
        completed: { expression: action.expression, result: formatNumber(action.value) },
      };

    case 'recall': {
      const factorMatch = FACTORIZE_RECALL.exec(action.expression);
      if (factorMatch) return factorize(state, Number(factorMatch[1]));
      return {
        ...state,
        input: action.expression,
        result: null,
        factorization: null,
        error: null,
        completed: null,
      };
    }
  }
}
