import { analyzeEigen, type EigenAnalysis } from '@/lib/eigen';
import { evaluateExpression } from '@/lib/mathEngine';
import { multiply, type NumericMatrix } from '@/lib/numericMatrix';

export const MIN_MATRIX_DIMENSION = 2;
export const MAX_MATRIX_DIMENSION = 4;

const SINGULAR_TOLERANCE = 1e-12;

export type MatrixSize = { rows: number; cols: number };
export type MatrixCells = string[][];
export type MatrixOperation = 'determinant' | 'inverse' | 'transpose' | 'multiply' | 'eigenvalues' | 'eigenvectors';
export type MatrixOutcome =
  | { kind: 'scalar'; label: string; value: number }
  | { kind: 'matrix'; label: string; values: number[][] }
  | { kind: 'eigen'; label: string; analysis: EigenAnalysis; withVectors: boolean };

export function createCells(size: MatrixSize, previous: MatrixCells = []): MatrixCells {
  return Array.from({ length: size.rows }, (_, row) =>
    Array.from({ length: size.cols }, (_, col) => previous[row]?.[col] ?? ''),
  );
}

function parseCell(text: string, name: string, row: number, col: number): number {
  const position = `${name} row ${row + 1}, column ${col + 1}`;
  if (text.trim() === '') throw new Error(`Fill in ${position}`);
  try {
    return evaluateExpression(text, { angle: 'rad', ans: 0, base: 10 });
  } catch (error) {
    throw new Error(`${position}: ${error instanceof Error ? error.message : 'invalid value'}`);
  }
}

export function parseMatrix(cells: MatrixCells, name: string): NumericMatrix {
  return cells.map((row, rowIndex) => row.map((text, colIndex) => parseCell(text, name, rowIndex, colIndex)));
}

function requireSquare(values: NumericMatrix): void {
  if (values.some((row) => row.length !== values.length)) throw new Error('This needs a square matrix A');
}

export type Elimination = { triangle: NumericMatrix; swaps: number; singular: boolean };

export function eliminate(values: NumericMatrix): Elimination {
  const size = values.length;
  const working = values.map((row) => [...row]);
  let swaps = 0;

  for (let pivotColumn = 0; pivotColumn < size; pivotColumn += 1) {
    let pivotRow = pivotColumn;
    for (let row = pivotColumn + 1; row < size; row += 1) {
      if (Math.abs(working[row][pivotColumn]) > Math.abs(working[pivotRow][pivotColumn])) pivotRow = row;
    }
    if (working[pivotRow][pivotColumn] === 0) return { triangle: working, swaps, singular: true };
    if (pivotRow !== pivotColumn) {
      [working[pivotRow], working[pivotColumn]] = [working[pivotColumn], working[pivotRow]];
      swaps += 1;
    }
    for (let row = pivotColumn + 1; row < size; row += 1) {
      const factor = working[row][pivotColumn] / working[pivotColumn][pivotColumn];
      for (let col = pivotColumn; col < size; col += 1) {
        working[row][col] -= factor * working[pivotColumn][col];
      }
    }
  }

  return { triangle: working, swaps, singular: false };
}

function determinant(values: NumericMatrix): number {
  const { triangle, swaps, singular } = eliminate(values);
  if (singular) return 0;
  let result = swaps % 2 === 0 ? 1 : -1;
  for (let index = 0; index < triangle.length; index += 1) result *= triangle[index][index];
  return result;
}

function inverse(values: NumericMatrix): NumericMatrix {
  const size = values.length;
  const working = values.map((row, rowIndex) => [
    ...row,
    ...Array.from({ length: size }, (_, col) => (col === rowIndex ? 1 : 0)),
  ]);

  for (let pivotColumn = 0; pivotColumn < size; pivotColumn += 1) {
    let pivotRow = pivotColumn;
    for (let row = pivotColumn + 1; row < size; row += 1) {
      if (Math.abs(working[row][pivotColumn]) > Math.abs(working[pivotRow][pivotColumn])) pivotRow = row;
    }
    if (Math.abs(working[pivotRow][pivotColumn]) < SINGULAR_TOLERANCE) {
      throw new Error('This matrix has no inverse because its determinant is zero');
    }
    [working[pivotRow], working[pivotColumn]] = [working[pivotColumn], working[pivotRow]];

    const pivot = working[pivotColumn][pivotColumn];
    working[pivotColumn] = working[pivotColumn].map((value) => value / pivot);
    for (let row = 0; row < size; row += 1) {
      if (row === pivotColumn) continue;
      const factor = working[row][pivotColumn];
      working[row] = working[row].map((value, col) => value - factor * working[pivotColumn][col]);
    }
  }

  return working.map((row) => row.slice(size));
}

function transpose(values: NumericMatrix): NumericMatrix {
  return values[0].map((_, col) => values.map((row) => row[col]));
}

function assertFinite(values: NumericMatrix): void {
  if (values.some((row) => row.some((value) => !Number.isFinite(value)))) throw new Error('Math error');
}

export function runMatrixOperation(operation: MatrixOperation, cellsA: MatrixCells, cellsB: MatrixCells): MatrixOutcome {
  const a = parseMatrix(cellsA, 'A');

  if (operation === 'determinant') {
    requireSquare(a);
    const value = determinant(a);
    if (!Number.isFinite(value)) throw new Error('Math error');
    return { kind: 'scalar', label: 'det(A)', value };
  }

  if (operation === 'inverse') {
    requireSquare(a);
    const values = inverse(a);
    assertFinite(values);
    return { kind: 'matrix', label: 'A⁻¹', values };
  }

  if (operation === 'eigenvalues' || operation === 'eigenvectors') {
    requireSquare(a);
    const analysis = analyzeEigen(a);
    if (analysis.pairs.some((pair) => !Number.isFinite(pair.value.re) || !Number.isFinite(pair.value.im))) {
      throw new Error('Math error');
    }
    const withVectors = operation === 'eigenvectors';
    return { kind: 'eigen', label: withVectors ? 'v(A)' : 'λ(A)', analysis, withVectors };
  }

  if (operation === 'transpose') {
    return { kind: 'matrix', label: 'Aᵀ', values: transpose(a) };
  }

  const b = parseMatrix(cellsB, 'B');
  if (a[0].length !== b.length) throw new Error('A needs as many columns as B has rows');
  const values = multiply(a, b);
  assertFinite(values);
  return { kind: 'matrix', label: 'A × B', values };
}
