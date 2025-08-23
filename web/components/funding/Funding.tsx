import { FundingHero } from './FundingHero';
import { FundingMethods } from './FundingMethods';

export function Funding() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* iOS-style status bar area */}
      <div className="h-11 bg-white"></div>
      
      <main className="relative">
        {/* iOS-style background */}
        <div className="absolute inset-0 bg-gradient-to-b from-gray-50 via-white to-gray-50"></div>
        
        <div className="relative">
          {/* Hero section */}
          <div className="px-4 py-6 max-w-sm mx-auto md:max-w-6xl">
            <FundingHero />
          </div>
          
          {/* Methods section */}
          <div className="px-4 pb-6">
            <FundingMethods />
          </div>
          
          {/* iOS-style security footer */}
          <div className="px-4 pb-8">
            <div className="max-w-sm mx-auto">
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                <div className="flex items-center justify-center space-x-2 text-gray-600">
                  <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm font-medium">Protegido con encriptación SSL</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
