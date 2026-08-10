import type { Metadata } from 'next';
import About from '@components/About';

export const metadata: Metadata = {
  title: 'About Critter Canteen',
  alternates: {
    canonical: 'https://www.crittercanteen.com/about',
  },
  openGraph: {
    title: 'About Critter Canteen',
    url: 'https://www.crittercanteen.com/about',
  },
  twitter: {
    title: 'About Critter Canteen',
  },
};

const AboutPage = () => <About />;

export default AboutPage;
