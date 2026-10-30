import { useRef, type KeyboardEvent } from 'react';
import type { MatrixCells } from '@/lib/matrix';

type MatrixGridProps = {
  cells: MatrixCells;
  onCellChange: (row: number, col: number, value: string) => void;
};

export function MatrixGrid({ cells, onCellChange }: MatrixGridProps) {
  const inputs = useRef<(HTMLInputElement | null)[][]>([]);
  const cols = cells[0]?.length ?? 0;

  const focusCell = (row: number, col: number) => {
    inputs.current[row]?.[col]?.focus();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>, row: number, col: number) => {
    if (event.key !== 'Enter') return;
    event.preventDefault();
    const rows = cells.length;
    const nextCol = col + 1 < cols ? col + 1 : 0;
    const nextRow = col + 1 < cols ? row : (row + 1) % rows;
    focusCell(nextRow, nextCol);
  };

  return (
    <div
      role="grid"
      aria-label="Matrix entries"
      className="grid gap-2.5 rounded-2xl border border-prism/40 bg-ink-950 p-4 shadow-[0_0_24px_-12px_rgb(var(--prism-rgb)/0.7)]"
      style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
    >
      {cells.map((rowCells, row) =>
        rowCells.map((value, col) => (
          <input
            key={`${row}-${col}`}
            ref={(element) => {
              inputs.current[row] = inputs.current[row] ?? [];
              inputs.current[row][col] = element;
            }}
            type="text"
            inputMode="decimal"
            aria-label={`Row ${row + 1}, column ${col + 1}`}
            value={value}
            placeholder="0"
            autoFocus={row === 0 && col === 0}
            onChange={(event) => onCellChange(row, col, event.target.value)}
            onKeyDown={(event) => handleKeyDown(event, row, col)}
            className="w-full min-w-0 rounded-lg border border-prism/50 bg-ink-900 px-2 py-2.5 text-center font-mono text-base text-zinc-100 placeholder:text-zinc-600 transition focus:border-neon-cyan focus:outline-none focus:ring-2 focus:ring-neon-cyan/30"
          />
        )),
      )}
    </div>
  );
}
