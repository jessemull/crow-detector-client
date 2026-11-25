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
const recordedLabel = 'Saturday, Nov 14, 8:00 PM';

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

    render(<PorchClips />);

    expect(await screen.findByText('Loading…')).toBeTruthy();
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

    render(<PorchClips />);

    await waitFor(() => {
      expect(screen.getByText("Can't load visits right now.")).toBeTruthy();
    });
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('shows an empty status line when there are no visits', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => [],
    });

    render(<PorchClips />);

    await waitFor(() => {
      expect(screen.getByText('No visits yet.')).toBeTruthy();
    });
    expect(screen.queryByText('0 visits')).toBeNull();
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

  it('has no accessibility violations after load', async () => {
    const { container } = render(<PorchClips />);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: recordedLabel })).toBeTruthy();
    });

    expect(await axe(container)).toHaveNoViolations();
  });
});
