import React from 'react';
import { PageShell } from '@components/PageShell';

const HomePage: React.FC = () => {
  return (
    <PageShell>
      <div className="text-center mb-6 lg:mb-8">
        <h1 className="text-xl md:text-2xl lg:text-4xl font-light text-amber-400 mb-3 tracking-wide">
          Critter Canteen
        </h1>
        <p className="text-xs md:text-sm text-white max-w-3xl mx-auto leading-relaxed font-light">
          An innovative IoT-powered crow feeding and imaging station that
          combines wildlife observation with cutting-edge technology. Watch our
          feathered friends enjoy their meals and view captured images in
          real-time.
        </p>
      </div>
      <div className="text-center mb-6">
        <h2 className="text-lg md:text-xl font-medium text-white mb-4">
          System Status
        </h2>
      </div>
      <div className="text-center mb-8">
        <button
          type="button"
          disabled
          className="bg-stone-800 text-amber-400 border border-amber-400 font-medium py-3 px-8 rounded-lg opacity-70 cursor-not-allowed"
          aria-disabled="true"
          title="Feeding controls are not connected yet"
        >
          Feed the Crows
        </button>
      </div>
      <div className="flex justify-center items-center gap-8 mb-6">
        <div className="flex items-start gap-2" data-testid="feeder-status">
          <span className="text-sm mt-0.5" aria-hidden="true">
            ⚪
          </span>
          <div className="text-left">
            <h3 className="text-sm font-medium text-white mb-1">
              Feeder Status
            </h3>
            <p className="text-gray-300 text-xs">Status unknown</p>
          </div>
        </div>
        <div className="flex items-start gap-2" data-testid="camera-status">
          <span className="text-lg -mt-1" aria-hidden="true">
            📷
          </span>
          <div className="text-left">
            <h3 className="text-sm font-medium text-white mb-1">
              Camera Status
            </h3>
            <p className="text-gray-300 text-xs">Status unknown</p>
          </div>
        </div>
      </div>
    </PageShell>
  );
};

export default HomePage;
