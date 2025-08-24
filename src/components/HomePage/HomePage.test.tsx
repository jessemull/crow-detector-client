import React from 'react';
import { render, screen } from '@testing-library/react';
import HomePage from './HomePage';

describe('HomePage', () => {
  it('renders the main heading', () => {
    render(<HomePage />);
    const heading = screen.getByRole('heading', { name: 'Critter Canteen' });
    expect(heading).toBeTruthy();
  });

  it('renders the feed button', () => {
    render(<HomePage />);
    const button = screen.getByRole('button', { name: 'Feed the Crows' });
    expect(button).toBeTruthy();
  });

  it('renders feeder and camera status indicators', () => {
    render(<HomePage />);
    expect(screen.getByTestId('feeder-status')).toBeTruthy();
    expect(screen.getByTestId('camera-status')).toBeTruthy();
  });
});
