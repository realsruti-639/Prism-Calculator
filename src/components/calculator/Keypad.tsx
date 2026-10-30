import { useState } from 'react';
import { KeyButton } from '@/components/calculator/KeyButton';
import {
  BASE_KEYS,
  CALCULUS_KEYS,
  CONSTANT_KEYS,
  HEX_KEYS,
  MEMORY_KEYS,
  NUMPAD_KEYS,
  SCIENTIFIC_KEYS,
  UTILITY_KEYS,
  type KeyDefinition,
} from '@/components/calculator/keyLayout';
import type { KeyAction } from '@/lib/calculatorReducer';
import type { CalculusKind } from '@/lib/calculus';
import type { NumberFormat } from '@/lib/fractionFormat';
import type { AngleMode } from '@/lib/mathEngine';
import { isInsertAllowed, type RadixMode } from '@/lib/radix';

type KeypadProps = {
  angle: AngleMode;
  numberFormat: NumberFormat;
  radix: RadixMode;
  onPress: (action: KeyAction) => void;
  onOpenCalculus: (kind: CalculusKind) => void;
  onOpenMatrix: () => void;
  soundEnabled: boolean;
};

function isEnabled(definition: KeyDefinition, radix: RadixMode): boolean {
  if (definition.requiresDecimal && radix !== 'DEC') return false;
  if (definition.action.type === 'insert') return isInsertAllowed(definition.action.text, radix);
  return true;
}

function isActive(action: KeyAction, angle: AngleMode, numberFormat: NumberFormat, radix: RadixMode): boolean {
  if (action.type === 'toggleAngle') return angle === 'deg';
  if (action.type === 'toggleFormat') return numberFormat === 'fraction';
  if (action.type === 'setRadix') return action.radix === radix;
  return false;
}

export function Keypad({ angle, numberFormat, radix, onPress, onOpenCalculus, onOpenMatrix, soundEnabled }: KeypadProps) {
  const [constantsOpen, setConstantsOpen] = useState(false);

  const renderKey = (definition: KeyDefinition) => (
    <KeyButton
      key={definition.label}
      label={definition.label}
      variant={definition.variant}
      wide={definition.wide}
      hint={definition.hint}
      soundEnabled={soundEnabled}
      active={isActive(definition.action, angle, numberFormat, radix)}
      disabled={!isEnabled(definition, radix)}
      onActivate={() => onPress(definition.action)}
    />
  );

  return (
    <div className="flex flex-col gap-4 md:gap-5">
      <div className="grid grid-cols-4 gap-2.5 sm:gap-3">{BASE_KEYS.map(renderKey)}</div>

      {radix === 'HEX' && <div className="grid grid-cols-6 gap-2.5 sm:gap-3">{HEX_KEYS.map(renderKey)}</div>}

      <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-6 sm:gap-3">{MEMORY_KEYS.map(renderKey)}</div>

      <div className="grid grid-cols-4 gap-2.5 sm:gap-3">
        {UTILITY_KEYS.map(renderKey)}
        <KeyButton
          label="CONST"
          variant="toggle"
          active={constantsOpen}
          disabled={radix !== 'DEC'}
          hint="Insert a physical constant"
          soundEnabled={soundEnabled}
          onActivate={() => setConstantsOpen((open) => !open)}
        />
      </div>

      {constantsOpen && radix === 'DEC' && (
        <div className="grid grid-cols-4 gap-2.5 sm:gap-3">{CONSTANT_KEYS.map(renderKey)}</div>
      )}

      <div className="grid grid-cols-4 gap-2.5 sm:gap-3">
        {CALCULUS_KEYS.map((key) => (
          <KeyButton
            key={key.kind}
            label={key.label}
            variant="scientific"
            hint={key.hint}
            disabled={radix !== 'DEC'}
            soundEnabled={soundEnabled}
            onActivate={() => onOpenCalculus(key.kind)}
          />
        ))}
        <KeyButton
          label="MATRIX"
          variant="scientific"
          hint="Matrix builder: determinant of a grid of values"
          disabled={radix !== 'DEC'}
          soundEnabled={soundEnabled}
          onActivate={onOpenMatrix}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 md:gap-5">
        <div className="grid grid-cols-4 gap-2.5 sm:gap-3">{SCIENTIFIC_KEYS.map(renderKey)}</div>
        <div className="grid grid-cols-4 gap-2.5 sm:gap-3">{NUMPAD_KEYS.map(renderKey)}</div>
      </div>
    </div>
  );
}
