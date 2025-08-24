import { HomeHero } from './HomeHero';
import { HomeFeatures } from './HomeFeatures';
import { HomeFooter } from './HomeFooter';
import { AppHeader } from '../shared';

export function Home() {
  return (
    <div className="min-h-screen">
      <AppHeader />
      
      <main className="relative">
        {/* iOS-style background with subtle texture */}
        <div className="absolute inset-0 bg-gradient-to-b from-gray-50 via-white to-gray-50"></div>
        
        <div className="relative px-4 py-6 md:py-8 lg:py-12 max-w-sm mx-auto md:max-w-6xl">
          <HomeHero />
          <HomeFeatures />
        </div>
      </main>
      <HomeFooter />
    </div>
  );
}
