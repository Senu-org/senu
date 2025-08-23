import { NextRequest, NextResponse } from 'next/server';

// En una aplicación real, esto se almacenaría en una base de datos
// Por ahora usamos el mismo Map que en subscribe
const subscriptions = new Map<string, any>();

export async function POST(request: NextRequest) {
  try {
    const { endpoint } = await request.json();

    if (!endpoint) {
      return NextResponse.json(
        { error: 'Endpoint requerido' },
        { status: 400 }
      );
    }

    // Remover la suscripción
    const existed = subscriptions.delete(endpoint);

    console.log('[API] Push subscription removed:', endpoint, 'existed:', existed);

    return NextResponse.json(
      { 
        success: true, 
        message: existed ? 'Suscripción removida exitosamente' : 'Suscripción no encontrada',
        subscriptionCount: subscriptions.size
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('[API] Error removing push subscription:', error);
    
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
