import { useCallback, useEffect, useState } from 'react';
import {
  clearCalculations,
  deleteCalculation,
  fetchCalculations,
  insertCalculation,
  type HistoryEntry,
} from '@/lib/calculationHistory';
import type { CompletedCalculation } from '@/lib/calculatorReducer';

export type HistoryStatus = 'loading' | 'ready' | 'error';

export function useCalculationHistory() {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [status, setStatus] = useState<HistoryStatus>('loading');
  const [actionError, setActionError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setStatus('loading');
    try {
      setEntries(await fetchCalculations());
      setStatus('ready');
    } catch {
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const addEntry = useCallback(async (calculation: CompletedCalculation) => {
    try {
      const entry = await insertCalculation(calculation);
      setEntries((previous) => [entry, ...previous]);
      setActionError(null);
    } catch {
      setActionError("Couldn't save this calculation to your history.");
    }
  }, []);

  const removeEntry = useCallback(async (id: string) => {
    try {
      await deleteCalculation(id);
      setEntries((previous) => previous.filter((entry) => entry.id !== id));
      setActionError(null);
    } catch {
      setActionError("Couldn't delete that calculation. Please try again.");
    }
  }, []);

  const clearAll = useCallback(async () => {
    try {
      await clearCalculations();
      setEntries([]);
      setActionError(null);
    } catch {
      setActionError("Couldn't clear your history. Please try again.");
    }
  }, []);

  return { entries, status, actionError, load, addEntry, removeEntry, clearAll };
}
