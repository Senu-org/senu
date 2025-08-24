import React from 'react';
import { ITransaction } from '@/lib/types';

interface TransactionTableProps {
  transactions: ITransaction[];
}

const TransactionTable: React.FC<TransactionTableProps> = ({ transactions }) => {
  return (
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
          {transactions.length === 0 ? (
            <tr>
              <td colSpan={5} className="text-center py-4">
                No transactions found.
              </td>
            </tr>
          ) : (
            transactions.map((transaction) => (
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
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default TransactionTable;
