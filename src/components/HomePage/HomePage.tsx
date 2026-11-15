import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getActiveHero } from '@constants/heroes';

const HomePage: React.FC = () => {
  const hero = getActiveHero();

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
          <p className="mb-3 font-urbanist text-[0.7rem] font-medium uppercase tracking-[0.35em] text-white/70 md:text-xs">
            Neighborhood wildlife station
          </p>
          <h1 className="mb-4 font-urbanist text-4xl font-medium tracking-[-0.04em] text-white md:text-6xl md:leading-[1.05] lg:text-7xl">
            Critter Canteen
          </h1>
          <p className="mb-8 max-w-xl font-urbanist text-sm font-medium leading-relaxed tracking-[-0.32px] text-white/85 md:text-base">
            Crows eat from an automated feeder. A heated shelter stays open for
            whoever else stops by.
          </p>
          <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
            <button
              type="button"
              disabled
              className="inline-flex h-12 cursor-not-allowed items-center justify-center rounded-[50px] border border-white/35 bg-white/10 px-8 font-urbanist text-[16px] font-semibold leading-[22.4px] tracking-[-0.32px] text-white/75 opacity-80 backdrop-blur-sm"
              aria-disabled="true"
              title="Feeding controls are not connected yet"
            >
              Feeder
            </button>
            <Link
              href="/porch"
              className="inline-flex h-12 items-center justify-center rounded-[50px] bg-cc-yellow px-8 font-urbanist text-[16px] font-semibold leading-[22.4px] tracking-[-0.32px] text-cc-ink transition-opacity hover:opacity-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              Shelter Cam
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HomePage;
