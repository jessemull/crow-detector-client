import { UtilityNotice } from '@components/UtilityNotice';

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
