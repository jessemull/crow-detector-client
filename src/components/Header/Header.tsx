'use client';

import Image from 'next/image';
import Link from 'next/link';
import React, { useState } from 'react';
import { Menu, X, Home, Info } from 'lucide-react';

interface HeaderProps {}

const Header: React.FC<HeaderProps> = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="sticky top-0 z-20 bg-stone-900 backdrop-blur-sm border-b border-amber-400/30 relative">
      <div className="max-w-6xl py-3 md:py-4 pl-3 md:pl-6">
        <div className="flex items-center relative">
          <button
            onClick={toggleMenu}
            className="lg:hidden absolute md:-left-2 focus:outline-none"
            aria-label="Toggle menu"
          >
            <Menu className="w-6 h-6 md:w-8 md:h-8 text-white" />
          </button>
          <div className="flex items-center space-x-3 w-full lg:w-auto justify-center lg:justify-start">
            <Link
              href="/"
              className="flex items-center space-x-3 text-white hover:text-gray-400 transition-colors"
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
              className="text-gray-200 hover:text-gray-400 transition-colors font-light"
            >
              Home
            </Link>
            <Link
              href="/about"
              className="text-gray-200 hover:text-gray-400 transition-colors font-light"
            >
              About
            </Link>
          </nav>
        </div>
        {isMenuOpen && (
          <div className="lg:hidden min-h-screen absolute top-0 left-0 bg-stone-900 border-r border-white/30 shadow-lg z-50 min-w-72">
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
                onClick={() => setIsMenuOpen(false)}
                className="text-white hover:text-gray-300"
                aria-label="Close menu"
              >
                <X className="w-5 h-5 md:w-6 md:h-6" />
              </button>
            </div>
            <nav
              className="flex flex-col space-y-0"
              aria-label="Mobile navigation"
            >
              <Link
                href="/"
                className="text-white hover:text-gray-400 transition-colors font-light text-sm md:text-base flex items-center space-x-3 py-2.5 md:py-3 px-4 border-t border-b border-white/30"
                onClick={() => setIsMenuOpen(false)}
              >
                <Home className="w-4 h-4 md:w-5 md:h-5" />
                <span>Home</span>
              </Link>
              <Link
                href="/about"
                className="text-white hover:text-gray-400 transition-colors font-light text-sm md:text-base flex items-center space-x-3 py-2.5 md:py-3 px-4 border-b border-white/30"
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
