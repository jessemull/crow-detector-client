import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import PorchPage from './page';

jest.mock('@sentry/nextjs', () => ({
  captureException: jest.fn(),
}));

describe('Porch page', () => {
  const originalApiBase = process.env.NEXT_PUBLIC_API_BASE_URL;
  const originalFetch = global.fetch;

  beforeEach(() => {
    process.env.NEXT_PUBLIC_API_BASE_URL = 'https://api-dev.example.com';
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => [
        {
          name: 'clip-1.mp4',
          recordedAt: '2026-11-14T20:00:00.000Z',
          playbackUrl: 'https://cdn.example.com/clip-1.mp4',
          expiresAt: '2099-01-01T00:00:00.000Z',
        },
      ],
    }) as unknown as typeof fetch;
  });

  afterEach(() => {
    if (originalApiBase === undefined) {
      delete process.env.NEXT_PUBLIC_API_BASE_URL;
    } else {
      process.env.NEXT_PUBLIC_API_BASE_URL = originalApiBase;
    }
    global.fetch = originalFetch;
  });

  it('renders Shelter Cam visits', async () => {
    render(<PorchPage />);
    expect(
      screen.getByRole('heading', { level: 1, name: 'Shelter Cam' })
    ).toBeTruthy();
    await waitFor(() => {
      expect(
        screen.getByText(
          new Date('2026-11-14T20:00:00.000Z').toLocaleString('en-US', {
            weekday: 'long',
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
          })
        )
      ).toBeTruthy();
    });
  });
});
