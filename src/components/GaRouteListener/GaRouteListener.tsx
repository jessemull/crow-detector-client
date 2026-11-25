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
  const skipFirst = useRef(true);

  useEffect(() => {
    if (skipFirst.current) {
      skipFirst.current = false;
      return;
    }
    const gtag = (window as Window & { gtag?: Gtag }).gtag;
    gtag?.('config', measurementId, { page_path: pathname });
  }, [measurementId, pathname]);

  return null;
};

export default GaRouteListener;
