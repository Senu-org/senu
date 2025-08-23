import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ phone: string }> }
) {
  try {
    const { phone } = await params
    
    // Wallet balance logic will be implemented here
    
    return NextResponse.json({ balance: '0', phone })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to get balance' }, { status: 500 })
  }
}