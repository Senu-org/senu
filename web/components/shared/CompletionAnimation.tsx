'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface CompletionAnimationProps {
  isVisible: boolean;
  onComplete?: () => void;
  title?: string;
  subtitle?: string;
  redirectTo?: string;
  isLoading?: boolean;
  loadingMessage?: string;
  showDismissButton?: boolean;
}

export function CompletionAnimation({ 
  isVisible, 
  onComplete, 
  title = "¡Registro Completado!",
  subtitle = "Tu método de pago ha sido configurado exitosamente",
  redirectTo,
  isLoading = false,
  loadingMessage = "Procesando...",
  showDismissButton = false
}: CompletionAnimationProps) {
  const [animationStep, setAnimationStep] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [showDismiss, setShowDismiss] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isVisible && mounted) {
      setAnimationStep(0);
      
      // If loading, don't start animation yet
      if (isLoading) {
        return;
      }
      
      // Animation sequence (only when not loading)
      const timer1 = setTimeout(() => setAnimationStep(1), 100);
      const timer2 = setTimeout(() => setAnimationStep(2), 600);
      const timer3 = setTimeout(() => setAnimationStep(3), 1100);
      const timer4 = setTimeout(() => {
        setAnimationStep(4);
        
        // Wait for animation to fully complete before showing dismiss button or redirecting
        setTimeout(() => {
          onComplete?.();
          
          // If dismiss button is enabled, show it instead of auto-redirecting
          if (showDismissButton) {
            setShowDismiss(true);
          } else {
            // Handle redirect if specified - only after animation is complete
            if (redirectTo) {
              if (redirectTo.startsWith('http://') || redirectTo.startsWith('https://')) {
                window.location.href = redirectTo;
              } else {
                router.push(redirectTo);
              }
            }
          }
        }, 1500); // Wait for animation to fully complete before showing dismiss or redirect
      }, 2500); // Complete animation sequence timing

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
        clearTimeout(timer4);
      };
    }
  }, [isVisible, onComplete, mounted, redirectTo, router, isLoading]);

  if (!mounted || !isVisible) return null;

  const modalContent = (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-3xl p-8 mx-4 max-w-sm w-full text-center">
        
        {/* Loading State */}
        {isLoading ? (
          <>
            {/* Futuristic dual spinner with Senu logo */}
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
              <p className="text-gray-600">{loadingMessage}</p>
            </div>
          </>
        ) : (
          <>
            {/* Success Animation - Only shown when not loading */}
            {/* Animated checkmark circle */}
            <div className="relative mx-auto mb-6">
              <div 
                className={`
                  w-20 h-20 mx-auto rounded-full border-4 border-purple-500 flex items-center justify-center
                  transform transition-all duration-500 ease-out
                  ${animationStep >= 1 ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}
                `}
              >
                {/* Checkmark animation */}
                <svg 
                  className={`
                    w-10 h-10 text-purple-500 transform transition-all duration-300 ease-out delay-300
                    ${animationStep >= 2 ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}
                  `} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={3} 
                    d="M5 13l4 4L19 7"
                    className={`${animationStep >= 2 ? 'animate-pulse' : ''}`}
                  />
                </svg>
              </div>
              
              {/* Ripple effect */}
              <div 
                className={`
                  absolute inset-0 w-20 h-20 mx-auto rounded-full border-2 border-purple-300
                  transform transition-all duration-700 ease-out
                  ${animationStep >= 2 ? 'scale-150 opacity-0' : 'scale-100 opacity-100'}
                `}
              />
            </div>

            {/* Text content */}
            <div 
              className={`
                space-y-2 transform transition-all duration-500 ease-out delay-500
                ${animationStep >= 3 ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}
              `}
            >
              <h3 className="text-xl font-bold text-gray-900">{title}</h3>
              <p className="text-gray-600">{subtitle}</p>
            </div>

            {/* Feature badges */}
            <div 
              className={`
                flex justify-center space-x-2 mt-6 transform transition-all duration-500 ease-out delay-700
                ${animationStep >= 3 ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}
              `}
            >
              <div className="flex items-center space-x-1 px-3 py-1 bg-purple-100 rounded-full">
                <svg className="w-3 h-3 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span className="text-xs font-medium text-purple-700">Verificado</span>
              </div>
              {redirectTo?.includes('wa.me') && (
                <div className="flex items-center space-x-1 px-3 py-1 bg-green-100 rounded-full">
                  <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347"/>
                  </svg>
                  <span className="text-xs font-medium text-green-700">WhatsApp</span>
                </div>
              )}
            </div>

            {/* Dismiss Button - Only shown when showDismissButton is true and animation is complete */}
            {showDismissButton && showDismiss && (
              <div 
                className={`
                  mt-6 transform transition-all duration-500 ease-out
                  ${showDismiss ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}
                `}
              >
                <button
                  onClick={() => {
                    // Handle redirect when dismiss button is clicked
                    if (redirectTo) {
                      if (redirectTo.startsWith('http://') || redirectTo.startsWith('https://')) {
                        window.location.href = redirectTo;
                      } else {
                        router.push(redirectTo);
                      }
                    }
                  }}
                  className="w-full bg-purple-600 text-white font-semibold py-3 px-6 rounded-2xl hover:bg-purple-700 active:bg-purple-800 transition-colors duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
                >
                  Continuar
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
