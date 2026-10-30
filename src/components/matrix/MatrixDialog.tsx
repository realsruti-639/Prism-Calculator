import { useState } from 'react';
import { X } from 'lucide-react';
import { MatrixGrid } from '@/components/matrix/MatrixGrid';
import { MatrixResultPanel } from '@/components/matrix/MatrixResultPanel';
import { MatrixSizeControl } from '@/components/matrix/MatrixSizeControl';
import { SolutionStepsModal } from '@/components/steps/SolutionStepsModal';
import { ViewStepsButton } from '@/components/steps/ViewStepsButton';
import type { CalculusResult } from '@/lib/calculus';
import { explainMatrixOperation } from '@/lib/matrixSteps';
import {
  createCells,
  runMatrixOperation,
  type MatrixCells,
  type MatrixOperation,
  type MatrixOutcome,
  type MatrixSize,
} from '@/lib/matrix';

type MatrixDialogProps = {
  onClose: () => void;
  onUseOnDisplay: (result: CalculusResult) => void;
};

type MatrixId = 'A' | 'B';

type OperationDefinition = { id: MatrixOperation; label: string; name: string };

const OPERATIONS: OperationDefinition[] = [
  { id: 'determinant', label: 'det(A)', name: 'Determinant' },
  { id: 'inverse', label: 'A⁻¹', name: 'Inverse' },
  { id: 'transpose', label: 'Aᵀ', name: 'Transpose' },
  { id: 'multiply', label: 'A × B', name: 'Multiply' },
  { id: 'eigenvalues', label: 'λ', name: 'Eigenvalues' },
  { id: 'eigenvectors', label: 'v', name: 'Eigenvectors' },
];

const DEFAULT_SIZE: MatrixSize = { rows: 2, cols: 2 };

const SEGMENT_BASE =
  'flex-1 rounded-full px-3 py-1.5 text-sm font-medium transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-cyan';

const OPERATION_BUTTON =
  'flex flex-col items-start gap-1 rounded-xl border border-prism/60 bg-prism/5 px-4 py-3 text-left transition hover:bg-prism/15 disabled:cursor-not-allowed disabled:border-zinc-700 disabled:bg-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-cyan';

function sizeOf(cells: MatrixCells): MatrixSize {
  return { rows: cells.length, cols: cells[0]?.length ?? 0 };
}

function hasEmptyCell(cells: MatrixCells): boolean {
  return cells.some((row) => row.some((cell) => cell.trim() === ''));
}

function blockerFor(operation: MatrixOperation, cellsA: MatrixCells, cellsB: MatrixCells): string | null {
  const a = sizeOf(cellsA);
  const b = sizeOf(cellsB);
  if (operation === 'multiply') {
    if (hasEmptyCell(cellsA) || hasEmptyCell(cellsB)) return 'Fill in every cell of A and B';
    if (a.cols !== b.rows) return 'Columns of A must equal rows of B';
    return null;
  }
  if (hasEmptyCell(cellsA)) return 'Fill in every cell of A';
  const needsSquare = operation === 'determinant' || operation === 'inverse' || operation === 'eigenvalues' || operation === 'eigenvectors';
  if (needsSquare && a.rows !== a.cols) return 'Needs a square A';
  return null;
}

export function MatrixDialog({ onClose, onUseOnDisplay }: MatrixDialogProps) {
  const [active, setActive] = useState<MatrixId>('A');
  const [matrices, setMatrices] = useState<Record<MatrixId, MatrixCells>>(() => ({
    A: createCells(DEFAULT_SIZE),
    B: createCells(DEFAULT_SIZE),
  }));
  const [outcome, setOutcome] = useState<MatrixOutcome | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [lastOperation, setLastOperation] = useState<MatrixOperation | null>(null);
  const [stepsOpen, setStepsOpen] = useState(false);

  const sizes = { A: sizeOf(matrices.A), B: sizeOf(matrices.B) };

  const replaceActive = (cells: MatrixCells) => {
    setMatrices((current) => ({ ...current, [active]: cells }));
    setOutcome(null);
    setMessage(null);
  };

  const updateCell = (row: number, col: number, value: string) => {
    replaceActive(matrices[active].map((rowCells, rowIndex) => rowCells.map((cell, colIndex) => (rowIndex === row && colIndex === col ? value : cell))));
  };

  const runOperation = (operation: MatrixOperation) => {
    try {
      setOutcome(runMatrixOperation(operation, matrices.A, matrices.B));
      setLastOperation(operation);
      setMessage(null);
    } catch (error) {
      setOutcome(null);
      setMessage(error instanceof Error ? error.message : 'Calculation failed');
    }
  };

  const useOnDisplay = (result: Extract<MatrixOutcome, { kind: 'scalar' }>) => {
    onUseOnDisplay({ label: result.label, value: result.value });
  };

  return (
    <>
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/75 p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="matrix-title"
        onClick={(event) => event.stopPropagation()}
        className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-prism/40 bg-ink-900 p-6 shadow-[0_0_60px_-20px_rgb(var(--prism-rgb)/0.45)] sm:p-7"
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 id="matrix-title" className="font-mono text-sm tracking-widest text-prism glow-text">
            MATRIX
          </h2>
          <button
            type="button"
            aria-label="Close matrix builder"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-prism/70 text-neon-cyan transition hover:bg-prism/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-cyan"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div role="tablist" aria-label="Matrix" className="mb-5 flex rounded-full border border-prism/50 bg-ink-950 p-1">
          {(['A', 'B'] as const).map((id) => {
            const isActive = id === active;
            return (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => {
                  setActive(id);
                  setOutcome(null);
                  setMessage(null);
                }}
                className={`${SEGMENT_BASE} ${
                  isActive ? 'bg-neon-cyan/15 text-neon-cyan shadow-[0_0_16px_-6px_rgba(46,230,246,0.9)]' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Matrix {id} <span className="font-mono text-xs opacity-70">({sizes[id].rows}×{sizes[id].cols})</span>
              </button>
            );
          })}
        </div>

        <div className="flex flex-col gap-5">
          <MatrixSizeControl size={sizes[active]} onChange={(size) => replaceActive(createCells(size, matrices[active]))} />
          <MatrixGrid cells={matrices[active]} onCellChange={updateCell} />
          <p className="text-xs text-zinc-500">Enter a number or expression in each cell. Press Enter to move to the next cell.</p>

          <div className="grid grid-cols-2 gap-3">
            {OPERATIONS.map((operation) => {
              const blocker = blockerFor(operation.id, matrices.A, matrices.B);
              return (
                <button
                  key={operation.id}
                  type="button"
                  disabled={blocker !== null}
                  onClick={() => runOperation(operation.id)}
                  className={OPERATION_BUTTON}
                >
                  <span className="font-mono text-base font-semibold text-prism">{operation.label}</span>
                  <span className="text-xs text-zinc-400">{blocker ?? operation.name}</span>
                </button>
              );
            })}
          </div>

          {message && (
            <p role="alert" className="text-sm text-rose-400">
              {message}
            </p>
          )}

          {outcome && <MatrixResultPanel outcome={outcome} onUseOnDisplay={useOnDisplay} />}
          {outcome && (
            <div className="flex justify-center">
              <ViewStepsButton onClick={() => setStepsOpen(true)} />
            </div>
          )}
        </div>
      </div>
    </div>
    {outcome && lastOperation && stepsOpen && (
      <SolutionStepsModal
        steps={explainMatrixOperation(lastOperation, matrices.A, matrices.B, outcome)}
        onClose={() => setStepsOpen(false)}
      />
    )}
    </>
  );
}
