/**
 * @jest-environment node
 */

export {};

const ENV_KEYS = ['NEXT_RUNTIME', 'SENTRY_DSN', 'SENTRY_ENVIRONMENT'] as const;

describe('instrumentation', () => {
  const originalEnv = new Map<string, string | undefined>(
    ENV_KEYS.map((key) => [key, process.env[key]])
  );

  afterEach(() => {
    for (const key of ENV_KEYS) {
      const original = originalEnv.get(key);
      if (original === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = original;
      }
    }
    jest.resetModules();
    jest.dontMock('@sentry/nextjs');
  });

  it('initializes Sentry on the node runtime', async () => {
    const init = jest.fn();
    const captureRequestError = jest.fn();
    jest.doMock('@sentry/nextjs', () => ({
      init,
      captureRequestError,
    }));
    process.env.NEXT_RUNTIME = 'nodejs';
    process.env.SENTRY_DSN = 'https://example.invalid/1';
    process.env.SENTRY_ENVIRONMENT = 'test';

    jest.resetModules();
    const instrumentation = await import('./instrumentation');
    await instrumentation.register();

    expect(init).toHaveBeenCalledWith({
      dsn: 'https://example.invalid/1',
      environment: 'test',
      tracesSampleRate: 1.0,
    });
    expect(instrumentation.onRequestError).toBe(captureRequestError);
  });

  it('skips Sentry init when the runtime is not node', async () => {
    const init = jest.fn();
    jest.doMock('@sentry/nextjs', () => ({
      init,
      captureRequestError: jest.fn(),
    }));
    process.env.NEXT_RUNTIME = 'edge';

    jest.resetModules();
    const instrumentation = await import('./instrumentation');
    await instrumentation.register();

    expect(init).not.toHaveBeenCalled();
  });
});
