import { createContext, useContext } from 'react';

export type PaywallContextValue = {
  isPro: boolean;
  openPaywall: (featureName: string) => void;
};

export const PaywallContext = createContext<PaywallContextValue | null>(null);

export function usePaywall(): PaywallContextValue {
  const value = useContext(PaywallContext);
  if (!value) throw new Error('usePaywall must be used inside PaywallProvider');
  return value;
}
