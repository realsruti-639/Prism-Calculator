import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { RotateCcw } from 'lucide-react';
import {
  clamp,
  DEFAULT_SURFACE_VIEW,
  drawSurface,
  MAX_SURFACE_PITCH,
  MAX_SURFACE_ZOOM,
  MIN_SURFACE_ZOOM,
  readPrismRgb,
  type SurfaceView,
} from '@/components/graph/drawSurface';

type SurfaceCanvasProps = {
  values: number[][];
};

const DRAG_YAW_SPEED = 0.01;
const DRAG_TILT_SPEED = 0.01;
const WHEEL_ZOOM_SPEED = 0.0015;
const RADIANS_PER_DEGREE = Math.PI / 180;

export function SurfaceCanvas({ values }: SurfaceCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dragRef = useRef<{ x: number; y: number } | null>(null);
  const [view, setView] = useState<SurfaceView>(DEFAULT_SURFACE_VIEW);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    const dpr = window.devicePixelRatio || 1;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);
    drawSurface(ctx, values, view, width, height, readPrismRgb());
  }, [values, view]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      setView((current) => ({
        ...current,
        zoom: clamp(current.zoom * Math.exp(-event.deltaY * WHEEL_ZOOM_SPEED), MIN_SURFACE_ZOOM, MAX_SURFACE_ZOOM),
      }));
    };
    canvas.addEventListener('wheel', handleWheel, { passive: false });
    return () => canvas.removeEventListener('wheel', handleWheel);
  }, []);

  const handlePointerDown = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = { x: event.clientX, y: event.clientY };
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    const last = dragRef.current;
    if (!last) return;
    dragRef.current = { x: event.clientX, y: event.clientY };
    const deltaX = event.clientX - last.x;
    const deltaY = event.clientY - last.y;
    setView((current) => ({
      ...current,
      yaw: current.yaw + deltaX * DRAG_YAW_SPEED,
      pitch: clamp(current.pitch + deltaY * DRAG_TILT_SPEED, 0, MAX_SURFACE_PITCH),
    }));
  };

  const endDrag = () => {
    dragRef.current = null;
  };

  return (
    <div className="flex flex-col gap-4">
      <canvas
        ref={canvasRef}
        aria-label="Three-dimensional wireframe surface. Drag to rotate and tilt, scroll to zoom."
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        className="h-80 w-full cursor-grab touch-none rounded-2xl border border-prism/30 bg-ink-950 active:cursor-grabbing sm:h-96"
      />

      <div className="flex flex-wrap items-center gap-4">
        <label className="flex flex-1 items-center gap-3">
          <span className="w-12 text-xs uppercase tracking-widest text-neon-cyan/70">Tilt</span>
          <input
            type="range"
            min={0}
            max={Math.round(MAX_SURFACE_PITCH / RADIANS_PER_DEGREE)}
            value={Math.round(view.pitch / RADIANS_PER_DEGREE)}
            onChange={(event) => setView((current) => ({ ...current, pitch: Number(event.target.value) * RADIANS_PER_DEGREE }))}
            className="flex-1 accent-[rgb(var(--prism-rgb))]"
          />
          <span className="w-10 text-right font-mono text-xs text-zinc-400">{Math.round(view.pitch / RADIANS_PER_DEGREE)}°</span>
        </label>
        <button
          type="button"
          onClick={() => setView(DEFAULT_SURFACE_VIEW)}
          className="flex items-center gap-2 rounded-full border border-neon-cyan/40 px-4 py-2 text-xs font-medium text-neon-cyan transition hover:bg-neon-cyan/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-cyan"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Reset view
        </button>
      </div>
    </div>
  );
}
