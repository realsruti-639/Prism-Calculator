import { useMemo, useState, type ReactNode } from 'react';
import { PricingModal } from '@/components/ui/PricingModal';
import { PaywallContext } from '@/hooks/usePaywall';

type PaywallProviderProps = {
  isPro: boolean;
  children: ReactNode;
};

export function PaywallProvider({ isPro, children }: PaywallProviderProps) {
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
