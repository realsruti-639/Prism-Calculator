import { useMemo, useState } from 'react';
import { SurfaceCanvas } from '@/components/graph/SurfaceCanvas';
import { usePaywall } from '@/hooks/usePaywall';
import { sampleSurface, SURFACE_MAX_RESOLUTION, SURFACE_MIN_RESOLUTION, SURFACE_RANGE } from '@/lib/surface';

const EXAMPLE_SURFACES = ['z = sin(x) * cos(y)', 'z = x^2 - y^2', 'z = sqrt(x^2 + y^2)', 'z = 4 - (x^2 + y^2) / 4'];

export function SurfacePanel() {
  const { isPro, openPaywall } = usePaywall();
  const [equation, setEquation] = useState('z = sin(x) * cos(y)');
  const [resolution, setResolution] = useState(SURFACE_MIN_RESOLUTION);

  const sample = useMemo(() => {
    try {
      return { values: sampleSurface(equation, resolution), error: null };
    } catch (error) {
      return { values: null, error: error instanceof Error ? error.message : 'Calculation failed' };
    }
  }, [equation, resolution]);

  return (
    <div className="flex flex-col gap-5">
      <label className="flex flex-col gap-2">
        <span className="text-xs uppercase tracking-widest text-neon-cyan/70">Surface</span>
        <input
          type="text"
          value={equation}
          onChange={(event) => setEquation(event.target.value)}
          spellCheck={false}
          autoComplete="off"
          placeholder="z = sin(x) * cos(y)"
          className="rounded-xl border border-prism/70 bg-ink-950 px-4 py-3 font-mono text-lg text-neon-cyan placeholder:text-zinc-600 shadow-[0_0_18px_-8px_rgb(var(--prism-rgb)/0.9)] transition focus:border-prism focus:outline-none focus:ring-2 focus:ring-prism/30"
        />
      </label>

      <div className="flex flex-wrap gap-2">
        {EXAMPLE_SURFACES.map((example) => (
          <button
            key={example}
            type="button"
            onClick={() => setEquation(example)}
            className="rounded-full border border-neon-cyan/25 px-3 py-1 font-mono text-xs text-zinc-300 transition hover:border-neon-cyan/70 hover:text-neon-cyan"
          >
            {example}
          </button>
        ))}
      </div>

      {isPro && (
        <label className="flex items-center gap-3">
          <span className="w-16 text-xs uppercase tracking-widest text-neon-cyan/70">Mesh</span>
          <input
            type="range"
            min={SURFACE_MIN_RESOLUTION}
            max={SURFACE_MAX_RESOLUTION}
            step={1}
            value={resolution}
            onChange={(event) => setResolution(Number(event.target.value))}
            className="flex-1 accent-[rgb(var(--prism-rgb))]"
          />
          <span className="w-20 text-right font-mono text-xs text-zinc-400">
            {resolution} x {resolution}
          </span>
        </label>
      )}

      <div className="relative">
        <div className={isPro ? undefined : 'pointer-events-none select-none blur-md'} aria-hidden={!isPro}>
          {sample.error && (
            <p role="alert" className="mb-4 text-sm text-rose-400">
              {sample.error}
            </p>
          )}
          {sample.values && <SurfaceCanvas values={sample.values} />}
        </div>

        {!isPro && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 rounded-2xl border border-prism/40 bg-zinc-950/60 p-6 text-center">
            <p className="font-mono text-sm tracking-wide text-zinc-100">Unlock Interactive 3D Graphs with Pro</p>
            <button
              type="button"
              onClick={() => openPaywall('Interactive 3D graphs')}
              className="rounded-full border border-prism/70 bg-prism/10 px-5 py-2.5 text-sm font-semibold text-prism shadow-[0_0_18px_-6px_rgb(var(--prism-rgb)/0.9)] transition hover:bg-prism/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-cyan"
            >
              See Pro plans
            </button>
          </div>
        )}
      </div>

      <p className="text-xs text-zinc-500">
        Use x and y as the variables. The grid covers x and y from -{SURFACE_RANGE} to {SURFACE_RANGE}. Drag to rotate and tilt, scroll to zoom.
      </p>
    </div>
  );
}
