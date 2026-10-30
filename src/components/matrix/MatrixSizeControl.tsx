import { Minus, Plus } from 'lucide-react';
import { MAX_MATRIX_DIMENSION, MIN_MATRIX_DIMENSION, type MatrixSize } from '@/lib/matrix';

type MatrixSizeControlProps = {
  size: MatrixSize;
  onChange: (size: MatrixSize) => void;
};

const STEP_BUTTON =
  'flex h-8 w-8 items-center justify-center rounded-full border border-prism/60 text-neon-cyan transition hover:bg-prism/10 disabled:cursor-not-allowed disabled:opacity-30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-cyan';

type DimensionProps = {
  label: string;
  value: number;
  onStep: (delta: number) => void;
};

function Dimension({ label, value, onStep }: DimensionProps) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs uppercase tracking-widest text-neon-cyan/70">{label}</span>
      <button
        type="button"
        aria-label={`Decrease ${label.toLowerCase()}`}
        disabled={value <= MIN_MATRIX_DIMENSION}
        onClick={() => onStep(-1)}
        className={STEP_BUTTON}
      >
        <Minus className="h-3.5 w-3.5" />
      </button>
      <span className="w-5 text-center font-mono text-lg text-neon-cyan">{value}</span>
      <button
        type="button"
        aria-label={`Increase ${label.toLowerCase()}`}
        disabled={value >= MAX_MATRIX_DIMENSION}
        onClick={() => onStep(1)}
        className={STEP_BUTTON}
      >
        <Plus className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

export function MatrixSizeControl({ size, onChange }: MatrixSizeControlProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <Dimension label="Rows" value={size.rows} onStep={(delta) => onChange({ ...size, rows: size.rows + delta })} />
      <Dimension label="Columns" value={size.cols} onStep={(delta) => onChange({ ...size, cols: size.cols + delta })} />
    </div>
  );
}
