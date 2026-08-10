import React from 'react';
import Link from 'next/link';
import { PageShell } from '@components/PageShell';

const About: React.FC = () => {
  return (
    <PageShell
      className="flex flex-col"
      contentClassName="flex-1 flex flex-col"
    >
      <div className="text-center mb-4 md:mb-6 lg:mb-8">
        <h1 className="text-xl md:text-2xl lg:text-4xl font-light text-amber-400 mb-3 tracking-wide">
          About Critter Canteen
        </h1>
        <p className="text-xs md:text-sm text-white max-w-3xl mx-auto leading-relaxed font-light mb-4 md:mb-2">
          Critter Canteen is an innovative IoT-powered crow feeding and imaging
          station that combines wildlife observation with cutting-edge
          technology. Our automated feeding system allows users to remotely
          dispense food for local crows while capturing high-quality images of
          these intelligent birds in their natural habitat.
        </p>
        <p className="text-xs md:text-sm text-white max-w-3xl mx-auto leading-relaxed font-light mb-4 md:mb-2">
          The system features a smart camera that automatically captures images
          when crows visit the feeding station, providing researchers and
          wildlife enthusiasts with valuable data about crow behavior, feeding
          patterns, and local populations. Users can trigger feeding events
          through our web interface and view captured images in real-time.
        </p>
        <p className="text-xs md:text-sm text-white max-w-3xl mx-auto leading-relaxed font-light mb-4 md:mb-2">
          Built using modern web technologies including Next.js, AWS Cloud
          Infrastructure, and IoT sensors, Critter Canteen represents the
          intersection of wildlife conservation and technological innovation.
          All data is collected ethically and used to better understand and
          protect our local crow populations.
        </p>
      </div>
      <div className="flex justify-center">
        <div className="text-center">
          <Link
            href="/"
            className="inline-flex items-center px-4 md:px-6 py-2 md:py-3 bg-stone-800 text-amber-400 border border-amber-400 font-medium text-sm md:text-base rounded-lg hover:bg-stone-700 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </PageShell>
  );
};

export default About;
