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
          ? // Pull up over the hero spill. Use stone-950 (not transparent): on
            // portrait the copyright wraps taller than the spill, and transparent
            // text sat on body canvas (#f5f5f5) — white-on-white “cut off” footer.
            'relative z-20 -mt-[4.5rem] border-0 bg-stone-950 py-6'
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
