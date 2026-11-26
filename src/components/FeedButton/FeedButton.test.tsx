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
        screen.getByRole('button', { name: /Ready in \d+:\d{2}/ })
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

    expect(await screen.findByText('Asking the feeder…')).toBeTruthy();

    await act(async () => {
      await jest.advanceTimersByTimeAsync(2000);
    });

    expect(
      await screen.findByText('Food dropped. Proof clip is in the feed below.')
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
        screen.getByRole('button', { name: /Ready in \d+:\d{2}/ })
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

  it('has no accessibility violations', async () => {
    jest.useRealTimers();
    const { container } = render(<FeedButton />);
    await waitFor(() => {
      expect(screen.getByRole('button', { name: feedName })).toBeEnabled();
    });
    expect(await axe(container)).toHaveNoViolations();
  });
});
