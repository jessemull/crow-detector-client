import React from 'react';
import { render, screen } from '@testing-library/react';
import Footer from './Footer';

jest.mock('next/navigation', () => ({
  usePathname: () => '/',
}));

describe('Footer', () => {
  it('renders the current year copyright', () => {
    render(<Footer />);
    const year = new Date().getFullYear();
    expect(
      screen.getByText(`© ${year} Critter Canteen. All rights reserved.`)
    ).toBeTruthy();
  });

  it('keeps home copyright in flow without a black bar', () => {
    render(<Footer />);
    const footer = screen.getByRole('contentinfo');
    expect(footer.className).toContain('bg-transparent');
    expect(footer.className).toContain('-mt-[4.5rem]');
    expect(footer.className).not.toContain('bg-stone-950');
    expect(footer.className).not.toContain('fixed');
  });
});
