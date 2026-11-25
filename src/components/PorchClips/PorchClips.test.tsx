import React from 'react';
import { axe, toHaveNoViolations } from 'jest-axe';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import * as Sentry from '@sentry/nextjs';
import PorchClips from './PorchClips';

expect.extend(toHaveNoViolations);

jest.mock('@sentry/nextjs', () => ({
  captureException: jest.fn(),
}));

const originalApiBase = process.env.NEXT_PUBLIC_API_BASE_URL;
const recordedLabel = new Date('2026-11-14T20:00:00.000Z').toLocaleString(
  'en-US',
  {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }
);

describe('PorchClips', () => {
  const fetchMock = jest.fn();
  const recordedAt = '2026-11-14T20:00:00.000Z';

  beforeEach(() => {
    process.env.NEXT_PUBLIC_API_BASE_URL = 'https://api-dev.example.com';
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => [
        {
          name: 'clip-1.mp4',
          recordedAt,
          playbackUrl: 'https://cdn.example.com/clip-1.mp4?sig=1',
          expiresAt: '2026-11-14T20:05:00.000Z',
        },
      ],
    });
    global.fetch = fetchMock as unknown as typeof fetch;
  });

  afterEach(() => {
    if (originalApiBase === undefined) {
      delete process.env.NEXT_PUBLIC_API_BASE_URL;
    } else {
      process.env.NEXT_PUBLIC_API_BASE_URL = originalApiBase;
    }
    fetchMock.mockReset();
    jest.useRealTimers();
  });

  it('renders Shelter Cam visits from the API', async () => {
    const { container } = render(<PorchClips />);

    expect(
      screen.getByRole('heading', { level: 1, name: 'Shelter Cam' })
    ).toBeTruthy();
    expect(container.querySelector('section')?.className).toContain(
      'bg-cc-canvas'
    );

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { level: 2, name: recordedLabel })
      ).toBeTruthy();
    });

    expect(screen.getByText('1 visit')).toBeTruthy();
    expect(screen.getByText('Latest')).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Refresh' })).toBeNull();
    expect(
      screen.getByLabelText(`Shelter visit recorded ${recordedLabel}`)
    ).toBeTruthy();
    expect(screen.getByRole('article').className).toContain('bg-white');
  });

  it('shows visit-sized skeleton cards while loading', async () => {
    let resolveFetch: ((value: unknown) => void) | undefined;
    fetchMock.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveFetch = resolve;
        })
    );

    const { container } = render(<PorchClips />);

    expect(await screen.findByText('Loading…')).toBeTruthy();
    expect(await axe(container)).toHaveNoViolations();
    expect(document.querySelectorAll('article')).toHaveLength(2);
    expect(document.querySelector('.aspect-video')).toBeTruthy();
    expect(screen.getByText('Loading…')).toBeTruthy();
    expect(
      screen.getByRole('heading', { level: 1, name: 'Shelter Cam' })
        .parentElement?.className
    ).toContain('mb-10');

    await act(async () => {
      resolveFetch?.({
        ok: true,
        json: async () => [
          {
            name: 'clip-1.mp4',
            recordedAt,
            playbackUrl: 'https://cdn.example.com/clip-1.mp4?sig=1',
            expiresAt: '2026-11-14T20:05:00.000Z',
          },
        ],
      });
    });

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { level: 2, name: recordedLabel })
      ).toBeTruthy();
    });
  });

  it('shows a status line when the API base is missing', async () => {
    delete process.env.NEXT_PUBLIC_API_BASE_URL;
    render(<PorchClips />);

    await waitFor(() => {
      expect(
        screen.getByText(
          'Shelter Cam is not configured yet. Visits will show up after the camera service is connected.'
        )
      ).toBeTruthy();
    });
    expect(screen.queryByRole('alert')).toBeNull();
    expect(
      screen.getByRole('heading', { level: 1, name: 'Shelter Cam' })
        .parentElement?.className
    ).toContain('mb-4');
  });

  it('shows a status line when the API fails', async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({}),
    });

    const { container } = render(<PorchClips />);

    await waitFor(() => {
      expect(screen.getByText("Can't load visits right now.")).toBeTruthy();
    });
    expect(screen.queryByRole('alert')).toBeNull();
    expect(await axe(container)).toHaveNoViolations();
  });

  it('shows an empty status line when there are no visits', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => [],
    });

    const { container } = render(<PorchClips />);

    await waitFor(() => {
      expect(screen.getByText('No visits yet.')).toBeTruthy();
    });
    expect(screen.queryByText('0 visits')).toBeNull();
    expect(await axe(container)).toHaveNoViolations();
  });

  it('polls for new visits while the tab is visible', async () => {
    jest.useFakeTimers();
    render(<PorchClips />);

    await act(async () => {
      jest.advanceTimersByTime(0);
    });

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    await act(async () => {
      jest.advanceTimersByTime(45_000);
    });

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(2);
    });
  });

  it('keeps the same playback URL across silent polls when the clip set is unchanged', async () => {
    jest.useFakeTimers();
    const firstUrl = 'https://cdn.example.com/clip-1.mp4?sig=1';
    const refreshedUrl = 'https://cdn.example.com/clip-1.mp4?sig=2';

    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [
          {
            name: 'clip-1.mp4',
            recordedAt,
            playbackUrl: firstUrl,
            expiresAt: '2099-01-01T00:00:00.000Z',
          },
        ],
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [
          {
            name: 'clip-1.mp4',
            recordedAt,
            playbackUrl: refreshedUrl,
            expiresAt: '2099-01-01T00:05:00.000Z',
          },
        ],
      });

    render(<PorchClips />);

    await act(async () => {
      jest.advanceTimersByTime(0);
    });

    await waitFor(() => {
      expect(
        screen.getByLabelText(`Shelter visit recorded ${recordedLabel}`)
      ).toHaveAttribute('src', firstUrl);
    });

    await act(async () => {
      jest.advanceTimersByTime(45_000);
    });

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(2);
    });

    expect(
      screen.getByLabelText(`Shelter visit recorded ${recordedLabel}`)
    ).toHaveAttribute('src', firstUrl);
  });

  it('keeps clips and shows a refresh warning when a silent poll fails', async () => {
    jest.useFakeTimers();
    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [
          {
            name: 'clip-1.mp4',
            recordedAt,
            playbackUrl: 'https://cdn.example.com/clip-1.mp4',
            expiresAt: '2099-01-01T00:00:00.000Z',
          },
        ],
      })
      .mockRejectedValueOnce(new Error('network down'));

    render(<PorchClips />);

    await act(async () => {
      jest.advanceTimersByTime(0);
    });

    await waitFor(() => {
      expect(screen.getByText(recordedLabel)).toBeTruthy();
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
    expect(screen.getByText(recordedLabel)).toBeTruthy();
  });

  it('does not preload video bytes until playback is requested', async () => {
    render(<PorchClips />);

    await waitFor(() => {
      expect(
        screen.getByLabelText(`Shelter visit recorded ${recordedLabel}`)
      ).toBeTruthy();
    });

    expect(
      screen.getByLabelText(`Shelter visit recorded ${recordedLabel}`)
    ).toHaveAttribute('preload', 'none');
  });

  it('rejects a porch payload that is not a list of clips', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ unexpected: true }),
    });

    render(<PorchClips />);

    await waitFor(() => {
      expect(screen.getByText("Can't load visits right now.")).toBeTruthy();
    });
    expect(screen.queryByText('No visits yet.')).toBeNull();
  });

  it('aborts an in-flight porch request on unmount', async () => {
    jest.useFakeTimers();
    fetchMock.mockImplementation(() => new Promise(() => undefined));
    const { unmount } = render(<PorchClips />);

    await act(async () => {
      jest.advanceTimersByTime(0);
    });

    const signal = fetchMock.mock.calls[0]?.[1]?.signal as AbortSignal;
    unmount();
    expect(signal.aborted).toBe(true);
  });

  it('shows a playback error when the visit video fails', async () => {
    render(<PorchClips />);
    const video = await screen.findByLabelText(
      `Shelter visit recorded ${recordedLabel}`
    );
    fireEvent.error(video);
    expect(
      screen.getByText(
        'This visit can’t be played. It will be replaced on the next refresh.'
      )
    ).toBeTruthy();
  });

  it('loads a later visit when it scrolls into view', async () => {
    const instances: {
      observe: jest.Mock;
      disconnect: jest.Mock;
      callback: IntersectionObserverCallback;
    }[] = [];

    class FakeIntersectionObserver {
      observe = jest.fn();
      disconnect = jest.fn();
      unobserve = jest.fn();
      takeRecords = () => [];
      constructor(callback: IntersectionObserverCallback) {
        instances.push({
          observe: this.observe,
          disconnect: this.disconnect,
          callback,
        });
      }
    }

    const originalObserver = window.IntersectionObserver;
    window.IntersectionObserver =
      FakeIntersectionObserver as unknown as typeof IntersectionObserver;

    const olderRecordedAt = '2026-11-13T18:00:00.000Z';
    const olderLabel = new Date(olderRecordedAt).toLocaleString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
    const olderUrl = 'https://cdn.example.com/clip-2.mp4';

    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => [
        {
          name: 'clip-1.mp4',
          recordedAt,
          playbackUrl: 'https://cdn.example.com/clip-1.mp4?sig=1',
          expiresAt: '2026-11-14T20:05:00.000Z',
        },
        {
          name: 'clip-2.mp4',
          recordedAt: olderRecordedAt,
          playbackUrl: olderUrl,
          expiresAt: '2026-11-13T18:05:00.000Z',
        },
      ],
    });

    const { unmount } = render(<PorchClips />);

    const later = await screen.findByLabelText(
      `Shelter visit recorded ${olderLabel}`
    );
    expect(later).not.toHaveAttribute('src');
    expect(instances).toHaveLength(1);
    expect(instances[0]?.observe).toHaveBeenCalled();

    act(() => {
      instances[0]?.callback(
        [{ isIntersecting: false } as IntersectionObserverEntry],
        instances[0] as unknown as IntersectionObserver
      );
    });
    expect(later).not.toHaveAttribute('src');

    act(() => {
      instances[0]?.callback(
        [{ isIntersecting: true } as IntersectionObserverEntry],
        instances[0] as unknown as IntersectionObserver
      );
    });
    expect(later).toHaveAttribute('src', olderUrl);

    unmount();
    expect(instances[0]?.disconnect).toHaveBeenCalled();
    window.IntersectionObserver = originalObserver;
  });

  it('shows an error when the visit request times out', async () => {
    jest.useFakeTimers();
    (Sentry.captureException as jest.Mock).mockClear();
    fetchMock.mockImplementation(
      (_url: string, init?: RequestInit) =>
        new Promise((_resolve, reject) => {
          init?.signal?.addEventListener('abort', () => {
            reject(init.signal?.reason);
          });
        })
    );

    render(<PorchClips />);

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

    render(<PorchClips />);

    await act(async () => {
      jest.advanceTimersByTime(0);
    });
    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    Object.defineProperty(document, 'visibilityState', {
      configurable: true,
      get: () => 'hidden',
    });

    await act(async () => {
      jest.advanceTimersByTime(45_000);
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);

    await act(async () => {
      jest.advanceTimersByTime(45_000);
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);

    if (descriptor) {
      Object.defineProperty(Document.prototype, 'visibilityState', descriptor);
    }
    delete (document as { visibilityState?: string }).visibilityState;
  });

  it('waits longer after repeated refresh failures', async () => {
    jest.useFakeTimers();
    fetchMock.mockRejectedValue(new Error('network down'));

    render(<PorchClips />);

    await act(async () => {
      jest.advanceTimersByTime(0);
    });
    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    await act(async () => {
      jest.advanceTimersByTime(45_000);
    });
    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(2);
    });

    await act(async () => {
      jest.advanceTimersByTime(45_000);
    });
    expect(fetchMock).toHaveBeenCalledTimes(2);

    await act(async () => {
      jest.advanceTimersByTime(45_000);
    });
    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(3);
    });
  });

  it('shows an unparseable recorded time as-is', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => [
        {
          name: 'clip-1.mp4',
          recordedAt: 'not-a-date',
          playbackUrl: 'https://cdn.example.com/clip-1.mp4',
          expiresAt: '2099-01-01T00:00:00.000Z',
        },
      ],
    });

    render(<PorchClips />);

    expect(
      await screen.findByRole('heading', { level: 2, name: 'not-a-date' })
    ).toBeTruthy();
  });

  it('rejects clips whose playback URL is not an allowed https host', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => [
        {
          name: 'clip-1.mp4',
          recordedAt,
          playbackUrl: 'http://cdn.example.com/clip-1.mp4',
          expiresAt: '2099-01-01T00:00:00.000Z',
        },
        null,
        {
          name: 'clip-2.mp4',
          recordedAt,
          playbackUrl: 'not a url',
          expiresAt: '2099-01-01T00:00:00.000Z',
        },
      ],
    });

    render(<PorchClips />);

    expect(
      await screen.findByText("Can't load visits right now.")
    ).toBeTruthy();
  });

  it('plays a CloudFront visit', async () => {
    const playbackUrl = 'https://d111111abcdef8.cloudfront.net/clip-1.mp4';
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => [
        {
          name: 'clip-1.mp4',
          recordedAt,
          playbackUrl,
          expiresAt: '2099-01-01T00:00:00.000Z',
        },
      ],
    });

    render(<PorchClips />);

    expect(
      await screen.findByLabelText(`Shelter visit recorded ${recordedLabel}`)
    ).toHaveAttribute('src', playbackUrl);
  });

  it('replaces a failed visit when the next poll brings a new link', async () => {
    jest.useFakeTimers();
    const failedUrl = 'https://cdn.example.com/clip-1.mp4?sig=1';
    const freshUrl = 'https://cdn.example.com/clip-1.mp4?sig=2';
    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [
          {
            name: 'clip-1.mp4',
            recordedAt,
            playbackUrl: failedUrl,
            expiresAt: '2099-01-01T00:00:00.000Z',
          },
        ],
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [
          {
            name: 'clip-1.mp4',
            recordedAt,
            playbackUrl: freshUrl,
            expiresAt: '2099-01-01T00:05:00.000Z',
          },
        ],
      });

    render(<PorchClips />);
    await act(async () => {
      jest.advanceTimersByTime(0);
    });
    const video = await screen.findByLabelText(
      `Shelter visit recorded ${recordedLabel}`
    );
    fireEvent.error(video);

    await act(async () => {
      jest.advanceTimersByTime(45_000);
    });

    await waitFor(() => {
      expect(
        screen.getByLabelText(`Shelter visit recorded ${recordedLabel}`)
      ).toHaveAttribute('src', freshUrl);
    });
  });

  it('shows a newly recorded visit on the next poll', async () => {
    jest.useFakeTimers();
    const newerAt = '2026-11-14T21:00:00.000Z';
    const newerLabel = new Date(newerAt).toLocaleString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [
          {
            name: 'clip-1.mp4',
            recordedAt,
            playbackUrl: 'https://cdn.example.com/clip-1.mp4',
            expiresAt: '2099-01-01T00:00:00.000Z',
          },
        ],
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [
          {
            name: 'clip-2.mp4',
            recordedAt: newerAt,
            playbackUrl: 'https://cdn.example.com/clip-2.mp4',
            expiresAt: '2099-01-01T00:05:00.000Z',
          },
        ],
      });

    render(<PorchClips />);
    await act(async () => {
      jest.advanceTimersByTime(0);
    });
    expect(await screen.findByText(recordedLabel)).toBeTruthy();

    await act(async () => {
      jest.advanceTimersByTime(45_000);
    });

    expect(await screen.findByText(newerLabel)).toBeTruthy();
  });

  it('loads a later visit immediately when IntersectionObserver is missing', async () => {
    const original = window.IntersectionObserver;
    Object.defineProperty(window, 'IntersectionObserver', {
      configurable: true,
      writable: true,
      value: undefined,
    });
    expect(typeof IntersectionObserver).toBe('undefined');

    const olderRecordedAt = '2026-11-13T18:00:00.000Z';
    const olderLabel = new Date(olderRecordedAt).toLocaleString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
    const olderUrl = 'https://cdn.example.com/clip-2.mp4';
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => [
        {
          name: 'clip-1.mp4',
          recordedAt,
          playbackUrl: 'https://cdn.example.com/clip-1.mp4',
          expiresAt: '2099-01-01T00:00:00.000Z',
        },
        {
          name: 'clip-2.mp4',
          recordedAt: olderRecordedAt,
          playbackUrl: olderUrl,
          expiresAt: '2099-01-01T00:05:00.000Z',
        },
      ],
    });

    render(<PorchClips />);

    await waitFor(() => {
      expect(
        screen.getByLabelText(`Shelter visit recorded ${olderLabel}`)
      ).toHaveAttribute('src', olderUrl);
    });

    Object.defineProperty(window, 'IntersectionObserver', {
      configurable: true,
      writable: true,
      value: original,
    });
  });

  it('ignores an abort that is not the request timeout', async () => {
    jest.useFakeTimers();
    (Sentry.captureException as jest.Mock).mockClear();
    fetchMock.mockRejectedValue(
      new DOMException('The operation was aborted.', 'AbortError')
    );

    render(<PorchClips />);
    await act(async () => {
      jest.advanceTimersByTime(0);
    });

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalled();
    });
    expect(screen.queryByText("Can't load visits right now.")).toBeNull();
    expect(Sentry.captureException).not.toHaveBeenCalled();
  });

  it('refreshes when the tab becomes visible again', async () => {
    jest.useFakeTimers();
    render(<PorchClips />);
    await act(async () => {
      jest.advanceTimersByTime(0);
    });
    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    document.dispatchEvent(new Event('visibilitychange'));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(2);
    });
  });

  it('rejects an https playback host outside the allowlist', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => [
        {
          name: 'clip-1.mp4',
          recordedAt,
          playbackUrl: 'https://evil.example/clip-1.mp4',
          expiresAt: '2099-01-01T00:00:00.000Z',
        },
      ],
    });

    render(<PorchClips />);

    expect(
      await screen.findByText("Can't load visits right now.")
    ).toBeTruthy();
  });

  it('lists the newest visit first when the payload is oldest-first', async () => {
    const older = '2026-11-14T18:00:00.000Z';
    const newer = '2026-11-14T20:00:00.000Z';
    const labelFor = (value: string) =>
      new Date(value).toLocaleString('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      });
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => [
        {
          name: 'old.mp4',
          recordedAt: older,
          playbackUrl: 'https://cdn.example.com/old.mp4',
          expiresAt: '2099-01-01T00:00:00.000Z',
        },
        {
          name: 'new.mp4',
          recordedAt: newer,
          playbackUrl: 'https://cdn.example.com/new.mp4',
          expiresAt: '2099-01-01T00:00:00.000Z',
        },
      ],
    });

    render(<PorchClips />);

    const headings = await screen.findAllByRole('heading', { level: 2 });
    expect(headings[0]).toHaveTextContent(labelFor(newer));
    expect(headings[1]).toHaveTextContent(labelFor(older));
  });

  it('replaces a signed URL that expires inside the refresh window', async () => {
    jest.useFakeTimers();
    const soon = new Date(Date.now() + 30_000).toISOString();
    const later = new Date(Date.now() + 3_600_000).toISOString();
    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [
          {
            name: 'clip-1.mp4',
            recordedAt,
            playbackUrl: 'https://cdn.example.com/clip-1.mp4?sig=old',
            expiresAt: soon,
          },
        ],
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [
          {
            name: 'clip-1.mp4',
            recordedAt,
            playbackUrl: 'https://cdn.example.com/clip-1.mp4?sig=new',
            expiresAt: later,
          },
        ],
      });

    render(<PorchClips />);
    await act(async () => {
      jest.advanceTimersByTime(0);
    });
    await waitFor(() => {
      expect(document.querySelector('video')).toHaveAttribute(
        'src',
        'https://cdn.example.com/clip-1.mp4?sig=old'
      );
    });

    await act(async () => {
      jest.advanceTimersByTime(45_000);
    });

    await waitFor(() => {
      expect(document.querySelector('video')).toHaveAttribute(
        'src',
        'https://cdn.example.com/clip-1.mp4?sig=new'
      );
    });
  });

  it('does not abort the first load when the tab becomes visible', async () => {
    jest.useFakeTimers();
    let resolveFetch: (value: unknown) => void = () => {};
    fetchMock.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveFetch = resolve;
        })
    );

    render(<PorchClips />);
    await act(async () => {
      jest.advanceTimersByTime(0);
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);

    document.dispatchEvent(new Event('visibilitychange'));
    expect(fetchMock).toHaveBeenCalledTimes(1);

    await act(async () => {
      resolveFetch({
        ok: true,
        json: async () => [
          {
            name: 'clip-1.mp4',
            recordedAt,
            playbackUrl: 'https://cdn.example.com/clip-1.mp4?sig=1',
            expiresAt: '2099-01-01T00:00:00.000Z',
          },
        ],
      });
    });

    expect(
      await screen.findByRole('heading', { name: recordedLabel })
    ).toBeTruthy();
    expect(screen.queryByText('No visits yet.')).toBeNull();
  });

  it('moves focus to the message when a visit cannot play', async () => {
    render(<PorchClips />);
    const video = await screen.findByLabelText(/Shelter visit recorded/);
    fireEvent.error(video);

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('This visit can’t be played.');
    expect(alert).toHaveFocus();
  });

  it('has no accessibility violations after load', async () => {
    const { container } = render(<PorchClips />);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: recordedLabel })).toBeTruthy();
    });

    expect(await axe(container)).toHaveNoViolations();
  });
});
