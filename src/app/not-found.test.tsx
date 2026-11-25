import React, { AnchorHTMLAttributes, ReactNode } from 'react';
import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import NotFoundPage, { metadata } from './not-found';

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

describe('Not Found Page', () => {
  it('points the canonical URL at the static 404 page', () => {
    expect(metadata.alternates?.canonical).toBe(
      'https://www.crittercanteen.com/404'
    );
  });

  it('renders the not found notice and home link', async () => {
    const { container } = render(<NotFoundPage />);
    expect(
      screen.getByRole('heading', { level: 1, name: 'Oops! Page Not Found' })
    ).toBeTruthy();
    expect(screen.getByText('404')).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Back to Home' })).toHaveAttribute(
      'href',
      '/'
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
