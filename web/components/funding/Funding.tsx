import { FundingHero } from './FundingHero';
import { FundingMethods } from './FundingMethods';

interface FundingProps {
  phoneNumber?: string | null;
}

export function Funding({ phoneNumber }: FundingProps) {
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
                 <div className="px-4 pb-8">
                   <FundingMethods phoneNumber={phoneNumber} />
                 </div>
        </div>
      </main>
    </div>
  );
}