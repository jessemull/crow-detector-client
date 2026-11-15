import React, { AnchorHTMLAttributes, ReactNode } from 'react';
import { render, screen } from '@testing-library/react';
import UtilityNotice from './UtilityNotice';

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

describe('UtilityNotice', () => {
  it('renders title, description, and default home CTA', () => {
    render(
      <UtilityNotice
        title="Oops! Page Not Found"
        description="Missing page copy."
      />
    );

    expect(
      screen.getByRole('heading', { level: 1, name: 'Oops! Page Not Found' })
    ).toBeTruthy();
    expect(screen.getByText('Missing page copy.')).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Back to Home' })).toHaveAttribute(
      'href',
      '/'
    );
  });

  it('renders an optional watermark', () => {
    render(
      <UtilityNotice
        title="Oops! Page Not Found"
        description="Missing page copy."
        watermark="404"
      />
    );

    expect(screen.getByText('404')).toBeTruthy();
  });

  it('uses standalone padding without site chrome offset', () => {
    const { container } = render(
      <UtilityNotice
        standalone
        title="Something went wrong"
        description="Fly back home."
        ctaLabel="Home"
      />
    );

    const section = container.querySelector('section');
    expect(section?.className).toContain('py-16');
    expect(section?.className).not.toContain('pt-28');
    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute(
      'href',
      '/'
    );
  });
});
