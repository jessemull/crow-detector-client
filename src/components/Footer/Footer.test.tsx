import React from 'react';
import { render, screen } from '@testing-library/react';
import Footer from './Footer';

const mockPathname = jest.fn(() => '/');

jest.mock('next/navigation', () => ({
  usePathname: () => mockPathname(),
}));

describe('Footer', () => {
  beforeEach(() => {
    mockPathname.mockReturnValue('/');
  });

  it('renders the current year copyright', () => {
    render(<Footer />);
    const year = new Date().getFullYear();
    expect(
      screen.getByText(`© ${year} Critter Canteen. All rights reserved.`)
    ).toBeTruthy();
  });

  it('keeps photo-page copyright in flow on a dark spill band', () => {
    render(<Footer />);
    const footer = screen.getByRole('contentinfo');
    expect(footer.className).toContain('bg-stone-950');
    expect(footer.className).toContain('-mt-[4.5rem]');
    expect(footer.className).toContain('border-0');
    expect(footer.className).not.toContain('bg-transparent');
    expect(footer.className).not.toContain('border-t');
    expect(footer.className).not.toContain('fixed');
    expect(screen.getByText(/Critter Canteen/).className).toContain(
      'text-white/70'
    );
  });

  it('floats over About the same as Home', () => {
    mockPathname.mockReturnValue('/about');
    render(<Footer />);
    const footer = screen.getByRole('contentinfo');
    expect(footer.className).toContain('bg-stone-950');
    expect(footer.className).toContain('-mt-[4.5rem]');
  });

  it('keeps light-page footer below the canvas with no hairline', () => {
    mockPathname.mockReturnValue('/porch');
    render(<Footer />);
    const footer = screen.getByRole('contentinfo');
    expect(footer.className).toContain('bg-cc-canvas');
    expect(footer.className).toContain('mt-auto');
    expect(footer.className).toContain('border-0');
    expect(footer.className).not.toContain('border-t');
    expect(footer.className).not.toContain('-mt-[4.5rem]');
    expect(footer.className).not.toContain('bg-stone-950');
  });
});
