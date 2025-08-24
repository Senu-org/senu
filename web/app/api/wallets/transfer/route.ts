import { NextRequest, NextResponse } from 'next/server'
//import  JSONRepository from '../../../../lib/repository/JSONrepository';
import SupabaseRepository from '../../../../lib/repository/SupabaseRepository';
import { TransactionService } from '@/lib/services/transaction';

export async function POST(request: NextRequest) {
  try {
    const { fromPhone, toPhone, amount } = await request.json()
    const walletRepository = new SupabaseRepository();
    const transactionService = new TransactionService(walletRepository);

    
    const transaction = await transactionService.createTransaction(fromPhone, toPhone, amount);
    console.log('Transaction created:', transaction);
    
    return NextResponse.json({ success: true, transactionId: 'temp-id' })
  } catch {
    return NextResponse.json({ error: 'Transfer failed' }, { status: 500 })
  }
}