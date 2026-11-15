import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getAboutImage } from '@constants/heroes';
import { PageShell } from '@components/PageShell';

const About: React.FC = () => {
  const aboutImage = getAboutImage();

  return (
    <PageShell
      className="flex flex-col"
      contentClassName="flex-1 flex flex-col"
    >
      <div className="mb-8 overflow-hidden rounded-2xl border border-white/10 shadow-[0_24px_60px_-32px_rgba(0,0,0,0.8)] md:mb-10">
        <div className="relative aspect-[21/9] min-h-[10rem] w-full bg-stone-900">
          <Image
            src={aboutImage.src}
            alt=""
            fill
            sizes="(max-width: 768px) 100vw, 1152px"
            className="object-cover"
            style={{ objectPosition: aboutImage.objectPosition }}
            priority
          />
          <div
            className="absolute inset-0 bg-gradient-to-t from-stone-950/50 to-transparent"
            aria-hidden="true"
          />
        </div>
      </div>

      <div className="mb-8 text-center md:mb-10">
        <h1 className="mb-4 text-xl font-light tracking-wide text-cc-amber md:text-2xl lg:text-4xl">
          About Critter Canteen
        </h1>
        <p className="mx-auto mb-4 max-w-2xl text-xs font-light leading-relaxed text-cc-cream-muted md:mb-3 md:text-sm">
          Critter Canteen is a small porch station for neighborhood wildlife — a
          heated shelter for whoever stops by, with a crow feeder on the way.
          Shelter Cam records short visits so you can peek in anytime.
        </p>
        <p className="mx-auto max-w-2xl text-xs font-light leading-relaxed text-cc-cream-muted md:text-sm">
          Built as a quiet backyard experiment: observe kindly, feed gently when
          the Feeder is ready, and keep the surface simple.
        </p>
      </div>

      <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
        <Link
          href="/porch"
          className="inline-flex items-center justify-center rounded-full bg-cc-lime px-6 py-2.5 text-sm font-medium text-stone-900 transition-colors hover:bg-[#d4e87a] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cc-amber"
        >
          Shelter Cam
        </Link>
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-full border border-cc-amber/70 bg-stone-900/60 px-6 py-2.5 text-sm font-medium text-cc-amber transition-colors hover:bg-stone-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cc-amber"
        >
          Back to Home
        </Link>
      </div>
    </PageShell>
  );
};

export default About;
