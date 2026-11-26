import HomePage from './HomePage';
import React, { AnchorHTMLAttributes, ReactNode } from 'react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { fireEvent, render, screen } from '@testing-library/react';

expect.extend(toHaveNoViolations);

jest.mock('next/link', () => {
  const MockLink = ({
    children,
    href,
    ...props
  }: AnchorHTMLAttributes<HTMLAnchorElement> & {
    href: string;
    children?: ReactNode;
  }) => {
    return (
      <a href={href} {...props}>
        {children}
      </a>
    );
  };
  MockLink.displayName = 'MockLink';
  return MockLink;
});

describe('HomePage', () => {
  it('renders the main heading', () => {
    render(<HomePage />);
    const heading = screen.getByRole('heading', {
      level: 1,
      name: 'Critter Canteen',
    });
    expect(heading).toBeTruthy();
  });

  it('links to Shelter Cam then Feeder', () => {
    render(<HomePage />);
    const shelter = screen.getByRole('link', { name: 'Shelter Cam' });
    const feeder = screen.getByRole('link', { name: 'Feeder' });
    expect(shelter).toHaveAttribute('href', '/porch');
    expect(shelter.className).toContain('bg-white/10');
    expect(feeder).toHaveAttribute('href', '/feeder');
    expect(feeder.className).toContain('bg-cc-lime');
    expect(
      shelter.compareDocumentPosition(feeder) & Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();
  });

  it('does not render placeholder system status', () => {
    render(<HomePage />);
    expect(
      screen.getByRole('heading', { level: 1, name: 'Critter Canteen' })
    ).toBeTruthy();
    expect(screen.queryByText('System Status')).toBeNull();
  });

  it('renders the locked active hero image', () => {
    render(<HomePage />);
    const image = screen.getByTestId('splash-image');
    expect(image).toHaveAttribute('src', '/images/hero/spencer-1280.jpg');
    expect(image.className).toContain('!-top-[25%]');
    expect(image.className).toContain('!h-[125%]');
  });

  it('keeps the heading when the splash fails', () => {
    render(<HomePage />);
    fireEvent.error(screen.getByTestId('splash-image'));
    expect(screen.queryByTestId('splash-image')).toBeNull();
    expect(
      screen.getByRole('heading', { level: 1, name: 'Critter Canteen' })
    ).toBeTruthy();
  });

  it('keeps copyright below the fold on the photo', () => {
    render(<HomePage />);
    const year = 2026;
    const line = screen.getByText(
      `© ${year} Critter Canteen. All rights reserved.`
    );
    expect(line.closest('.min-h-dvh')).toBeNull();
    expect(line.className).toContain('text-white/70');
    expect(line.parentElement?.className).toContain('bg-transparent');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<HomePage />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
