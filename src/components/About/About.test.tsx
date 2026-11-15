import React, {
  AnchorHTMLAttributes,
  ImgHTMLAttributes,
  ReactNode,
} from 'react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { render, screen } from '@testing-library/react';
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
        name: 'Wildlife care, engineered end to end.',
      })
    ).toBeTruthy();
  });

  it('renders the locked about splash image', () => {
    render(<About />);
    const image = screen.getByTestId('about-image');
    expect(image).toHaveAttribute('src', '/images/hero/narubono.jpg');
    expect(image.className).toContain('!-top-[20%]');
    expect(image.className).toContain('!h-[120%]');
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
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<About />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
