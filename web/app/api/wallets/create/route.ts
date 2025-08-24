import { NextRequest, NextResponse } from 'next/server'
import WalletService from '../../../../lib/services/wallet';
import SupabaseRepository from '../../../../lib/repository/SupabaseRepository';

export async function POST(request: NextRequest) {
  try {
    const { phoneNumber } = await request.json()
    console.log('Received phone number:', phoneNumber);
    const telegramUserId = phoneNumber; 
    const walletRepository = new SupabaseRepository();
    const createWalletService = new WalletService(walletRepository);
    await createWalletService.createWallet(telegramUserId);
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Wallet creation error:', error);
    return NextResponse.json({ error: 'Wallet creation failed' }, { status: 500 })
  }
}