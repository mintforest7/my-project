import { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { Auth } from './components/Auth';
import { StyleRushGame } from './components/style-rush/StyleRushGame';
import { supabase } from './lib/supabase';

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSession(data.session);
      setLoading(false);
    });

    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!active) return;
      setSession(nextSession);
      setLoading(false);
    });

    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return <main className="style-rush-shell">Loading...</main>;
  }

  if (!session?.user) {
    return (
      <main className="style-rush-shell">
        <Auth />
      </main>
    );
  }

  return <StyleRushGame user={session.user} />;
}
