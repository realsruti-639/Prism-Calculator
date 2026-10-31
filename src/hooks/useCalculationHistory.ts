import { useCallback, useEffect, useState } from 'react';
import {
  clearCalculations,
  deleteCalculation,
  fetchCalculations,
  HISTORY_LIMIT,
  insertCalculation,
  type HistoryEntry,
} from '@/lib/calculationHistory';
import { loadLocalHistory, saveLocalHistory } from '@/lib/localCalculationHistory';
import type { CompletedCalculation } from '@/lib/calculatorReducer';

export type HistoryStatus = 'loading' | 'ready' | 'error';

export function useCalculationHistory(cloudUserId: string | null) {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [status, setStatus] = useState<HistoryStatus>('loading');
  const [actionError, setActionError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setStatus('loading');
    try {
      const next = cloudUserId === null ? loadLocalHistory() : await fetchCalculations(cloudUserId);
      setEntries(next);
      setStatus('ready');
    } catch {
      setStatus('error');
    }
  }, [cloudUserId]);

  useEffect(() => {
    void load();
  }, [load]);

  const addEntry = useCallback(
    async (calculation: CompletedCalculation) => {
      if (cloudUserId === null) {
        const entry: HistoryEntry = {
          id: crypto.randomUUID(),
          expression: calculation.expression,
          result: calculation.result,
          createdAt: new Date().toISOString(),
        };
        const next = [entry, ...entries].slice(0, HISTORY_LIMIT);
        saveLocalHistory(next);
        setEntries(next);
        setActionError(null);
        return;
      }
      try {
        const entry = await insertCalculation(cloudUserId, calculation);
        setEntries((previous) => [entry, ...previous]);
        setActionError(null);
      } catch {
        setActionError("Couldn't save this calculation to your history.");
      }
    },
    [cloudUserId, entries],
  );

  const removeEntry = useCallback(
    async (id: string) => {
      if (cloudUserId === null) {
        const next = entries.filter((entry) => entry.id !== id);
        saveLocalHistory(next);
        setEntries(next);
        setActionError(null);
        return;
      }
      try {
        await deleteCalculation(cloudUserId, id);
        setEntries((previous) => previous.filter((entry) => entry.id !== id));
        setActionError(null);
      } catch {
        setActionError("Couldn't delete that calculation. Please try again.");
      }
    },
    [cloudUserId, entries],
  );

  const clearAll = useCallback(async () => {
    if (cloudUserId === null) {
      saveLocalHistory([]);
      setEntries([]);
      setActionError(null);
      return;
    }
    try {
      await clearCalculations(cloudUserId);
      setEntries([]);
      setActionError(null);
    } catch {
      setActionError("Couldn't clear your history. Please try again.");
    }
  }, [cloudUserId]);

  return { entries, status, actionError, load, addEntry, removeEntry, clearAll };
}
