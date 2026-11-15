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
    const heading = screen.getByRole('heading', {
      level: 1,
      name: 'About Critter Canteen',
    });
    expect(heading).toBeTruthy();
    expect(
      screen.getByText(
        /Critter Canteen is a small porch station for neighborhood wildlife/
      )
    ).toBeTruthy();
  });

  it('renders the back to home link', () => {
    render(<AboutPage />);
    const link = screen.getByRole('link', { name: 'Back to Home' });
    expect(link).toBeTruthy();
  });
});
