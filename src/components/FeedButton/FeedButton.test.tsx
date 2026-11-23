import React from 'react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { act, fireEvent, render, screen } from '@testing-library/react';
import FeedButton from './FeedButton';

expect.extend(toHaveNoViolations);

const originalApiBase = process.env.NEXT_PUBLIC_API_BASE_URL;

describe('FeedButton', () => {
  const fetchMock = jest.fn();

  beforeEach(() => {
    process.env.NEXT_PUBLIC_API_BASE_URL = 'https://api-dev.example.com';
    global.fetch = fetchMock as unknown as typeof fetch;
    jest.useFakeTimers();
  });

  afterEach(() => {
    process.env.NEXT_PUBLIC_API_BASE_URL = originalApiBase;
    fetchMock.mockReset();
    jest.useRealTimers();
  });

  it('says the feeder is not configured when the API base is missing', async () => {
    delete process.env.NEXT_PUBLIC_API_BASE_URL;
    render(<FeedButton />);

    fireEvent.click(screen.getByRole('button', { name: 'Feeder' }));

    expect(await screen.findByText('Feeder is not configured.')).toBeTruthy();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('plays the proof clip once the dispense is ready', async () => {
    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 'req-1', status: 'requested' }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: 'req-1',
          status: 'ready',
          proofClipUrl: 'https://cdn.example.com/feeder/proof.mp4?sig=1',
        }),
      });

    render(<FeedButton />);
    fireEvent.click(screen.getByRole('button', { name: 'Feeder' }));

    expect(await screen.findByText('Asking the feeder…')).toBeTruthy();

    await act(async () => {
      await jest.advanceTimersByTimeAsync(2000);
    });

    await screen.findByRole('button', { name: 'Feeder' });
    const video = document.querySelector('video');
    expect(video).toHaveAttribute(
      'src',
      'https://cdn.example.com/feeder/proof.mp4?sig=1'
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      'https://api-dev.example.com/feeder/dispense',
      { method: 'POST' }
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      'https://api-dev.example.com/feeder/dispense/req-1'
    );
  });

  it('explains the cooldown when the API rejects the request', async () => {
    fetchMock.mockResolvedValueOnce({ ok: false, status: 400 });

    render(<FeedButton />);
    fireEvent.click(screen.getByRole('button', { name: 'Feeder' }));

    expect(
      await screen.findByText(
        'The feeder was just used. Try again in a few minutes.'
      )
    ).toBeTruthy();
  });

  it('reports a failed recording', async () => {
    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 'req-2', status: 'requested' }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 'req-2', status: 'failed' }),
      });

    render(<FeedButton />);
    fireEvent.click(screen.getByRole('button', { name: 'Feeder' }));

    await act(async () => {
      await jest.advanceTimersByTimeAsync(2000);
    });

    expect(
      await screen.findByText('The feeder could not record that drop.')
    ).toBeTruthy();
  });

  it('reports when the feeder cannot be reached', async () => {
    fetchMock.mockRejectedValueOnce(new Error('offline'));

    render(<FeedButton />);
    fireEvent.click(screen.getByRole('button', { name: 'Feeder' }));

    expect(
      await screen.findByText('The feeder could not be reached.')
    ).toBeTruthy();
  });

  it('has no accessibility violations', async () => {
    jest.useRealTimers();
    const { container } = render(<FeedButton />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
