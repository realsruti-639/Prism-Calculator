import { useEffect, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { signOutAccount } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

type PlanState = { userId: string; isPro: boolean; failed: boolean };

export type PrismAuth = {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isPro: boolean;
  planFailed: boolean;
  signOut: () => Promise<string | null>;
};

export function usePrismAuth(): PrismAuth {
  const [session, setSession] = useState<Session | null>(null);
  const [sessionReady, setSessionReady] = useState(false);
  const [plan, setPlan] = useState<PlanState | null>(null);
  const userId = session?.user.id ?? null;

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setSessionReady(true);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (userId === null) return;
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('is_premium')
        .eq('id', userId)
        .maybeSingle();
      if (cancelled) return;
      const isPro = error === null && data?.is_premium === true;
      setPlan({ userId, isPro, failed: error !== null || data === null });
    })();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const planForUser = userId !== null && plan?.userId === userId ? plan : null;
  const isLoading = !sessionReady || (userId !== null && planForUser === null);

  return {
    user: session?.user ?? null,
    session,
    isLoading,
    isPro: planForUser?.isPro ?? false,
    planFailed: planForUser?.failed ?? false,
    signOut: signOutAccount,
  };
}
