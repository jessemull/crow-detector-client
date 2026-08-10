import Link from 'next/link';
import { PageShell } from '@components/PageShell';

const NotFoundPage = () => {
  return (
    <PageShell>
      <div className="text-center">
        <h1 className="text-xl md:text-2xl lg:text-4xl font-light text-amber-400 mb-3 tracking-wide">
          Page Not Found
        </h1>
        <p className="text-xs md:text-sm text-white max-w-3xl mx-auto leading-relaxed font-light mb-8">
          The page you requested does not exist. Check the address or return to
          the home page.
        </p>
        <Link
          href="/"
          className="inline-flex items-center px-4 md:px-6 py-2 md:py-3 bg-stone-800 text-amber-400 border border-amber-400 font-medium text-sm md:text-base rounded-lg hover:bg-stone-700 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400"
        >
          Home
        </Link>
      </div>
    </PageShell>
  );
};

export default NotFoundPage;
