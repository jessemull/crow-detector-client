import type { Metadata } from 'next';
import { UtilityNotice } from '@components/UtilityNotice';

export const metadata: Metadata = {
  title: 'Page not found - Critter Canteen',
  robots: { index: false, follow: false },
  alternates: {
    canonical: 'https://www.crittercanteen.com/404',
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
