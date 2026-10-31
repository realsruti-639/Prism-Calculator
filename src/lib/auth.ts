import { supabase } from '@/lib/supabase';

const CONNECTION_ERROR = "Couldn't reach the sign-in service. Check your connection and try again.";

async function runAuthCall(call: () => Promise<{ error: { message: string } | null }>): Promise<string | null> {
  try {
    const { error } = await call();
    return error ? error.message : null;
  } catch {
    return CONNECTION_ERROR;
  }
}

export function signInWithEmail(email: string, password: string): Promise<string | null> {
  return runAuthCall(() => supabase.auth.signInWithPassword({ email, password }));
}

export function signUpWithEmail(email: string, password: string): Promise<string | null> {
  return runAuthCall(() => supabase.auth.signUp({ email, password }));
}

export function signOutAccount(): Promise<string | null> {
  return runAuthCall(() => supabase.auth.signOut());
}
