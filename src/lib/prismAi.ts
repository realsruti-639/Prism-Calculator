import { solveCalculus, type CalculusKind, type CalculusSolution } from '@/lib/calculus';
import { closeOpenParentheses, evaluateExpression } from '@/lib/mathEngine';
import { MAX_MATRIX_DIMENSION, runMatrixOperation, type MatrixCells, type MatrixOperation, type MatrixOutcome } from '@/lib/matrix';

export type PrismIntent =
  | { kind: 'expression'; expression: string }
  | { kind: 'calculus'; solution: CalculusSolution }
  | { kind: 'matrix'; outcome: MatrixOutcome; operation: MatrixOperation }
  | { kind: 'error'; message: string };

export const PRISM_AI_HELP =
  'Prism-AI did not understand that. Try "derivative of x^2 at 3", "integral of x^2 from 0 to 1", "sum of x from 1 to 10", "determinant of [[1,2],[3,4]]", or "2 plus 3 times 4".';

const COMMAND_PREFIX = '(?:(?:find|compute|calculate|what is|what\'s|give me)\\s+)?';
const DERIVATIVE_PATTERN = new RegExp(`^${COMMAND_PREFIX}(?:the\\s+)?(?:derivative|d/dx)\\s+of\\s+(.+?)\\s+at\\s+(?:x\\s*=\\s*)?(.+)$`);
const INTEGRAL_PATTERN = new RegExp(`^${COMMAND_PREFIX}(?:the\\s+)?(?:integral|integrate)(?:\\s+of)?\\s+(.+?)\\s+(?:from|between)\\s+(.+?)\\s+(?:to|and)\\s+(.+)$`);
const SUMMATION_PATTERN = new RegExp(`^${COMMAND_PREFIX}(?:the\\s+)?(?:sum|summation)\\s+of\\s+(.+?)\\s+(?:from|for)\\s+(?:x\\s*=\\s*)?(.+?)\\s+to\\s+(.+)$`);
const MATRIX_PATTERN = /^(determinant|det|inverse|inv|transpose|eigenvalues?|eigenvectors?)\s+(?:of\s+)?(\[.*\])$/;
const MULTIPLY_PATTERN = /^(?:multiply|product of)\s+(\[.*\])\s+(?:by|and|with|times)\s+(\[.*\])$/;

const MATRIX_OPERATIONS: Record<string, MatrixOperation> = {
  determinant: 'determinant',
  det: 'determinant',
  inverse: 'inverse',
  inv: 'inverse',
  transpose: 'transpose',
  eigenvalue: 'eigenvalues',
  eigenvalues: 'eigenvalues',
  eigenvector: 'eigenvectors',
  eigenvectors: 'eigenvectors',
};

const WORD_TO_SYMBOL: ReadonlyArray<readonly [RegExp, string]> = [
  [/square root of\s*/g, 'sqrt('],
  [/cube root of\s*/g, 'cbrt('],
  [/\s*(?:raised to the power of|to the power of)\s*/g, '^'],
  [/\s*squared\b/g, '^2'],
  [/\s*cubed\b/g, '^3'],
  [/\s*(?:multiplied by|times)\s*/g, '×'],
  [/\s*divided by\s*/g, '÷'],
  [/\s*plus\s*/g, '+'],
  [/\s*minus\s*/g, '−'],
  [/\*/g, '×'],
  [/\//g, '÷'],
  [/-/g, '−'],
];

function translateMath(text: string): string {
  let expression = text;
  for (const [pattern, symbol] of WORD_TO_SYMBOL) expression = expression.replace(pattern, symbol);
  return closeOpenParentheses(expression.replace(/\s+/g, ''));
}

function parseMatrixLiteral(literal: string): MatrixCells {
  const rows = literal
    .slice(1, -1)
    .split(/\]\s*,\s*\[/)
    .map((row) => row.replace(/^\s*\[/, '').replace(/\]\s*$/, '').split(',').map((cell) => cell.trim()));
  const width = rows[0]?.length ?? 0;
  const valid =
    rows.length >= 1 &&
    rows.length <= MAX_MATRIX_DIMENSION &&
    width >= 1 &&
    width <= MAX_MATRIX_DIMENSION &&
    rows.every((row) => row.length === width && row.every((cell) => cell !== ''));
  if (!valid) throw new Error('Write the matrix as rows, for example [[1,2],[3,4]], up to 4 by 4');
  return rows;
}

function interpretMatrix(text: string): PrismIntent | null {
  const single = MATRIX_PATTERN.exec(text);
  if (single) {
    const operation = MATRIX_OPERATIONS[single[1]];
    const cells = parseMatrixLiteral(single[2]);
    const outcome = runMatrixOperation(operation, cells, cells);
    return { kind: 'matrix', outcome, operation };
  }
  const product = MULTIPLY_PATTERN.exec(text);
  if (product) {
    const cellsA = parseMatrixLiteral(product[1]);
    const cellsB = parseMatrixLiteral(product[2]);
    return { kind: 'matrix', outcome: runMatrixOperation('multiply', cellsA, cellsB), operation: 'multiply' };
  }
  return null;
}

const CALCULUS_PATTERNS: ReadonlyArray<readonly [CalculusKind, RegExp]> = [
  ['derivative', DERIVATIVE_PATTERN],
  ['integral', INTEGRAL_PATTERN],
  ['summation', SUMMATION_PATTERN],
];

function interpretCalculus(text: string): PrismIntent | null {
  for (const [kind, pattern] of CALCULUS_PATTERNS) {
    const match = pattern.exec(text);
    if (!match) continue;
    const solution = solveCalculus({
      kind,
      expression: translateMath(match[1]),
      start: translateMath(match[2]),
      end: match[3] ? translateMath(match[3]) : '',
    });
    return { kind: 'calculus', solution };
  }
  return null;
}

function interpretArithmetic(text: string): PrismIntent | null {
  const expression = translateMath(text);
  if (expression === '') return null;
  try {
    evaluateExpression(expression, { angle: 'rad', ans: 0, base: 10 });
  } catch {
    return null;
  }
  return { kind: 'expression', expression };
}

export function interpretCommand(input: string): PrismIntent {
  const text = input.trim().toLowerCase().replace(/\s+/g, ' ');
  if (text === '') return { kind: 'error', message: PRISM_AI_HELP };
  try {
    return interpretMatrix(text) ?? interpretCalculus(text) ?? interpretArithmetic(text) ?? { kind: 'error', message: PRISM_AI_HELP };
  } catch (error) {
    return { kind: 'error', message: error instanceof Error ? error.message : PRISM_AI_HELP };
  }
}
