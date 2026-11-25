/**
 * @jest-environment node
 */

describe('instrumentation', () => {
  it('initializes Sentry on the node runtime', async () => {
    const init = jest.fn();
    jest.doMock('@sentry/nextjs', () => ({
      init,
      captureRequestError: jest.fn(),
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
  });
});
