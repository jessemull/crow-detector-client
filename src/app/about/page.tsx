import type { Metadata } from 'next';
import About from '@components/About';

const ABOUT_DESCRIPTION =
  'Learn how Critter Canteen combines IoT feeding, wildlife imaging, and ethical data collection to study local crow populations.';

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
  },
  twitter: {
    title: 'About Critter Canteen',
    description: ABOUT_DESCRIPTION,
  },
};

const AboutPage = () => <About />;

export default AboutPage;
