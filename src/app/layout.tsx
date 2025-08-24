import './globals.css';
import Script from 'next/script';
import type { Metadata } from 'next';
import { Footer } from '@components/Footer';
import { Header } from '@components/Header';

const NEXT_PUBLIC_GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_TRACKING_ID;

export const metadata: Metadata = {
  alternates: {
    canonical: 'https://www.crittercanteen.com',
  },
  title: 'Critter Canteen - Crow Feeding Station',
  description:
    'Automated crow feeding and imaging station. Watch our feathered friends enjoy their meals and view captured images in real-time!',
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
    card: 'summary_large_image',
    title: 'Critter Canteen - Crow Feeding Station',
    description: 'Automated crow feeding and imaging station.',
    images: ['/og-image.png'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.png" type="image/svg+xml" />
        <link rel="canonical" href="https://www.crittercanteen.com/" />
        <meta
          name="description"
          content="Automated crow feeding and imaging station. Watch our feathered friends enjoy their meals and view captured images in real-time!"
        />
        <meta
          property="og:title"
          content="Critter Canteen - Crow Feeding Station"
        />
        <meta property="og:image" content="/og-image.png" />
      </head>
      <body className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <>
          <Script id="gtag-load" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              (window.requestIdleCallback || function(cb) { setTimeout(cb, 0); })(() => {
                const script = document.createElement('script');
                script.src = 'https://www.googletagmanager.com/gtag/js?id=${NEXT_PUBLIC_GA_TRACKING_ID}';
                script.async = true;
                document.head.appendChild(script);

                gtag('js', new Date());
                gtag('config', '${NEXT_PUBLIC_GA_TRACKING_ID}', {
                  page_path: window.location.pathname,
                });
              });
            `}
          </Script>
        </>
      </body>
    </html>
  );
}
