import type { Metadata } from 'next';
import './globals.css';
import { Header } from '@components/Header';

export const metadata: Metadata = {
  title: 'Critter Canteen - Crow Feeding Station',
  description:
    'Automated crow feeding and imaging station. Watch our feathered friends enjoy their meals and view captured images in real-time.',
  keywords:
    'crow feeding, automated feeder, wildlife camera, bird watching, IoT',
  authors: [{ name: 'Jesse Mull' }],
  openGraph: {
    title: 'Critter Canteen - Crow Feeding Station',
    description: 'Automated crow feeding and imaging station',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Critter Canteen - Crow Feeding Station',
    description: 'Automated crow feeding and imaging station',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Header />
        {children}
      </body>
    </html>
  );
}
