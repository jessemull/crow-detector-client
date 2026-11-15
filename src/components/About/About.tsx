import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { getAboutImage } from '@constants/heroes';

const About: React.FC = () => {
  const aboutImage = getAboutImage();

  return (
    <section className="relative isolate min-h-[calc(100vh+4.5rem)] overflow-hidden bg-stone-950">
      <Image
        src={aboutImage.src}
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover"
        style={{ objectPosition: aboutImage.objectPosition }}
      />
      <div
        className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/25 to-black/55"
        aria-hidden="true"
      />

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 pb-24 pt-28 text-center md:px-10">
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
          className="inline-flex items-center gap-4 rounded-[50px] bg-white py-2.5 pl-6 pr-2.5 font-urbanist text-lg font-semibold tracking-[-0.4px] text-[#0e0e0e] transition-opacity hover:opacity-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          Back to Home
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#fff017] text-[#0e0e0e]">
            <ArrowRight className="h-5 w-5" aria-hidden="true" />
          </span>
        </Link>
      </div>
    </section>
  );
};

export default About;
