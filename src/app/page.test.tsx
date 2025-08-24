import React from 'react';
import { render, screen } from '@testing-library/react';
import Home from './page';

describe('Home Page', () => {
  it('renders the HomePage component', () => {
    render(<Home />);
    const heading = screen.getByRole('heading', { name: 'Critter Canteen' });
    expect(heading).toBeTruthy();
    const subHeading = screen.getByRole('heading', {
      name: 'Automated Crow Feeding & Imaging',
    });
    expect(subHeading).toBeTruthy();
  });
});
