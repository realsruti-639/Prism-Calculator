import { useMemo, useState, type ReactNode } from 'react';
import { PricingModal } from '@/components/ui/PricingModal';
import { PaywallContext } from '@/hooks/usePaywall';
import { loadIsPro } from '@/lib/plan';

type PaywallProviderProps = {
  children: ReactNode;
};

export function PaywallProvider({ children }: PaywallProviderProps) {
  const [isPro] = useState(loadIsPro);
  const [featureName, setFeatureName] = useState<string | null>(null);

  const value = useMemo(
    () => ({ isPro, openPaywall: (name: string) => setFeatureName(name) }),
    [isPro],
  );

  return (
    <PaywallContext.Provider value={value}>
      {children}
      {featureName !== null && !isPro && (
        <PricingModal featureName={featureName} onClose={() => setFeatureName(null)} />
      )}
    </PaywallContext.Provider>
  );
}
