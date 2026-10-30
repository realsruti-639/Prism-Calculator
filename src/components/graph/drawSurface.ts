export type SurfaceView = { yaw: number; pitch: number; zoom: number };

export const DEFAULT_SURFACE_VIEW: SurfaceView = { yaw: -0.7, pitch: 0.6, zoom: 1 };
export const MIN_SURFACE_ZOOM = 0.5;
export const MAX_SURFACE_ZOOM = 3;
export const MAX_SURFACE_PITCH = 1.4;

const CAMERA_DISTANCE = 4;
const DEPTH_LIMIT = 1.5;
const FALLBACK_RGB = [255, 63, 203];

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function readPrismRgb(): number[] {
  const parts = getComputedStyle(document.documentElement)
    .getPropertyValue('--prism-rgb')
    .trim()
    .split(/\s+/)
    .map(Number);
  return parts.length === 3 && parts.every(Number.isFinite) ? parts : FALLBACK_RGB;
}

type ScreenPoint = { x: number; y: number; depth: number };

function projectSurfacePoint(
  gridX: number,
  gridY: number,
  height: number,
  view: SurfaceView,
  scale: number,
  width: number,
  canvasHeight: number,
): ScreenPoint {
  const cosYaw = Math.cos(view.yaw);
  const sinYaw = Math.sin(view.yaw);
  const rotatedX = gridX * cosYaw - gridY * sinYaw;
  const rotatedY = gridX * sinYaw + gridY * cosYaw;

  const cosPitch = Math.cos(view.pitch);
  const sinPitch = Math.sin(view.pitch);
  const depth = rotatedY * cosPitch - height * sinPitch;
  const up = rotatedY * sinPitch + height * cosPitch;

  const perspective = CAMERA_DISTANCE / (CAMERA_DISTANCE + depth);
  return {
    x: width / 2 + rotatedX * perspective * scale,
    y: canvasHeight / 2 - up * perspective * scale,
    depth,
  };
}

function strokeSegment(ctx: CanvasRenderingContext2D, from: ScreenPoint, to: ScreenPoint, rgb: number[]): void {
  const nearness = 1 - (from.depth + to.depth + 2 * DEPTH_LIMIT) / (4 * DEPTH_LIMIT);
  ctx.strokeStyle = `rgba(${rgb.join(', ')}, ${(0.25 + 0.7 * clamp(nearness, 0, 1)).toFixed(3)})`;
  ctx.beginPath();
  ctx.moveTo(from.x, from.y);
  ctx.lineTo(to.x, to.y);
  ctx.stroke();
}

export function drawSurface(
  ctx: CanvasRenderingContext2D,
  values: number[][],
  view: SurfaceView,
  width: number,
  height: number,
  rgb: number[],
): void {
  const finite = values.flat().filter(Number.isFinite);
  const maxHeight = finite.length === 0 ? 1 : Math.max(1e-9, ...finite.map(Math.abs));
  const steps = values.length - 1;
  const scale = Math.min(width, height) * 0.36 * view.zoom;
  const points = values.map((row, rowIndex) =>
    row.map((value, colIndex) => {
      if (!Number.isFinite(value)) return null;
      return projectSurfacePoint(
        (colIndex / steps) * 2 - 1,
        (rowIndex / steps) * 2 - 1,
        value / maxHeight,
        view,
        scale,
        width,
        height,
      );
    }),
  );

  ctx.lineWidth = 1;
  ctx.lineCap = 'round';
  points.forEach((row, rowIndex) =>
    row.forEach((point, colIndex) => {
      if (point === null) return;
      const right = row[colIndex + 1];
      const below = points[rowIndex + 1]?.[colIndex];
      if (right) strokeSegment(ctx, point, right, rgb);
      if (below) strokeSegment(ctx, point, below, rgb);
    }),
  );
}
