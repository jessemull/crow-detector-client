import React from 'react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { render, screen, waitFor } from '@testing-library/react';
import FeederClips from './FeederClips';

expect.extend(toHaveNoViolations);

jest.mock('@sentry/nextjs', () => ({
  captureException: jest.fn(),
}));

const originalApiBase = process.env.NEXT_PUBLIC_API_BASE_URL;

describe('FeederClips', () => {
  const fetchMock = jest.fn();
  const fedAt = '2026-11-22T20:00:00.000Z';
  const recordedAt = '2026-11-22T20:10:00.000Z';
  const fedLabel = new Date(fedAt).toLocaleString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
  const recordedLabel = new Date(recordedAt).toLocaleString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });

  const feedsPayload = {
    feeds: [
      {
        id: 'feed-1',
        fedAt,
        proof: {
          playbackUrl: 'https://cdn.example.com/feeder/proof.mp4?sig=1',
          expiresAt: '2099-01-01T00:00:00.000Z',
        },
        visits: [
          {
            id: 'visit-1',
            recordedAt,
            animalCount: 1,
            crowCount: 1,
            playbackUrl: 'https://cdn.example.com/feeder/visit-1.mp4?sig=1',
            expiresAt: '2099-01-01T00:00:00.000Z',
          },
        ],
      },
    ],
    ungroupedVisits: [],
  };

  beforeEach(() => {
    process.env.NEXT_PUBLIC_API_BASE_URL = 'https://api-dev.example.com';
    fetchMock.mockImplementation(async (url: RequestInfo) => {
      const href = String(url);
      if (href.endsWith('/feeder/status')) {
        return {
          ok: true,
          json: async () => ({
            canFeed: true,
            cooldownEndsAt: null,
            lastFeedAt: null,
            lastFeedId: null,
          }),
        };
      }
      if (href.endsWith('/feeder/feeds')) {
        return {
          ok: true,
          json: async () => feedsPayload,
        };
      }
      return { ok: false, status: 404, json: async () => ({}) };
    });
    global.fetch = fetchMock as unknown as typeof fetch;
  });

  afterEach(() => {
    process.env.NEXT_PUBLIC_API_BASE_URL = originalApiBase;
    fetchMock.mockReset();
  });

  it('lists feed sections with proof first', async () => {
    render(<FeederClips />);

    expect(
      screen.getByRole('heading', { level: 1, name: 'Feeder Cam' })
    ).toBeTruthy();
    expect(screen.getByText(/Press the plunger when it is ready/)).toBeTruthy();

    expect(
      await screen.findByRole('heading', { name: `Fed ${fedLabel}` })
    ).toBeTruthy();
    expect(
      await screen.findByLabelText(`Feed proof recorded ${fedLabel}`)
    ).toHaveAttribute('src', 'https://cdn.example.com/feeder/proof.mp4?sig=1');
    expect(screen.getByText('Proof')).toBeTruthy();
    expect(
      screen.getByLabelText(`Feeder visit recorded ${recordedLabel}`)
    ).toBeTruthy();
    expect(fetchMock).toHaveBeenCalledWith(
      'https://api-dev.example.com/feeder/feeds',
      expect.objectContaining({ cache: 'no-store' })
    );
  });

  it('shows empty visits under a feed', async () => {
    fetchMock.mockImplementation(async (url: RequestInfo) => {
      const href = String(url);
      if (href.endsWith('/feeder/status')) {
        return {
          ok: true,
          json: async () => ({
            canFeed: true,
            cooldownEndsAt: null,
            lastFeedAt: null,
            lastFeedId: null,
          }),
        };
      }
      return {
        ok: true,
        json: async () => ({
          feeds: [
            {
              id: 'feed-1',
              fedAt,
              proof: {
                playbackUrl: 'https://cdn.example.com/feeder/proof.mp4?sig=1',
                expiresAt: '2099-01-01T00:00:00.000Z',
              },
              visits: [],
            },
          ],
          ungroupedVisits: [],
        }),
      };
    });

    render(<FeederClips />);

    expect(await screen.findByText('No visitors yet.')).toBeTruthy();
  });

  it('lists ungrouped visits separately', async () => {
    fetchMock.mockImplementation(async (url: RequestInfo) => {
      const href = String(url);
      if (href.endsWith('/feeder/status')) {
        return {
          ok: true,
          json: async () => ({
            canFeed: true,
            cooldownEndsAt: null,
            lastFeedAt: null,
            lastFeedId: null,
          }),
        };
      }
      return {
        ok: true,
        json: async () => ({
          feeds: [],
          ungroupedVisits: [
            {
              id: 'visit-9',
              recordedAt,
              animalCount: 1,
              crowCount: 0,
              playbackUrl: 'https://cdn.example.com/feeder/visit-9.mp4?sig=1',
              expiresAt: '2099-01-01T00:00:00.000Z',
            },
          ],
        }),
      };
    });

    render(<FeederClips />);

    expect(
      await screen.findByRole('heading', { name: 'Other visits' })
    ).toBeTruthy();
  });

  it('shows a status line when the API base is missing', async () => {
    delete process.env.NEXT_PUBLIC_API_BASE_URL;
    render(<FeederClips />);

    expect(
      await screen.findByText(
        'Feeder Cam is not configured yet. Visits will show up after the camera service is connected.'
      )
    ).toBeTruthy();
  });

  it('shows a status line when the API fails', async () => {
    fetchMock.mockImplementation(async (url: RequestInfo) => {
      const href = String(url);
      if (href.endsWith('/feeder/status')) {
        return {
          ok: true,
          json: async () => ({
            canFeed: true,
            cooldownEndsAt: null,
            lastFeedAt: null,
            lastFeedId: null,
          }),
        };
      }
      return { ok: false, status: 500 };
    });

    render(<FeederClips />);

    expect(
      await screen.findByText("Can't load visits right now.")
    ).toBeTruthy();
  });

  it('shows an empty status line when there are no feeds', async () => {
    fetchMock.mockImplementation(async (url: RequestInfo) => {
      const href = String(url);
      if (href.endsWith('/feeder/status')) {
        return {
          ok: true,
          json: async () => ({
            canFeed: true,
            cooldownEndsAt: null,
            lastFeedAt: null,
            lastFeedId: null,
          }),
        };
      }
      return {
        ok: true,
        json: async () => ({ feeds: [], ungroupedVisits: [] }),
      };
    });

    render(<FeederClips />);

    expect(await screen.findByText('No feeds yet.')).toBeTruthy();
  });

  it('rejects feeds whose playback URL is not an allowed https host', async () => {
    fetchMock.mockImplementation(async (url: RequestInfo) => {
      const href = String(url);
      if (href.endsWith('/feeder/status')) {
        return {
          ok: true,
          json: async () => ({
            canFeed: true,
            cooldownEndsAt: null,
            lastFeedAt: null,
            lastFeedId: null,
          }),
        };
      }
      return {
        ok: true,
        json: async () => ({
          feeds: [
            {
              id: 'feed-1',
              fedAt,
              proof: {
                playbackUrl: 'https://evil.example/feeder/proof.mp4',
                expiresAt: '2099-01-01T00:00:00.000Z',
              },
              visits: [],
            },
          ],
          ungroupedVisits: [],
        }),
      };
    });

    render(<FeederClips />);

    expect(
      await screen.findByText("Can't load visits right now.")
    ).toBeTruthy();
  });

  it('has no accessibility violations after load', async () => {
    const { container } = render(<FeederClips />);

    await waitFor(() => {
      expect(
        screen.getByLabelText(`Feed proof recorded ${fedLabel}`)
      ).toBeTruthy();
    });

    expect(await axe(container)).toHaveNoViolations();
  });
});
