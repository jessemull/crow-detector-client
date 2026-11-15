import React from 'react';
import { render, screen } from '@testing-library/react';
import AboutPage from './page';

jest.mock('next/image', () => {
  const MockImage = ({
    src,
    alt,
    className,
    style,
  }: {
    src: string;
    alt?: string;
    className?: string;
    style?: React.CSSProperties;
  }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt ?? ''} className={className} style={style} />
  );
  MockImage.displayName = 'MockImage';
  return MockImage;
});

describe('About Page', () => {
  it('renders the about page component', () => {
    render(<AboutPage />);
    expect(
      screen.getByRole('heading', {
        level: 1,
        name: 'Wildlife care, engineered end to end.',
      })
    ).toBeTruthy();
    expect(
      screen.getByText(/Edge IoT handles sensing and control/i)
    ).toBeTruthy();
  });

  it('renders the back to home link', () => {
    render(<AboutPage />);
    expect(screen.getByRole('link', { name: 'Back to Home' })).toBeTruthy();
  });
});
