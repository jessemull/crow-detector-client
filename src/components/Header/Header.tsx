'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, { useEffect, useRef, useState } from 'react';
import { Menu, X, Home, Info, Camera, Bird } from 'lucide-react';
import HeaderMark from './HeaderMark';

/** Earthon Menu List pill: canvas, radius 244px, padding 5px */
const menuListClassName =
  'hidden lg:flex items-center justify-center rounded-[244px] bg-cc-canvas p-[5px] font-urbanist';

/**
 * Earthon tab labels: Urbanist 16px / 500, letter-spacing -0.32px
 * Contact CTA: Urbanist 16px / 600
 */
const navIdleClassName =
  'inline-flex items-center justify-center rounded-[137px] bg-[rgba(13,13,13,0)] px-5 py-2 font-urbanist text-[16px] font-medium leading-[22.4px] tracking-[-0.32px] text-cc-ink backdrop-blur-[45px] transition-colors hover:bg-black/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cc-ink';

const navActiveClassName =
  'inline-flex items-center justify-center rounded-[137px] bg-cc-ink px-5 py-2 font-urbanist text-[16px] font-medium leading-[22.4px] tracking-[-0.32px] text-white backdrop-blur-[45px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cc-ink';

const navDisabledClassName =
  'inline-flex cursor-not-allowed items-center justify-center rounded-[137px] px-5 py-2 font-urbanist text-[16px] font-medium leading-[22.4px] tracking-[-0.32px] text-cc-ink/60';

const contactClassName =
  'hidden lg:inline-flex h-11 cursor-not-allowed items-center justify-center rounded-[50px] bg-cc-yellow px-6 font-urbanist text-[16px] font-semibold leading-[22.4px] tracking-[-0.32px] text-cc-ink opacity-70';

const mobileContactClassName =
  'mx-4 mt-4 inline-flex h-11 cursor-not-allowed items-center justify-center rounded-[50px] bg-cc-yellow px-6 text-[16px] font-semibold leading-[22.4px] tracking-[-0.32px] text-cc-ink opacity-70';

const mobileNavLinkClassName =
  'flex items-center space-x-3 px-4 py-2.5 font-urbanist text-[16px] font-medium tracking-[-0.32px] text-cc-ink transition-colors hover:bg-black/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cc-ink md:py-3';

const mobileDisabledNavClassName =
  'flex cursor-not-allowed items-center space-x-3 px-4 py-2.5 font-urbanist text-[16px] font-medium tracking-[-0.32px] text-cc-ink/60 md:py-3';

const Header: React.FC = () => {
  const pathname = usePathname() || '/';
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const chromeRef = useRef<HTMLDivElement>(null);
  const wasMenuOpenRef = useRef(false);

  const isHome = pathname === '/';
  const isAbout = pathname === '/about';
  const isPorch = pathname === '/porch';

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  useEffect(() => {
    if (isMenuOpen) {
      wasMenuOpenRef.current = true;
      closeButtonRef.current?.focus();

      const previousOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      const inertTargets = [
        chromeRef.current,
        document.querySelector('main'),
        document.querySelector('footer'),
      ].filter((element): element is HTMLElement => element != null);

      for (const element of inertTargets) {
        element.setAttribute('inert', '');
      }

      const onKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          setIsMenuOpen(false);
          return;
        }

        if (event.key !== 'Tab' || !dialogRef.current) {
          return;
        }

        const focusable = Array.from(
          dialogRef.current.querySelectorAll<HTMLElement>(
            'button:not([disabled]), a[href]'
          )
        );

        if (focusable.length === 0) {
          return;
        }

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      };

      document.addEventListener('keydown', onKeyDown);
      return () => {
        document.removeEventListener('keydown', onKeyDown);
        document.body.style.overflow = previousOverflow;
        for (const element of inertTargets) {
          element.removeAttribute('inert');
        }
      };
    }

    if (wasMenuOpenRef.current) {
      wasMenuOpenRef.current = false;
      menuButtonRef.current?.focus();
    }
  }, [isMenuOpen]);

  return (
    <header className="pointer-events-none absolute inset-x-0 top-8 z-50 bg-transparent font-urbanist">
      <nav
        ref={chromeRef}
        className="pointer-events-auto mx-auto flex h-[60px] w-full max-w-[1280px] items-center justify-between px-[30px]"
        aria-label="Primary"
      >
        <button
          ref={menuButtonRef}
          type="button"
          onClick={toggleMenu}
          className="absolute left-[30px] z-10 cursor-pointer rounded-full bg-cc-canvas p-2 text-cc-ink lg:hidden focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cc-ink"
          aria-label="Toggle menu"
          aria-expanded={isMenuOpen}
          aria-controls="mobile-navigation"
        >
          <Menu className="h-5 w-5" />
        </button>

        <Link
          href="/"
          className="relative z-10 flex items-center gap-1.5 text-cc-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cc-ink max-lg:mx-auto"
        >
          <HeaderMark className="h-[27px] w-[27px] shrink-0" />
          <span className="text-[16px] font-medium leading-[22.4px] tracking-[-0.32px]">
            Critter Canteen
          </span>
        </Link>

        <div className={`${menuListClassName}`} aria-label="Desktop navigation">
          <Link
            href="/"
            className={isHome ? navActiveClassName : navIdleClassName}
            aria-current={isHome ? 'page' : undefined}
          >
            Home
          </Link>
          <button
            type="button"
            className={navDisabledClassName}
            disabled
            title="Feeding controls are not connected yet"
          >
            Feeder
          </button>
          <Link
            href="/porch"
            className={isPorch ? navActiveClassName : navIdleClassName}
            aria-current={isPorch ? 'page' : undefined}
          >
            Shelter Cam
          </Link>
          <Link
            href="/about"
            className={isAbout ? navActiveClassName : navIdleClassName}
            aria-current={isAbout ? 'page' : undefined}
          >
            About
          </Link>
        </div>

        <button
          type="button"
          className={contactClassName}
          disabled
          title="Contact form coming soon"
        >
          Contact
        </button>
      </nav>

      {isMenuOpen && (
        <div
          ref={dialogRef}
          className="pointer-events-auto absolute left-0 top-0 z-50 min-h-screen min-w-72 border-r border-stone-200 bg-white shadow-lg lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile menu"
        >
          <div className="flex items-center justify-between border-b border-stone-200 p-4">
            <div className="flex items-center gap-1.5 text-cc-ink">
              <HeaderMark className="h-[27px] w-[27px] shrink-0" />
              <span className="text-base font-medium tracking-[-0.32px]">
                Critter Canteen
              </span>
            </div>
            <button
              ref={closeButtonRef}
              type="button"
              onClick={() => setIsMenuOpen(false)}
              className="cursor-pointer text-cc-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cc-ink"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <nav
            id="mobile-navigation"
            className="flex flex-col"
            aria-label="Mobile navigation"
          >
            <Link
              href="/"
              className={mobileNavLinkClassName}
              onClick={() => setIsMenuOpen(false)}
            >
              <Home className="h-4 w-4" />
              <span>Home</span>
            </Link>
            <button
              type="button"
              className={mobileDisabledNavClassName}
              disabled
              title="Feeding controls are not connected yet"
            >
              <Bird className="h-4 w-4" aria-hidden="true" />
              <span>Feeder</span>
            </button>
            <Link
              href="/porch"
              className={mobileNavLinkClassName}
              onClick={() => setIsMenuOpen(false)}
            >
              <Camera className="h-4 w-4" />
              <span>Shelter Cam</span>
            </Link>
            <Link
              href="/about"
              className={mobileNavLinkClassName}
              onClick={() => setIsMenuOpen(false)}
            >
              <Info className="h-4 w-4" />
              <span>About</span>
            </Link>
            <button
              type="button"
              className={mobileContactClassName}
              disabled
              title="Contact form coming soon"
            >
              Contact
            </button>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
