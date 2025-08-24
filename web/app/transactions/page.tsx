'use client';

import React, { useEffect, useState } from 'react';
import { ITransaction } from '@/lib/types';
import { AppWrapper } from '@/components/shared/AppWrapper';
import { AppHeader } from '@/components/shared/AppHeader';
import TransactionDashboard from '@/components/transactions/TransactionDashboard';

const TransactionsPage: React.FC = () => {
  const [transactions, setTransactions] = useState<ITransaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/transactions/list');
        if (!response.ok) {
          throw new Error(`Error: ${response.statusText}`);
        }
        const data: ITransaction[] = await response.json();
        setTransactions(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, []);

  return (
    <AppWrapper>
      <AppHeader />
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Your Transactions</h1>
        {loading && <p>Loading transactions...</p>}
        {error && <p className="text-red-500">Error: {error}</p>}
        {!loading && !error && (
          <TransactionDashboard transactions={transactions} />
        )}
      </div>
    </AppWrapper>
  );
};

export default TransactionsPage;
