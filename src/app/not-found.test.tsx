import React from 'react';
import { render, screen } from '@testing-library/react';
import NotFoundPage from './not-found';

describe('Not Found Page', () => {
  it('renders the not found heading and home link', () => {
    render(<NotFoundPage />);
    expect(
      screen.getByRole('heading', { level: 1, name: 'Page Not Found' })
    ).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute(
      'href',
      '/'
    );
  });
});
