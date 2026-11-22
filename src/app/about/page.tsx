import type { Metadata } from 'next';
import About from '@components/About';

const ABOUT_DESCRIPTION =
  'Learn how Critter Canteen combines IoT feeding, wildlife imaging, and ethical data collection to study local crow populations.';

const ABOUT_OG_IMAGE = {
  url: '/og-image.png',
  width: 1200,
  height: 630,
  alt: 'Critter Canteen - Automated Crow Feeding & Imaging Station.',
};

export const metadata: Metadata = {
  title: 'About Critter Canteen',
  description: ABOUT_DESCRIPTION,
  alternates: {
    canonical: 'https://www.crittercanteen.com/about',
  },
  openGraph: {
    title: 'About Critter Canteen',
    description: ABOUT_DESCRIPTION,
    url: 'https://www.crittercanteen.com/about',
    images: [ABOUT_OG_IMAGE],
  },
  twitter: {
    card: 'summary',
    title: 'About Critter Canteen',
    description: ABOUT_DESCRIPTION,
    images: ['/twitter-image.png'],
  },
};

const AboutPage = () => <About />;

export default AboutPage;
