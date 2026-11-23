import React from 'react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { render, screen, waitFor } from '@testing-library/react';
import FeederClips from './FeederClips';

expect.extend(toHaveNoViolations);

const originalApiBase = process.env.NEXT_PUBLIC_API_BASE_URL;

describe('FeederClips', () => {
  const fetchMock = jest.fn();

  beforeEach(() => {
    process.env.NEXT_PUBLIC_API_BASE_URL = 'https://api-dev.example.com';
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => [
        {
          id: 'visit-1',
          recordedAt: '2026-11-22T20:10:00.000Z',
          animalCount: 1,
          crowCount: 1,
          playbackUrl: 'https://cdn.example.com/feeder/visit-1.mp4?sig=1',
          expiresAt: '2026-11-22T20:15:00.000Z',
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

    await waitFor(() => {
      expect(document.querySelector('video')).toBeTruthy();
    });
    const video = document.querySelector('video');
    expect(video).toHaveAttribute(
      'src',
      'https://cdn.example.com/feeder/visit-1.mp4?sig=1'
    );
    expect(video).toHaveAttribute('preload', 'none');
    expect(fetchMock).toHaveBeenCalledWith(
      'https://api-dev.example.com/feeder/clips'
    );
  });

  it('shows a status line when the API base is missing', async () => {
    delete process.env.NEXT_PUBLIC_API_BASE_URL;
    render(<FeederClips />);

    expect(
      await screen.findByText('Feeder Cam is not configured.')
    ).toBeTruthy();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('shows a status line when the API fails', async () => {
    fetchMock.mockResolvedValue({ ok: false, status: 500 });

    render(<FeederClips />);

    expect(await screen.findByText('Feeder Cam could not load.')).toBeTruthy();
  });

  it('shows an empty status line when there are no visits', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => [],
    });

    render(<FeederClips />);

    expect(await screen.findByText('No feeder visits yet.')).toBeTruthy();
  });

  it('has no accessibility violations after load', async () => {
    const { container } = render(<FeederClips />);

    await waitFor(() => {
      expect(document.querySelector('video')).toBeTruthy();
    });

    expect(await axe(container)).toHaveNoViolations();
  });
});
