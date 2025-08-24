import React from 'react';
import { render, screen } from '@testing-library/react';
import HomePage from './HomePage';

describe('HomePage', () => {
  it('renders the main heading', () => {
    render(<HomePage />);
    const heading = screen.getByRole('heading', { name: 'Critter Canteen' });
    expect(heading).toBeTruthy();
  });

  it('renders the automated feeding section', () => {
    render(<HomePage />);
    const subHeading = screen.getByRole('heading', {
      name: 'Automated Crow Feeding & Imaging',
    });
    expect(subHeading).toBeTruthy();
  });

  it('renders feeder and camera status indicators', () => {
    render(<HomePage />);
    expect(screen.getByTestId('feeder-status')).toBeTruthy();
    expect(screen.getByTestId('camera-status')).toBeTruthy();
  });

  it('renders the ready to feed section', () => {
    render(<HomePage />);
    const readyHeading = screen.getByRole('heading', {
      name: '🎯 Ready to Feed?',
    });
    expect(readyHeading).toBeTruthy();
  });

  it('renders the feed button', () => {
    render(<HomePage />);
    const button = screen.getByRole('button', { name: '🍽️ Feed the Crows' });
    expect(button).toBeTruthy();
  });

  it('renders the placeholder disclaimer', () => {
    render(<HomePage />);
    const disclaimer = screen.getByText(/🚧 This is a placeholder interface/);
    expect(disclaimer).toBeTruthy();
  });
});
