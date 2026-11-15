'use client';

import React from 'react';
import { usePathname } from 'next/navigation';

const Footer: React.FC = () => {
  const pathname = usePathname() || '/';
  const year = new Date().getFullYear();
  const floatsOverHero = pathname === '/' || pathname === '/about';
  const isLightPage = pathname === '/porch';

  return (
    <footer
      className={
        floatsOverHero
          ? // Pull up over the hero’s extra bottom band — no black bar, still below the fold.
            'relative z-20 -mt-[4.5rem] border-0 bg-transparent py-6'
          : isLightPage
            ? 'mt-auto border-t border-black/5 bg-[#f5f5f5] py-6'
            : 'mt-auto border-t border-white/10 bg-stone-950 py-6'
      }
    >
      <div className="mx-auto max-w-6xl px-6 text-center">
        <p
          className={
            floatsOverHero
              ? 'text-sm text-white/70'
              : isLightPage
                ? 'text-sm text-[#0e0e0e]/55'
                : 'text-sm text-stone-400'
          }
        >
          © {year} Critter Canteen. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
