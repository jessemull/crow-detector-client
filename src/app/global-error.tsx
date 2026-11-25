'use client';

import './globals.css';
import * as Sentry from '@sentry/nextjs';
import React, { useEffect } from 'react';
import { Inter, Urbanist } from 'next/font/google';
import { UtilityNotice } from '@components/UtilityNotice';

const inter = Inter({
  subsets: ['latin'],
  weight: ['400'],
  display: 'swap',
  variable: '--font-inter',
});

const urbanist = Urbanist({
  subsets: ['latin'],
  weight: ['500', '600'],
  display: 'swap',
  variable: '--font-urbanist-family',
});

interface Props {
  error: Error & { digest?: string };
  reset: () => void;
  retry: () => void;
}

const GlobalError: React.FC<Props> = ({ error, retry }) => {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en" className={`${inter.variable} ${urbanist.variable}`}>
      <head>
        <title>Something went wrong</title>
      </head>
      <body className={`${urbanist.className} min-h-screen bg-cc-canvas`}>
        <UtilityNotice
          standalone
          title="Something went wrong"
          description="We logged the issue. Fly back home and try again."
          onRetry={retry}
        />
      </body>
    </html>
  );
};

export default GlobalError;
