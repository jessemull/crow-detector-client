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
  const recordedAt = '2026-11-22T20:10:00.000Z';
  const recordedLabel = new Date(recordedAt).toLocaleString('en-US', {
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
          id: 'visit-1',
          recordedAt,
          animalCount: 1,
          crowCount: 1,
          playbackUrl: 'https://cdn.example.com/feeder/visit-1.mp4?sig=1',
          expiresAt: '2099-01-01T00:00:00.000Z',
        },
      ],
    });
    global.fetch = fetchMock as unknown as typeof fetch;
  });

  afterEach(() => {
    process.env.NEXT_PUBLIC_API_BASE_URL = originalApiBase;
    fetchMock.mockReset();
  });

  it('lists feeder visits from the API', async () => {
    render(<FeederClips />);

    expect(
      screen.getByRole('heading', { level: 1, name: 'Feeder Cam' })
    ).toBeTruthy();

    const video = await screen.findByLabelText(
      `Feeder visit recorded ${recordedLabel}`
    );
    expect(video).toHaveAttribute(
      'src',
      'https://cdn.example.com/feeder/visit-1.mp4?sig=1'
    );
    expect(video).toHaveAttribute('preload', 'none');
    expect(screen.getByText('Latest')).toBeTruthy();
    expect(fetchMock).toHaveBeenCalledWith(
      'https://api-dev.example.com/feeder/clips',
      expect.objectContaining({ cache: 'no-store' })
    );
  });

  it('plays an S3 signed feeder visit', async () => {
    const playbackUrl =
      'https://crow-detector-images-prod.s3.us-west-2.amazonaws.com/feeder/visit-1.mp4?X-Amz-Signature=abc';
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => [
        {
          id: 'visit-1',
          recordedAt,
          animalCount: 1,
          crowCount: 0,
          playbackUrl,
          expiresAt: '2099-01-01T00:00:00.000Z',
        },
      ],
    });

    render(<FeederClips />);

    expect(
      await screen.findByLabelText(`Feeder visit recorded ${recordedLabel}`)
    ).toHaveAttribute('src', playbackUrl);
  });

  it('shows a status line when the API base is missing', async () => {
    delete process.env.NEXT_PUBLIC_API_BASE_URL;
    render(<FeederClips />);

    expect(
      await screen.findByText(
        'Feeder Cam is not configured yet. Visits will show up after the camera service is connected.'
      )
    ).toBeTruthy();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('shows a status line when the API fails', async () => {
    fetchMock.mockResolvedValue({ ok: false, status: 500 });

    render(<FeederClips />);

    expect(
      await screen.findByText("Can't load visits right now.")
    ).toBeTruthy();
  });

  it('shows an empty status line when there are no visits', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => [],
    });

    render(<FeederClips />);

    expect(await screen.findByText('No visits yet.')).toBeTruthy();
  });

  it('rejects clips whose playback URL is not an allowed https host', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => [
        {
          id: 'visit-1',
          recordedAt,
          animalCount: 1,
          crowCount: 0,
          playbackUrl: 'https://evil.example/feeder/visit-1.mp4',
          expiresAt: '2099-01-01T00:00:00.000Z',
        },
      ],
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
        screen.getByLabelText(`Feeder visit recorded ${recordedLabel}`)
      ).toBeTruthy();
    });

    expect(await axe(container)).toHaveNoViolations();
  });
});
