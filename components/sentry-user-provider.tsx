'use client';

import { useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';
import { useAuth } from '@/lib/auth';

export function SentryUserProvider() {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      Sentry.setUser(null);
      return;
    }

    Sentry.setUser({
      id: user.id,
      email: user.email,
      username: user.name,
      segment: user.role,
    });
  }, [user]);

  return null;
}
