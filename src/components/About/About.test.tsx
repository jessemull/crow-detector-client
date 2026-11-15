import React, { ImgHTMLAttributes } from 'react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { render, screen } from '@testing-library/react';
import About from './About';

expect.extend(toHaveNoViolations);

jest.mock('next/image', () => {
  type MockImageProps = Pick<
    ImgHTMLAttributes<HTMLImageElement>,
    'alt' | 'className' | 'style'
  > & {
    src: string;
    fill?: boolean;
    priority?: boolean;
    sizes?: string;
  };

  const MockImage = ({ src, alt, className, style }: MockImageProps) => {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt ?? ''}
        className={className}
        style={style}
        data-testid="about-image"
      />
    );
  };
  MockImage.displayName = 'MockImage';
  return MockImage;
});

describe('About', () => {
  it('renders the page heading', () => {
    render(<About />);
    expect(
      screen.getByRole('heading', {
        level: 1,
        name: 'About Critter Canteen',
      })
    ).toBeTruthy();
  });

  it('renders the about splash image', () => {
    render(<About />);
    expect(screen.getByTestId('about-image')).toHaveAttribute(
      'src',
      '/images/hero/mia.jpg'
    );
  });

  it('renders Shelter Cam and back to home links', () => {
    render(<About />);
    expect(screen.getByRole('link', { name: 'Shelter Cam' })).toHaveAttribute(
      'href',
      '/porch'
    );
    expect(screen.getByRole('link', { name: 'Back to Home' })).toHaveAttribute(
      'href',
      '/'
    );
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<About />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
