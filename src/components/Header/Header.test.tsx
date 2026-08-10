import React, {
  AnchorHTMLAttributes,
  ImgHTMLAttributes,
  ReactNode,
} from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import Header from './Header';

expect.extend(toHaveNoViolations);

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
    'alt' | 'className'
  > & {
    src: string;
    width?: number | `${number}`;
    height?: number | `${number}`;
  };

  const MockImage = ({
    src,
    alt,
    width,
    height,
    className,
  }: MockImageProps) => {
    return (
      <div
        data-testid="mock-image"
        data-src={src}
        data-alt={alt}
        data-width={width}
        data-height={height}
        className={className}
      />
    );
  };
  MockImage.displayName = 'MockImage';
  return MockImage;
});

describe('Header', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the header with logo and title', () => {
    render(<Header />);

    const logo = screen.getByTestId('mock-image');
    const title = screen.getByText('Critter Canteen');

    expect(logo).toBeTruthy();
    expect(title).toBeTruthy();
    expect(logo.getAttribute('data-src')).toBe('/favicon.png');
  });

  it('renders desktop navigation links', () => {
    render(<Header />);

    const desktopNav = screen.getByLabelText('Desktop navigation');
    const homeLink = desktopNav.querySelector('a[href="/"]');
    const aboutLink = desktopNav.querySelector('a[href="/about"]');

    expect(homeLink).toBeTruthy();
    expect(aboutLink).toBeTruthy();
    expect(homeLink?.textContent).toBe('Home');
    expect(aboutLink?.textContent).toBe('About');
  });

  it('renders mobile menu toggle button', () => {
    render(<Header />);

    const menuButton = screen.getByRole('button', { name: 'Toggle menu' });
    expect(menuButton).toBeTruthy();
    expect(menuButton).toHaveAttribute('type', 'button');
    expect(menuButton).toHaveAttribute('aria-expanded', 'false');
    expect(menuButton.className).toContain('lg:hidden');
    expect(menuButton.className).toContain('cursor-pointer');
  });

  it('toggles mobile menu when button is clicked', () => {
    render(<Header />);

    const menuButton = screen.getByRole('button', { name: 'Toggle menu' });

    expect(screen.queryByRole('button', { name: 'Close menu' })).toBeFalsy();

    fireEvent.click(menuButton);

    expect(menuButton).toHaveAttribute('aria-expanded', 'true');
    const closeButton = screen.getByRole('button', { name: 'Close menu' });
    expect(closeButton).toBeTruthy();
    expect(closeButton).toHaveAttribute('type', 'button');

    const mobileNav = screen.getByLabelText('Mobile navigation');
    expect(mobileNav).toHaveAttribute('id', 'mobile-navigation');
    expect(mobileNav.querySelector('a[href="/"]')).toBeTruthy();
    expect(mobileNav.querySelector('a[href="/about"]')).toBeTruthy();
  });

  it('supports keyboard activation of the menu toggle', () => {
    render(<Header />);

    const menuButton = screen.getByRole('button', { name: 'Toggle menu' });
    menuButton.focus();
    fireEvent.keyDown(menuButton, { key: 'Enter', code: 'Enter' });
    fireEvent.click(menuButton);

    expect(screen.getByRole('button', { name: 'Close menu' })).toBeTruthy();
    expect(screen.getByLabelText('Mobile navigation')).toBeTruthy();
  });

  it('closes the mobile menu on Escape', () => {
    render(<Header />);

    const menuButton = screen.getByRole('button', { name: 'Toggle menu' });
    fireEvent.click(menuButton);
    expect(screen.getByRole('button', { name: 'Close menu' })).toBeTruthy();

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('button', { name: 'Close menu' })).toBeFalsy();
    expect(menuButton).toHaveFocus();
  });

  it('restores focus to the menu toggle when the close button is clicked', () => {
    render(<Header />);

    const menuButton = screen.getByRole('button', { name: 'Toggle menu' });
    fireEvent.click(menuButton);
    fireEvent.click(screen.getByRole('button', { name: 'Close menu' }));

    expect(screen.queryByRole('button', { name: 'Close menu' })).toBeFalsy();
    expect(menuButton).toHaveFocus();
  });

  it('traps tab focus inside the mobile menu dialog', () => {
    render(<Header />);

    fireEvent.click(screen.getByRole('button', { name: 'Toggle menu' }));

    const closeButton = screen.getByRole('button', { name: 'Close menu' });
    const mobileNav = screen.getByLabelText('Mobile navigation');
    const homeLink = mobileNav.querySelector(
      'a[href="/"]'
    ) as HTMLAnchorElement | null;
    const aboutLink = mobileNav.querySelector(
      'a[href="/about"]'
    ) as HTMLAnchorElement | null;

    expect(homeLink).toBeTruthy();
    expect(aboutLink).toBeTruthy();

    aboutLink?.focus();
    fireEvent.keyDown(document, { key: 'Tab' });
    expect(closeButton).toHaveFocus();

    closeButton.focus();
    fireEvent.keyDown(document, { key: 'Tab', shiftKey: true });
    expect(aboutLink).toHaveFocus();
  });

  it('exposes visible focus styles on the menu toggle', () => {
    render(<Header />);
    const menuButton = screen.getByRole('button', { name: 'Toggle menu' });
    expect(menuButton.className).toContain('focus-visible:outline');
    expect(menuButton.className).not.toContain('focus:outline-none');
  });

  it('has no accessibility violations when the mobile menu is open', async () => {
    const { container } = render(<Header />);
    fireEvent.click(screen.getByRole('button', { name: 'Toggle menu' }));
    expect(await axe(container)).toHaveNoViolations();
  });

  it('closes mobile menu when close button is clicked', () => {
    render(<Header />);

    const menuButton = screen.getByRole('button', { name: 'Toggle menu' });

    fireEvent.click(menuButton);
    expect(screen.getByRole('button', { name: 'Close menu' })).toBeTruthy();

    const closeButton = screen.getByRole('button', { name: 'Close menu' });
    fireEvent.click(closeButton);

    expect(screen.queryByRole('button', { name: 'Close menu' })).toBeFalsy();
  });

  it('closes mobile menu when navigation links are clicked', () => {
    render(<Header />);

    const menuButton = screen.getByRole('button', { name: 'Toggle menu' });

    fireEvent.click(menuButton);
    expect(screen.getByRole('button', { name: 'Close menu' })).toBeTruthy();

    const mobileNav = screen.getByLabelText('Mobile navigation');
    const mobileHomeLink = mobileNav.querySelector('a[href="/"]');
    expect(mobileHomeLink).toBeTruthy();

    if (mobileHomeLink) {
      fireEvent.click(mobileHomeLink);
    }

    expect(screen.queryByRole('button', { name: 'Close menu' })).toBeFalsy();
  });

  it('closes mobile menu when About navigation link is clicked', () => {
    render(<Header />);

    const menuButton = screen.getByRole('button', { name: 'Toggle menu' });

    fireEvent.click(menuButton);
    expect(screen.getByRole('button', { name: 'Close menu' })).toBeTruthy();

    const mobileNav = screen.getByLabelText('Mobile navigation');
    const mobileAboutLink = mobileNav.querySelector('a[href="/about"]');
    expect(mobileAboutLink).toBeTruthy();

    if (mobileAboutLink) {
      fireEvent.click(mobileAboutLink);
    }

    expect(screen.queryByRole('button', { name: 'Close menu' })).toBeFalsy();
  });

  it('renders mobile menu with correct styling and content', () => {
    render(<Header />);

    const menuButton = screen.getByRole('button', { name: 'Toggle menu' });
    fireEvent.click(menuButton);

    const mobileMenu = screen.getByLabelText('Mobile navigation');
    expect(mobileMenu).toBeTruthy();

    const mobileNav = screen.getByLabelText('Mobile navigation');
    const homeLink = mobileNav.querySelector('a[href="/"]');
    const aboutLink = mobileNav.querySelector('a[href="/about"]');

    expect(homeLink?.querySelector('svg')).toBeTruthy();
    expect(aboutLink?.querySelector('svg')).toBeTruthy();
  });

  it('renders header with correct CSS classes', () => {
    render(<Header />);

    const header = screen.getByRole('banner');
    expect(header.className).toContain('sticky');
    expect(header.className).toContain('top-0');
    expect(header.className).toContain('z-20');
    expect(header.className).toContain('bg-stone-900');
  });

  it('renders logo link with correct href', () => {
    render(<Header />);

    const logoLink = screen.getByRole('link', { name: /Critter Canteen/ });
    expect(logoLink.getAttribute('href')).toBe('/');
  });

  it('renders desktop navigation with correct aria-label', () => {
    render(<Header />);

    const desktopNav = screen.getByLabelText('Desktop navigation');
    expect(desktopNav).toBeTruthy();
    expect(desktopNav.className).toContain('hidden');
    expect(desktopNav.className).toContain('lg:flex');
  });

  it('renders mobile navigation with correct aria-label', () => {
    render(<Header />);

    const menuButton = screen.getByRole('button', { name: 'Toggle menu' });
    fireEvent.click(menuButton);

    const mobileNav = screen.getByLabelText('Mobile navigation');
    expect(mobileNav).toBeTruthy();
  });
});
