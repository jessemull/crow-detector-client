import React from 'react';
import Link from 'next/link';
import { preload } from 'react-dom';
import SplashBackground from '@components/SplashBackground';
import HeroCopyright from '@components/Footer/HeroCopyright';
import {
  SPLASH_SIZES,
  getActiveHero,
  splashFallback,
  splashSrcSet,
} from '@constants/heroes';

const HomePage: React.FC = () => {
  const hero = getActiveHero();
  const fallback = splashFallback(hero);

  preload(fallback.webp, {
    as: 'image',
    fetchPriority: 'high',
    imageSrcSet: splashSrcSet(hero, 'webp'),
    imageSizes: SPLASH_SIZES,
    type: 'image/webp',
  });

  return (
    <section className="relative isolate overflow-hidden bg-stone-950">
      <SplashBackground
        image={hero}
        frameClassName="!-top-[25%] !bottom-auto !h-[125%]"
      />
      <div
        className="absolute inset-0 bg-gradient-to-t from-stone-950/85 via-stone-950/35 to-stone-950/25"
        aria-hidden="true"
      />
      {/* First viewport: photo + CTAs only. Copyright is the next sibling (under the fold). */}
      <div className="relative z-10 flex min-h-dvh flex-col justify-end px-6 pb-[max(5rem,calc(env(safe-area-inset-bottom,0px)+3.5rem))] pt-28 md:px-10 md:pb-[max(6rem,calc(env(safe-area-inset-bottom,0px)+4.5rem))] lg:px-16">
        <div className="max-w-3xl">
          <p className="mb-3 text-[0.7rem] font-medium uppercase tracking-[0.35em] text-cc-cream-muted/90 md:text-xs">
            Neighborhood wildlife station
          </p>
          <h1 className="mb-4 text-4xl font-light tracking-wide text-cc-cream md:text-6xl lg:text-7xl">
            Critter Canteen
          </h1>
          <p className="mb-8 max-w-xl text-sm font-light leading-relaxed text-cc-cream-muted md:text-base">
            Crows eat from an automated feeder. A heated shelter stays open for
            whoever else stops by.
          </p>
          <div className="flex flex-row items-center gap-3">
            <Link
              href="/porch"
              className="inline-flex items-center justify-center rounded-full border border-white/35 bg-white/10 px-8 py-3 text-sm font-medium text-cc-cream backdrop-blur-sm transition-colors hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cc-cream"
            >
              Shelter Cam
            </Link>
            <Link
              href="/feeder"
              className="inline-flex items-center justify-center rounded-full bg-cc-lime px-8 py-3 text-sm font-medium text-cc-ink transition-colors hover:bg-cc-lime-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cc-cream"
            >
              Feeder
            </Link>
          </div>
        </div>
      </div>
      <HeroCopyright />
    </section>
  );
};

export default HomePage;
