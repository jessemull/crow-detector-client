import React, { AnchorHTMLAttributes, ReactNode } from 'react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { fireEvent, render, screen } from '@testing-library/react';
import About from './About';

expect.extend(toHaveNoViolations);

jest.mock('next/link', () => {
  const MockLink = ({
    children,
    href,
    ...props
  }: AnchorHTMLAttributes<HTMLAnchorElement> & {
    href: string;
    children?: ReactNode;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  );
  MockLink.displayName = 'MockLink';
  return MockLink;
});

describe('About', () => {
  it('renders the page heading', () => {
    render(<About />);
    expect(
      screen.getByRole('heading', {
        level: 1,
        name: 'Wildlife care, engineered end to end.',
      })
    ).toBeTruthy();
  });

  it('renders the locked about splash image', () => {
    render(<About />);
    const image = screen.getByTestId('splash-image');
    expect(image).toHaveAttribute('src', '/images/hero/narubono-1920.jpg');
    expect(image.className).toContain('!top-0');
    expect(image.className).toContain('!h-full');
    expect(image.className).toContain('md:!-top-[20%]');
    expect(image.className).toContain('md:!h-[120%]');
    expect(image.style.getPropertyValue('--splash-op-mobile')).toBe('48% 8%');
    expect(image.style.getPropertyValue('--splash-op')).toBe('50% 50%');
  });

  it('keeps the heading when the splash fails', () => {
    render(<About />);
    fireEvent.error(screen.getByTestId('splash-image'));
    expect(screen.queryByTestId('splash-image')).toBeNull();
    expect(
      screen.getByRole('heading', {
        level: 1,
        name: 'Wildlife care, engineered end to end.',
      })
    ).toBeTruthy();
  });

  it('describes the station and the tech stack', () => {
    render(<About />);
    expect(screen.getByText(/backyard wildlife station/i)).toBeTruthy();
    expect(
      screen.getByText(/Edge IoT handles sensing and control/i)
    ).toBeTruthy();
    expect(screen.getByText(/AI and LLM tooling/i)).toBeTruthy();
  });

  it('renders a back to home CTA', () => {
    render(<About />);
    expect(screen.getByRole('link', { name: /Back to Home/i })).toHaveAttribute(
      'href',
      '/'
    );
    expect(screen.queryByRole('link', { name: /Shelter Cam/i })).toBeNull();
    expect(
      screen.getByRole('heading', { level: 1 }).parentElement?.className
    ).toContain('justify-start');
    expect(
      screen.getByRole('heading', { level: 1 }).parentElement?.className
    ).toContain('md:justify-center');
  });

  it('keeps copyright below the fold on the photo', () => {
    render(<About />);
    const year = new Date().getFullYear();
    const line = screen.getByText(
      `© ${year} Critter Canteen. All rights reserved.`
    );
    expect(line.className).toContain('text-white/70');
    expect(line.parentElement?.className).toContain('bg-transparent');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<About />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
