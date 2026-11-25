import React from 'react';
import { render, screen } from '@testing-library/react';
import Footer from './Footer';
import HeroCopyright from './HeroCopyright';
import { copyrightLine } from './copyright';

const mockPathname = jest.fn(() => '/');

jest.mock('next/navigation', () => ({
  usePathname: () => mockPathname(),
}));

describe('Footer', () => {
  beforeEach(() => {
    mockPathname.mockReturnValue('/');
  });

  it('does not render on Home — copyright lives in the hero below the fold', () => {
    const { container } = render(<Footer />);
    expect(container).toBeEmptyDOMElement();
  });

  it('does not render on About — copyright lives in the hero below the fold', () => {
    mockPathname.mockReturnValue('/about');
    const { container } = render(<Footer />);
    expect(container).toBeEmptyDOMElement();
  });

  it('keeps light-page footer in document flow on canvas', () => {
    mockPathname.mockReturnValue('/porch');
    render(<Footer />);
    const footer = screen.getByRole('contentinfo');
    expect(footer.className).toContain('bg-cc-canvas');
    expect(footer.className).toContain('mt-auto');
    expect(screen.getByText(copyrightLine())).toBeTruthy();
    expect(screen.getByText(copyrightLine()).className).toContain(
      'text-cc-ink/75'
    );
  });
});

describe('HeroCopyright', () => {
  it('renders transparent copyright text for hero pages', () => {
    render(<HeroCopyright />);
    const line = screen.getByText(copyrightLine());
    expect(line.className).toContain('text-white/70');
    expect(line.parentElement?.className).toContain('bg-transparent');
  });
});
