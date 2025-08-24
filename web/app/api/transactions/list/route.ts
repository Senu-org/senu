import { NextRequest, NextResponse } from 'next/server';
import { TransactionService } from '@/web/lib/services/transaction';
import { auth } from '@/web/lib/services/auth';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user || !session.user.phoneNumber) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const phoneNumber = session.user.phoneNumber;
    const transactions = await TransactionService.getTransactionsByPhoneNumber(phoneNumber);

    return NextResponse.json(transactions);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
