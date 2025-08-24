'use client';

import { useState, useEffect } from 'react';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { NativeNotificationPrompt, MaterialNotificationPrompt } from './NativeNotificationPrompt';

interface NotificationManagerProps {
  children?: React.ReactNode;
}

export function NotificationManager({ children }: NotificationManagerProps) {
  const {
    isSupported,
    permission,
    isSubscribed,
    isLoading,
    requestPermission,
    subscribe,
    unsubscribe,
    showNotification,
  } = usePushNotifications();

  const [showPrompt, setShowPrompt] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [deviceType, setDeviceType] = useState<'ios' | 'android' | 'desktop'>('desktop');

  // Mostrar prompt después de un tiempo si no está suscrito
  useEffect(() => {
    if (!isSupported || permission.denied || isSubscribed || dismissed) return;

    const timer = setTimeout(() => {
      setShowPrompt(true);
    }, 10000); // Mostrar después de 10 segundos

    return () => clearTimeout(timer);
  }, [isSupported, permission.denied, isSubscribed, dismissed]);

  const handleEnableNotifications = async () => {
    setShowPrompt(false);
    
    try {
      // El hook subscribe ahora maneja automáticamente la solicitud de permisos
      const subscriptionResult = await subscribe();
      
      if (subscriptionResult) {
        // Mostrar notificación de bienvenida
        setTimeout(async () => {
          await showNotification({
            title: '¡Notificaciones Activadas!',
            body: 'Te notificaremos sobre el estado de tus transacciones.',
            tag: 'welcome',
            actions: [
              {
                action: 'view',
                title: 'Ver Transacciones'
              }
            ]
          });
        }, 1000); // Esperar un poco para que se procese la suscripción
      }
    } catch (error) {
      console.error('[NotificationManager] Error enabling notifications:', error);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setDismissed(true);
    localStorage.setItem('senu-notifications-dismissed', 'true');
  };

  const handleToggleNotifications = async () => {
    try {
      if (isSubscribed) {
        await unsubscribe();
      } else {
        // El hook subscribe ahora maneja automáticamente la solicitud de permisos
        const subscriptionResult = await subscribe();
        
        if (subscriptionResult) {
          // Mostrar notificación de confirmación
          setTimeout(async () => {
            await showNotification({
              title: '¡Notificaciones Activadas!',
              body: 'Recibirás notificaciones sobre tus transacciones.',
              tag: 'toggle-enabled'
            });
          }, 1000);
        }
      }
    } catch (error) {
      console.error('[NotificationManager] Error toggling notifications:', error);
    }
  };

  // Detectar tipo de dispositivo y verificar si fue previamente descartado
  useEffect(() => {
    // Detectar tipo de dispositivo
    const userAgent = navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(userAgent)) {
      setDeviceType('ios');
    } else if (/android/.test(userAgent)) {
      setDeviceType('android');
    } else {
      setDeviceType('desktop');
    }

    // Verificar si fue descartado previamente
    const wasDismissed = localStorage.getItem('senu-notifications-dismissed');
    if (wasDismissed) {
      setDismissed(true);
    }
  }, []);

  return (
    <>
      {children}
      
      {/* Prompt de notificaciones nativo según dispositivo */}
      {showPrompt && isSupported && !permission.denied && (
        <>
          {deviceType === 'ios' && (
            <NativeNotificationPrompt
              isVisible={showPrompt}
              onAllow={handleEnableNotifications}
              onDeny={handleDismiss}
              isLoading={isLoading}
            />
          )}
          
          {deviceType === 'android' && (
            <MaterialNotificationPrompt
              isVisible={showPrompt}
              onAllow={handleEnableNotifications}
              onDeny={handleDismiss}
              isLoading={isLoading}
            />
          )}
          
          {deviceType === 'desktop' && (
            <NativeNotificationPrompt
              isVisible={showPrompt}
              onAllow={handleEnableNotifications}
              onDeny={handleDismiss}
              isLoading={isLoading}
            />
          )}
        </>
      )}

      {/* Control de notificaciones flotante estilo nativo */}
      {isSupported && (
        <div className="fixed bottom-6 right-6 z-40 md:top-4 md:bottom-auto">
          <button
            onClick={handleToggleNotifications}
            disabled={isLoading}
            className={`
              relative p-4 rounded-full shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95
              ${isSubscribed 
                ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-200' 
                : 'bg-white hover:bg-gray-50 text-gray-600 shadow-gray-200 border border-gray-100'
              }
            `}
            title={isSubscribed ? 'Desactivar notificaciones' : 'Activar notificaciones'}
          >
            {/* Badge de estado */}
            {isSubscribed && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></div>
            )}
            
            {isLoading ? (
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-current border-t-transparent"></div>
            ) : (
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                {isSubscribed ? (
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-.61-.35-1.16-.78-1.65-1.27l1.65.95v.32zm2 0v-.32l1.65-.95c-.49.49-1.04.92-1.65 1.27zM18 14c0 .37-.04.72-.12 1.06-.08.34-.2.66-.36.96-.16.3-.36.57-.6.81-.24.24-.51.44-.81.6-.3.16-.62.28-.96.36-.34.08-.69.12-1.06.12H7.94c-.37 0-.72-.04-1.06-.12-.34-.08-.66-.2-.96-.36-.3-.16-.57-.36-.81-.6-.24-.24-.44-.51-.6-.81-.16-.3-.28-.62-.36-.96C4.04 14.72 4 14.37 4 14v-2c0-4.42 3.58-8 8-8s8 3.58 8 8v2z"/>
                ) : (
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8 0-1.48.41-2.86 1.12-4.06l10.94 10.94C16.86 19.59 15.48 20 12 20zM18.88 16.06L7.94 5.12C9.14 4.41 10.52 4 12 4c4.41 0 8 3.59 8 8 0 1.48-.41 2.86-1.12 4.06z"/>
                )}
              </svg>
            )}
          </button>
          
          {/* Tooltip */}
          <div className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-gray-900 text-white text-xs rounded-lg opacity-0 pointer-events-none transition-opacity duration-200 whitespace-nowrap group-hover:opacity-100">
            {isSubscribed ? 'Notificaciones activadas' : 'Activar notificaciones'}
            <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
          </div>
        </div>
      )}
    </>
  );
}

// Componente para mostrar el estado de las notificaciones
export function NotificationStatus() {
  const { isSupported, permission, isSubscribed } = usePushNotifications();

  if (!isSupported) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
        <div className="flex items-center">
          <svg className="h-5 w-5 text-yellow-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span className="text-sm text-yellow-800">
            Las notificaciones no están soportadas en este navegador
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={`border rounded-lg p-3 ${
      isSubscribed 
        ? 'bg-emerald-50 border-emerald-200' 
        : permission.denied 
        ? 'bg-red-50 border-red-200'
        : 'bg-gray-50 border-gray-200'
    }`}>
      <div className="flex items-center">
        <div className={`h-2 w-2 rounded-full mr-2 ${
          isSubscribed 
            ? 'bg-emerald-500' 
            : permission.denied 
            ? 'bg-red-500'
            : 'bg-gray-400'
        }`}></div>
        <span className={`text-sm ${
          isSubscribed 
            ? 'text-emerald-800' 
            : permission.denied 
            ? 'text-red-800'
            : 'text-gray-700'
        }`}>
          {isSubscribed 
            ? 'Notificaciones activadas' 
            : permission.denied 
            ? 'Notificaciones bloqueadas'
            : 'Notificaciones desactivadas'
          }
        </span>
      </div>
    </div>
  );
}
