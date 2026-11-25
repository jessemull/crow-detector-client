import type { Metadata } from 'next';
import About from '@components/About';

const ABOUT_DESCRIPTION =
  'A backyard wildlife station with an automated feeder, a heated shelter, motion-sensing cameras, and cloud clips.';

const ABOUT_OG_IMAGE = {
  url: '/og-image.jpg',
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
    type: 'website',
    locale: 'en_US',
    url: 'https://www.crittercanteen.com/about',
    siteName: 'Critter Canteen',
    images: [ABOUT_OG_IMAGE],
  },
  twitter: {
    card: 'summary',
    title: 'About Critter Canteen',
    description: ABOUT_DESCRIPTION,
    images: ['/twitter-image.jpg'],
  },
};

const AboutPage = () => <About />;

export default AboutPage;
