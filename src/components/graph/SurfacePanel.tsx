import { useMemo, useState } from 'react';
import { SurfaceCanvas } from '@/components/graph/SurfaceCanvas';
import { sampleSurface, SURFACE_RANGE } from '@/lib/surface';

const EXAMPLE_SURFACES = ['z = sin(x) * cos(y)', 'z = x^2 - y^2', 'z = sqrt(x^2 + y^2)', 'z = 4 - (x^2 + y^2) / 4'];

export function SurfacePanel() {
  const [equation, setEquation] = useState('z = sin(x) * cos(y)');

  const sample = useMemo(() => {
    try {
      return { values: sampleSurface(equation), error: null };
    } catch (error) {
      return { values: null, error: error instanceof Error ? error.message : 'Calculation failed' };
    }
  }, [equation]);

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

      {sample.error && (
        <p role="alert" className="text-sm text-rose-400">
          {sample.error}
        </p>
      )}
      {sample.values && <SurfaceCanvas values={sample.values} />}

      <p className="text-xs text-zinc-500">
        Use x and y as the variables. The grid covers x and y from -{SURFACE_RANGE} to {SURFACE_RANGE}. Drag to rotate and tilt, scroll to zoom.
      </p>
    </div>
  );
}
