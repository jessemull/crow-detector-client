'use client';

import Image from 'next/image';
import Link from 'next/link';
import React, { useEffect, useRef, useState } from 'react';
import { Menu, X, Home, Info } from 'lucide-react';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const wasMenuOpenRef = useRef(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  useEffect(() => {
    if (isMenuOpen) {
      wasMenuOpenRef.current = true;
      closeButtonRef.current?.focus();

      const previousOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

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
      };
    }

    if (wasMenuOpenRef.current) {
      wasMenuOpenRef.current = false;
      menuButtonRef.current?.focus();
    }
  }, [isMenuOpen]);

  return (
    <header className="sticky top-0 z-20 bg-stone-900 backdrop-blur-sm border-b border-amber-400/30 relative">
      <div className="max-w-6xl py-3 md:py-4 pl-3 md:pl-6">
        <div className="flex items-center relative">
          <button
            ref={menuButtonRef}
            type="button"
            onClick={toggleMenu}
            className="lg:hidden absolute md:-left-2 cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400"
            aria-label="Toggle menu"
            aria-expanded={isMenuOpen}
            aria-controls="mobile-navigation"
          >
            <Menu className="w-6 h-6 md:w-8 md:h-8 text-white" />
          </button>
          <div className="flex items-center space-x-3 w-full lg:w-auto justify-center lg:justify-start">
            <Link
              href="/"
              className="flex items-center space-x-3 text-white hover:text-gray-400 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400"
            >
              <Image
                src="/favicon.png"
                alt=""
                width={32}
                height={32}
                className="w-6 h-6 md:w-8 md:h-8"
              />
              <span className="font-light text-base md:text-lg tracking-wide">
                Critter Canteen
              </span>
            </Link>
          </div>
          <nav
            className="hidden lg:flex items-center space-x-6 ml-8"
            aria-label="Desktop navigation"
          >
            <Link
              href="/"
              className="text-gray-200 hover:text-gray-400 transition-colors font-light focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400"
            >
              Home
            </Link>
            <Link
              href="/about"
              className="text-gray-200 hover:text-gray-400 transition-colors font-light focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400"
            >
              About
            </Link>
          </nav>
        </div>
        {isMenuOpen && (
          <div
            ref={dialogRef}
            className="lg:hidden min-h-screen absolute top-0 left-0 bg-stone-900 border-r border-white/30 shadow-lg z-50 min-w-72"
            role="dialog"
            aria-modal="true"
            aria-label="Mobile menu"
          >
            <div className="flex justify-between items-center p-4">
              <div className="flex items-center space-x-3">
                <Image
                  src="/favicon.png"
                  alt=""
                  width={32}
                  height={32}
                  className="w-5 h-5 md:w-6 md:w-6"
                />
                <span className="text-white font-light text-sm md:text-base tracking-wide">
                  Critter Canteen
                </span>
              </div>
              <button
                ref={closeButtonRef}
                type="button"
                onClick={() => setIsMenuOpen(false)}
                className="text-white hover:text-gray-300 cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400"
                aria-label="Close menu"
              >
                <X className="w-5 h-5 md:w-6 md:h-6" />
              </button>
            </div>
            <nav
              id="mobile-navigation"
              className="flex flex-col space-y-0"
              aria-label="Mobile navigation"
            >
              <Link
                href="/"
                className="text-white hover:text-gray-400 transition-colors font-light text-sm md:text-base flex items-center space-x-3 py-2.5 md:py-3 px-4 border-t border-b border-white/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400"
                onClick={() => setIsMenuOpen(false)}
              >
                <Home className="w-4 h-4 md:w-5 md:h-5" />
                <span>Home</span>
              </Link>
              <Link
                href="/about"
                className="text-white hover:text-gray-400 transition-colors font-light text-sm md:text-base flex items-center space-x-3 py-2.5 md:py-3 px-4 border-b border-white/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400"
                onClick={() => setIsMenuOpen(false)}
              >
                <Info className="w-4 h-4 md:w-5 md:h-5" />
                <span>About</span>
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
