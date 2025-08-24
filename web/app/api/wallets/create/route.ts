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
    
    try {
      await createWalletService.createWallet(telegramUserId);
      return NextResponse.json({ success: true, message: 'Wallet created or already exists' })
    } catch (error) {
      if (error instanceof Error && error.message.includes('already exists')) {
        // Wallet already exists, this is not an error
        return NextResponse.json({ success: true, message: 'Wallet already exists' })
      }
      throw error; // Re-throw other errors
    }
  } catch (error) {
    console.error('Wallet creation error:', error);
    return NextResponse.json({ error: 'Wallet creation failed' }, { status: 500 })
  }
}