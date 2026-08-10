import HomePage from './HomePage';
import React from 'react';
import { render, screen } from '@testing-library/react';

describe('HomePage', () => {
  it('renders the main heading', () => {
    render(<HomePage />);
    const heading = screen.getByRole('heading', {
      level: 1,
      name: 'Critter Canteen',
    });
    expect(heading).toBeTruthy();
  });

  it('renders the feed button as an inert control', () => {
    render(<HomePage />);
    const button = screen.getByRole('button', { name: 'Feed the Crows' });
    expect(button).toBeTruthy();
    expect(button).toHaveAttribute('type', 'button');
    expect(button).toHaveAttribute('aria-disabled', 'true');
    expect(button.className).toContain('cursor-pointer');
  });

  it('renders feeder and camera status indicators', () => {
    render(<HomePage />);
    expect(screen.getByTestId('feeder-status')).toBeTruthy();
    expect(screen.getByTestId('camera-status')).toBeTruthy();
  });
});
