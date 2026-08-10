import HomePage from './HomePage';
import React from 'react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { render, screen } from '@testing-library/react';

expect.extend(toHaveNoViolations);

describe('HomePage', () => {
  it('renders the main heading', () => {
    render(<HomePage />);
    const heading = screen.getByRole('heading', {
      level: 1,
      name: 'Critter Canteen',
    });
    expect(heading).toBeTruthy();
  });

  it('renders the feed button as a disabled control', () => {
    render(<HomePage />);
    const button = screen.getByRole('button', { name: 'Feed the Crows' });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('type', 'button');
    expect(button).toHaveAttribute('aria-disabled', 'true');
  });

  it('renders feeder and camera status indicators', () => {
    render(<HomePage />);
    expect(screen.getByTestId('feeder-status')).toBeTruthy();
    expect(screen.getByTestId('camera-status')).toBeTruthy();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<HomePage />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
