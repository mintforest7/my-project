import { useState } from 'react';
import { supabase } from '../lib/supabase';

export function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setBusy(true);
    setMessage('');

    const request =
      mode === 'signup'
        ? supabase.auth.signUp({ email, password })
        : supabase.auth.signInWithPassword({ email, password });

    const { error } = await request;
    if (error) {
      setMessage(error.message);
    } else if (mode === 'signup') {
      setMessage('Account created. Check your email if confirmation is enabled.');
    }

    setBusy(false);
  }

  async function handleGoogleSignIn(): Promise<void> {
    setBusy(true);
    setMessage('');

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    });

    if (error) {
      setMessage(error.message);
      setBusy(false);
    }
  }

  return (
    <section className="auth-panel screen-panel centered">
      <p className="eyebrow">Cloud Save</p>
      <h2>{mode === 'signin' ? 'Sign In' : 'Create Account'}</h2>
      <form className="auth-form" onSubmit={handleSubmit}>
        <input
          autoComplete="email"
          onChange={(event) => setEmail(event.target.value)}
          placeholder="email"
          required
          type="email"
          value={email}
        />
        <input
          autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
          minLength={6}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="password"
          required
          type="password"
          value={password}
        />
        <button disabled={busy} type="submit">
          {busy ? 'Please wait...' : mode === 'signin' ? 'Sign In' : 'Create Account'}
        </button>
      </form>
      <div className="auth-divider">
        <span>or</span>
      </div>
      <button className="google-auth-button" disabled={busy} onClick={handleGoogleSignIn} type="button">
        <span aria-hidden="true">G</span>
        Continue with Google
      </button>
      {message && <p className="theme-prompt">{message}</p>}
      <button className="quiet" onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}>
        {mode === 'signin' ? 'Need an account?' : 'Already have an account?'}
      </button>
    </section>
  );
}
