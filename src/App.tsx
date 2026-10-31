import { useState } from 'react';
import { AppHeader } from '@/components/AppHeader';
import { CalculusDialog } from '@/components/calculus/CalculusDialog';
import { MatrixDialog } from '@/components/matrix/MatrixDialog';
import { Display } from '@/components/calculator/Display';
import { PrismAiBar } from '@/components/ai/PrismAiBar';
import { HistoryPanel } from '@/components/calculator/HistoryPanel';
import { Keypad } from '@/components/calculator/Keypad';
import { GraphPanel } from '@/components/graph/GraphPanel';
import { ModeTabs, type ViewMode } from '@/components/ModeTabs';
import { UnitConverterDialog } from '@/components/converter/UnitConverterDialog';
import { PaywallProvider } from '@/components/ui/PaywallProvider';
import { useCalculationHistory } from '@/hooks/useCalculationHistory';
import { useCalculator, useCalculatorKeyboard } from '@/hooks/useCalculator';
import { usePreferences } from '@/hooks/usePreferences';
import type { CalculusKind } from '@/lib/calculus';
import { PreferencesDialog } from '@/components/preferences/PreferencesDialog';

export default function App() {
  const history = useCalculationHistory();
  const { state, dispatch, preview } = useCalculator(history.addEntry);
  const { preferences, updatePreferences } = usePreferences();
  const [mode, setMode] = useState<ViewMode>('standard');
  const [converterOpen, setConverterOpen] = useState(false);
  const [calculusKind, setCalculusKind] = useState<CalculusKind | null>(null);
  const [matrixOpen, setMatrixOpen] = useState(false);
  const [preferencesOpen, setPreferencesOpen] = useState(false);
  useCalculatorKeyboard(
    dispatch,
    mode === 'standard' && !converterOpen && calculusKind === null && !matrixOpen && !preferencesOpen,
  );

  return (
    <PaywallProvider>
      <div className="relative min-h-screen overflow-x-hidden">
        <div aria-hidden="true" className="grid-backdrop pointer-events-none fixed inset-0" />
        <div className="relative">
          <AppHeader onOpenPreferences={() => setPreferencesOpen(true)} />
          <main className="mx-auto w-full max-w-6xl px-4 pb-12 sm:px-6 lg:px-8">
            <div className="mb-6">
              <ModeTabs mode={mode} onModeChange={setMode} onOpenConverter={() => setConverterOpen(true)} />
            </div>
            <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
              <section className="rounded-3xl border border-neon-cyan/25 bg-ink-900/80 p-5 shadow-[0_0_60px_-20px_rgba(46,230,246,0.35)] backdrop-blur sm:p-7">
                {mode === 'standard' ? (
                  <>
                    <Display
                      input={state.input}
                      result={state.result}
                      preview={preview}
                      factorization={state.factorization}
                      error={state.error}
                      angle={state.angle}
                      numberFormat={state.numberFormat}
                      radix={state.radix}
                    />
                    <div className="my-6">
                      <PrismAiBar
                        onLoadExpression={(expression) => dispatch({ type: 'recall', expression })}
                        onShowResult={({ label, value }) => dispatch({ type: 'showResult', expression: label, value })}
                      />
                    </div>
                    <div className="mb-6 h-px bg-gradient-to-r from-transparent via-neon-cyan/25 to-transparent" />
                    <Keypad
                      angle={state.angle}
                      numberFormat={state.numberFormat}
                      radix={state.radix}
                      onPress={dispatch}
                      onOpenCalculus={setCalculusKind}
                      onOpenMatrix={() => setMatrixOpen(true)}
                      soundEnabled={preferences.soundEnabled}
                    />
                  </>
                ) : (
                  <GraphPanel />
                )}
              </section>

              <HistoryPanel
                entries={history.entries}
                status={history.status}
                actionError={history.actionError}
                onRecall={(expression) => dispatch({ type: 'recall', expression })}
                onRemove={history.removeEntry}
                onClear={history.clearAll}
                onRetry={history.load}
              />
            </div>
          </main>
        </div>

        {preferencesOpen && (
          <PreferencesDialog
            preferences={preferences}
            onChange={updatePreferences}
            onClose={() => setPreferencesOpen(false)}
          />
        )}
        {converterOpen && <UnitConverterDialog onClose={() => setConverterOpen(false)} />}
        {matrixOpen && (
          <MatrixDialog
            onClose={() => setMatrixOpen(false)}
            onUseOnDisplay={(result) => {
              dispatch({ type: 'showResult', expression: result.label, value: result.value });
              setMatrixOpen(false);
            }}
          />
        )}
        {calculusKind && (
          <CalculusDialog
            kind={calculusKind}
            onClose={() => setCalculusKind(null)}
            onResult={({ label, value }) => {
              dispatch({ type: 'showResult', expression: label, value });
              setCalculusKind(null);
            }}
          />
        )}
      </div>
    </PaywallProvider>
  );
}
