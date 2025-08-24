import React from 'react';

const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-900 via-neutral-800 to-stone-900">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.02%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%221%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30"></div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-8 md:py-16">
        {/* Header Section */}
        <div className="text-center mb-6 lg:mb-8">
          <h1 className="text-xl md:text-2xl lg:text-4xl font-light text-amber-400 mb-3 tracking-wide">
            Critter Canteen
          </h1>
          <p className="text-xs md:text-sm text-white max-w-3xl mx-auto leading-relaxed font-light">
            An innovative IoT-powered crow feeding and imaging station that
            combines wildlife observation with cutting-edge technology. Watch
            our feathered friends enjoy their meals and view captured images in
            real-time.
          </p>
        </div>

        {/* Feed Button Section */}
        <div className="text-center mb-8">
          <button className="bg-stone-800 text-amber-400 border border-amber-400 font-medium py-3 px-8 rounded-lg hover:bg-stone-700 transition-colors">
            Feed the Crows
          </button>
        </div>

        {/* Status Indicators */}
        <div className="flex justify-center items-center gap-8 mb-6">
          <div className="flex items-start gap-2" data-testid="feeder-status">
            <span className="text-sm mt-0.5">🟢</span>
            <div className="text-left">
              <h3 className="text-sm font-medium text-white mb-1">
                Feeder Status
              </h3>
              <p className="text-gray-300 text-xs">Online & Ready</p>
            </div>
          </div>

          <div className="flex items-start gap-2" data-testid="camera-status">
            <span className="text-lg -mt-1">📷</span>
            <div className="text-left">
              <h3 className="text-sm font-medium text-white mb-1">
                Camera Status
              </h3>
              <p className="text-gray-300 text-xs">Active & Monitoring</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
