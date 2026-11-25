'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';

type Gtag = (
  command: 'config',
  measurementId: string,
  params: { page_path: string }
) => void;

const GaRouteListener = ({ measurementId }: { measurementId: string }) => {
  const pathname = usePathname() || '/';
  const lastSent = useRef<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const send = () => {
      if (cancelled || lastSent.current === pathname) {
        return;
      }
      const gtag = (window as Window & { gtag?: Gtag }).gtag;
      if (!gtag) {
        return;
      }
      lastSent.current = pathname;
      gtag('config', measurementId, { page_path: pathname });
    };

    send();
    window.addEventListener('ga-ready', send);
    return () => {
      cancelled = true;
      window.removeEventListener('ga-ready', send);
    };
  }, [measurementId, pathname]);

  return null;
};

export default GaRouteListener;
