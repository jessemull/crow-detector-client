import React from 'react';

const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-gray-900 mb-6">
            🐦 Critter Canteen
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Welcome to the automated crow feeding and imaging station. Watch our
            feathered friends enjoy their meals and view captured images in
            real-time.
          </p>

          <div className="bg-white rounded-lg shadow-lg p-8 max-w-4xl mx-auto">
            <h2 className="text-3xl font-semibold text-gray-800 mb-6">
              🍽️ Feeding Station Status
            </h2>

            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div className="text-center" data-testid="feeder-status">
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-4xl">🟢</span>
                </div>
                <h3 className="text-xl font-medium text-gray-700 mb-2">
                  Feeder Status
                </h3>
                <p className="text-gray-600">Online & Ready</p>
              </div>

              <div className="text-center" data-testid="camera-status">
                <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-4xl">📷</span>
                </div>
                <h3 className="text-xl font-medium text-gray-700 mb-2">
                  Camera Status
                </h3>
                <p className="text-gray-600">Active & Monitoring</p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                🎯 Ready to Feed?
              </h3>
              <p className="text-gray-600 mb-4">
                Push the button below to dispense food for our crow friends.
                Images will be captured and uploaded automatically.
              </p>
              <button className="bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200">
                🍽️ Feed the Crows
              </button>
            </div>
          </div>

          <div className="mt-12 text-center">
            <p className="text-gray-500">
              🚧 This is a placeholder interface. The actual feeding and imaging
              functionality will be implemented soon.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
