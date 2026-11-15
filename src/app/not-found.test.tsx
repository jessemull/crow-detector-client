import React, { AnchorHTMLAttributes, ReactNode } from 'react';
import { render, screen } from '@testing-library/react';
import NotFoundPage from './not-found';

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

describe('Not Found Page', () => {
  it('renders the Earthon-style not found notice and home link', () => {
    render(<NotFoundPage />);
    expect(
      screen.getByRole('heading', { level: 1, name: 'Oops! Page Not Found' })
    ).toBeTruthy();
    expect(screen.getByText('404')).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Back to Home' })).toHaveAttribute(
      'href',
      '/'
    );
  });
});
