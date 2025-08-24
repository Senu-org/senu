'use client';

import { useState, useEffect, useCallback } from 'react';

interface Transaction {
  id: string;
  hash: string;
  from: string;
  to: string;
  amount: string;
  tokenSymbol: string;
  status: 'pending' | 'confirmed' | 'failed';
  timestamp: Date;
  gasUsed?: string;
  gasPrice?: string;
}

interface TransactionHistoryProps {
  walletAddress?: string;
  onTransactionClick?: (transaction: Transaction) => void;
}

export function TransactionHistory({ walletAddress, onTransactionClick }: TransactionHistoryProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'pending' | 'confirmed' | 'failed'>('all');

  const loadTransactions = useCallback(async () => {
    setIsLoading(true);
    try {
      // TODO: Implement real transaction loading from Monad RPC
      // For now, simulate transactions
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockTransactions: Transaction[] = [
        {
          id: '1',
          hash: '0x1234567890abcdef1234567890abcdef12345678',
          from: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
          to: walletAddress || '0x0000000000000000000000000000000000000000',
          amount: '0.5',
          tokenSymbol: 'MONAD',
          status: 'confirmed',
          timestamp: new Date(Date.now() - 3600000), // 1 hour ago
          gasUsed: '21000',
          gasPrice: '20000000000'
        },
        {
          id: '2',
          hash: '0xabcdef1234567890abcdef1234567890abcdef12',
          from: walletAddress || '0x0000000000000000000000000000000000000000',
          to: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
          amount: '1.2',
          tokenSymbol: 'MONAD',
          status: 'pending',
          timestamp: new Date(Date.now() - 1800000), // 30 minutes ago
        }
      ];
      
      setTransactions(mockTransactions);
    } catch (error) {
      console.error('Failed to load transactions:', error);
    } finally {
      setIsLoading(false);
    }
  }, [walletAddress]);

  useEffect(() => {
    if (walletAddress) {
      loadTransactions();
    }
  }, [walletAddress, loadTransactions]);

  const filteredTransactions = transactions.filter(tx => 
    selectedStatus === 'all' || tx.status === selectedStatus
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-600';
      case 'pending':
        return 'bg-yellow-100 text-yellow-600';
      case 'failed':
        return 'bg-red-100 text-red-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'Confirmado';
      case 'pending':
        return 'Pendiente';
      case 'failed':
        return 'Fallido';
      default:
        return 'Desconocido';
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-4 border-b border-gray-100 bg-purple-50">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Historial de Transacciones</h3>
          <button
            onClick={loadTransactions}
            disabled={isLoading}
            className="text-purple-600 hover:text-purple-700 disabled:opacity-50"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>

      {/* Status Filter */}
      <div className="px-4 py-3 border-b border-gray-100">
        <div className="flex space-x-2">
          {(['all', 'pending', 'confirmed', 'failed'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={`
                px-3 py-1 text-xs font-medium rounded-full transition-colors
                ${selectedStatus === status
                  ? 'bg-purple-100 text-purple-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }
              `}
            >
              {status === 'all' ? 'Todas' : getStatusText(status)}
            </button>
          ))}
        </div>
      </div>

      {/* Transactions List */}
      <div className="max-h-96 overflow-y-auto">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-sm text-gray-500">Cargando transacciones...</p>
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="p-8 text-center">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-sm text-gray-500">No hay transacciones</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredTransactions.map((transaction) => (
              <div
                key={transaction.id}
                onClick={() => onTransactionClick?.(transaction)}
                className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <div className={`
                      w-2 h-2 rounded-full
                      ${transaction.status === 'confirmed' ? 'bg-green-500' :
                        transaction.status === 'pending' ? 'bg-yellow-500' : 'bg-red-500'}
                    `} />
                    <span className="text-xs font-mono text-gray-500">
                      {formatAddress(transaction.hash)}
                    </span>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(transaction.status)}`}>
                    {getStatusText(transaction.status)}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {transaction.to === walletAddress ? 'Recibido' : 'Enviado'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {transaction.to === walletAddress 
                        ? `De: ${formatAddress(transaction.from)}`
                        : `Para: ${formatAddress(transaction.to)}`
                      }
                    </p>
                    <p className="text-xs text-gray-400">
                      {formatDate(transaction.timestamp)}
                    </p>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">
                      {transaction.to === walletAddress ? '+' : '-'}{transaction.amount} {transaction.tokenSymbol}
                    </p>
                    {transaction.gasUsed && transaction.gasPrice && (
                      <p className="text-xs text-gray-500">
                        Gas: {transaction.gasUsed}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
