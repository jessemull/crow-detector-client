export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const Sentry = await import('@sentry/nextjs');
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.SENTRY_ENVIRONMENT,
      tracesSampleRate: 1.0,
    });
  }
}

export const onRequestError = (error: Error) => {
  const Sentry = require('@sentry/nextjs');
  Sentry.captureRequestError(error);
};
