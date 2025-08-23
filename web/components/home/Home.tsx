import { HomeHeader } from './HomeHeader';
import { HomeHero } from './HomeHero';
import { HomeFeatures } from './HomeFeatures';
import { HomeFooter } from './HomeFooter';

export function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      <main>
        <div className="container mx-auto px-4 py-8 md:py-12 lg:py-16">
          <HomeHeader />
          <HomeHero />
          <HomeFeatures />
        </div>
      </main>
      <HomeFooter />
    </div>
  );
}
