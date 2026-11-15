import React, {
  AnchorHTMLAttributes,
  ImgHTMLAttributes,
  ReactNode,
} from 'react';
import { render, screen } from '@testing-library/react';
import Home from './page';

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

jest.mock('next/image', () => {
  type MockImageProps = Pick<
    ImgHTMLAttributes<HTMLImageElement>,
    'alt' | 'className' | 'style'
  > & { src: string };

  const MockImage = ({ src, alt, className, style }: MockImageProps) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt ?? ''} className={className} style={style} />
  );
  MockImage.displayName = 'MockImage';
  return MockImage;
});

describe('Home Page', () => {
  it('renders the HomePage component', () => {
    render(<Home />);
    const heading = screen.getByRole('heading', { name: 'Critter Canteen' });
    expect(heading).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Shelter Cam' })).toHaveAttribute(
      'href',
      '/porch'
    );
    expect(screen.getByRole('button', { name: 'Feeder' })).toBeDisabled();
  });
});
