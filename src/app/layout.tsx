import './globals.css';
import Script from 'next/script';
import type { Metadata } from 'next';
import { Inter, Urbanist } from 'next/font/google';
import { Footer } from '@components/Footer';
import { GaRouteListener } from '@components/GaRouteListener';
import { Header } from '@components/Header';

const GA_ID_PATTERN = /^G-[A-Z0-9]+$/;

const gaTrackingId = (() => {
  const id = process.env.NEXT_PUBLIC_GA_TRACKING_ID;
  const consent = process.env.NEXT_PUBLIC_GA_CONSENT;
  if (consent !== 'granted' || !id || !GA_ID_PATTERN.test(id)) {
    return null;
  }
  return id;
})();

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  display: 'swap',
  variable: '--font-inter',
});

const urbanist = Urbanist({
  subsets: ['latin'],
  weight: ['500', '600'],
  display: 'swap',
  variable: '--font-urbanist-family',
});

export const metadata: Metadata = {
  alternates: {
    canonical: 'https://www.crittercanteen.com',
  },
  title: 'Critter Canteen - Crow Feeding Station',
  description:
    'Automated crow feeding and imaging station. A heated porch shelter, motion-sensing cameras, and recorded visits on Shelter Cam.',
  keywords:
    'crow feeding, automated feeder, wildlife camera, bird watching, IoT',
  authors: [{ name: 'Jesse Mull' }],
  metadataBase: new URL('https://www.crittercanteen.com'),
  icons: {
    icon: '/favicon.png',
    shortcut: '/favicon.png',
    apple: '/favicon.png',
  },
  openGraph: {
    title: 'Critter Canteen - Crow Feeding Station',
    description: 'Automated crow feeding and imaging station.',
    type: 'website',
    locale: 'en_US',
    url: 'https://www.crittercanteen.com',
    siteName: 'Critter Canteen',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Critter Canteen - Automated Crow Feeding & Imaging Station.',
      },
    ],
  },
  twitter: {
    // Square asset for X summary card; keep landscape `/og-image.png` for Open Graph only.
    card: 'summary',
    title: 'Critter Canteen - Crow Feeding Station',
    description: 'Automated crow feeding and imaging station.',
    images: ['/twitter-image.png'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${urbanist.variable}`}>
      <body className="relative flex min-h-dvh flex-col bg-cc-canvas font-sans">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:bg-cc-ink focus:px-4 focus:py-2 focus:text-cc-amber focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-cc-amber"
        >
          Skip to content
        </a>
        <Header />
        <main id="main-content" className="flex-1" tabIndex={-1}>
          {children}
        </main>
        <Footer />
        {gaTrackingId ? (
          <>
            <Script id="gtag-load" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                window.gtag = gtag;
                gtag('js', new Date());
                const script = document.createElement('script');
                script.src = 'https://www.googletagmanager.com/gtag/js?id=${gaTrackingId}';
                script.async = true;
                document.head.appendChild(script);
                window.dispatchEvent(new Event('ga-ready'));
              `}
            </Script>
            <GaRouteListener measurementId={gaTrackingId} />
          </>
        ) : null}
      </body>
    </html>
  );
}
