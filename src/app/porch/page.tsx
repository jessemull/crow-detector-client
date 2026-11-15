import type { Metadata } from 'next';
import PorchClips from '@components/PorchClips';

const PORCH_DESCRIPTION =
  'Shelter Cam at Critter Canteen — short visits to the heated porch shelter. Playback links expire after a few minutes.';

export const metadata: Metadata = {
  title: 'Shelter Cam - Critter Canteen',
  description: PORCH_DESCRIPTION,
  robots: {
    index: false,
    follow: false,
  },
  alternates: {
    canonical: 'https://www.crittercanteen.com/porch',
  },
  openGraph: {
    title: 'Shelter Cam - Critter Canteen',
    description: PORCH_DESCRIPTION,
    url: 'https://www.crittercanteen.com/porch',
  },
};

const PorchPage = () => <PorchClips />;

export default PorchPage;
