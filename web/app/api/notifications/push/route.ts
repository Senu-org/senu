import { NextRequest, NextResponse } from 'next/server';
import webpush from 'web-push';

// Configurar VAPID keys (en producción estas deberían estar en variables de entorno)
const vapidKeys = {
  publicKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "",
  privateKey: process.env.VAPID_PRIVATE_KEY || "",
};

// Only set VAPID details if keys are provided
if (vapidKeys.publicKey && vapidKeys.privateKey) {
  webpush.setVapidDetails(
    'mailto:notifications@senu.app',
    vapidKeys.publicKey,
    vapidKeys.privateKey
  );
}

interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  image?: string;
  tag?: string;
  data?: Record<string, string | number | boolean | object>;
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
  requireInteraction?: boolean;
  silent?: boolean;
  vibrate?: number[];
}

interface PushRequest {
  type: 'transaction' | 'general' | 'test';
  payload: NotificationPayload;
  targetEndpoint?: string; // Para enviar a un usuario específico
}

interface Subscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

// Simulamos almacenamiento de suscripciones (en producción usar base de datos)
const subscriptions = new Map<string, Subscription>();

export async function POST(request: NextRequest) {
  try {
    // Check if VAPID keys are configured
    if (!vapidKeys.publicKey || !vapidKeys.privateKey) {
      return NextResponse.json(
        { error: 'VAPID keys not configured. Please set NEXT_PUBLIC_VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY environment variables.' },
        { status: 500 }
      );
    }

    const { type, payload, targetEndpoint }: PushRequest = await request.json();

    if (!payload.title || !payload.body) {
      return NextResponse.json(
        { error: 'Título y cuerpo son requeridos' },
        { status: 400 }
      );
    }

    // Preparar el payload de la notificación
    const notificationPayload = {
      title: payload.title,
      body: payload.body,
      icon: payload.icon || '/icon-192x192.png',
      badge: payload.badge || '/icon-96x96.png',
      image: payload.image,
      tag: payload.tag || `senu-${type}-${Date.now()}`,
      data: {
        ...payload.data,
        type,
        timestamp: new Date().toISOString(),
        url: payload.data?.url || '/',
      },
      actions: payload.actions || getDefaultActions(type),
      requireInteraction: payload.requireInteraction || type === 'transaction',
      silent: payload.silent || false,
      vibrate: payload.vibrate || getDefaultVibration(type),
    };

    let sentCount = 0;
    let failedCount = 0;
    const errors: string[] = [];

    // Determinar a qué suscripciones enviar
    const targetSubscriptions = targetEndpoint 
      ? [subscriptions.get(targetEndpoint)].filter((sub): sub is Subscription => sub !== undefined)
      : Array.from(subscriptions.values());

    if (targetSubscriptions.length === 0) {
      return NextResponse.json(
        { error: 'No hay suscripciones disponibles' },
        { status: 404 }
      );
    }

    // Enviar notificaciones
    const sendPromises = targetSubscriptions.map(async (subscription) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: subscription.endpoint,
            keys: {
              p256dh: subscription.keys.p256dh,
              auth: subscription.keys.auth,
            },
          },
          JSON.stringify(notificationPayload)
        );
        sentCount++;
        console.log('[Push] Notification sent to:', subscription.endpoint.substring(0, 50) + '...');
      } catch (error: unknown) {
        failedCount++;
        const errorMsg = `Failed to send to ${subscription.endpoint.substring(0, 30)}...: ${error instanceof Error ? error.message : 'Unknown error'}`;
        errors.push(errorMsg);
        console.error('[Push]', errorMsg);
        
        // Si la suscripción es inválida, removerla
        if (error && typeof error === 'object' && 'statusCode' in error) {
          const statusCode = (error as { statusCode: number }).statusCode;
          if (statusCode === 410 || statusCode === 404) {
            subscriptions.delete(subscription.endpoint);
            console.log('[Push] Removed invalid subscription:', subscription.endpoint.substring(0, 50) + '...');
          }
        }
      }
    });

    await Promise.all(sendPromises);

    return NextResponse.json({
      success: true,
      message: `Notificaciones enviadas: ${sentCount} exitosas, ${failedCount} fallidas`,
      details: {
        sent: sentCount,
        failed: failedCount,
        total: targetSubscriptions.length,
        type,
        errors: errors.length > 0 ? errors : undefined,
      }
    });

  } catch (error: unknown) {
    console.error('[Push] Error sending notifications:', error);
    
    return NextResponse.json(
      { error: 'Error interno del servidor', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Endpoint para testing
export async function GET() {
  // Check if VAPID keys are configured
  if (!vapidKeys.publicKey || !vapidKeys.privateKey) {
    return NextResponse.json(
      { error: 'VAPID keys not configured. Please set NEXT_PUBLIC_VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY environment variables.' },
      { status: 500 }
    );
  }

  const testPayload: PushRequest = {
    type: 'test',
    payload: {
      title: 'Senu - Notificación de Prueba',
      body: 'Esta es una notificación de prueba para verificar que todo funciona correctamente.',
      tag: 'test-notification',
      data: {
        url: '/',
        testId: Date.now(),
      }
    }
  };

  // Reutilizar la lógica del POST
  const mockRequest = {
    json: async () => testPayload
  } as NextRequest;

  return POST(mockRequest);
}

// Acciones por defecto según el tipo
function getDefaultActions(type: string) {
  switch (type) {
    case 'transaction':
      return [
        { action: 'view', title: 'Ver Detalles' },
        { action: 'dismiss', title: 'Cerrar' }
      ];
    case 'general':
      return [
        { action: 'open', title: 'Abrir App' },
        { action: 'dismiss', title: 'Cerrar' }
      ];
    case 'test':
      return [
        { action: 'view', title: 'Ver App' },
        { action: 'dismiss', title: 'OK' }
      ];
    default:
      return [];
  }
}

// Patrones de vibración por defecto
function getDefaultVibration(type: string): number[] {
  switch (type) {
    case 'transaction':
      return [200, 100, 200, 100, 200]; // Patrón más llamativo
    case 'general':
      return [200, 100, 200];
    case 'test':
      return [100];
    default:
      return [200, 100, 200];
  }
}
