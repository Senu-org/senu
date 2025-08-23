'use client';

import { useState, useEffect, useCallback } from 'react';

export interface NotificationPermission {
  granted: boolean;
  denied: boolean;
  default: boolean;
}

export interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export interface NotificationOptions {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  image?: string;
  tag?: string;
  data?: any;
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
  requireInteraction?: boolean;
  silent?: boolean;
  vibrate?: number[];
}

export function usePushNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>({
    granted: false,
    denied: false,
    default: true,
  });
  
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [isSupported, setIsSupported] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Verificar soporte y estado inicial
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const checkSupport = () => {
      const hasServiceWorker = 'serviceWorker' in navigator;
      const hasPushManager = 'PushManager' in window;
      const hasNotifications = 'Notification' in window;
      const isSecureContext = window.isSecureContext || window.location.protocol === 'https:';
      
      console.log('[Push] Support check:', {
        serviceWorker: hasServiceWorker,
        pushManager: hasPushManager,
        notifications: hasNotifications,
        secureContext: isSecureContext,
        protocol: window.location.protocol
      });
      
      const supported = hasServiceWorker && hasPushManager && hasNotifications && isSecureContext;
      
      setIsSupported(supported);

      if (supported) {
        updatePermissionState();
        getExistingSubscription();
      } else {
        console.warn('[Push] Push notifications not supported:', {
          missingServiceWorker: !hasServiceWorker,
          missingPushManager: !hasPushManager,
          missingNotifications: !hasNotifications,
          notSecureContext: !isSecureContext
        });
      }
    };

    checkSupport();
  }, []);

  // Actualizar estado de permisos
  const updatePermissionState = useCallback(() => {
    if (!('Notification' in window)) return;

    const currentPermission = Notification.permission;
    setPermission({
      granted: currentPermission === 'granted',
      denied: currentPermission === 'denied',
      default: currentPermission === 'default',
    });
  }, []);

  // Obtener suscripción existente
  const getExistingSubscription = useCallback(async () => {
    if (!('serviceWorker' in navigator)) return;

    try {
      const registration = await navigator.serviceWorker.ready;
      const existingSubscription = await registration.pushManager.getSubscription();
      
      if (existingSubscription) {
        const subscriptionData = {
          endpoint: existingSubscription.endpoint,
          keys: {
            p256dh: arrayBufferToBase64(existingSubscription.getKey('p256dh')!),
            auth: arrayBufferToBase64(existingSubscription.getKey('auth')!),
          },
        };
        setSubscription(subscriptionData);
      }
    } catch (error) {
      console.error('[Push] Error getting existing subscription:', error);
    }
  }, []);

  // Solicitar permisos
  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!('Notification' in window)) {
      console.warn('[Push] Notifications not supported');
      return false;
    }

    setIsLoading(true);

    try {
      const result = await Notification.requestPermission();
      updatePermissionState();
      
      if (result === 'granted') {
        console.log('[Push] Permission granted');
        return true;
      } else {
        console.log('[Push] Permission denied');
        return false;
      }
    } catch (error) {
      console.error('[Push] Error requesting permission:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [updatePermissionState]);

  // Suscribirse a push notifications
  const subscribe = useCallback(async (): Promise<PushSubscription | null> => {
    if (!isSupported) {
      console.warn('[Push] Cannot subscribe: not supported');
      return null;
    }

    // Si no hay permisos, solicitarlos primero
    if (!permission.granted) {
      const hasPermission = await requestPermission();
      if (!hasPermission) {
        console.warn('[Push] Cannot subscribe: permission denied');
        return null;
      }
    }

    setIsLoading(true);

    try {
      const registration = await navigator.serviceWorker.ready;
      
      // VAPID public key - en producción esto debería venir del servidor
      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || 
        'BLWipxqQGhYqIo0w8XxjJrbjhb8ov86JbibokqQrDRJtwd8mHsEDFljhMeR0QiBqRJ9UY04iWcnWr3nxEQ8kKWE';
      
      // Convertir la clave VAPID usando una implementación más compatible
      const applicationServerKey = convertVapidKey(vapidPublicKey);
      
      const pushSubscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey,
      });

      const subscriptionData = {
        endpoint: pushSubscription.endpoint,
        keys: {
          p256dh: arrayBufferToBase64(pushSubscription.getKey('p256dh')!),
          auth: arrayBufferToBase64(pushSubscription.getKey('auth')!),
        },
      };

      setSubscription(subscriptionData);

      // Enviar suscripción al servidor
      await sendSubscriptionToServer(subscriptionData);

      console.log('[Push] Successfully subscribed');
      return subscriptionData;
    } catch (error) {
      console.error('[Push] Error subscribing:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [isSupported, permission.granted, requestPermission]);

  // Desuscribirse
  const unsubscribe = useCallback(async (): Promise<boolean> => {
    if (!subscription) return true;

    setIsLoading(true);

    try {
      const registration = await navigator.serviceWorker.ready;
      const pushSubscription = await registration.pushManager.getSubscription();
      
      if (pushSubscription) {
        await pushSubscription.unsubscribe();
      }

      // Remover del servidor
      await removeSubscriptionFromServer(subscription);

      setSubscription(null);
      console.log('[Push] Successfully unsubscribed');
      return true;
    } catch (error) {
      console.error('[Push] Error unsubscribing:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [subscription]);

  // Mostrar notificación local
  const showNotification = useCallback(async (options: NotificationOptions): Promise<boolean> => {
    if (!permission.granted) {
      console.warn('[Push] Cannot show notification: no permission');
      return false;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      
      const notificationOptions = {
        body: options.body,
        icon: options.icon || '/icon-192x192.png',
        badge: options.badge || '/icon-96x96.png',
        image: options.image,
        tag: options.tag || 'senu-notification',
        data: options.data || {},
        actions: options.actions || [],
        requireInteraction: options.requireInteraction || false,
        silent: options.silent || false,
        vibrate: options.vibrate || [200, 100, 200],
      };

      await registration.showNotification(options.title, notificationOptions);
      return true;
    } catch (error) {
      console.error('[Push] Error showing notification:', error);
      return false;
    }
  }, [permission.granted]);

  return {
    // Estado
    isSupported,
    permission,
    subscription,
    isLoading,
    isSubscribed: !!subscription,
    
    // Métodos
    requestPermission,
    subscribe,
    unsubscribe,
    showNotification,
  };
}

// Utilidades
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function convertVapidKey(base64String: string): BufferSource {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  try {
    const rawData = atob(base64);
    const bytes = new Uint8Array(rawData.length);
    
    for (let i = 0; i < rawData.length; i++) {
      bytes[i] = rawData.charCodeAt(i);
    }
    
    return bytes.buffer;
  } catch (error) {
    console.error('Error converting VAPID key:', error);
    throw new Error('Invalid VAPID key format');
  }
}

// Enviar suscripción al servidor
async function sendSubscriptionToServer(subscription: PushSubscription): Promise<void> {
  try {
    const response = await fetch('/api/notifications/subscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(subscription),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    console.log('[Push] Subscription sent to server');
  } catch (error) {
    console.error('[Push] Error sending subscription to server:', error);
    // No lanzar error para no bloquear la funcionalidad local
  }
}

// Remover suscripción del servidor
async function removeSubscriptionFromServer(subscription: PushSubscription): Promise<void> {
  try {
    const response = await fetch('/api/notifications/unsubscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ endpoint: subscription.endpoint }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    console.log('[Push] Subscription removed from server');
  } catch (error) {
    console.error('[Push] Error removing subscription from server:', error);
  }
}
