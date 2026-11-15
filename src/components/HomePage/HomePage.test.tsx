import HomePage from './HomePage';
import React, {
  AnchorHTMLAttributes,
  ImgHTMLAttributes,
  ReactNode,
} from 'react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { render, screen } from '@testing-library/react';

expect.extend(toHaveNoViolations);

const mockSearchParams = new URLSearchParams();

jest.mock('next/navigation', () => ({
  useSearchParams: () => mockSearchParams,
}));

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
        data-testid="hero-image"
      />
    );
  };
  MockImage.displayName = 'MockImage';
  return MockImage;
});

describe('HomePage', () => {
  beforeEach(() => {
    Array.from(mockSearchParams.keys()).forEach((key) => {
      mockSearchParams.delete(key);
    });
  });

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
  });

  it('renders the feeder control as disabled', () => {
    render(<HomePage />);
    const button = screen.getByRole('button', { name: 'Feeder' });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('type', 'button');
    expect(button).toHaveAttribute('aria-disabled', 'true');
  });

  it('does not render placeholder system status', () => {
    render(<HomePage />);
    expect(screen.queryByText('System Status')).toBeNull();
    expect(screen.queryByTestId('feeder-status')).toBeNull();
    expect(screen.queryByTestId('camera-status')).toBeNull();
  });

  it('renders the default active hero image', () => {
    render(<HomePage />);
    expect(screen.getByTestId('hero-image')).toHaveAttribute(
      'src',
      '/images/hero/spencer.jpg'
    );
  });

  it('cycles hero via ?hero= query', () => {
    mockSearchParams.set('hero', 'luca');
    render(<HomePage />);
    expect(screen.getByTestId('hero-image')).toHaveAttribute(
      'src',
      '/images/hero/luca.jpg'
    );
  });

  it('applies CSS crop via ?pos= query', () => {
    mockSearchParams.set('hero', 'mia');
    mockSearchParams.set('pos', '20%_80%');
    render(<HomePage />);
    expect(screen.getByTestId('hero-image')).toHaveStyle({
      objectPosition: '20% 80%',
    });
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<HomePage />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
