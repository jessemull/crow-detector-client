'use client';

import React from 'react';
import { usePathname } from 'next/navigation';

const Footer: React.FC = () => {
  const pathname = usePathname() || '/';
  const year = new Date().getFullYear();
  const isHome = pathname === '/';

  return (
    <footer
      className={
        isHome
          ? // Pull up over the hero’s extra bottom band — no black bar, still below the fold.
            'relative z-20 -mt-[4.5rem] border-0 bg-transparent py-6'
          : 'mt-auto border-t border-white/10 bg-stone-950 py-6'
      }
    >
      <div className="mx-auto max-w-6xl px-6 text-center">
        <p
          className={
            isHome ? 'text-sm text-white/70' : 'text-sm text-stone-400'
          }
        >
          © {year} Critter Canteen. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
