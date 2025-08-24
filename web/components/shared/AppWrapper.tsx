'use client';

import { useState, useEffect } from 'react';
import { SplashScreen } from './SplashScreen';
import { WalletKitProvider } from '@/components/providers';
import { AppKitProvider } from '@/components/providers/AppKitProvider';

interface AppWrapperProps {
  children: React.ReactNode;
  cookies?: string | null;
}

export function AppWrapper({ children, cookies }: AppWrapperProps) {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    // Add class to body to control visibility
    document.body.classList.add('splash-ready');
    
    return () => {
      document.body.classList.remove('splash-ready');
    };
  }, []);

  const handleSplashComplete = () => {
    setShowSplash(false);
  };

  // Use the cookies passed from the server

  return (
    <AppKitProvider cookies={cookies}>
      <WalletKitProvider>
        <>
          {/* Splash screen - always shows first */}
          {showSplash && <SplashScreen onComplete={handleSplashComplete} />}
          
          {/* Main content - hidden by CSS initially, then controlled by state */}
          <div className={`splash-loading ${!showSplash ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}>
            {children}
          </div>
        </>
      </WalletKitProvider>
    </AppKitProvider>
  );
}
