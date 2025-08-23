'use client';

import { useEffect, useState } from 'react';

interface ServiceWorkerState {
  isSupported: boolean;
  isRegistered: boolean;
  isOnline: boolean;
  updateAvailable: boolean;
  installing: boolean;
  showConnectionRestored: boolean;
}

export function ServiceWorkerProvider({ children }: { children: React.ReactNode }) {
  const [swState, setSwState] = useState<ServiceWorkerState>({
    isSupported: false,
    isRegistered: false,
    isOnline: true,
    updateAvailable: false,
    installing: false,
    showConnectionRestored: false,
  });

  const [showUpdatePrompt, setShowUpdatePrompt] = useState(false);

  useEffect(() => {
    // Verificar soporte para Service Workers
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      setSwState(prev => ({ ...prev, isSupported: true }));
      registerServiceWorker();
    }

    // Estado inicial de conexión
    const initialOnlineState = navigator.onLine;
    console.log('[ServiceWorker] Initial online state:', initialOnlineState);
    setSwState(prev => ({ ...prev, isOnline: initialOnlineState }));

    // Función para verificar conexión real (no solo navigator.onLine)
    const checkRealConnection = async () => {
      try {
        // Intentar hacer una request pequeña al mismo dominio
        const response = await fetch('/manifest.json', { 
          method: 'HEAD',
          cache: 'no-cache',
          signal: AbortSignal.timeout(5000) // 5 segundos timeout
        });
        return response.ok;
      } catch {
        return false;
      }
    };

    // Listeners para estado de conexión
    const handleOnline = async () => {
      console.log('[ServiceWorker] Online event fired');
      
      // Verificar conexión real
      const hasRealConnection = await checkRealConnection();
      console.log('[ServiceWorker] Real connection check:', hasRealConnection);
      
      setSwState(prev => {
        // Solo mostrar "conexión restaurada" si estaba offline antes Y hay conexión real
        const wasOffline = !prev.isOnline;
        const shouldShowRestored = wasOffline && hasRealConnection;
        console.log('[ServiceWorker] Was offline:', wasOffline, 'Should show restored:', shouldShowRestored);
        
        return { 
          ...prev, 
          isOnline: hasRealConnection,
          showConnectionRestored: shouldShowRestored
        };
      });
      
      // Auto-ocultar la notificación después de 3 segundos
      if (hasRealConnection) {
        setTimeout(() => {
          setSwState(prev => ({ ...prev, showConnectionRestored: false }));
        }, 3000);
      }
    };
    
    const handleOffline = () => {
      console.log('[ServiceWorker] Offline event fired');
      setSwState(prev => ({ 
        ...prev, 
        isOnline: false,
        showConnectionRestored: false
      }));
    };

    // Registrar listeners
    console.log('[ServiceWorker] Registering connection listeners');
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Verificar conexión periódicamente como fallback
    const connectionCheckInterval = setInterval(async () => {
      const navigatorOnline = navigator.onLine;
      const realConnection = navigatorOnline ? await checkRealConnection() : false;
      
      setSwState(prev => {
        if (prev.isOnline !== realConnection) {
          console.log('[ServiceWorker] Connection state changed via polling:', realConnection);
          return { 
            ...prev, 
            isOnline: realConnection,
            showConnectionRestored: !prev.isOnline && realConnection
          };
        }
        return prev;
      });
    }, 3000); // Verificar cada 3 segundos

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(connectionCheckInterval);
    };
  }, []);

  const registerServiceWorker = async () => {
    try {
      console.log('[PWA] Registering Service Worker...');
      
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
      });

      setSwState(prev => ({ ...prev, isRegistered: true }));
      console.log('[PWA] Service Worker registered successfully');

      // Listener para actualizaciones
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (!newWorker) return;

        setSwState(prev => ({ ...prev, installing: true }));

        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed') {
            setSwState(prev => ({ ...prev, installing: false }));
            
            if (navigator.serviceWorker.controller) {
              // Hay una actualización disponible
              setSwState(prev => ({ ...prev, updateAvailable: true }));
              setShowUpdatePrompt(true);
            }
          }
        });
      });

      // Listener para cuando el SW toma control
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('[PWA] Service Worker controller changed');
        window.location.reload();
      });

    } catch (error) {
      console.error('[PWA] Service Worker registration failed:', error);
    }
  };

  const updateServiceWorker = () => {
    if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' });
    }
    setShowUpdatePrompt(false);
  };

  const dismissUpdate = () => {
    setShowUpdatePrompt(false);
    setSwState(prev => ({ ...prev, updateAvailable: false }));
  };

  return (
    <>
      {children}
      
      {/* Indicador de estado offline estilo nativo */}
      {!swState.isOnline && (
        <div className="fixed top-0 left-0 right-0 bg-gradient-to-r from-red-500 to-red-600 text-white text-center py-3 px-4 z-50 shadow-lg">
          <div className="flex items-center justify-center space-x-3">
            <div className="relative">
              <div className="h-2 w-2 bg-white rounded-full animate-pulse"></div>
              <div className="absolute inset-0 h-2 w-2 bg-white rounded-full animate-ping"></div>
            </div>
            <span className="text-sm font-medium tracking-wide">Sin conexión a internet</span>
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      )}

      {/* Indicador de instalación estilo nativo */}
      {swState.installing && (
        <div className="fixed top-0 left-0 right-0 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-center py-3 px-4 z-50 shadow-lg">
          <div className="flex items-center justify-center space-x-3">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
            <span className="text-sm font-medium tracking-wide">Actualizando aplicación...</span>
            <div className="w-16 bg-white bg-opacity-30 rounded-full h-1">
              <div className="bg-white h-1 rounded-full animate-pulse" style={{ width: '60%' }}></div>
            </div>
          </div>
        </div>
      )}

      {/* Prompt de actualización estilo nativo */}
      {showUpdatePrompt && (
        <div className="fixed bottom-6 left-4 right-4 z-50 md:bottom-4 md:left-6 md:right-auto md:max-w-sm">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden transform transition-all duration-300 scale-100">
            <div className="p-5">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-semibold text-gray-900 mb-1">
                    Actualización Disponible
                  </h3>
                  <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                    Una nueva versión de Senu está lista para instalar.
                  </p>
                  
                  <div className="flex space-x-3">
                    <button
                      onClick={updateServiceWorker}
                      className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-medium py-2.5 px-4 rounded-xl transition-colors duration-200 text-sm"
                    >
                      Actualizar
                    </button>
                    <button
                      onClick={dismissUpdate}
                      className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2.5 px-4 rounded-xl transition-colors duration-200 text-sm"
                    >
                      Después
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Estado de conexión restaurada */}
      {swState.showConnectionRestored && (
        <div className="fixed top-0 left-0 right-0 bg-emerald-600 text-white text-center py-2 px-4 z-50 transform transition-all duration-300 animate-in slide-in-from-top">
          <div className="flex items-center justify-center space-x-2">
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span className="text-sm font-medium">Conexión restaurada</span>
          </div>
        </div>
      )}
    </>
  );
}

// Hook para usar el estado del Service Worker
export function useServiceWorker() {
  const [isOnline, setIsOnline] = useState(true);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Solo verificar estado inicial, no registrar listeners duplicados
    setIsOnline(navigator.onLine);

    // Verificar si está instalado como PWA
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    // Escuchar cambios en el estado global del ServiceWorkerProvider
    // En lugar de registrar listeners duplicados
    const checkOnlineStatus = () => {
      setIsOnline(navigator.onLine);
    };

    // Verificar cada segundo si hay cambios (fallback)
    const interval = setInterval(checkOnlineStatus, 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  const cacheUrls = (urls: string[]) => {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'CACHE_URLS',
        payload: { urls }
      });
    }
  };

  return {
    isOnline,
    isInstalled,
    cacheUrls,
  };
}
