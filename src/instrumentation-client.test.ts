export {};

const ENV_KEYS = [
  'NEXT_PUBLIC_SENTRY_ENVIRONMENT',
  'NEXT_PUBLIC_SENTRY_DSN',
  'NEXT_PUBLIC_SENTRY_RELEASE',
] as const;

describe('instrumentation-client', () => {
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

  async function load(environment: string | undefined) {
    const init = jest.fn();
    const captureRouterTransitionStart = jest.fn();
    jest.doMock('@sentry/nextjs', () => ({
      init,
      captureRouterTransitionStart,
    }));
    if (environment === undefined) {
      delete process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT;
    } else {
      process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT = environment;
    }
    process.env.NEXT_PUBLIC_SENTRY_DSN = 'https://example.invalid/1';
    process.env.NEXT_PUBLIC_SENTRY_RELEASE = 'test-release';

    jest.resetModules();
    const client = await import('./instrumentation-client');
    return { init, captureRouterTransitionStart, client };
  }

  it('samples every trace outside production and leaves replay off', async () => {
    const { init, client, captureRouterTransitionStart } = await load('test');

    expect(init).toHaveBeenCalledWith({
      dsn: 'https://example.invalid/1',
      environment: 'test',
      release: 'test-release',
      tracesSampleRate: 1,
    });
    expect(client.onRouterTransitionStart).toBe(captureRouterTransitionStart);
  });

  it('samples one trace in ten in production', async () => {
    const { init } = await load('production');

    expect(init).toHaveBeenCalledWith({
      dsn: 'https://example.invalid/1',
      environment: 'production',
      release: 'test-release',
      tracesSampleRate: 0.1,
    });
  });

  it('treats the prod environment name as production', async () => {
    const { init } = await load('prod');

    expect(init).toHaveBeenCalledWith({
      dsn: 'https://example.invalid/1',
      environment: 'prod',
      release: 'test-release',
      tracesSampleRate: 0.1,
    });
  });

  it('uses an empty environment when the variable is unset', async () => {
    const { init } = await load(undefined);

    expect(init).toHaveBeenCalledWith({
      dsn: 'https://example.invalid/1',
      environment: '',
      release: 'test-release',
      tracesSampleRate: 1,
    });
  });
});
