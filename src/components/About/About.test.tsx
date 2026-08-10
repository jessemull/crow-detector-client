import React from 'react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { render, screen } from '@testing-library/react';
import About from './About';

expect.extend(toHaveNoViolations);

describe('About', () => {
  it('renders the page heading', () => {
    render(<About />);
    expect(
      screen.getByRole('heading', {
        level: 1,
        name: 'About Critter Canteen',
      })
    ).toBeTruthy();
  });

  it('renders the back to home link', () => {
    render(<About />);
    expect(screen.getByRole('link', { name: 'Back to Home' })).toBeTruthy();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<About />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
