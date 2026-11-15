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

  it('links to Shelter Cam', () => {
    render(<HomePage />);
    const link = screen.getByRole('link', { name: 'Shelter Cam' });
    expect(link).toHaveAttribute('href', '/porch');
  });

  it('renders the feeder control as coming soon', () => {
    render(<HomePage />);
    const button = screen.getByRole('button', { name: 'Feeder — coming soon' });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('type', 'button');
    expect(button).toHaveAttribute('aria-disabled', 'true');
  });

  it('does not render placeholder system status', () => {
    render(<HomePage />);
    expect(screen.queryByText('System Status')).toBeNull();
    expect(screen.queryByTestId('feeder-status')).toBeNull();
    expect(screen.queryByTestId('camera-status')).toBeNull();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<HomePage />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
