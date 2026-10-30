import { evaluateExpression, formatNumber } from '@/lib/mathEngine';
import type { SolutionSteps } from '@/lib/solutionSteps';

export type CalculusKind = 'derivative' | 'integral' | 'summation';

export type CalculusRequest = {
  kind: CalculusKind;
  expression: string;
  start: string;
  end: string;
};

export type CalculusResult = { label: string; value: number };

export type CalculusSolution = { result: CalculusResult; steps: SolutionSteps };

type Evaluator = (x: number) => number;

type DerivativeDetail = { step: number; coarse: number; fine: number; value: number };
type IntegralEstimate = { intervals: number; value: number };
type IntegralDetail = { value: number; estimates: IntegralEstimate[] };

const MAX_SUMMATION_TERMS = 100000;
const MAX_INTEGRAL_SAMPLES = 1 << 14;
const INTEGRAL_TOLERANCE = 1e-10;
const DERIVATIVE_STEP = 1e-3;

function compile(expression: string): Evaluator {
  if (expression.trim() === '') throw new Error('Enter an expression using x');
  return (x) => evaluateExpression(expression, { angle: 'rad', ans: 0, base: 10, x });
}

function evaluateBound(text: string): number {
  if (text.trim() === '') throw new Error('Fill in every value');
  return evaluateExpression(text, { angle: 'rad', ans: 0, base: 10 });
}

function derivativeDetail(f: Evaluator, point: number): DerivativeDetail {
  const step = DERIVATIVE_STEP * Math.max(1, Math.abs(point));
  const central = (h: number) => (f(point + h) - f(point - h)) / (2 * h);
  const coarse = central(step);
  const fine = central(step / 2);
  return { step, coarse, fine, value: (4 * fine - coarse) / 3 };
}

function simpson(f: Evaluator, lower: number, upper: number, intervals: number): number {
  const width = (upper - lower) / intervals;
  let sum = f(lower) + f(upper);
  for (let index = 1; index < intervals; index += 1) {
    sum += (index % 2 === 1 ? 4 : 2) * f(lower + index * width);
  }
  return (sum * width) / 3;
}

function integralDetail(f: Evaluator, lower: number, upper: number): IntegralDetail {
  if (lower === upper) return { value: 0, estimates: [] };
  let intervals = 256;
  let previous = simpson(f, lower, upper, intervals);
  const estimates: IntegralEstimate[] = [{ intervals, value: previous }];
  while (intervals < MAX_INTEGRAL_SAMPLES) {
    intervals *= 2;
    const current = simpson(f, lower, upper, intervals);
    estimates.push({ intervals, value: current });
    if (Math.abs(current - previous) <= INTEGRAL_TOLERANCE * Math.max(1, Math.abs(current))) {
      return { value: current, estimates };
    }
    previous = current;
  }
  throw new Error('Integral did not settle');
}

function summation(f: Evaluator, start: number, end: number): number {
  if (!Number.isInteger(start) || !Number.isInteger(end)) throw new Error('Limits must be whole numbers');
  if (end < start) throw new Error('End must be at least the start');
  if (end - start + 1 > MAX_SUMMATION_TERMS) throw new Error('Too many terms to add');
  let total = 0;
  for (let index = start; index <= end; index += 1) total += f(index);
  return total;
}

function derivativeSolution(f: Evaluator, expression: string, start: string): CalculusSolution {
  const point = evaluateBound(start);
  const detail = derivativeDetail(f, point);
  if (!Number.isFinite(detail.value)) throw new Error('Math error');
  const value = detail.value;
  return {
    result: { label: `d/dx(${expression}) at x=${start}`, value },
    steps: {
      title: `Derivative of ${expression} at x = ${start}`,
      setup: [`f(x) = ${expression}`, `Evaluate at x = ${formatNumber(point)}`, 'Method: central differences with Richardson extrapolation'],
      derivation: [
        `Step size h = ${formatNumber(detail.step)}`,
        `Central difference with h: [f(x + h) - f(x - h)] / 2h = ${formatNumber(detail.coarse)}`,
        `Central difference with h/2: ${formatNumber(detail.fine)}`,
        `Richardson combination: (4 × estimate(h/2) - estimate(h)) / 3 = ${formatNumber(value)}`,
      ],
      result: [`f'(${formatNumber(point)}) ≈ ${formatNumber(value)}`],
    },
  };
}

function integralSolution(f: Evaluator, expression: string, start: string, end: string): CalculusSolution {
  const lower = evaluateBound(start);
  const upper = evaluateBound(end);
  const detail = integralDetail(f, lower, upper);
  if (!Number.isFinite(detail.value)) throw new Error('Math error');
  const value = detail.value;
  return {
    result: { label: `∫(${expression}, ${start}, ${end})`, value },
    steps: {
      title: `Definite integral of ${expression} from ${start} to ${end}`,
      setup: [`f(x) = ${expression}`, `Bounds: ${formatNumber(lower)} to ${formatNumber(upper)}`, "Method: Simpson's rule, doubling the intervals until it settles"],
      derivation:
        detail.estimates.length === 0
          ? ['Bounds are equal, so the area is 0']
          : [
              ...detail.estimates.map((estimate) => `Simpson with ${estimate.intervals} intervals: ${formatNumber(estimate.value)}`),
              `Stopped: the last doubling changed the value by less than ${INTEGRAL_TOLERANCE} (relative)`,
            ],
      result: [`∫ ≈ ${formatNumber(value)}`],
    },
  };
}

function summationSolution(f: Evaluator, expression: string, start: string, end: string): CalculusSolution {
  const first = evaluateBound(start);
  const last = evaluateBound(end);
  const value = summation(f, first, last);
  if (!Number.isFinite(value)) throw new Error('Math error');
  const terms = last - first + 1;
  return {
    result: { label: `∑(${expression}, ${start}, ${end})`, value },
    steps: {
      title: `Sum of ${expression} for x from ${start} to ${end}`,
      setup: [`f(x) = ${expression}`, `Index runs from ${formatNumber(first)} to ${formatNumber(last)}`, `Number of terms: ${formatNumber(terms)}`],
      derivation: [
        `First term f(${formatNumber(first)}) = ${formatNumber(f(first))}`,
        `Last term f(${formatNumber(last)}) = ${formatNumber(f(last))}`,
        `Add all ${formatNumber(terms)} terms in order`,
      ],
      result: [`∑ = ${formatNumber(value)}`],
    },
  };
}

export function solveCalculus(request: CalculusRequest): CalculusSolution {
  const expression = request.expression.trim();
  const start = request.start.trim();
  const end = request.end.trim();
  const f = compile(expression);

  if (request.kind === 'derivative') return derivativeSolution(f, expression, start);
  if (request.kind === 'integral') return integralSolution(f, expression, start, end);
  return summationSolution(f, expression, start, end);
}
