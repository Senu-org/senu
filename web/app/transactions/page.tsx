'use client';

import React, { useEffect, useState } from 'react';
import { ITransaction } from '@/lib/services/transaction';
import { AppWrapper } from '@/components/shared/AppWrapper';
import { AppHeader } from '@/components/shared/AppHeader';

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
        {!loading && !error && transactions.length === 0 && (
          <p>No transactions found.</p>
        )}
        {!loading && !error && transactions.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead>
                <tr>
                  <th className="py-2 px-4 border-b text-left">Type</th>
                  <th className="py-2 px-4 border-b text-left">Amount</th>
                  <th className="py-2 px-4 border-b text-left">Status</th>
                  <th className="py-2 px-4 border-b text-left">Date</th>
                  <th className="py-2 px-4 border-b text-left">Details</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction) => (
                  <tr key={transaction.id}>
                    <td className="py-2 px-4 border-b">{transaction.type}</td>
                    <td className="py-2 px-4 border-b">{`${transaction.amount} ${transaction.currency}`}</td>
                    <td className="py-2 px-4 border-b">{transaction.status}</td>
                    <td className="py-2 px-4 border-b">{new Date(transaction.timestamp).toLocaleDateString()}</td>
                    <td className="py-2 px-4 border-b">
                      {transaction.blockchainTxId && (
                        <a
                          href={transaction.monadExplorerUrl || `https://explorer.monad.xyz/tx/${transaction.blockchainTxId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          View on Explorer
                        </a>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AppWrapper>
  );
};

export default TransactionsPage;
