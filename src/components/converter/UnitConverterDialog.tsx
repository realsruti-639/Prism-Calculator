import { useState } from 'react';
import { ArrowLeftRight, X } from 'lucide-react';
import { UNIT_CATEGORIES, convertUnits, type UnitCategoryId } from '@/lib/unitConversion';
import { formatNumber } from '@/lib/mathEngine';

type UnitConverterDialogProps = {
  onClose: () => void;
};

type Outcome = { ok: true; text: string } | { ok: false; message: string };

const SELECT_CLASSES =
  'w-full rounded-xl border border-neon-cyan/30 bg-ink-950 px-3 py-2.5 text-zinc-100 transition focus:border-prism focus:outline-none focus:ring-2 focus:ring-prism/30';

const SEGMENT_BASE =
  'flex-1 rounded-full px-3 py-1.5 text-sm font-medium transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-cyan';

function computeOutcome(categoryId: UnitCategoryId, from: string, to: string, amount: string): Outcome {
  if (amount.trim() === '' || !Number.isFinite(Number(amount))) {
    return { ok: false, message: 'Enter a number to convert' };
  }
  try {
    return { ok: true, text: formatNumber(convertUnits(categoryId, from, to, Number(amount))) };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : 'Conversion failed' };
  }
}

export function UnitConverterDialog({ onClose }: UnitConverterDialogProps) {
  const [categoryIndex, setCategoryIndex] = useState(0);
  const category = UNIT_CATEGORIES[categoryIndex];
  const [fromUnit, setFromUnit] = useState(category.units[0].id);
  const [toUnit, setToUnit] = useState(category.units[1].id);
  const [amount, setAmount] = useState('1');

  const selectCategory = (index: number) => {
    const next = UNIT_CATEGORIES[index];
    setCategoryIndex(index);
    setFromUnit(next.units[0].id);
    setToUnit(next.units[1].id);
  };

  const swapUnits = () => {
    setFromUnit(toUnit);
    setToUnit(fromUnit);
  };

  const outcome = computeOutcome(category.id, fromUnit, toUnit, amount);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/75 p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="converter-title"
        onClick={(event) => event.stopPropagation()}
        className="w-full max-w-md rounded-3xl border border-neon-cyan/30 bg-ink-900 p-6 shadow-[0_0_60px_-20px_rgba(46,230,246,0.45)] sm:p-7"
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 id="converter-title" className="font-mono text-sm tracking-widest text-neon-cyan glow-text">
            CONVERT
          </h2>
          <button
            type="button"
            aria-label="Close converter"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-prism/70 text-neon-cyan transition hover:bg-prism/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-cyan"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div role="tablist" aria-label="Unit category" className="mb-6 flex rounded-full border border-prism/50 bg-ink-950 p-1">
          {UNIT_CATEGORIES.map((item, index) => {
            const isActive = index === categoryIndex;
            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => selectCategory(index)}
                className={`${SEGMENT_BASE} ${
                  isActive ? 'bg-neon-cyan/15 text-neon-cyan shadow-[0_0_16px_-6px_rgba(46,230,246,0.9)]' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        <label className="mb-4 flex flex-col gap-2">
          <span className="text-xs uppercase tracking-widest text-neon-cyan/70">Amount</span>
          <input
            type="number"
            inputMode="decimal"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            autoFocus
            className={SELECT_CLASSES}
          />
        </label>

        <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-3">
          <label className="flex flex-col gap-2">
            <span className="text-xs uppercase tracking-widest text-neon-cyan/70">From</span>
            <select value={fromUnit} onChange={(event) => setFromUnit(event.target.value)} className={SELECT_CLASSES}>
              {category.units.map((unit) => (
                <option key={unit.id} value={unit.id} className="bg-ink-900">
                  {unit.label}
                </option>
              ))}
            </select>
          </label>

          <button
            type="button"
            aria-label="Swap units"
            onClick={swapUnits}
            className="mb-0.5 flex h-11 w-11 items-center justify-center rounded-full border border-prism/70 text-neon-cyan shadow-[0_0_14px_-6px_rgb(var(--prism-rgb)/0.8)] transition hover:bg-prism/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-cyan"
          >
            <ArrowLeftRight className="h-4 w-4" />
          </button>

          <label className="flex flex-col gap-2">
            <span className="text-xs uppercase tracking-widest text-neon-cyan/70">To</span>
            <select value={toUnit} onChange={(event) => setToUnit(event.target.value)} className={SELECT_CLASSES}>
              {category.units.map((unit) => (
                <option key={unit.id} value={unit.id} className="bg-ink-900">
                  {unit.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-6 min-h-[5rem] rounded-2xl border border-neon-cyan/20 bg-ink-950 px-5 py-4 text-right">
          {outcome.ok ? (
            <p key={`${outcome.text}-${toUnit}`} className="animate-result-in break-all font-mono text-4xl text-neon-cyan glow-text">
              {outcome.text}
            </p>
          ) : (
            <p role="alert" className="font-mono text-lg text-rose-400">
              {outcome.message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
