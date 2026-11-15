import React from 'react';
import Link from 'next/link';
import { PageShell } from '@components/PageShell';

const HomePage: React.FC = () => {
  return (
    <PageShell>
      <div className="text-center mb-6 lg:mb-8">
        <h1 className="text-xl md:text-2xl lg:text-4xl font-light text-amber-400 mb-3 tracking-wide">
          Critter Canteen
        </h1>
        <p className="text-xs md:text-sm text-white max-w-3xl mx-auto leading-relaxed font-light">
          A cozy porch station for neighborhood wildlife — a heated little
          shelter for whoever stops by, with a crow feeder on the way. Peek in
          on Shelter Cam visits anytime.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row justify-center items-center gap-3 mb-10">
        <Link
          href="/porch"
          className="inline-flex items-center justify-center bg-stone-800 text-amber-400 border border-amber-400 font-medium py-3 px-8 rounded-lg hover:bg-stone-700 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400"
        >
          Shelter Cam
        </Link>
        <button
          type="button"
          disabled
          className="bg-stone-800 text-amber-400/70 border border-amber-400/50 font-medium py-3 px-8 rounded-lg opacity-70 cursor-not-allowed"
          aria-disabled="true"
          title="Feeding controls are not connected yet"
        >
          Feeder — coming soon
        </button>
      </div>
    </PageShell>
  );
};

export default HomePage;
