import { NextRequest, NextResponse } from 'next/server';
import { EnvioTransactionRepository } from '@/lib/repository/EnvioTransactionRepository';
import { auth } from '@/lib/services/auth';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user || !session.user.phoneNumber) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const phoneNumber = session.user.phoneNumber;
    const transactionRepository = new EnvioTransactionRepository();
    const transactions = await transactionRepository.getTransactionsByPhoneNumber(phoneNumber);

    return NextResponse.json(transactions);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
