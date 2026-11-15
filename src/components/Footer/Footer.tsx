'use client';

import React from 'react';
import { usePathname } from 'next/navigation';

const Footer: React.FC = () => {
  const pathname = usePathname() || '/';
  const year = new Date().getFullYear();
  const floatsOverHero = pathname === '/' || pathname === '/about';

  return (
    <footer
      className={
        floatsOverHero
          ? // Pull up over the hero’s extra bottom band — no bar, still below the fold.
            'relative z-20 -mt-[4.5rem] border-0 bg-transparent py-6'
          : // Full-height canvas above; copyright only after scroll — never a hairline.
            'mt-auto border-0 bg-cc-canvas py-6'
      }
    >
      <div className="mx-auto max-w-6xl px-6 text-center">
        <p
          className={
            floatsOverHero ? 'text-sm text-white/70' : 'text-sm text-cc-ink/55'
          }
        >
          © {year} Critter Canteen. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
