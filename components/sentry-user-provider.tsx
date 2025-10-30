'use client';

import { useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';
import { supabase } from '@/lib/supabase/client';

function setSentryUserFromSession(session: {
  user?: {
    id: string;
    email?: string | null;
    user_metadata?: Record<string, unknown>;
    app_metadata?: Record<string, unknown>;
  };
} | null) {
  const user = session?.user;

  if (!user) {
    Sentry.setUser(null);
    return;
  }

  const metadata = user.user_metadata ?? {};
  const appMetadata = user.app_metadata ?? {};

  Sentry.setUser({
    id: user.id,
    email: user.email ?? undefined,
    username:
      typeof metadata.full_name === 'string' ? metadata.full_name : undefined,
    segment:
      typeof appMetadata.role === 'string'
        ? (appMetadata.role as string)
        : undefined,
  });
}

export function SentryUserProvider() {
  useEffect(() => {
    if (!supabase) {
      Sentry.setUser(null);
      return;
    }

    let isMounted = true;

    void supabase.auth.getSession().then(({ data }) => {
      if (!isMounted) return;
      setSentryUserFromSession(data?.session ?? null);
    });

    const {
      data: authListener,
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSentryUserFromSession(session ?? null);
    });

    return () => {
      isMounted = false;
      authListener?.subscription.unsubscribe();
    };
  }, []);

  return null;
}
