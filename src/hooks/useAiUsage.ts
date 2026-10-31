import { useState } from 'react';
import { loadAiUsageCount, saveAiUsageCount } from '@/lib/aiUsage';

export function useAiUsage() {
  const [count, setCount] = useState(() => loadAiUsageCount());

  const recordRun = () => {
    const next = count + 1;
    setCount(next);
    saveAiUsageCount(next);
  };

  return { count, recordRun };
}
