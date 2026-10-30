import { formatNumber } from '@/lib/mathEngine';
import type { PlotBounds, PlotPoint } from '@/lib/functionPlot';

export type GraphView = { centerX: number; centerY: number; pixelsPerUnit: number };

export const DEFAULT_GRAPH_VIEW: GraphView = { centerX: 0, centerY: 0, pixelsPerUnit: 40 };

const MIN_PIXELS_PER_UNIT = 2;
const MAX_PIXELS_PER_UNIT = 2000;

const CYAN = '#2EE6F6';
const GRID_MINOR = 'rgba(46, 230, 246, 0.08)';
const AXIS = 'rgba(46, 230, 246, 0.55)';
const LABEL = 'rgba(161, 161, 170, 0.85)';
const TARGET_TICK_PIXELS = 80;

export function zoomAround(
  view: GraphView,
  factor: number,
  anchorX: number,
  anchorY: number,
  width: number,
  height: number,
): GraphView {
  const pixelsPerUnit = Math.min(MAX_PIXELS_PER_UNIT, Math.max(MIN_PIXELS_PER_UNIT, view.pixelsPerUnit * factor));
  const anchorWorldX = view.centerX + (anchorX - width / 2) / view.pixelsPerUnit;
  const anchorWorldY = view.centerY - (anchorY - height / 2) / view.pixelsPerUnit;
  return {
    pixelsPerUnit,
    centerX: anchorWorldX - (anchorX - width / 2) / pixelsPerUnit,
    centerY: anchorWorldY + (anchorY - height / 2) / pixelsPerUnit,
  };
}

export function visibleBounds(view: GraphView, width: number, height: number): PlotBounds {
  const halfWidth = width / 2 / view.pixelsPerUnit;
  const halfHeight = height / 2 / view.pixelsPerUnit;
  return {
    xMin: view.centerX - halfWidth,
    xMax: view.centerX + halfWidth,
    yMin: view.centerY - halfHeight,
    yMax: view.centerY + halfHeight,
  };
}

function niceStep(rawStep: number): number {
  const exponent = Math.floor(Math.log10(rawStep));
  const scale = 10 ** exponent;
  const fraction = rawStep / scale;
  if (fraction < 1.5) return scale;
  if (fraction < 3.5) return 2 * scale;
  if (fraction < 7.5) return 5 * scale;
  return 10 * scale;
}

function toScreen(view: GraphView, width: number, height: number, x: number, y: number) {
  return {
    px: (x - view.centerX) * view.pixelsPerUnit + width / 2,
    py: height / 2 - (y - view.centerY) * view.pixelsPerUnit,
  };
}

function drawGridLines(ctx: CanvasRenderingContext2D, view: GraphView, width: number, height: number, step: number) {
  const bounds = visibleBounds(view, width, height);
  ctx.strokeStyle = GRID_MINOR;
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let x = Math.ceil(bounds.xMin / step) * step; x <= bounds.xMax; x += step) {
    const { px } = toScreen(view, width, height, x, 0);
    ctx.moveTo(px, 0);
    ctx.lineTo(px, height);
  }
  for (let y = Math.ceil(bounds.yMin / step) * step; y <= bounds.yMax; y += step) {
    const { py } = toScreen(view, width, height, 0, y);
    ctx.moveTo(0, py);
    ctx.lineTo(width, py);
  }
  ctx.stroke();
}

function drawAxes(ctx: CanvasRenderingContext2D, view: GraphView, width: number, height: number, step: number) {
  const origin = toScreen(view, width, height, 0, 0);
  const axisX = Math.min(Math.max(origin.px, 0), width);
  const axisY = Math.min(Math.max(origin.py, 0), height);

  ctx.save();
  ctx.strokeStyle = AXIS;
  ctx.shadowColor = CYAN;
  ctx.shadowBlur = 8;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(0, axisY);
  ctx.lineTo(width, axisY);
  ctx.moveTo(axisX, 0);
  ctx.lineTo(axisX, height);
  ctx.stroke();
  ctx.restore();

  const bounds = visibleBounds(view, width, height);
  ctx.save();
  ctx.fillStyle = LABEL;
  ctx.font = '11px "JetBrains Mono", monospace';
  for (let x = Math.ceil(bounds.xMin / step) * step; x <= bounds.xMax; x += step) {
    if (Math.abs(x) < step / 2) continue;
    const { px } = toScreen(view, width, height, x, 0);
    ctx.textAlign = 'center';
    ctx.fillText(formatNumber(x), px, Math.min(axisY + 14, height - 4));
  }
  for (let y = Math.ceil(bounds.yMin / step) * step; y <= bounds.yMax; y += step) {
    if (Math.abs(y) < step / 2) continue;
    const { py } = toScreen(view, width, height, 0, y);
    ctx.textAlign = 'right';
    ctx.fillText(formatNumber(y), Math.max(axisX - 6, 30), py + 4);
  }
  ctx.restore();
}

function drawCurve(ctx: CanvasRenderingContext2D, view: GraphView, width: number, height: number, segments: PlotPoint[][]) {
  ctx.save();
  ctx.strokeStyle = CYAN;
  ctx.lineWidth = 2.25;
  ctx.lineJoin = 'round';
  ctx.shadowColor = CYAN;
  ctx.shadowBlur = 14;
  for (const segment of segments) {
    ctx.beginPath();
    segment.forEach(({ x, y }, index) => {
      const { px, py } = toScreen(view, width, height, x, y);
      if (index === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    });
    ctx.stroke();
  }
  ctx.restore();
}

export function drawGraph(
  ctx: CanvasRenderingContext2D,
  view: GraphView,
  width: number,
  height: number,
  segments: PlotPoint[][],
) {
  ctx.clearRect(0, 0, width, height);
  const step = niceStep(TARGET_TICK_PIXELS / view.pixelsPerUnit);
  drawGridLines(ctx, view, width, height, step);
  drawAxes(ctx, view, width, height, step);
  drawCurve(ctx, view, width, height, segments);
}
