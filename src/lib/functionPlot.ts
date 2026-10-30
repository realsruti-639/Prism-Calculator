import { evaluateExpression } from '@/lib/mathEngine';

export type PlotPoint = { x: number; y: number };
export type PlotBounds = { xMin: number; xMax: number; yMin: number; yMax: number };
export type PlotResult = { segments: PlotPoint[][]; error: string | null };

const LEADING_LABEL = /^\s*(?:y|f\(x\))\s*=/i;
const JUMP_RANGE_MULTIPLIER = 4;

export function stripGraphLabel(input: string): string {
  return input.replace(LEADING_LABEL, '').trim();
}

export function samplePlot(input: string, bounds: PlotBounds, sampleCount: number): PlotResult {
  const expression = stripGraphLabel(input);
  if (expression === '') return { segments: [], error: null };

  const rangeY = bounds.yMax - bounds.yMin;
  const step = (bounds.xMax - bounds.xMin) / sampleCount;
  const segments: PlotPoint[][] = [];
  let current: PlotPoint[] = [];
  let evaluatedCount = 0;
  let lastError: string | null = null;

  const endSegment = () => {
    if (current.length > 1) segments.push(current);
    current = [];
  };

  for (let index = 0; index <= sampleCount; index += 1) {
    const x = bounds.xMin + index * step;
    let y: number;
    try {
      y = evaluateExpression(expression, { angle: 'rad', ans: 0, base: 10, x });
    } catch (error) {
      lastError = error instanceof Error ? error.message : 'Syntax error';
      endSegment();
      continue;
    }

    evaluatedCount += 1;
    const previous = current[current.length - 1];
    if (previous && Math.abs(y - previous.y) > JUMP_RANGE_MULTIPLIER * rangeY) endSegment();
    current.push({ x, y });
  }
  endSegment();

  if (evaluatedCount === 0) return { segments: [], error: lastError };
  return { segments, error: null };
}
