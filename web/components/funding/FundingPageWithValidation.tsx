'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Funding } from './Funding';

export function FundingPageWithValidation() {
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
          {/* Loading spinner */}
          <div className="relative mx-auto mb-6">
            <div className="w-20 h-20 mx-auto rounded-full border-4 border-purple-200 flex items-center justify-center">
              <svg className="animate-spin w-10 h-10 text-purple-500" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
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

  // Render the funding page if validation passed
  return <Funding phoneNumber={phoneNumber} />;
}
