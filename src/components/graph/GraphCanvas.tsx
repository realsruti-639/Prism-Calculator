import { useEffect, useRef, useState, type PointerEvent } from 'react';
import { Maximize2, ZoomIn, ZoomOut } from 'lucide-react';
import { DEFAULT_GRAPH_VIEW, drawGraph, visibleBounds, zoomAround, type GraphView } from '@/components/graph/drawGraph';
import { samplePlot } from '@/lib/functionPlot';

type GraphCanvasProps = {
  expression: string;
  view: GraphView;
  onViewChange: (view: GraphView) => void;
};

const ZOOM_STEP = 1.25;
const WHEEL_ZOOM_STEP = 1.15;

const CONTROL_CLASSES =
  'flex h-9 w-9 items-center justify-center rounded-lg border border-prism/70 bg-ink-900/80 text-neon-cyan shadow-[0_0_14px_-6px_rgb(var(--prism-rgb)/0.8)] transition hover:border-prism hover:bg-prism/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-cyan';

export function GraphCanvas({ expression, view, onViewChange }: GraphCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dragStartRef = useRef<{ x: number; y: number } | null>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [plotError, setPlotError] = useState<string | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize({ width: Math.floor(width), height: Math.floor(height) });
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || size.width === 0) return;
    const ratio = window.devicePixelRatio || 1;
    canvas.width = size.width * ratio;
    canvas.height = size.height * ratio;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

    const plot = samplePlot(expression, visibleBounds(view, size.width, size.height), size.width);
    setPlotError(plot.error);
    drawGraph(ctx, view, size.width, size.height, plot.segments);
  }, [expression, view, size]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const factor = event.deltaY < 0 ? WHEEL_ZOOM_STEP : 1 / WHEEL_ZOOM_STEP;
      onViewChange(
        zoomAround(view, factor, event.clientX - rect.left, event.clientY - rect.top, rect.width, rect.height),
      );
    };
    canvas.addEventListener('wheel', handleWheel, { passive: false });
    return () => canvas.removeEventListener('wheel', handleWheel);
  }, [view, onViewChange]);

  const handlePointerDown = (event: PointerEvent<HTMLCanvasElement>) => {
    dragStartRef.current = { x: event.clientX, y: event.clientY };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: PointerEvent<HTMLCanvasElement>) => {
    const start = dragStartRef.current;
    if (!start) return;
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    dragStartRef.current = { x: event.clientX, y: event.clientY };
    onViewChange({
      ...view,
      centerX: view.centerX - dx / view.pixelsPerUnit,
      centerY: view.centerY + dy / view.pixelsPerUnit,
    });
  };

  const handlePointerEnd = () => {
    dragStartRef.current = null;
  };

  const zoomBy = (factor: number) => {
    onViewChange(zoomAround(view, factor, size.width / 2, size.height / 2, size.width, size.height));
  };

  return (
    <div
      ref={containerRef}
      className="relative h-[360px] overflow-hidden rounded-2xl border border-neon-cyan/25 bg-ink-950 sm:h-[460px]"
    >
      <canvas
        ref={canvasRef}
        aria-label="Graph of the entered equation"
        role="img"
        className="absolute inset-0 h-full w-full cursor-grab touch-none active:cursor-grabbing"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
        onPointerCancel={handlePointerEnd}
        onPointerLeave={handlePointerEnd}
      />

      {plotError && (
        <p role="alert" className="absolute left-3 top-3 rounded-md bg-ink-950/90 px-2 py-1 font-mono text-sm text-rose-400">
          {plotError}
        </p>
      )}

      <div className="absolute bottom-3 right-3 flex gap-2">
        <button type="button" aria-label="Zoom in" className={CONTROL_CLASSES} onClick={() => zoomBy(ZOOM_STEP)}>
          <ZoomIn className="h-4 w-4" />
        </button>
        <button type="button" aria-label="Zoom out" className={CONTROL_CLASSES} onClick={() => zoomBy(1 / ZOOM_STEP)}>
          <ZoomOut className="h-4 w-4" />
        </button>
        <button
          type="button"
          aria-label="Reset view"
          className={CONTROL_CLASSES}
          onClick={() => onViewChange(DEFAULT_GRAPH_VIEW)}
        >
          <Maximize2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
