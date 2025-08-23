import { NextRequest, NextResponse } from 'next/server';

interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

// En una aplicación real, esto se almacenaría en una base de datos
const subscriptions = new Map<string, PushSubscription>();

export async function POST(request: NextRequest) {
  try {
    const subscription: PushSubscription = await request.json();

    // Validar la suscripción
    if (!subscription.endpoint || !subscription.keys?.p256dh || !subscription.keys?.auth) {
      return NextResponse.json(
        { error: 'Datos de suscripción inválidos' },
        { status: 400 }
      );
    }

    // Almacenar la suscripción (en producción usar base de datos)
    subscriptions.set(subscription.endpoint, subscription);

    console.log('[API] Push subscription saved:', subscription.endpoint);

    return NextResponse.json(
      { 
        success: true, 
        message: 'Suscripción guardada exitosamente',
        subscriptionCount: subscriptions.size
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('[API] Error saving push subscription:', error);
    
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    subscriptionCount: subscriptions.size,
    endpoints: Array.from(subscriptions.keys()).map(endpoint => ({
      endpoint: endpoint.substring(0, 50) + '...',
      timestamp: new Date().toISOString()
    }))
  });
}
