import { useEffect, useMemo, useReducer } from 'react';
import {
  calculatorReducer,
  currentValue,
  initialCalculatorState,
  type CalculatorAction,
  type CalculatorState,
  type CompletedCalculation,
  type KeyAction,
} from '@/lib/calculatorReducer';

function previewValue(state: CalculatorState): number | null {
  try {
    return currentValue(state);
  } catch {
    return null;
  }
}

export function useCalculator(onCompleted: (calculation: CompletedCalculation) => void) {
  const [state, dispatch] = useReducer(calculatorReducer, initialCalculatorState);
  const preview = useMemo(() => previewValue(state), [state]);

  useEffect(() => {
    if (state.completed) onCompleted(state.completed);
  }, [state.completed, onCompleted]);

  return { state, dispatch, preview };
}

const KEYBOARD_ACTIONS: Record<string, KeyAction> = {
  '+': { type: 'insert', text: '+' },
  '-': { type: 'insert', text: '−' },
  '*': { type: 'insert', text: '×' },
  '/': { type: 'insert', text: '÷' },
  '^': { type: 'insert', text: '^' },
  '(': { type: 'insert', text: '(' },
  ')': { type: 'insert', text: ')' },
  '.': { type: 'insert', text: '.' },
  '%': { type: 'insert', text: '%' },
  '!': { type: 'insert', text: '!' },
  Enter: { type: 'equals' },
  '=': { type: 'equals' },
  Backspace: { type: 'delete' },
  Escape: { type: 'clear' },
};

function keyboardAction(key: string): KeyAction | null {
  if (/^[0-9]$/.test(key)) return { type: 'insert', text: key };
  if (/^[a-fA-F]$/.test(key)) return { type: 'insert', text: key.toUpperCase() };
  return KEYBOARD_ACTIONS[key] ?? null;
}

const TEXT_ENTRY_TAGS = new Set(['INPUT', 'TEXTAREA', 'SELECT']);

export function useCalculatorKeyboard(dispatch: (action: CalculatorAction) => void, enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey || event.altKey) return;
      if (event.target instanceof HTMLElement && TEXT_ENTRY_TAGS.has(event.target.tagName)) return;
      const action = keyboardAction(event.key);
      if (!action) return;
      event.preventDefault();
      dispatch(action);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [dispatch, enabled]);
}
