'use client';

import React, { useState, useMemo } from 'react';
import { ITransaction } from '@/lib/types';
import TransactionTabs from './TransactionTabs';
import TransactionTable from './TransactionTable';

interface TransactionDashboardProps {
  transactions: ITransaction[];
}

const TransactionDashboard: React.FC<TransactionDashboardProps> = ({ transactions }) => {
  const [activeTab, setActiveTab] = useState('All');

  const filteredTransactions = useMemo(() => {
    if (activeTab === 'All') {
      return transactions;
    }
    return transactions.filter(
      (transaction) => transaction.type.toLowerCase() === activeTab.toLowerCase() || transaction.status.toLowerCase() === activeTab.toLowerCase()
    );
  }, [transactions, activeTab]);

  return (
    <div>
      <TransactionTabs activeTab={activeTab} onTabChange={setActiveTab} />
      <TransactionTable transactions={filteredTransactions} />
    </div>
  );
};

export default TransactionDashboard;
