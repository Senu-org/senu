'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ReceiveMoney } from './ReceiveMoney';
import Image from 'next/image';

export function ReceivePageWithValidation() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isValidating, setIsValidating] = useState(true);
  const [phoneNumber, setPhoneNumber] = useState<string | null>(null);

  useEffect(() => {
    const phone = searchParams.get('phone') || searchParams.get('telephone');
    
    if (!phone) {
      // No phone number provided, redirect to home
      router.replace('/');
      return;
    }

    // Validate phone number format (basic validation)
    const phoneRegex = /^[\+]?[1-9][\d]{7,14}$/;
    if (!phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''))) {
      // Invalid phone format, redirect to home
      router.replace('/');
      return;
    }

    // Valid phone number
    setPhoneNumber(phone);
    setIsValidating(false);
  }, [searchParams, router]);

  // Show loading modal while validating
  if (isValidating) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-3xl p-8 mx-4 max-w-sm w-full text-center">
          {/* Loading spinner with Senu logo */}
          <div className="relative mx-auto mb-6">
            <div className="w-20 h-20 mx-auto flex items-center justify-center relative">
              {/* Senu logo in center */}
              <Image
                src="/senu.png"
                alt="Senu"
                width={32}
                height={32}
                className="rounded-lg z-10 relative"
              />
              {/* Outer arc - 80% complete, slower, clockwise */}
              <svg className="animate-spin absolute inset-0 w-20 h-20 text-purple-400" fill="none" viewBox="0 0 24 24" style={{ animationDuration: '3s' }}>
                <circle 
                  cx="12" 
                  cy="12" 
                  r="10" 
                  stroke="currentColor" 
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeDasharray="50.24 12.56"
                  className="opacity-70"
                />
              </svg>
              
              {/* Inner arc - 40% complete, faster, counter-clockwise */}
              <svg className="absolute inset-2 w-16 h-16 text-purple-600" fill="none" viewBox="0 0 24 24" style={{ animation: 'spin 2s linear infinite reverse' }}>
                <circle 
                  cx="12" 
                  cy="12" 
                  r="10" 
                  stroke="currentColor" 
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeDasharray="25.12 37.68"
                  className="opacity-90"
                />
              </svg>
            </div>
          </div>
          
          {/* Loading text */}
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-gray-900">Procesando...</h3>
            <p className="text-gray-600">Validando número de teléfono...</p>
          </div>
        </div>
      </div>
    );
  }

  // Render the receive page if validation passed
  return <ReceiveMoney phoneNumber={phoneNumber} />;
}
