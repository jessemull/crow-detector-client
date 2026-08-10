'use client';

import * as Sentry from '@sentry/nextjs';
import Link from 'next/link';
import React, { useEffect } from 'react';
import { Bird } from 'lucide-react';

interface Props {
  error: Error & { digest?: string };
}

const GlobalError: React.FC<Props> = ({ error }) => {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);
  return (
    <html lang="en">
      <body className="min-h-screen flex items-center justify-center bg-gradient-to-br from-stone-900 via-neutral-800 to-stone-900 px-4 text-center font-sans">
        <div className="flex flex-col items-center max-w-xl w-full">
          <div className="text-white mb-6 flex justify-center">
            <Bird
              stroke="#f59e0b"
              strokeWidth="1"
              className="w-[20vw] h-[20vw] max-w-[160px] max-h-[160px]"
            />
          </div>
          <h1 className="text-xl md:text-2xl font-light text-amber-500 mb-4 tracking-wide">
            Something Went Wrong!
          </h1>
          <p className="text-md md:text-lg font-light text-white mb-6">
            We&apos;ve logged the issue. Please refresh to try again.
          </p>
          <Link
            href="/"
            className="text-amber-500 text-2xl hover:text-white transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400"
          >
            Home
          </Link>
        </div>
      </body>
    </html>
  );
};

export default GlobalError;
