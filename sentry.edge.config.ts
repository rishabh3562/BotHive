import * as Sentry from '@sentry/nextjs';

const dsn = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;
const isEnabled = Boolean(dsn);

Sentry.init({
  dsn: dsn || undefined,
  enabled: isEnabled,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
});
