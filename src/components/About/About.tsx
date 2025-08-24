import React from 'react';
import Link from 'next/link';

const About: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-stone-900 via-neutral-800 to-stone-900">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.02%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%221%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30"></div>
      <div className="relative z-10 max-w-6xl mx-auto px-6 py-8 md:py-16 flex-1 flex flex-col">
        <div className="text-center mb-4 md:mb-6 lg:mb-8">
          <h1 className="text-xl md:text-2xl lg:text-4xl font-light text-amber-400 mb-3 tracking-wide">
            About Critter Canteen
          </h1>
          <p className="text-xs md:text-sm text-white max-w-3xl mx-auto leading-relaxed font-light mb-4 md:mb-2">
            Critter Canteen is an innovative IoT-powered crow feeding and
            imaging station that combines wildlife observation with cutting-edge
            technology. Our automated feeding system allows users to remotely
            dispense food for local crows while capturing high-quality images of
            these intelligent birds in their natural habitat.
          </p>
          <p className="text-xs md:text-sm text-white max-w-3xl mx-auto leading-relaxed font-light mb-4 md:mb-2">
            The system features a smart camera that automatically captures
            images when crows visit the feeding station, providing researchers
            and wildlife enthusiasts with valuable data about crow behavior,
            feeding patterns, and local populations. Users can trigger feeding
            events through our web interface and view captured images in
            real-time.
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
              className="inline-flex items-center px-4 md:px-6 py-2 md:py-3 bg-stone-800 text-amber-400 border border-amber-400 font-medium text-sm md:text-base rounded-lg hover:bg-stone-700 transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
