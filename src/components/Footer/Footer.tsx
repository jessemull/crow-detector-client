'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { copyrightLine } from './copyright';

const Footer: React.FC = () => {
  const pathname = usePathname() || '/';

  // Home / About own the copyright inside the hero (below the fold, on the photo).

  if (pathname === '/' || pathname === '/about') {
    return null;
  }

  return (
    <footer className="mt-auto border-0 bg-cc-canvas py-6">
      <div className="mx-auto max-w-6xl px-6 text-center">
        <p className="text-sm text-cc-ink/75">{copyrightLine()}</p>
      </div>
    </footer>
  );
};

export default Footer;
