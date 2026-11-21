import React from 'react';
import Link from 'next/link';
import { preload } from 'react-dom';
import { ArrowRight } from 'lucide-react';
import SplashBackground from '@components/SplashBackground';
import {
  SPLASH_SIZES,
  getAboutImage,
  splashFallback,
  splashSrcSet,
} from '@constants/heroes';

const About: React.FC = () => {
  const aboutImage = getAboutImage();
  const fallback = splashFallback(aboutImage);

  preload(fallback.webp, {
    as: 'image',
    fetchPriority: 'high',
    imageSrcSet: splashSrcSet(aboutImage, 'webp'),
    imageSizes: SPLASH_SIZES,
    type: 'image/webp',
  });

  return (
    <section className="relative isolate min-h-[calc(100dvh+4.5rem)] overflow-hidden bg-stone-950">
      <SplashBackground
        image={aboutImage}
        frameClassName="!top-0 !bottom-auto !h-full md:!-top-[20%] md:!h-[120%]"
      />
      <div
        className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/25 to-black/55"
        aria-hidden="true"
      />

      <div className="relative z-10 flex min-h-dvh flex-col items-center justify-start px-6 pb-[max(6rem,calc(env(safe-area-inset-bottom,0px)+4rem))] pt-28 text-center md:justify-center md:px-10">
        <h1 className="mb-5 max-w-4xl font-urbanist text-4xl font-medium leading-tight tracking-[-0.04em] text-white md:text-6xl md:leading-[1.05] lg:text-[80px] lg:leading-[80px] lg:tracking-[-1.6px]">
          Wildlife care, engineered end to end.
        </h1>
        <p className="mx-auto mb-4 max-w-2xl font-urbanist text-base font-medium leading-relaxed tracking-[-0.32px] text-white/90 md:text-lg">
          Critter Canteen is a backyard wildlife station. Guests feed crows
          using an automated feeder, a heated shelter keeps wildlife
          comfortable, and motion-sensing cameras capture every visit.
        </p>
        <p className="mx-auto mb-10 max-w-2xl font-urbanist text-base font-medium leading-relaxed tracking-[-0.32px] text-white/85 md:text-lg">
          Edge IoT handles sensing and control. The cloud stores and delivers
          every clip. AI and LLM tooling power detection and day-to-day
          operations. A professional system in a quiet backyard form.
        </p>

        <Link
          href="/"
          className="inline-flex h-12 items-center gap-3 rounded-[50px] bg-white pl-6 pr-2 font-urbanist text-[16px] font-semibold leading-[22.4px] tracking-[-0.32px] text-cc-ink transition-opacity hover:opacity-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          Back to Home
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-cc-yellow text-cc-ink">
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </span>
        </Link>
      </div>
    </section>
  );
};

export default About;
