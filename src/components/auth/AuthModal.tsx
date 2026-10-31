import { useState, type FormEvent } from 'react';
import { X } from 'lucide-react';
import { signInWithEmail, signUpWithEmail } from '@/lib/auth';

type AuthModalProps = {
  onClose: () => void;
};

type AuthMode = 'signin' | 'signup';

const FIELD_CLASSES =
  'w-full rounded-xl border border-neon-cyan/30 bg-ink-950 px-4 py-3 text-zinc-100 transition placeholder:text-zinc-600 focus:border-prism focus:outline-none focus:ring-2 focus:ring-prism/30';

export function AuthModal({ onClose }: AuthModalProps) {
  const [mode, setMode] = useState<AuthMode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const isSignUp = mode === 'signup';

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPending(true);
    setMessage(null);
    const error = isSignUp ? await signUpWithEmail(email, password) : await signInWithEmail(email, password);
    setPending(false);
    if (error) {
      setMessage(error);
      return;
    }
    onClose();
  };

  const switchMode = () => {
    setMode(isSignUp ? 'signin' : 'signup');
    setMessage(null);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-zinc-950/80 p-4 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
        onClick={(event) => event.stopPropagation()}
        className="w-full max-w-md rounded-3xl border border-zinc-800 bg-zinc-950/80 p-6 shadow-2xl backdrop-blur-md sm:p-8"
      >
        <div className="mb-8 flex items-start justify-between gap-4">
          <div className="flex flex-col gap-2">
            <h2 id="auth-modal-title" className="font-mono text-sm tracking-widest text-prism glow-text">
              {isSignUp ? 'CREATE ACCOUNT' : 'SIGN IN'}
            </h2>
            <p className="text-sm text-zinc-400">
              {isSignUp ? 'Keep your calculations and Pro access with you.' : 'Welcome back to Prism.'}
            </p>
          </div>
          <button
            type="button"
            aria-label="Close account form"
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-zinc-700 text-zinc-300 transition hover:border-zinc-500 hover:text-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-cyan"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form key={mode} onSubmit={handleSubmit} className="animate-result-in flex flex-col gap-5">
          <label className="flex flex-col gap-2">
            <span className="text-xs uppercase tracking-widest text-neon-cyan/70">Email</span>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className={FIELD_CLASSES}
            />
          </label>
          <label className="flex flex-col gap-2">
            <span className="text-xs uppercase tracking-widest text-neon-cyan/70">Password</span>
            <input
              type="password"
              required
              minLength={6}
              autoComplete={isSignUp ? 'new-password' : 'current-password'}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className={FIELD_CLASSES}
            />
            {isSignUp && <span className="text-xs text-zinc-500">At least 6 characters.</span>}
          </label>

          <div className="min-h-[1.5rem]">
            {message && (
              <p role="alert" className="text-sm text-rose-400">
                {message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={pending}
            className="rounded-full border border-prism/70 bg-prism/10 px-6 py-3 text-sm font-semibold tracking-wide text-prism shadow-[0_0_18px_-6px_rgb(var(--prism-rgb)/0.9)] transition hover:bg-prism/20 hover:shadow-[0_0_28px_-4px_rgb(var(--prism-rgb)/1)] disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-cyan"
          >
            {pending ? 'Please wait...' : isSignUp ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-zinc-400">
          {isSignUp ? 'Already have an account?' : 'New to Prism?'}{' '}
          <button
            type="button"
            onClick={switchMode}
            className="font-medium text-neon-cyan underline-offset-4 transition hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-cyan"
          >
            {isSignUp ? 'Sign In' : 'Create Account'}
          </button>
        </p>
      </div>
    </div>
  );
}
