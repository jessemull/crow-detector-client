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

        {/* Sub Header */}
        <div className="mb-2 md:mb-0 text-center">
          <h2 className="text-base md:text-lg font-normal text-white mb-1">
            Automated Crow Feeding & Imaging
          </h2>
          <p className="text-gray-300 text-xs md:text-sm font-light mb-3">
            Click the button below to dispense food and capture images of
            visiting crows.
          </p>
        </div>

        {/* Main Content */}
        <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 p-8 max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div className="text-center" data-testid="feeder-status">
              <div className="w-24 h-24 bg-emerald-100/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-300/30">
                <span className="text-4xl">🟢</span>
              </div>
              <h3 className="text-xl font-medium text-white mb-2">
                Feeder Status
              </h3>
              <p className="text-gray-300">Online & Ready</p>
            </div>

            <div className="text-center" data-testid="camera-status">
              <div className="w-24 h-24 bg-amber-100/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-amber-300/30">
                <span className="text-4xl">📷</span>
              </div>
              <h3 className="text-xl font-medium text-white mb-2">
                Camera Status
              </h3>
              <p className="text-gray-300">Active & Monitoring</p>
            </div>
          </div>

          <div className="bg-white/5 rounded-lg p-6 border border-white/10">
            <h3 className="text-xl font-semibold text-white mb-4">
              🎯 Ready to Feed?
            </h3>
            <p className="text-gray-300 mb-4">
              Push the button below to dispense food for our crow friends.
              Images will be captured and uploaded automatically.
            </p>
            <button className="bg-stone-800 text-amber-400 border border-amber-400 font-medium py-3 px-8 rounded-lg hover:bg-stone-700 transition-colors">
              🍽️ Feed the Crows
            </button>
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-400 text-xs">
            🚧 This is a placeholder interface. The actual feeding and imaging
            functionality will be implemented soon.
          </p>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
