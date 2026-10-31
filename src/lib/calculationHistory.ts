import type { CompletedCalculation } from '@/lib/calculatorReducer';
import { supabase } from '@/lib/supabase';

export type HistoryEntry = {
  id: string;
  expression: string;
  result: string;
  createdAt: string;
};

type CalculationRow = {
  id: string;
  expression: string;
  result: string;
  created_at: string;
};

export const HISTORY_LIMIT = 100;
const COLUMNS = 'id, expression, result, created_at';

function isCalculationRow(value: unknown): value is CalculationRow {
  if (typeof value !== 'object' || value === null) return false;
  const row = value as Record<string, unknown>;
  return (
    typeof row.id === 'string' &&
    typeof row.expression === 'string' &&
    typeof row.result === 'string' &&
    typeof row.created_at === 'string'
  );
}

function toEntry(row: CalculationRow): HistoryEntry {
  return { id: row.id, expression: row.expression, result: row.result, createdAt: row.created_at };
}

export async function fetchCalculations(userId: string): Promise<HistoryEntry[]> {
  const { data, error } = await supabase
    .from('calculations')
    .select(COLUMNS)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(HISTORY_LIMIT);

  if (error) throw new Error(error.message);
  if (!Array.isArray(data) || !data.every(isCalculationRow)) throw new Error('Unexpected history response');
  return data.map(toEntry);
}

export async function insertCalculation(userId: string, calculation: CompletedCalculation): Promise<HistoryEntry> {
  const { data, error } = await supabase
    .from('calculations')
    .insert({ user_id: userId, expression: calculation.expression, result: calculation.result })
    .select(COLUMNS)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!isCalculationRow(data)) throw new Error('Calculation was not saved');
  return toEntry(data);
}

export async function deleteCalculation(userId: string, id: string): Promise<void> {
  const { error } = await supabase.from('calculations').delete().eq('user_id', userId).eq('id', id);
  if (error) throw new Error(error.message);
}

export async function clearCalculations(userId: string): Promise<void> {
  const { error } = await supabase.from('calculations').delete().eq('user_id', userId);
  if (error) throw new Error(error.message);
}
