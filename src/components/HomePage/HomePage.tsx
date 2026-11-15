'use client';

import React, { Suspense, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  getActiveHero,
  resolveHeroQuery,
  resolveObjectPosition,
} from '@constants/heroes';

const showHeroReviewHint =
  process.env.NODE_ENV === 'development' ||
  process.env.NEXT_PUBLIC_HERO_REVIEW === 'true';

const HomeHero: React.FC = () => {
  const searchParams = useSearchParams();
  const active = getActiveHero();

  const hero = useMemo(() => {
    const fromQuery = resolveHeroQuery(searchParams.get('hero'), active.id);
    const objectPosition = resolveObjectPosition(
      searchParams.get('pos'),
      fromQuery.objectPosition
    );
    return { ...fromQuery, objectPosition };
  }, [searchParams, active.id]);

  return (
    <section className="relative isolate min-h-[calc(100vh+4.5rem)] overflow-hidden bg-stone-950">
      <Image
        src={hero.src}
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover !-top-[25%] !bottom-auto !h-[125%]"
        style={{ objectPosition: hero.objectPosition }}
      />
      <div
        className="absolute inset-0 bg-gradient-to-t from-stone-950/85 via-stone-950/35 to-stone-950/25"
        aria-hidden="true"
      />
      <div className="relative z-10 flex min-h-screen flex-col justify-end px-6 pb-16 pt-28 md:px-10 md:pb-24 lg:px-16">
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
          <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
            <button
              type="button"
              disabled
              className="inline-flex cursor-not-allowed items-center justify-center rounded-full border border-white/35 bg-white/10 px-8 py-3 text-sm font-medium text-cc-cream/75 opacity-80 backdrop-blur-sm"
              aria-disabled="true"
              title="Feeding controls are not connected yet"
            >
              Feeder
            </button>
            <Link
              href="/porch"
              className="inline-flex items-center justify-center rounded-full bg-cc-lime px-8 py-3 text-sm font-medium text-stone-900 transition-colors hover:bg-[#d4e87a] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cc-cream"
            >
              Shelter Cam
            </Link>
          </div>
        </div>
      </div>
      {showHeroReviewHint ? (
        <p
          className="pointer-events-none absolute bottom-3 right-3 z-20 rounded-md bg-black/70 px-2 py-1 font-mono text-[0.65rem] text-cc-cream/90"
          data-testid="hero-review-hint"
        >
          hero={hero.id} · pos={hero.objectPosition}
        </p>
      ) : null}
    </section>
  );
};

const HomePage: React.FC = () => {
  return (
    <Suspense fallback={<section className="min-h-screen bg-stone-950" />}>
      <HomeHero />
    </Suspense>
  );
};

export default HomePage;
