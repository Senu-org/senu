import { ReceiveHero } from './ReceiveHero';
import { ReceiveMethods } from './ReceiveMethods';
import { AppHeader } from '../shared';

interface ReceiveMoneyProps {
  phoneNumber?: string | null;
}

export function ReceiveMoney({ phoneNumber }: ReceiveMoneyProps) {
  return (
    <div className="min-h-screen">
      <AppHeader />
      
      <main className="relative">
        {/* iOS-style background */}
        <div className="absolute inset-0 bg-gradient-to-b from-gray-50 via-white to-gray-50"></div>
        
        <div className="relative">
          {/* Hero section */}
          <div className="px-4 py-6 max-w-sm mx-auto md:max-w-6xl">
            <ReceiveHero />
          </div>
          
          {/* Methods section */}
          <div className="px-4 pb-8">
            <ReceiveMethods />
          </div>
        </div>
      </main>
    </div>
  );
}