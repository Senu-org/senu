import { NextRequest, NextResponse } from 'next/server';
import { BotService } from '@/lib/services/bot';

const botService = new BotService();

export async function POST(request: NextRequest) {
  try {
    const { to, message } = await request.json();
    
    if (!to || !message) {
      return NextResponse.json({ error: 'Missing to or message' }, { status: 400 });
    }
    
    await botService.sendMessage(to, message);
    
    return NextResponse.json({ success: true, message: 'Test message sent' });
  } catch (error) {
    console.error('Test endpoint error:', error);
    return NextResponse.json({ error: 'Failed to send test message' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ 
    status: 'Bot test endpoint is running',
    endpoints: {
      test: 'POST /api/bot/test - Send test WhatsApp message',
      webhook: 'POST /api/bot/webhook - Twilio webhook endpoint'
    }
  });
}
