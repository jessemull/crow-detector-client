import React from 'react';
import * as Sentry from '@sentry/nextjs';
import { axe, toHaveNoViolations } from 'jest-axe';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import FeederClips from './FeederClips';

expect.extend(toHaveNoViolations);

jest.mock('@sentry/nextjs', () => ({
  captureException: jest.fn(),
}));

const originalApiBase = process.env.NEXT_PUBLIC_API_BASE_URL;

const okStatus = {
  ok: true,
  json: async () => ({
    canFeed: true,
    cooldownEndsAt: null,
    lastFeedAt: null,
    lastFeedId: null,
  }),
};

const feedsCallCount = (fetchMock: jest.Mock) =>
  fetchMock.mock.calls.filter((call) =>
    String(call[0]).endsWith('/feeder/feeds')
  ).length;

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
        return okStatus;
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
    jest.useRealTimers();
  });

  it('lists feed sections with the feed clip first', async () => {
    render(<FeederClips />);

    expect(
      screen.getByRole('heading', { level: 1, name: 'Feeder Cam' })
    ).toBeTruthy();
    expect(screen.getByText('Trigger the Feeder')).toBeTruthy();
    expect(screen.getByText('Watch the Visitors')).toBeTruthy();

    expect(
      await screen.findByRole('heading', { name: `Fed ${fedLabel}` })
    ).toBeTruthy();
    expect(
      await screen.findByLabelText(`Feed recorded ${fedLabel}`)
    ).toHaveAttribute('src', 'https://cdn.example.com/feeder/proof.mp4?sig=1');
    expect(screen.getByText('Feed')).toBeTruthy();
    expect(
      screen.getByLabelText(`Feeder visit recorded ${recordedLabel}`)
    ).toBeTruthy();
    expect(fetchMock).toHaveBeenCalledWith(
      'https://api-dev.example.com/feeder/feeds',
      expect.objectContaining({ cache: 'no-store' })
    );
  });

  it('omits an empty-visits message under a feed', async () => {
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

    expect(
      await screen.findByRole('heading', { name: `Fed ${fedLabel}` })
    ).toBeTruthy();
    expect(screen.queryByText('No visitors yet.')).toBeNull();
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

  it('polls for new feeds while the tab is visible', async () => {
    jest.useFakeTimers();
    render(<FeederClips />);

    await act(async () => {
      jest.advanceTimersByTime(0);
    });

    await waitFor(() => {
      expect(feedsCallCount(fetchMock)).toBe(1);
    });

    await act(async () => {
      jest.advanceTimersByTime(45_000);
    });

    await waitFor(() => {
      expect(feedsCallCount(fetchMock)).toBe(2);
    });
  });

  it('keeps the same proof URL across silent polls when the feed set is unchanged', async () => {
    jest.useFakeTimers();
    const firstUrl = 'https://cdn.example.com/feeder/proof.mp4?sig=1';
    const refreshedUrl = 'https://cdn.example.com/feeder/proof.mp4?sig=2';
    let feedsCalls = 0;

    fetchMock.mockImplementation(async (url: RequestInfo) => {
      const href = String(url);
      if (href.endsWith('/feeder/status')) {
        return okStatus;
      }
      if (href.endsWith('/feeder/feeds')) {
        feedsCalls += 1;
        return {
          ok: true,
          json: async () => ({
            feeds: [
              {
                id: 'feed-1',
                fedAt,
                proof: {
                  playbackUrl: feedsCalls === 1 ? firstUrl : refreshedUrl,
                  expiresAt:
                    feedsCalls === 1
                      ? '2099-01-01T00:00:00.000Z'
                      : '2099-01-01T00:05:00.000Z',
                },
                visits: [],
              },
            ],
            ungroupedVisits: [],
          }),
        };
      }
      return { ok: false, status: 404, json: async () => ({}) };
    });

    render(<FeederClips />);

    await act(async () => {
      jest.advanceTimersByTime(0);
    });

    await waitFor(() => {
      expect(
        screen.getByLabelText(`Feed recorded ${fedLabel}`)
      ).toHaveAttribute('src', firstUrl);
    });

    await act(async () => {
      jest.advanceTimersByTime(45_000);
    });

    await waitFor(() => {
      expect(feedsCallCount(fetchMock)).toBe(2);
    });

    expect(screen.getByLabelText(`Feed recorded ${fedLabel}`)).toHaveAttribute(
      'src',
      firstUrl
    );
  });

  it('keeps feeds and shows a refresh warning when a silent poll fails', async () => {
    jest.useFakeTimers();
    let feedsCalls = 0;
    fetchMock.mockImplementation(async (url: RequestInfo) => {
      const href = String(url);
      if (href.endsWith('/feeder/status')) {
        return okStatus;
      }
      if (href.endsWith('/feeder/feeds')) {
        feedsCalls += 1;
        if (feedsCalls === 1) {
          return { ok: true, json: async () => feedsPayload };
        }
        throw new Error('network down');
      }
      return { ok: false, status: 404, json: async () => ({}) };
    });

    render(<FeederClips />);

    await act(async () => {
      jest.advanceTimersByTime(0);
    });

    await waitFor(() => {
      expect(screen.getByText(`Fed ${fedLabel}`)).toBeTruthy();
    });

    await act(async () => {
      jest.advanceTimersByTime(45_000);
    });

    await waitFor(() => {
      expect(
        screen.getByText(
          /Could not refresh visits\. Showing the last loaded list\./
        )
      ).toBeTruthy();
    });
    expect(Sentry.captureException).toHaveBeenCalled();
    expect(screen.getByText(`Fed ${fedLabel}`)).toBeTruthy();
  });

  it('does not preload video bytes until playback is requested', async () => {
    render(<FeederClips />);

    await waitFor(() => {
      expect(screen.getByLabelText(`Feed recorded ${fedLabel}`)).toBeTruthy();
    });

    expect(screen.getByLabelText(`Feed recorded ${fedLabel}`)).toHaveAttribute(
      'preload',
      'none'
    );
  });

  it('rejects a feeder payload that is not a feeds object', async () => {
    fetchMock.mockImplementation(async (url: RequestInfo) => {
      const href = String(url);
      if (href.endsWith('/feeder/status')) {
        return okStatus;
      }
      return {
        ok: true,
        json: async () => ({ unexpected: true }),
      };
    });

    render(<FeederClips />);

    await waitFor(() => {
      expect(screen.getByText("Can't load visits right now.")).toBeTruthy();
    });
    expect(screen.queryByText('No feeds yet.')).toBeNull();
  });

  it('aborts an in-flight feeder request on unmount', async () => {
    jest.useFakeTimers();
    fetchMock.mockImplementation((url: RequestInfo) => {
      const href = String(url);
      if (href.endsWith('/feeder/status')) {
        return Promise.resolve(okStatus);
      }
      return new Promise(() => undefined);
    });
    const { unmount } = render(<FeederClips />);

    await act(async () => {
      jest.advanceTimersByTime(0);
    });

    await waitFor(() => {
      expect(feedsCallCount(fetchMock)).toBe(1);
    });

    const feedsCall = fetchMock.mock.calls.find((call) =>
      String(call[0]).endsWith('/feeder/feeds')
    );
    const signal = feedsCall?.[1]?.signal as AbortSignal;
    unmount();
    expect(signal.aborted).toBe(true);
  });

  it('shows a playback error when the feed video fails', async () => {
    render(<FeederClips />);
    const video = await screen.findByLabelText(`Feed recorded ${fedLabel}`);
    fireEvent.error(video);
    expect(
      screen.getByText(
        'This visit can’t be played. It will be replaced on the next refresh.'
      )
    ).toBeTruthy();
  });

  it('shows an error when the feeds request times out', async () => {
    jest.useFakeTimers();
    (Sentry.captureException as jest.Mock).mockClear();
    fetchMock.mockImplementation((url: RequestInfo, init?: RequestInit) => {
      const href = String(url);
      if (href.endsWith('/feeder/status')) {
        return Promise.resolve(okStatus);
      }
      return new Promise((_resolve, reject) => {
        init?.signal?.addEventListener('abort', () => {
          reject(init.signal?.reason);
        });
      });
    });

    render(<FeederClips />);

    await act(async () => {
      jest.advanceTimersByTime(0);
    });
    await act(async () => {
      jest.advanceTimersByTime(15_000);
    });

    await waitFor(() => {
      expect(screen.getByText("Can't load visits right now.")).toBeTruthy();
    });
    expect(Sentry.captureException).not.toHaveBeenCalled();
  });

  it('does not poll while the tab is hidden', async () => {
    jest.useFakeTimers();
    const descriptor = Object.getOwnPropertyDescriptor(
      Document.prototype,
      'visibilityState'
    );
    Object.defineProperty(document, 'visibilityState', {
      configurable: true,
      get: () => 'visible',
    });

    render(<FeederClips />);

    await act(async () => {
      jest.advanceTimersByTime(0);
    });
    await waitFor(() => {
      expect(feedsCallCount(fetchMock)).toBe(1);
    });

    Object.defineProperty(document, 'visibilityState', {
      configurable: true,
      get: () => 'hidden',
    });

    await act(async () => {
      jest.advanceTimersByTime(45_000);
    });
    expect(feedsCallCount(fetchMock)).toBe(1);

    await act(async () => {
      jest.advanceTimersByTime(45_000);
    });
    expect(feedsCallCount(fetchMock)).toBe(1);

    if (descriptor) {
      Object.defineProperty(Document.prototype, 'visibilityState', descriptor);
    }
    delete (document as { visibilityState?: string }).visibilityState;
  });

  it('waits longer after repeated refresh failures', async () => {
    jest.useFakeTimers();
    fetchMock.mockImplementation(async (url: RequestInfo) => {
      const href = String(url);
      if (href.endsWith('/feeder/status')) {
        return okStatus;
      }
      throw new Error('network down');
    });

    render(<FeederClips />);

    await act(async () => {
      jest.advanceTimersByTime(0);
    });
    await waitFor(() => {
      expect(feedsCallCount(fetchMock)).toBe(1);
    });

    await act(async () => {
      jest.advanceTimersByTime(45_000);
    });
    await waitFor(() => {
      expect(feedsCallCount(fetchMock)).toBe(2);
    });

    await act(async () => {
      jest.advanceTimersByTime(45_000);
    });
    expect(feedsCallCount(fetchMock)).toBe(2);

    await act(async () => {
      jest.advanceTimersByTime(45_000);
    });
    await waitFor(() => {
      expect(feedsCallCount(fetchMock)).toBe(3);
    });
  });

  it('refreshes when the tab becomes visible again', async () => {
    jest.useFakeTimers();
    let visibility: DocumentVisibilityState = 'visible';
    Object.defineProperty(document, 'visibilityState', {
      configurable: true,
      get: () => visibility,
    });

    render(<FeederClips />);

    await act(async () => {
      jest.advanceTimersByTime(0);
    });
    await waitFor(() => {
      expect(feedsCallCount(fetchMock)).toBe(1);
    });

    visibility = 'hidden';
    document.dispatchEvent(new Event('visibilitychange'));

    visibility = 'visible';
    document.dispatchEvent(new Event('visibilitychange'));

    await waitFor(() => {
      expect(feedsCallCount(fetchMock)).toBe(2);
    });

    delete (document as { visibilityState?: string }).visibilityState;
  });

  it('plays an S3 signed feed clip', async () => {
    fetchMock.mockImplementation(async (url: RequestInfo) => {
      const href = String(url);
      if (href.endsWith('/feeder/status')) {
        return okStatus;
      }
      return {
        ok: true,
        json: async () => ({
          feeds: [
            {
              id: 'feed-s3',
              fedAt,
              proof: {
                playbackUrl:
                  'https://bucket.s3-us-west-2.amazonaws.com/feeder/proof.mp4?X-Amz-Signature=1',
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
      await screen.findByLabelText(`Feed recorded ${fedLabel}`)
    ).toHaveAttribute(
      'src',
      'https://bucket.s3-us-west-2.amazonaws.com/feeder/proof.mp4?X-Amz-Signature=1'
    );
  });

  it('replaces a signed URL that expires inside the refresh window', async () => {
    jest.useFakeTimers();
    const soon = new Date(Date.now() + 30_000).toISOString();
    const later = '2099-01-01T00:00:00.000Z';
    const firstUrl = 'https://cdn.example.com/feeder/proof.mp4?sig=1';
    const freshUrl = 'https://cdn.example.com/feeder/proof.mp4?sig=2';
    let feedsCalls = 0;

    fetchMock.mockImplementation(async (url: RequestInfo) => {
      const href = String(url);
      if (href.endsWith('/feeder/status')) {
        return okStatus;
      }
      feedsCalls += 1;
      return {
        ok: true,
        json: async () => ({
          feeds: [
            {
              id: 'feed-1',
              fedAt,
              proof: {
                playbackUrl: feedsCalls === 1 ? firstUrl : freshUrl,
                expiresAt: feedsCalls === 1 ? soon : later,
              },
              visits: [],
            },
          ],
          ungroupedVisits: [],
        }),
      };
    });

    render(<FeederClips />);

    await act(async () => {
      jest.advanceTimersByTime(0);
    });

    await waitFor(() => {
      expect(
        screen.getByLabelText(`Feed recorded ${fedLabel}`)
      ).toHaveAttribute('src', firstUrl);
    });

    await act(async () => {
      jest.advanceTimersByTime(45_000);
    });

    await waitFor(() => {
      expect(
        screen.getByLabelText(`Feed recorded ${fedLabel}`)
      ).toHaveAttribute('src', freshUrl);
    });
  });

  it('lists feeds newest first when the payload is oldest-first', async () => {
    const olderFedAt = '2026-11-22T19:00:00.000Z';
    const newerFedAt = '2026-11-22T21:00:00.000Z';
    fetchMock.mockImplementation(async (url: RequestInfo) => {
      const href = String(url);
      if (href.endsWith('/feeder/status')) {
        return okStatus;
      }
      return {
        ok: true,
        json: async () => ({
          feeds: [
            {
              id: 'feed-old',
              fedAt: olderFedAt,
              proof: null,
              visits: [],
            },
            {
              id: 'feed-new',
              fedAt: newerFedAt,
              proof: null,
              visits: [],
            },
          ],
          ungroupedVisits: [],
        }),
      };
    });

    render(<FeederClips />);

    const newerLabel = new Date(newerFedAt).toLocaleString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
    const olderLabel = new Date(olderFedAt).toLocaleString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });

    const headings = await screen.findAllByRole('heading', { level: 2 });
    const feedHeadings = headings.filter((heading) =>
      heading.textContent?.startsWith('Fed ')
    );
    expect(feedHeadings[0]?.textContent).toBe(`Fed ${newerLabel}`);
    expect(feedHeadings[1]?.textContent).toBe(`Fed ${olderLabel}`);
  });

  it('shows a feed section with a null proof and no visit videos', async () => {
    fetchMock.mockImplementation(async (url: RequestInfo) => {
      const href = String(url);
      if (href.endsWith('/feeder/status')) {
        return okStatus;
      }
      return {
        ok: true,
        json: async () => ({
          feeds: [
            {
              id: 'feed-1',
              fedAt,
              proof: null,
              visits: [],
            },
          ],
          ungroupedVisits: [],
        }),
      };
    });

    render(<FeederClips />);

    expect(
      await screen.findByRole('heading', { name: `Fed ${fedLabel}` })
    ).toBeTruthy();
    expect(screen.queryByLabelText(`Feed recorded ${fedLabel}`)).toBeNull();
  });

  it('has no accessibility violations after load', async () => {
    const { container } = render(<FeederClips />);

    await waitFor(() => {
      expect(screen.getByLabelText(`Feed recorded ${fedLabel}`)).toBeTruthy();
    });

    expect(await axe(container)).toHaveNoViolations();
  });
});
