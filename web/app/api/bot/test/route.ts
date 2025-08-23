import { NextRequest, NextResponse } from 'next/server';
import { BotService } from '@/lib/services/bot';

const botService = new BotService();

export async function POST(request: NextRequest) {
  try {
    const { to, message } = await request.json();

    if (!to || !message) {
      return NextResponse.json({ error: 'Missing \'to\' or \'message\' in request body' }, { status: 400 });
    }

    await botService.sendMessage(to, message);

    return NextResponse.json({ success: true, message: `Test message sent to ${to}` });
  } catch (error) {
    console.error('Test endpoint error:', error);
    return NextResponse.json({ error: 'Failed to send test message' }, { status: 500 });
  }
}
