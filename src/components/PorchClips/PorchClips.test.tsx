import React from 'react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { act, render, screen, waitFor } from '@testing-library/react';
import PorchClips from './PorchClips';

expect.extend(toHaveNoViolations);

const originalApiBase = process.env.NEXT_PUBLIC_API_BASE_URL;

describe('PorchClips', () => {
  const fetchMock = jest.fn();
  const recordedAt = '2026-11-14T20:00:00.000Z';
  const recordedLabel = new Date(recordedAt).toLocaleString(undefined, {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });

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
    process.env.NEXT_PUBLIC_API_BASE_URL = originalApiBase;
    fetchMock.mockReset();
    jest.useRealTimers();
  });

  it('renders Shelter Cam visits from the API', async () => {
    render(<PorchClips />);

    expect(
      screen.getByRole('heading', { level: 1, name: 'Shelter Cam' })
    ).toBeTruthy();

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
  });

  it('shows a configuration error when the API base is missing', async () => {
    delete process.env.NEXT_PUBLIC_API_BASE_URL;
    render(<PorchClips />);

    await waitFor(() => {
      expect(screen.getByRole('alert').textContent).toContain('not configured');
    });
  });

  it('shows an error when the API fails', async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({}),
    });

    render(<PorchClips />);

    await waitFor(() => {
      expect(screen.getByRole('alert').textContent).toContain(
        'Could not load visits'
      );
    });
  });

  it('shows an empty state when there are no visits', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => [],
    });

    render(<PorchClips />);

    await waitFor(() => {
      expect(screen.getByText('No visits yet.')).toBeTruthy();
    });
    expect(screen.getByText('0 visits')).toBeTruthy();
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

  it('has no accessibility violations after load', async () => {
    const { container } = render(<PorchClips />);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: recordedLabel })).toBeTruthy();
    });

    expect(await axe(container)).toHaveNoViolations();
  });
});
