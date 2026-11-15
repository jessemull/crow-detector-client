import React from 'react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PorchClips from './PorchClips';

expect.extend(toHaveNoViolations);

const originalApiBase = process.env.NEXT_PUBLIC_API_BASE_URL;

describe('PorchClips', () => {
  const fetchMock = jest.fn();

  beforeEach(() => {
    process.env.NEXT_PUBLIC_API_BASE_URL = 'https://api-dev.example.com';
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => [
        {
          name: 'clip-1.mp4',
          recordedAt: '2026-11-14T20:00:00.000Z',
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
  });

  it('renders porch clips from the API', async () => {
    render(<PorchClips />);

    expect(
      screen.getByRole('heading', { level: 1, name: 'Porch Clips' })
    ).toBeTruthy();

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { level: 2, name: 'clip-1.mp4' })
      ).toBeTruthy();
    });

    expect(screen.getByRole('button', { name: 'Refresh clips' })).toBeTruthy();
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
        'Could not load clips'
      );
    });
  });

  it('shows an empty state when there are no clips', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => [],
    });

    render(<PorchClips />);

    await waitFor(() => {
      expect(screen.getByText('No porch clips yet.')).toBeTruthy();
    });
  });

  it('reloads clips when refresh is pressed', async () => {
    const user = userEvent.setup();
    render(<PorchClips />);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'clip-1.mp4' })).toBeTruthy();
    });

    await user.click(screen.getByRole('button', { name: 'Refresh clips' }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(2);
    });
  });

  it('has no accessibility violations after load', async () => {
    const { container } = render(<PorchClips />);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'clip-1.mp4' })).toBeTruthy();
    });

    expect(await axe(container)).toHaveNoViolations();
  });
});
