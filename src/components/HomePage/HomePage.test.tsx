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

  it('links to Shelter Cam', () => {
    render(<HomePage />);
    const link = screen.getByRole('link', { name: 'Shelter Cam' });
    expect(link).toHaveAttribute('href', '/porch');
    expect(link.className).toContain('bg-cc-lime');
  });

  it('renders the feeder control', () => {
    render(<HomePage />);
    const button = screen.getByRole('button', { name: 'Feeder' });
    expect(button).toHaveAttribute('type', 'button');
    expect(button).toBeEnabled();
  });

  it('does not render placeholder system status', () => {
    render(<HomePage />);
    expect(screen.queryByText('System Status')).toBeNull();
    expect(screen.queryByTestId('feeder-status')).toBeNull();
    expect(screen.queryByTestId('camera-status')).toBeNull();
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

  it('does not render a hero review hint', () => {
    render(<HomePage />);
    expect(screen.queryByTestId('hero-review-hint')).toBeNull();
  });

  it('keeps copyright below the fold on the photo', () => {
    render(<HomePage />);
    const year = new Date().getFullYear();
    const line = screen.getByText(
      `© ${year} Critter Canteen. All rights reserved.`
    );
    expect(line.className).toContain('text-white/70');
    expect(line.parentElement?.className).toContain('bg-transparent');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<HomePage />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
