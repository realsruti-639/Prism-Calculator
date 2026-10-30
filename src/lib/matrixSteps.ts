import type { Complex, EigenAnalysis } from '@/lib/eigen';
import { formatNumber } from '@/lib/mathEngine';
import { eliminate, parseMatrix, type MatrixCells, type MatrixOperation, type MatrixOutcome } from '@/lib/matrix';
import { multiply, type NumericMatrix } from '@/lib/numericMatrix';
import type { SolutionSteps } from '@/lib/solutionSteps';

function formatRow(row: number[]): string {
  return `[ ${row.map(formatNumber).join('   ')} ]`;
}

function formatComplex({ re, im }: Complex): string {
  if (im === 0) return formatNumber(re);
  return `${formatNumber(re)} ${im < 0 ? '−' : '+'} ${formatNumber(Math.abs(im))}i`;
}

function matrixLines(name: string, values: NumericMatrix): string[] {
  return [`${name} (${values.length}×${values[0].length}):`, ...values.map(formatRow)];
}

function determinantSteps(a: NumericMatrix, value: number): SolutionSteps {
  const { triangle, swaps, singular } = eliminate(a);
  const derivation = singular
    ? ['A zero pivot appeared during elimination', 'Therefore det(A) = 0']
    : [
        `Row swaps during elimination: ${swaps}`,
        'Upper triangular form after elimination:',
        ...triangle.map(formatRow),
        `det(A) = (−1)^${swaps} × product of the diagonal = ${formatNumber(value)}`,
      ];
  return {
    title: 'Determinant of A',
    setup: matrixLines('A', a),
    derivation,
    result: [`det(A) = ${formatNumber(value)}`],
  };
}

function inverseSteps(a: NumericMatrix, inverse: NumericMatrix): SolutionSteps {
  return {
    title: 'Inverse of A',
    setup: matrixLines('A', a),
    derivation: [
      'Gauss-Jordan elimination on [A | I] until the left side becomes I',
      'Check: A × A⁻¹ should equal the identity',
      ...multiply(a, inverse).map(formatRow),
    ],
    result: matrixLines('A⁻¹', inverse),
  };
}

function transposeSteps(a: NumericMatrix, transposed: NumericMatrix): SolutionSteps {
  return {
    title: 'Transpose of A',
    setup: matrixLines('A', a),
    derivation: a.map((_, col) => `Column ${col + 1} of A becomes row ${col + 1} of Aᵀ`),
    result: matrixLines('Aᵀ', transposed),
  };
}

function multiplySteps(a: NumericMatrix, b: NumericMatrix, product: NumericMatrix): SolutionSteps {
  const derivation = product.flatMap((row, i) =>
    row.map((value, j) => {
      const terms = a[i].map((_, k) => `${formatNumber(a[i][k])}·${formatNumber(b[k][j])}`);
      return `C[${i + 1},${j + 1}] = ${terms.join(' + ')} = ${formatNumber(value)}`;
    }),
  );
  return {
    title: 'Product A × B',
    setup: [...matrixLines('A', a), ...matrixLines('B', b)],
    derivation,
    result: matrixLines('A × B', product),
  };
}

function eigenMethodLines(a: NumericMatrix, analysis: EigenAnalysis): string[] {
  if (analysis.method === 'quadratic') {
    const trace = a[0][0] + a[1][1];
    const determinant = a[0][0] * a[1][1] - a[0][1] * a[1][0];
    return [
      'Method: quadratic formula on the 2×2 characteristic equation',
      `Trace = ${formatNumber(trace)}, determinant = ${formatNumber(determinant)}`,
      `λ² − ${formatNumber(trace)}λ + ${formatNumber(determinant)} = 0`,
    ];
  }
  if (analysis.method === 'qr') {
    return [
      'Method: unshifted QR iteration (Gram-Schmidt)',
      `Converged after ${analysis.iterations} iterations (entries below the diagonal below 1e-6)`,
    ];
  }
  return [
    'Method: characteristic polynomial, roots found numerically',
    'QR iteration did not settle, so the characteristic polynomial was used',
    `Coefficients, lowest power first: ${(analysis.coefficients ?? []).map(formatNumber).join(', ')}`,
  ];
}

function eigenSteps(a: NumericMatrix, outcome: Extract<MatrixOutcome, { kind: 'eigen' }>): SolutionSteps {
  const { analysis, withVectors } = outcome;
  const derivation = [
    ...eigenMethodLines(a, analysis),
    ...analysis.pairs.flatMap((pair, index) => {
      const header = `λ${index + 1} = ${formatComplex(pair.value)}${pair.multiplicity > 1 ? ` (multiplicity ${pair.multiplicity})` : ''}`;
      if (pair.vectors === null) return [header, 'Complex root: no real eigenvector shown'];
      return [
        header,
        `Null space of A − λI has dimension ${pair.vectors.length}`,
        ...pair.vectors.map((vector) => `v = ${formatRow(vector)}`),
      ];
    }),
  ];
  const result = analysis.pairs.map((pair, index) => {
    const base = `λ${index + 1} = ${formatComplex(pair.value)}`;
    if (!withVectors || pair.vectors === null) return base;
    return `${base}   v = ${pair.vectors.map(formatRow).join(' ; ')}`;
  });
  return {
    title: withVectors ? 'Eigenvectors of A' : 'Eigenvalues of A',
    setup: matrixLines('A', a),
    derivation,
    result,
  };
}

export function explainMatrixOperation(
  operation: MatrixOperation,
  cellsA: MatrixCells,
  cellsB: MatrixCells,
  outcome: MatrixOutcome,
): SolutionSteps {
  const a = parseMatrix(cellsA, 'A');
  if (outcome.kind === 'scalar') return determinantSteps(a, outcome.value);
  if (outcome.kind === 'eigen') return eigenSteps(a, outcome);
  if (operation === 'inverse') return inverseSteps(a, outcome.values);
  if (operation === 'transpose') return transposeSteps(a, outcome.values);
  return multiplySteps(a, parseMatrix(cellsB, 'B'), outcome.values);
}
