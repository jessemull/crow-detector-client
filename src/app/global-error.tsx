'use client';

import * as Sentry from '@sentry/nextjs';
import React, { useEffect } from 'react';
import { Urbanist } from 'next/font/google';
import { UtilityNotice } from '@components/UtilityNotice';

const urbanist = Urbanist({
  subsets: ['latin'],
  weight: ['500', '600'],
  display: 'swap',
});

interface Props {
  error: Error & { digest?: string };
}

const GlobalError: React.FC<Props> = ({ error }) => {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <body className={`${urbanist.className} min-h-screen bg-cc-canvas`}>
        <UtilityNotice
          standalone
          title="Something went wrong"
          description="We logged the issue. Fly back home and try again."
        />
      </body>
    </html>
  );
};

export default GlobalError;
