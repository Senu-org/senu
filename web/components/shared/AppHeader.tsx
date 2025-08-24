'use client';

import Link from 'next/link';
import Image from 'next/image';

interface AppHeaderProps {
  showBackButton?: boolean;
  onBackClick?: () => void;
}

export function AppHeader({ showBackButton = false, onBackClick }: AppHeaderProps) {
  const handleBackClick = () => {
    if (onBackClick) {
      onBackClick();
    } else {
      window.history.back();
    }
  };

  return (
    <header className="relative z-10">
      {/* iOS-style status bar area */}
      <div className="h-11"></div>
      
      {/* Header content */}
      <div className="px-4 py-3">
        <div className="flex items-center max-w-sm mx-auto">
          {/* Left side - Senu logo */}
          <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <Image
              src="/senu.png"
              alt="Senu"
              width={32}
              height={32}
              className="rounded-lg"
            />
            <span className="text-lg font-bold text-gray-900">Senu</span>
          </Link>

          {/* Right side - Back button if needed */}
          <div className="ml-auto">
            {showBackButton && (
              <button
                onClick={handleBackClick}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 active:bg-gray-200 transition-colors"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
