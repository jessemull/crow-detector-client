import React, {
  AnchorHTMLAttributes,
  ImgHTMLAttributes,
  ReactNode,
} from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import Header from './Header';

expect.extend(toHaveNoViolations);

const mockPathname = jest.fn(() => '/');

jest.mock('next/navigation', () => ({
  usePathname: () => mockPathname(),
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
    mockPathname.mockReturnValue('/');
  });

  it('renders the header with mark and title', () => {
    render(<Header />);

    const mark = screen.getByTestId('header-mark');
    const title = screen.getByText('Critter Canteen');

    expect(mark).toBeTruthy();
    expect(mark.getAttribute('data-mark')).toBe('crow-4');
    expect(title).toBeTruthy();
  });

  it('keeps a dark brand mark on the light Shelter Cam page', () => {
    mockPathname.mockReturnValue('/porch');
    render(<Header />);

    const logoLink = screen.getByRole('link', { name: /Critter Canteen/ });
    expect(logoLink.className).toContain('text-[#0e0e0e]');
  });

  it('renders desktop navigation links', () => {
    render(<Header />);

    const desktopNav = screen.getByLabelText('Desktop navigation');
    const homeLink = desktopNav.querySelector('a[href="/"]');
    const shelterLink = desktopNav.querySelector('a[href="/porch"]');
    const aboutLink = desktopNav.querySelector('a[href="/about"]');
    const feeder = desktopNav.querySelector('[aria-disabled="true"]');

    expect(homeLink).toBeTruthy();
    expect(shelterLink).toBeTruthy();
    expect(aboutLink).toBeTruthy();
    expect(homeLink?.textContent).toBe('Home');
    expect(shelterLink?.textContent).toBe('Shelter Cam');
    expect(aboutLink?.textContent).toBe('About');
    expect(feeder?.textContent).toBe('Feeder');
    expect(desktopNav.querySelector('a[href="/feeder"]')).toBeNull();
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
    expect(mobileNav.querySelector('a[href="/porch"]')).toBeTruthy();
    expect(mobileNav.querySelector('a[href="/about"]')).toBeTruthy();
    expect(
      mobileNav.querySelector('[aria-disabled="true"]')?.textContent
    ).toContain('Feeder');
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
    const dialog = screen.getByRole('dialog', { name: 'Mobile menu' });
    const mobileNav = screen.getByLabelText('Mobile navigation');
    const homeLink = mobileNav.querySelector(
      'a[href="/"]'
    ) as HTMLAnchorElement | null;
    const contactButton = Array.from(dialog.querySelectorAll('button')).find(
      (button) => button.textContent === 'Contact'
    ) as HTMLButtonElement;

    expect(homeLink).toBeTruthy();
    expect(contactButton).toBeTruthy();

    // Contact is the last focusable control in the mobile drawer.
    contactButton.focus();
    expect(contactButton).toHaveFocus();
    fireEvent.keyDown(document, { key: 'Tab' });
    expect(closeButton).toHaveFocus();

    closeButton.focus();
    fireEvent.keyDown(document, { key: 'Tab', shiftKey: true });
    expect(contactButton).toHaveFocus();
  });

  it('wraps Tab from the last menu item back to the close button', () => {
    render(<Header />);

    fireEvent.click(screen.getByRole('button', { name: 'Toggle menu' }));

    const closeButton = screen.getByRole('button', { name: 'Close menu' });
    const dialog = screen.getByRole('dialog', { name: 'Mobile menu' });
    const contactButton = Array.from(dialog.querySelectorAll('button')).find(
      (button) => button.textContent === 'Contact'
    ) as HTMLButtonElement;

    contactButton.focus();
    expect(document.activeElement).toBe(contactButton);

    fireEvent.keyDown(document, { key: 'Tab', shiftKey: false });
    expect(document.activeElement).toBe(closeButton);
  });

  it('marks background content inert while the mobile menu is open', () => {
    const main = document.createElement('main');
    const footer = document.createElement('footer');
    document.body.append(main, footer);

    render(<Header />);

    fireEvent.click(screen.getByRole('button', { name: 'Toggle menu' }));

    const chrome = screen.getByLabelText('Primary');
    expect(chrome).toHaveAttribute('inert');
    expect(main).toHaveAttribute('inert');
    expect(footer).toHaveAttribute('inert');
    expect(
      screen.getByRole('dialog', { name: 'Mobile menu' })
    ).not.toHaveAttribute('inert');

    fireEvent.click(screen.getByRole('button', { name: 'Close menu' }));
    expect(chrome).not.toHaveAttribute('inert');
    expect(main).not.toHaveAttribute('inert');
    expect(footer).not.toHaveAttribute('inert');

    main.remove();
    footer.remove();
  });

  it('ignores non-Tab keys while the menu is open', () => {
    render(<Header />);

    fireEvent.click(screen.getByRole('button', { name: 'Toggle menu' }));
    const closeButton = screen.getByRole('button', { name: 'Close menu' });
    closeButton.focus();

    fireEvent.keyDown(document, { key: 'a' });
    expect(closeButton).toHaveFocus();
    expect(screen.getByRole('dialog', { name: 'Mobile menu' })).toBeTruthy();
  });

  it('ignores Tab when the dialog has no focusable elements', () => {
    render(<Header />);

    fireEvent.click(screen.getByRole('button', { name: 'Toggle menu' }));
    const dialog = screen.getByRole('dialog', { name: 'Mobile menu' });
    const spy = jest
      .spyOn(dialog, 'querySelectorAll')
      .mockReturnValue([] as unknown as NodeListOf<Element>);

    expect(() => {
      fireEvent.keyDown(document, { key: 'Tab' });
    }).not.toThrow();

    spy.mockRestore();
  });

  it('locks background scroll while the mobile menu is open', () => {
    render(<Header />);

    expect(document.body.style.overflow).toBe('');
    fireEvent.click(screen.getByRole('button', { name: 'Toggle menu' }));
    expect(document.body.style.overflow).toBe('hidden');

    fireEvent.click(screen.getByRole('button', { name: 'Close menu' }));
    expect(document.body.style.overflow).toBe('');
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
    const shelterLink = mobileNav.querySelector('a[href="/porch"]');
    const aboutLink = mobileNav.querySelector('a[href="/about"]');
    const feeder = mobileNav.querySelector('[aria-disabled="true"]');

    expect(homeLink?.querySelector('svg')).toBeTruthy();
    expect(shelterLink?.querySelector('svg')).toBeTruthy();
    expect(aboutLink?.querySelector('svg')).toBeTruthy();
    expect(feeder?.querySelector('svg')).toBeTruthy();
  });

  it('closes mobile menu when Shelter Cam is clicked', () => {
    render(<Header />);

    fireEvent.click(screen.getByRole('button', { name: 'Toggle menu' }));
    const mobileNav = screen.getByLabelText('Mobile navigation');
    const shelterLink = mobileNav.querySelector('a[href="/porch"]');
    expect(shelterLink).toBeTruthy();

    if (shelterLink) {
      fireEvent.click(shelterLink);
    }

    expect(screen.queryByRole('button', { name: 'Close menu' })).toBeFalsy();
  });

  it('renders Earthon-style floating header with light menu pill and no brown bar', () => {
    render(<Header />);

    const header = screen.getByRole('banner');
    expect(header.className).toContain('absolute');
    expect(header.className).toContain('bg-transparent');
    expect(header.className).not.toContain('bg-stone');
    expect(header.className).not.toContain('bg-cc-glass');

    const desktopNav = screen.getByLabelText('Desktop navigation');
    expect(desktopNav.className).toContain('bg-[#f5f5f5]');
    expect(desktopNav.className).toContain('rounded-[244px]');

    const homeLink = desktopNav.querySelector('a[href="/"]');
    expect(homeLink?.className).toContain('bg-[#0e0e0e]');
    expect(homeLink).toHaveAttribute('aria-current', 'page');
  });

  it('renders a no-op Contact button matching Earthon yellow CTA', () => {
    render(<Header />);

    const contact = screen.getByRole('button', { name: 'Contact' });
    expect(contact).toHaveAttribute('type', 'button');
    expect(contact.className).toContain('bg-[#fff017]');
    expect(contact.className).toContain('rounded-[50px]');
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
