import type { Metadata } from 'next';
import PorchClips from '@components/PorchClips';

const PORCH_DESCRIPTION =
  'Short porch-camera visits from Critter Canteen. Playback links expire after a few minutes.';

export const metadata: Metadata = {
  title: 'Porch Clips - Critter Canteen',
  description: PORCH_DESCRIPTION,
  robots: {
    index: false,
    follow: false,
  },
  alternates: {
    canonical: 'https://www.crittercanteen.com/porch',
  },
  openGraph: {
    title: 'Porch Clips - Critter Canteen',
    description: PORCH_DESCRIPTION,
    url: 'https://www.crittercanteen.com/porch',
  },
};

const PorchPage = () => <PorchClips />;

export default PorchPage;
