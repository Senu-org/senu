import { FundingHero } from './FundingHero';
import { FundingMethods } from './FundingMethods';
import { AppHeader } from '../shared';

interface FundingProps {
  phoneNumber?: string | null;
  amount?: number | null;
}

export function Funding({ phoneNumber, amount }: FundingProps) {
  return (
    <div className="min-h-screen">
      <AppHeader />
      
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
            <FundingMethods phoneNumber={phoneNumber} amount={amount} />
          </div>
        </div>
      </main>
    </div>
  );
}