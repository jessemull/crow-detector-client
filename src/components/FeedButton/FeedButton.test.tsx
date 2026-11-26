import React from 'react';
import { axe, toHaveNoViolations } from 'jest-axe';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import FeedButton, { formatCountdown } from './FeedButton';

expect.extend(toHaveNoViolations);

const originalApiBase = process.env.NEXT_PUBLIC_API_BASE_URL;
const feedName = 'Feed the Critters';

describe('formatCountdown', () => {
  it('formats remaining time as mm:ss', () => {
    expect(
      formatCountdown(
        '2026-11-22T20:10:00.000Z',
        Date.parse('2026-11-22T20:07:05.000Z')
      )
    ).toBe('2:55');
  });

  it('returns null when elapsed', () => {
    expect(
      formatCountdown(
        '2026-11-22T20:00:00.000Z',
        Date.parse('2026-11-22T20:00:00.000Z')
      )
    ).toBeNull();
  });

  it('returns null for an invalid timestamp', () => {
    expect(formatCountdown('not-a-date', Date.now())).toBeNull();
  });
});

describe('FeedButton', () => {
  const fetchMock = jest.fn();

  beforeEach(() => {
    process.env.NEXT_PUBLIC_API_BASE_URL = 'https://api-dev.example.com';
    global.fetch = fetchMock as unknown as typeof fetch;
    jest.useFakeTimers();
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        canFeed: true,
        cooldownEndsAt: null,
        lastFeedAt: null,
        lastFeedId: null,
      }),
    });
  });

  afterEach(() => {
    process.env.NEXT_PUBLIC_API_BASE_URL = originalApiBase;
    fetchMock.mockReset();
    jest.useRealTimers();
  });

  it('says the feeder is not configured when the API base is missing', async () => {
    delete process.env.NEXT_PUBLIC_API_BASE_URL;
    render(<FeedButton />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: feedName })).toBeEnabled();
    });

    fireEvent.click(screen.getByRole('button', { name: feedName }));

    expect(await screen.findByText('Feeder is not configured.')).toBeTruthy();
  });

  it('keeps the plunger disabled when /feeder/status is not ok', async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({ message: 'down' }),
    });

    render(<FeedButton />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: feedName })).toBeDisabled();
    });
  });

  it('keeps the plunger disabled when /feeder/status JSON is invalid', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ unexpected: true }),
    });

    render(<FeedButton />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: feedName })).toBeDisabled();
    });
  });

  it('disables the plunger and shows a countdown while cooling down', async () => {
    const endsAt = new Date(Date.now() + 125_000).toISOString();
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        canFeed: false,
        cooldownEndsAt: endsAt,
        lastFeedAt: null,
        lastFeedId: null,
      }),
    });

    render(<FeedButton />);

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /Feed Again in \d+:\d{2}/ })
      ).toBeDisabled();
    });
  });

  it('marks the feed ready and notifies the parent', async () => {
    const onFeedReady = jest.fn();
    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          canFeed: true,
          cooldownEndsAt: null,
          lastFeedAt: null,
          lastFeedId: null,
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: 'req-1',
          status: 'requested',
          cooldownEndsAt: '2099-01-01T00:10:00.000Z',
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: 'req-1',
          status: 'ready',
          proofClipUrl: 'https://cdn.example.com/feeder/proof.mp4?sig=1',
        }),
      });

    render(<FeedButton onFeedReady={onFeedReady} />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: feedName })).toBeEnabled();
    });

    fireEvent.click(screen.getByRole('button', { name: feedName }));

    expect(screen.queryByText('Asking the feeder…')).toBeNull();
    expect(
      await screen.findByRole('button', { name: 'Feeding…' })
    ).toBeTruthy();

    await act(async () => {
      await jest.advanceTimersByTimeAsync(2000);
    });

    expect(
      await screen.findByText('Food dropped. The clip is in the feed below.')
    ).toBeTruthy();
    expect(onFeedReady).toHaveBeenCalled();
    expect(document.querySelector('video')).toBeNull();
  });

  it('applies cooldownEndsAt from a 409 conflict', async () => {
    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          canFeed: true,
          cooldownEndsAt: null,
          lastFeedAt: null,
          lastFeedId: null,
        }),
      })
      .mockResolvedValueOnce({
        ok: false,
        status: 409,
        json: async () => ({
          message: 'Feed cooldown active. Try again in a few minutes.',
          cooldownEndsAt: new Date(Date.now() + 180_000).toISOString(),
        }),
      });

    render(<FeedButton />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: feedName })).toBeEnabled();
    });

    fireEvent.click(screen.getByRole('button', { name: feedName }));

    expect(
      await screen.findByText(
        'Feed cooldown active. Try again in a few minutes.'
      )
    ).toBeTruthy();

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /Feed Again in \d+:\d{2}/ })
      ).toBeDisabled();
    });
  });

  it('keeps a 400 cooldown fallback', async () => {
    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          canFeed: true,
          cooldownEndsAt: null,
          lastFeedAt: null,
          lastFeedId: null,
        }),
      })
      .mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({
          message: 'Feed cooldown active. Try again in a few minutes.',
          cooldownEndsAt: new Date(Date.now() + 90_000).toISOString(),
        }),
      });

    render(<FeedButton />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: feedName })).toBeEnabled();
    });

    fireEvent.click(screen.getByRole('button', { name: feedName }));

    expect(
      await screen.findByText(
        'Feed cooldown active. Try again in a few minutes.'
      )
    ).toBeTruthy();
  });

  it('renders a sleek molded plunger control', async () => {
    const { container } = render(<FeedButton />);
    await waitFor(() => {
      expect(screen.getByRole('button', { name: feedName })).toBeEnabled();
    });
    expect(screen.getByRole('button', { name: feedName }).className).toContain(
      'feed-plunger'
    );
    expect(container.querySelector('.feed-plunger__dome')).toBeTruthy();
  });

  it('reports a failed recording', async () => {
    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          canFeed: true,
          cooldownEndsAt: null,
          lastFeedAt: null,
          lastFeedId: null,
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: 'req-2',
          status: 'requested',
          cooldownEndsAt: '2099-01-01T00:10:00.000Z',
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 'req-2', status: 'failed' }),
      });

    render(<FeedButton />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: feedName })).toBeEnabled();
    });

    fireEvent.click(screen.getByRole('button', { name: feedName }));

    await act(async () => {
      await jest.advanceTimersByTimeAsync(2000);
    });

    expect(
      await screen.findByText('The feeder could not record that drop.')
    ).toBeTruthy();
  });

  it('reports when the feeder cannot be reached', async () => {
    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          canFeed: true,
          cooldownEndsAt: null,
          lastFeedAt: null,
          lastFeedId: null,
        }),
      })
      .mockRejectedValueOnce(new Error('offline'));

    render(<FeedButton />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: feedName })).toBeEnabled();
    });

    fireEvent.click(screen.getByRole('button', { name: feedName }));

    expect(
      await screen.findByText('The feeder could not be reached.')
    ).toBeTruthy();
  });

  it('rejects an invalid dispense create payload', async () => {
    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          canFeed: true,
          cooldownEndsAt: null,
          lastFeedAt: null,
          lastFeedId: null,
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ unexpected: true }),
      });

    render(<FeedButton />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: feedName })).toBeEnabled();
    });

    fireEvent.click(screen.getByRole('button', { name: feedName }));

    expect(await screen.findByText('The feeder could not start.')).toBeTruthy();
  });

  it('uses the fallback message when create fails without a body message', async () => {
    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          canFeed: true,
          cooldownEndsAt: null,
          lastFeedAt: null,
          lastFeedId: null,
        }),
      })
      .mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({}),
      });

    render(<FeedButton />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: feedName })).toBeEnabled();
    });

    fireEvent.click(screen.getByRole('button', { name: feedName }));

    expect(await screen.findByText('The feeder could not start.')).toBeTruthy();
  });

  it('skips non-ok dispense status polls until ready', async () => {
    const onFeedReady = jest.fn();
    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          canFeed: true,
          cooldownEndsAt: null,
          lastFeedAt: null,
          lastFeedId: null,
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: 'req-3',
          status: 'requested',
          cooldownEndsAt: '2099-01-01T00:10:00.000Z',
        }),
      })
      .mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({}),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 'req-3', status: 'recording' }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 'req-3', status: 'ready' }),
      });

    render(<FeedButton onFeedReady={onFeedReady} />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: feedName })).toBeEnabled();
    });

    fireEvent.click(screen.getByRole('button', { name: feedName }));

    await act(async () => {
      await jest.advanceTimersByTimeAsync(2000);
    });
    await act(async () => {
      await jest.advanceTimersByTimeAsync(2000);
    });
    await act(async () => {
      await jest.advanceTimersByTimeAsync(2000);
    });

    expect(
      await screen.findByText('Food dropped. The clip is in the feed below.')
    ).toBeTruthy();
    expect(onFeedReady).toHaveBeenCalled();
  });

  it('reports when the camera never finishes recording', async () => {
    const onFeedReady = jest.fn();
    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          canFeed: true,
          cooldownEndsAt: null,
          lastFeedAt: null,
          lastFeedId: null,
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: 'req-4',
          status: 'requested',
          cooldownEndsAt: '2099-01-01T00:10:00.000Z',
        }),
      })
      .mockResolvedValue({
        ok: true,
        json: async () => ({ id: 'req-4', status: 'recording' }),
      });

    render(<FeedButton onFeedReady={onFeedReady} />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: feedName })).toBeEnabled();
    });

    fireEvent.click(screen.getByRole('button', { name: feedName }));

    for (let i = 0; i < 32; i += 1) {
      await act(async () => {
        await jest.advanceTimersByTimeAsync(2000);
      });
    }

    expect(
      await screen.findByText(
        'Still waiting on the camera. Check the feed below in a moment.'
      )
    ).toBeTruthy();
    expect(onFeedReady).toHaveBeenCalled();
  });

  it('treats a non-JSON create body as a failed start', async () => {
    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          canFeed: true,
          cooldownEndsAt: null,
          lastFeedAt: null,
          lastFeedId: null,
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => {
          throw new Error('bad json');
        },
      });

    render(<FeedButton />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: feedName })).toBeEnabled();
    });

    fireEvent.click(screen.getByRole('button', { name: feedName }));

    expect(await screen.findByText('The feeder could not start.')).toBeTruthy();
  });

  it('continues after an unparseable dispense status body', async () => {
    const onFeedReady = jest.fn();
    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          canFeed: true,
          cooldownEndsAt: null,
          lastFeedAt: null,
          lastFeedId: null,
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: 'req-6',
          status: 'requested',
          cooldownEndsAt: '2099-01-01T00:10:00.000Z',
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ not: 'a status' }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 'req-6', status: 'ready' }),
      });

    render(<FeedButton onFeedReady={onFeedReady} />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: feedName })).toBeEnabled();
    });

    fireEvent.click(screen.getByRole('button', { name: feedName }));

    await act(async () => {
      await jest.advanceTimersByTimeAsync(2000);
    });
    await act(async () => {
      await jest.advanceTimersByTimeAsync(2000);
    });

    expect(
      await screen.findByText('Food dropped. The clip is in the feed below.')
    ).toBeTruthy();
    expect(onFeedReady).toHaveBeenCalled();
  });

  it('refreshes status when cooldown elapses', async () => {
    const endsAt = new Date(Date.now() + 1500).toISOString();
    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          canFeed: false,
          cooldownEndsAt: endsAt,
          lastFeedAt: null,
          lastFeedId: null,
        }),
      })
      .mockResolvedValue({
        ok: true,
        json: async () => ({
          canFeed: true,
          cooldownEndsAt: null,
          lastFeedAt: null,
          lastFeedId: null,
        }),
      });

    render(<FeedButton />);

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /Feed Again in \d+:\d{2}/ })
      ).toBeDisabled();
    });

    await act(async () => {
      await jest.advanceTimersByTimeAsync(2000);
    });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: feedName })).toBeEnabled();
    });
  });

  it('reports a timed-out dispense as unreachable', async () => {
    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          canFeed: true,
          cooldownEndsAt: null,
          lastFeedAt: null,
          lastFeedId: null,
        }),
      })
      .mockImplementation(
        (_url: RequestInfo, init?: RequestInit) =>
          new Promise((_resolve, reject) => {
            init?.signal?.addEventListener('abort', () => {
              reject(
                new DOMException('The operation was aborted.', 'AbortError')
              );
            });
          })
      );

    render(<FeedButton />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: feedName })).toBeEnabled();
    });

    fireEvent.click(screen.getByRole('button', { name: feedName }));

    await act(async () => {
      await jest.advanceTimersByTimeAsync(15_000);
    });

    expect(
      await screen.findByText('The feeder could not be reached.')
    ).toBeTruthy();
  });

  it('aborts an in-flight dispense poll on unmount', async () => {
    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          canFeed: true,
          cooldownEndsAt: null,
          lastFeedAt: null,
          lastFeedId: null,
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: 'req-5',
          status: 'requested',
          cooldownEndsAt: '2099-01-01T00:10:00.000Z',
        }),
      })
      .mockImplementation(() => new Promise(() => undefined));

    const { unmount } = render(<FeedButton />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: feedName })).toBeEnabled();
    });

    fireEvent.click(screen.getByRole('button', { name: feedName }));

    await act(async () => {
      await jest.advanceTimersByTimeAsync(2000);
    });

    const dispenseStatusCall = fetchMock.mock.calls.find((call) =>
      String(call[0]).includes('/feeder/dispense/req-5')
    );
    const signal = dispenseStatusCall?.[1]?.signal as AbortSignal | undefined;
    unmount();
    expect(signal?.aborted).toBe(true);
  });

  it('has no accessibility violations', async () => {
    jest.useRealTimers();
    const { container } = render(<FeedButton />);
    await waitFor(() => {
      expect(screen.getByRole('button', { name: feedName })).toBeEnabled();
    });
    expect(await axe(container)).toHaveNoViolations();
  });
});
