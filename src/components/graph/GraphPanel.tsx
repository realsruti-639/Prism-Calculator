import { useState } from 'react';
import { GraphCanvas } from '@/components/graph/GraphCanvas';
import { SurfacePanel } from '@/components/graph/SurfacePanel';
import { DEFAULT_GRAPH_VIEW, type GraphView } from '@/components/graph/drawGraph';

const EXAMPLE_EQUATIONS = ['y = x^2', 'y = sin(x)', 'y = √x', 'y = 1/x', 'y = x^3 - 2x'];

type Dimension = '2d' | '3d';

const DIMENSIONS: { id: Dimension; label: string }[] = [
  { id: '2d', label: '2D graph' },
  { id: '3d', label: '3D surface' },
];

const SEGMENT_BASE =
  'flex-1 rounded-full px-3 py-1.5 text-sm font-medium transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-cyan';

export function GraphPanel() {
  const [dimension, setDimension] = useState<Dimension>('2d');
  const [equation, setEquation] = useState('y = x^2');
  const [view, setView] = useState<GraphView>(DEFAULT_GRAPH_VIEW);

  return (
    <div className="flex flex-col gap-5">
      <div role="tablist" aria-label="Graph dimension" className="flex rounded-full border border-prism/50 bg-ink-950 p-1">
        {DIMENSIONS.map((option) => {
          const isActive = option.id === dimension;
          return (
            <button
              key={option.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setDimension(option.id)}
              className={`${SEGMENT_BASE} ${
                isActive ? 'bg-neon-cyan/15 text-neon-cyan shadow-[0_0_16px_-6px_rgba(46,230,246,0.9)]' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>

      {dimension === '3d' ? (
        <SurfacePanel />
      ) : (
        <>
          <label className="flex flex-col gap-2">
            <span className="text-xs uppercase tracking-widest text-neon-cyan/70">Equation</span>
            <input
              type="text"
              value={equation}
              onChange={(event) => setEquation(event.target.value)}
              spellCheck={false}
              autoComplete="off"
              placeholder="y = sin(x)"
              className="rounded-xl border border-prism/70 bg-ink-950 px-4 py-3 font-mono text-lg text-neon-cyan placeholder:text-zinc-600 shadow-[0_0_18px_-8px_rgb(var(--prism-rgb)/0.9)] transition focus:border-prism focus:outline-none focus:ring-2 focus:ring-prism/30"
            />
          </label>

          <div className="flex flex-wrap gap-2">
            {EXAMPLE_EQUATIONS.map((example) => (
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

          <GraphCanvas expression={equation} view={view} onViewChange={setView} />

          <p className="text-xs text-zinc-500">Drag to pan, scroll or use the buttons to zoom. Use x as the variable.</p>
        </>
      )}
    </div>
  );
}
