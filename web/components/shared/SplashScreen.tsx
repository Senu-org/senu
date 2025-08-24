'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

interface SplashScreenProps {
  onComplete: () => void;
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Show splash screen for 1.5 seconds
    const timer = setTimeout(() => {
      setFadeOut(true);
      // Wait for fade out animation to complete before calling onComplete
      setTimeout(onComplete, 300);
    }, 1500);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className={`
      fixed inset-0 z-50 bg-gradient-to-br from-purple-400 via-purple-500 to-purple-600 
      flex items-center justify-center transition-opacity duration-300
      ${fadeOut ? 'opacity-0' : 'opacity-100'}
    `}>
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-white rounded-full blur-xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-24 h-24 bg-white rounded-full blur-lg"></div>
        <div className="absolute top-3/4 left-1/3 w-16 h-16 bg-white rounded-full blur-md"></div>
      </div>

      {/* Main content */}
      <div className="relative text-center">
        {/* Logo with animation */}
        <div className="mb-8 animate-pulse">
          <div className="relative mx-auto mb-4">
            <div className="w-24 h-24 mx-auto flex items-center justify-center relative">
              {/* Senu logo */}
              <Image
                src="/senu.png"
                alt="Senu"
                width={40}
                height={40}
                className="rounded-2xl z-10 relative"
              />
              
              {/* Animated rings */}
              <div className="absolute inset-0 w-24 h-24">
                {/* Outer ring */}
                <svg className="animate-spin absolute inset-0 w-24 h-24 text-white" fill="none" viewBox="0 0 24 24" style={{ animationDuration: '3s' }}>
                  <circle 
                    cx="12" 
                    cy="12" 
                    r="10" 
                    stroke="currentColor" 
                    strokeWidth="1"
                    strokeLinecap="round"
                    strokeDasharray="50.24 12.56"
                    className="opacity-40"
                  />
                </svg>
                
                {/* Inner ring */}
                <svg className="absolute inset-2 w-20 h-20 text-white" fill="none" viewBox="0 0 24 24" style={{ animation: 'spin 2s linear infinite reverse' }}>
                  <circle 
                    cx="12" 
                    cy="12" 
                    r="10" 
                    stroke="currentColor" 
                    strokeWidth="1"
                    strokeLinecap="round"
                    strokeDasharray="25.12 37.68"
                    className="opacity-60"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* App name */}
        <h1 className="text-4xl font-bold text-white mb-2 animate-fade-in">Senu</h1>
        <p className="text-white/80 text-lg animate-fade-in">Remesas por WhatsApp</p>
        
        {/* Loading indicator */}
        <div className="mt-8 flex justify-center">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}
