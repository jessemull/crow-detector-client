export async function register() {
  if (process.env.NEXT_RUNTIME === 'edge') {
    const Sentry = await import('@sentry/nextjs');
    Sentry.init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      environment: process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT,
      tracesSampleRate: 1.0,
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0,
    });
  }
}

// Add required Sentry hooks
export const onRouterTransitionStart = (context: any) => {
  const Sentry = require('@sentry/nextjs');
  Sentry.captureRouterTransitionStart(context);
};
