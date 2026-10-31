export const AI_FREE_DAILY_LIMIT = 5;

const AI_USAGE_STORAGE_KEY = 'prism-calculator-ai-usage';

type StoredAiUsage = { day: string; count: number };

function dayKey(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

export function loadAiUsageCount(now: Date = new Date()): number {
  try {
    const raw = window.localStorage.getItem(AI_USAGE_STORAGE_KEY);
    if (raw === null) return 0;
    const parsed = JSON.parse(raw) as Partial<StoredAiUsage>;
    if (parsed.day !== dayKey(now) || typeof parsed.count !== 'number') return 0;
    return parsed.count;
  } catch {
    return 0;
  }
}

export function saveAiUsageCount(count: number, now: Date = new Date()): void {
  try {
    const stored: StoredAiUsage = { day: dayKey(now), count };
    window.localStorage.setItem(AI_USAGE_STORAGE_KEY, JSON.stringify(stored));
  } catch {
    return;
  }
}
