import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Header from './Header';

// Mock Next.js components
jest.mock('next/link', () => {
  const MockLink = ({ children, href, ...props }: any) => {
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
  const MockImage = ({ src, alt, width, height, className, ...props }: any) => {
    return (
      <div
        data-testid="mock-image"
        data-src={src}
        data-alt={alt}
        data-width={width}
        data-height={height}
        className={className}
        {...props}
      />
    );
  };
  MockImage.displayName = 'MockImage';
  return MockImage;
});

describe('Header', () => {
  beforeEach(() => {
    // Reset any previous state
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
    expect(menuButton.className).toContain('lg:hidden');
  });

  it('toggles mobile menu when button is clicked', () => {
    render(<Header />);

    const menuButton = screen.getByRole('button', { name: 'Toggle menu' });

    // Menu should be closed initially
    expect(screen.queryByRole('button', { name: 'Close menu' })).toBeFalsy();

    // Click to open menu
    fireEvent.click(menuButton);

    // Menu should now be open
    const closeButton = screen.getByRole('button', { name: 'Close menu' });
    expect(closeButton).toBeTruthy();

    // Menu should contain navigation items
    const mobileNav = screen.getByLabelText('Mobile navigation');
    expect(mobileNav.querySelector('a[href="/"]')).toBeTruthy();
    expect(mobileNav.querySelector('a[href="/about"]')).toBeTruthy();
  });

  it('closes mobile menu when close button is clicked', () => {
    render(<Header />);

    const menuButton = screen.getByRole('button', { name: 'Toggle menu' });

    // Open menu
    fireEvent.click(menuButton);
    expect(screen.getByRole('button', { name: 'Close menu' })).toBeTruthy();

    // Close menu
    const closeButton = screen.getByRole('button', { name: 'Close menu' });
    fireEvent.click(closeButton);

    // Menu should be closed
    expect(screen.queryByRole('button', { name: 'Close menu' })).toBeFalsy();
  });

  it('closes mobile menu when navigation links are clicked', () => {
    render(<Header />);

    const menuButton = screen.getByRole('button', { name: 'Toggle menu' });

    // Open menu
    fireEvent.click(menuButton);
    expect(screen.getByRole('button', { name: 'Close menu' })).toBeTruthy();

    // Click on mobile Home link specifically
    const mobileNav = screen.getByLabelText('Mobile navigation');
    const mobileHomeLink = mobileNav.querySelector('a[href="/"]');
    expect(mobileHomeLink).toBeTruthy();

    if (mobileHomeLink) {
      fireEvent.click(mobileHomeLink);
    }

    // Menu should be closed
    expect(screen.queryByRole('button', { name: 'Close menu' })).toBeFalsy();
  });

  it('closes mobile menu when About navigation link is clicked', () => {
    render(<Header />);

    const menuButton = screen.getByRole('button', { name: 'Toggle menu' });

    // Open menu
    fireEvent.click(menuButton);
    expect(screen.getByRole('button', { name: 'Close menu' })).toBeTruthy();

    // Click on mobile About link specifically
    const mobileNav = screen.getByLabelText('Mobile navigation');
    const mobileAboutLink = mobileNav.querySelector('a[href="/about"]');
    expect(mobileAboutLink).toBeTruthy();

    if (mobileAboutLink) {
      fireEvent.click(mobileAboutLink);
    }

    // Menu should be closed
    expect(screen.queryByRole('button', { name: 'Close menu' })).toBeFalsy();
  });

  it('renders mobile menu with correct styling and content', () => {
    render(<Header />);

    const menuButton = screen.getByRole('button', { name: 'Toggle menu' });
    fireEvent.click(menuButton);

    // Check mobile menu container
    const mobileMenu = screen.getByLabelText('Mobile navigation');
    expect(mobileMenu).toBeTruthy();

    // Check mobile menu items have icons
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
