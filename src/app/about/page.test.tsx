import React from 'react';
import { render, screen } from '@testing-library/react';
import AboutPage from './page';

describe('About Page', () => {
  it('renders the about page component', () => {
    render(<AboutPage />);
    const heading = screen.getByRole('heading', {
      level: 1,
      name: 'About Critter Canteen',
    });
    expect(heading).toBeTruthy();
    expect(
      screen.getByText(
        /Critter Canteen is an innovative IoT-powered crow feeding and imaging station/
      )
    ).toBeTruthy();
  });

  it('renders the back to home link', () => {
    render(<AboutPage />);
    const link = screen.getByRole('link', { name: 'Back to Home' });
    expect(link).toBeTruthy();
  });
});
