import { HomeHeader } from './HomeHeader';
import { HomeHero } from './HomeHero';
import { HomeFeatures } from './HomeFeatures';

export function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      <div className="container mx-auto px-4 py-8 md:py-12 lg:py-16">
        <HomeHeader />
        <HomeHero />
        <HomeFeatures />
      </div>
    </main>
  );
}
