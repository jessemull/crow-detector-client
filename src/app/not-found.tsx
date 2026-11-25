import type { Metadata } from 'next';
import { UtilityNotice } from '@components/UtilityNotice';

const NOT_FOUND_DESCRIPTION =
  'The page you requested does not exist. Check the address or return home.';

export const metadata: Metadata = {
  title: 'Page not found - Critter Canteen',
  description: NOT_FOUND_DESCRIPTION,
  robots: { index: false, follow: false },
  alternates: {
    canonical: 'https://www.crittercanteen.com/404',
  },
  openGraph: {
    title: 'Page not found - Critter Canteen',
    description: NOT_FOUND_DESCRIPTION,
    type: 'website',
    locale: 'en_US',
    url: 'https://www.crittercanteen.com/404',
    siteName: 'Critter Canteen',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Critter Canteen - Automated Crow Feeding & Imaging Station.',
      },
    ],
  },
  twitter: {
    card: 'summary',
    title: 'Page not found - Critter Canteen',
    description: NOT_FOUND_DESCRIPTION,
    images: ['/twitter-image.jpg'],
  },
};

const NotFoundPage = () => {
  return (
    <UtilityNotice
      title="Oops! Page Not Found"
      description="The page you requested does not exist. Check the address or return home."
      watermark="404"
    />
  );
};

export default NotFoundPage;
