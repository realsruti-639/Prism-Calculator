import { evaluateExpression } from '@/lib/mathEngine';

export const SURFACE_RANGE = 5;
export const SURFACE_MIN_RESOLUTION = 24;
export const SURFACE_MAX_RESOLUTION = 40;

export function sampleSurface(equation: string, resolution: number): number[][] {
  const expression = equation.replace(/^\s*z\s*=\s*/i, '').trim();
  if (expression === '') throw new Error('Enter an equation using x and y');

  const steps = resolution - 1;
  let firstError: string | null = null;
  const values = Array.from({ length: resolution }, (_, row) =>
    Array.from({ length: resolution }, (_, col) => {
      const x = -SURFACE_RANGE + (2 * SURFACE_RANGE * col) / steps;
      const y = -SURFACE_RANGE + (2 * SURFACE_RANGE * row) / steps;
      try {
        const z = evaluateExpression(expression, { angle: 'rad', ans: 0, base: 10, x, y });
        return Number.isFinite(z) ? z : Number.NaN;
      } catch (error) {
        firstError ??= error instanceof Error ? error.message : 'Syntax error';
        return Number.NaN;
      }
    }),
  );

  if (values.every((row) => row.every((value) => Number.isNaN(value)))) {
    throw new Error(firstError ?? 'This equation has no real values in the range');
  }
  return values;
}
