import type { Metadata } from 'next';
import './globals.css';
import { Header } from '@components/Header';
import { Footer } from '@components/Footer';

export const metadata: Metadata = {
  title: 'Critter Canteen - Crow Feeding Station',
  description:
    'Automated crow feeding and imaging station. Watch our feathered friends enjoy their meals and view captured images in real-time!',
  keywords:
    'crow feeding, automated feeder, wildlife camera, bird watching, IoT',
  authors: [{ name: 'Jesse Mull' }],
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
      <body className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
