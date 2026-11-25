describe('instrumentation-client', () => {
  it('samples every trace outside production', async () => {
    const init = jest.fn();
    jest.doMock('@sentry/nextjs', () => ({
      init,
      captureRouterTransitionStart: jest.fn(),
    }));
    process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT = 'test';
    process.env.NEXT_PUBLIC_SENTRY_DSN = 'https://example.invalid/1';

    jest.resetModules();
    await import('./instrumentation-client');

    expect(init).toHaveBeenCalledWith(
      expect.objectContaining({ tracesSampleRate: 1 })
    );
  });
});
