import { multiply, type NumericMatrix } from '@/lib/numericMatrix';

export type Complex = { re: number; im: number };
export type EigenPair = { value: Complex; multiplicity: number; vectors: number[][] | null };

const REAL_TOLERANCE = 1e-6;
const CLUSTER_TOLERANCE = 1e-5;
const NULL_SPACE_TOLERANCE = 1e-5;
const QR_TOLERANCE = 1e-6;
const MAX_QR_ITERATIONS = 5000;
const QR_SINGULAR_TOLERANCE = 1e-12;
const ROOT_TOLERANCE = 1e-12;
const MAX_ROOT_ITERATIONS = 2000;
const ZERO_CLEANUP = 1e-12;

function complexAdd(a: Complex, b: Complex): Complex {
  return { re: a.re + b.re, im: a.im + b.im };
}

function complexSub(a: Complex, b: Complex): Complex {
  return { re: a.re - b.re, im: a.im - b.im };
}

function complexMul(a: Complex, b: Complex): Complex {
  return { re: a.re * b.re - a.im * b.im, im: a.re * b.im + a.im * b.re };
}

function complexDiv(a: Complex, b: Complex): Complex {
  const denominator = b.re * b.re + b.im * b.im;
  return { re: (a.re * b.re + a.im * b.im) / denominator, im: (a.im * b.re - a.re * b.im) / denominator };
}

function complexAbs(a: Complex): number {
  return Math.hypot(a.re, a.im);
}

function quadraticRoots(values: NumericMatrix): Complex[] {
  const trace = values[0][0] + values[1][1];
  const determinant = values[0][0] * values[1][1] - values[0][1] * values[1][0];
  const discriminant = trace * trace - 4 * determinant;
  if (discriminant >= 0) {
    const root = Math.sqrt(discriminant);
    return [
      { re: (trace + root) / 2, im: 0 },
      { re: (trace - root) / 2, im: 0 },
    ];
  }
  const root = Math.sqrt(-discriminant);
  return [
    { re: trace / 2, im: root / 2 },
    { re: trace / 2, im: -root / 2 },
  ];
}

function characteristicCoefficients(values: NumericMatrix): number[] {
  const size = values.length;
  const coefficients = new Array<number>(size + 1).fill(0);
  coefficients[size] = 1;
  let accumulator: NumericMatrix = values.map(() => new Array<number>(size).fill(0));

  for (let step = 1; step <= size; step += 1) {
    accumulator = multiply(values, accumulator);
    for (let index = 0; index < size; index += 1) {
      accumulator[index][index] += coefficients[size - step + 1];
    }
    const product = multiply(values, accumulator);
    const trace = product.reduce((sum, row, index) => sum + row[index], 0);
    coefficients[size - step] = -trace / step;
  }

  return coefficients;
}

function durandKerner(coefficients: number[]): Complex[] {
  const degree = coefficients.length - 1;

  const evaluate = (point: Complex): Complex => {
    let result: Complex = { re: 1, im: 0 };
    for (let index = degree - 1; index >= 0; index -= 1) {
      result = complexAdd(complexMul(result, point), { re: coefficients[index], im: 0 });
    }
    return result;
  };

  let roots: Complex[] = [];
  let power: Complex = { re: 1, im: 0 };
  for (let index = 0; index < degree; index += 1) {
    power = complexMul(power, { re: 0.4, im: 0.9 });
    roots.push(power);
  }

  for (let iteration = 0; iteration < MAX_ROOT_ITERATIONS; iteration += 1) {
    let largestStep = 0;
    const current = roots;
    roots = current.map((root, index) => {
      let denominator: Complex = { re: 1, im: 0 };
      current.forEach((other, otherIndex) => {
        if (otherIndex !== index) denominator = complexMul(denominator, complexSub(root, other));
      });
      if (complexAbs(denominator) === 0) return root;
      const step = complexDiv(evaluate(root), denominator);
      largestStep = Math.max(largestStep, complexAbs(step));
      return complexSub(root, step);
    });
    const scale = Math.max(1, ...roots.map(complexAbs));
    if (largestStep <= ROOT_TOLERANCE * scale) break;
  }

  return roots;
}

function cleanReal(value: Complex): Complex {
  return Math.abs(value.im) <= REAL_TOLERANCE * Math.max(1, Math.abs(value.re)) ? { re: value.re, im: 0 } : value;
}

function clusterRoots(roots: Complex[]): { value: Complex; multiplicity: number }[] {
  const clusters: { value: Complex; multiplicity: number }[] = [];
  for (const root of roots) {
    const match = clusters.find(
      (cluster) => complexAbs(complexSub(cluster.value, root)) <= CLUSTER_TOLERANCE * Math.max(1, complexAbs(root)),
    );
    if (match) {
      match.multiplicity += 1;
    } else {
      clusters.push({ value: root, multiplicity: 1 });
    }
  }
  return clusters;
}

function nullSpace(values: NumericMatrix, tolerance: number): number[][] {
  const rows = values.length;
  const cols = values[0].length;
  const reduced = values.map((row) => [...row]);
  const pivotColumns: number[] = [];
  let pivotRow = 0;

  for (let col = 0; col < cols && pivotRow < rows; col += 1) {
    let best = pivotRow;
    for (let row = pivotRow + 1; row < rows; row += 1) {
      if (Math.abs(reduced[row][col]) > Math.abs(reduced[best][col])) best = row;
    }
    if (Math.abs(reduced[best][col]) <= tolerance) continue;

    [reduced[best], reduced[pivotRow]] = [reduced[pivotRow], reduced[best]];
    const pivot = reduced[pivotRow][col];
    reduced[pivotRow] = reduced[pivotRow].map((value) => value / pivot);
    for (let row = 0; row < rows; row += 1) {
      if (row === pivotRow) continue;
      const factor = reduced[row][col];
      reduced[row] = reduced[row].map((value, index) => value - factor * reduced[pivotRow][index]);
    }
    pivotColumns.push(col);
    pivotRow += 1;
  }

  const freeColumns = Array.from({ length: cols }, (_, index) => index).filter((index) => !pivotColumns.includes(index));
  return freeColumns.map((free) => {
    const vector = new Array<number>(cols).fill(0);
    vector[free] = 1;
    pivotColumns.forEach((pivotColumn, index) => {
      vector[pivotColumn] = -reduced[index][free];
    });
    return vector;
  });
}

function normalize(vector: number[]): number[] {
  const norm = Math.hypot(...vector);
  const leading = vector.find((value) => Math.abs(value) > ZERO_CLEANUP) ?? 1;
  const sign = leading < 0 ? -1 : 1;
  return vector.map((value) => {
    const scaled = (sign * value) / norm;
    return Math.abs(scaled) < ZERO_CLEANUP ? 0 : scaled;
  });
}

function shiftDiagonal(values: NumericMatrix, shift: number): NumericMatrix {
  return values.map((row, rowIndex) => row.map((value, colIndex) => (rowIndex === colIndex ? value - shift : value)));
}

function transposeRows(matrix: NumericMatrix): NumericMatrix {
  return matrix[0].map((_, col) => matrix.map((row) => row[col]));
}

function gramSchmidtQR(values: NumericMatrix): { q: NumericMatrix; r: NumericMatrix } {
  const size = values.length;
  const orthonormal: number[][] = [];
  const r = values.map(() => new Array<number>(size).fill(0));

  for (let column = 0; column < size; column += 1) {
    let vector = values.map((row) => row[column]);
    for (let index = 0; index < column; index += 1) {
      const projection = orthonormal[index].reduce((sum, value, row) => sum + value * vector[row], 0);
      r[index][column] = projection;
      vector = vector.map((value, row) => value - projection * orthonormal[index][row]);
    }
    const norm = Math.hypot(...vector);
    if (norm < QR_SINGULAR_TOLERANCE) throw new Error('Singular');
    r[column][column] = norm;
    orthonormal.push(vector.map((value) => value / norm));
  }

  return { q: transposeRows(orthonormal), r };
}

function qrIterationDiagonal(values: NumericMatrix): { roots: Complex[]; iterations: number } | null {
  const scale = Math.max(1, ...values.flat().map(Math.abs));
  let current = values;
  for (let iteration = 1; iteration <= MAX_QR_ITERATIONS; iteration += 1) {
    let factors: { q: NumericMatrix; r: NumericMatrix };
    try {
      factors = gramSchmidtQR(current);
    } catch {
      return null;
    }
    current = multiply(factors.r, factors.q);
    const belowDiagonal = current.reduce(
      (largest, row, rowIndex) =>
        row.reduce((inner, value, colIndex) => (colIndex < rowIndex ? Math.max(inner, Math.abs(value)) : inner), largest),
      0,
    );
    if (belowDiagonal <= QR_TOLERANCE * scale) {
      return { roots: current.map((row, index) => ({ re: row[index], im: 0 })), iterations: iteration };
    }
  }
  return null;
}

export type EigenMethod = 'quadratic' | 'qr' | 'polynomial';

export type EigenAnalysis = {
  pairs: EigenPair[];
  method: EigenMethod;
  iterations: number;
  coefficients: number[] | null;
};

function solveRoots(values: NumericMatrix): { roots: Complex[]; method: EigenMethod; iterations: number; coefficients: number[] | null } {
  if (values.length === 2) return { roots: quadraticRoots(values), method: 'quadratic', iterations: 0, coefficients: null };
  const qr = qrIterationDiagonal(values);
  if (qr) return { roots: qr.roots, method: 'qr', iterations: qr.iterations, coefficients: null };
  const coefficients = characteristicCoefficients(values);
  return { roots: durandKerner(coefficients), method: 'polynomial', iterations: 0, coefficients };
}

export function analyzeEigen(values: NumericMatrix): EigenAnalysis {
  const solved = solveRoots(values);
  const sorted = solved.roots.map(cleanReal).sort((a, b) => b.re - a.re || b.im - a.im);
  const scale = Math.max(1, ...values.flat().map(Math.abs));

  const pairs = clusterRoots(sorted).map(({ value, multiplicity }) => ({
    value,
    multiplicity,
    vectors:
      value.im === 0
        ? nullSpace(shiftDiagonal(values, value.re), NULL_SPACE_TOLERANCE * scale).map(normalize)
        : null,
  }));
  return { pairs, method: solved.method, iterations: solved.iterations, coefficients: solved.coefficients };
}
