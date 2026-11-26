import type { Metadata } from 'next';
import FeederClips from '@components/FeederClips/FeederClips';

const FEEDER_DESCRIPTION =
  'Feeder Cam at Critter Canteen — visits at the automated feeder. Playback links expire after a few minutes.';

export const metadata: Metadata = {
  title: 'Feeder Cam - Critter Canteen',
  description: FEEDER_DESCRIPTION,
  robots: {
    index: false,
    follow: false,
  },
  alternates: {
    canonical: 'https://www.crittercanteen.com/feeder',
  },
  openGraph: {
    title: 'Feeder Cam - Critter Canteen',
    description: FEEDER_DESCRIPTION,
    url: 'https://www.crittercanteen.com/feeder',
  },
};

const FeederPage = () => <FeederClips />;

export default FeederPage;
