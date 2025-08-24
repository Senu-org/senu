'use client';

import { useState, useEffect } from 'react';
import { walletKitService } from '@/lib/services/walletkit';

interface TokenBalance {
  symbol: string;
  name: string;
  balance: string;
  decimals: number;
  isNative: boolean;
}

interface WalletBalanceProps {
  walletAddress?: string;
  onRefresh?: () => void;
}

export function WalletBalance({ walletAddress, onRefresh }: WalletBalanceProps) {
  const [balances, setBalances] = useState<TokenBalance[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    if (walletAddress) {
      loadBalances();
    }
  }, [walletAddress]);

  const loadBalances = async () => {
    setIsLoading(true);
    try {
      // TODO: Implement real balance loading from Monad RPC
      // For now, simulate balances
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockBalances: TokenBalance[] = [
        {
          symbol: 'MONAD',
          name: 'Monad',
          balance: '12.345678',
          decimals: 18,
          isNative: true
        },
        {
          symbol: 'USDC',
          name: 'USD Coin',
          balance: '100.00',
          decimals: 6,
          isNative: false
        }
      ];
      
      setBalances(mockBalances);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to load balances:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatBalance = (balance: string, decimals: number) => {
    const num = parseFloat(balance) / Math.pow(10, decimals);
    return num.toFixed(6);
  };

  const getTokenIcon = (symbol: string) => {
    switch (symbol) {
      case 'MONAD':
        return '₿';
      case 'USDC':
        return '💰';
      case 'ETH':
        return '⟠';
      default:
        return '🪙';
    }
  };

  const getTokenColor = (symbol: string) => {
    switch (symbol) {
      case 'MONAD':
        return 'bg-purple-100 text-purple-800';
      case 'USDC':
        return 'bg-blue-100 text-blue-800';
      case 'ETH':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-4 border-b border-gray-100 bg-purple-50">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Balance de Wallet</h3>
          <button
            onClick={loadBalances}
            disabled={isLoading}
            className="text-purple-600 hover:text-purple-700 disabled:opacity-50"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
        {lastUpdated && (
          <p className="text-xs text-gray-500 mt-1">
            Última actualización: {lastUpdated.toLocaleTimeString('es-ES')}
          </p>
        )}
      </div>

      {/* Balances List */}
      <div className="p-4">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-sm text-gray-500">Cargando balances...</p>
          </div>
        ) : balances.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <p className="text-sm text-gray-500">No hay balances disponibles</p>
          </div>
        ) : (
          <div className="space-y-3">
            {balances.map((token) => (
              <div
                key={token.symbol}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
              >
                <div className="flex items-center space-x-3">
                  <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center text-lg
                    ${getTokenColor(token.symbol)}
                  `}>
                    {getTokenIcon(token.symbol)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{token.name}</p>
                    <p className="text-xs text-gray-500">{token.symbol}</p>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">
                    {formatBalance(token.balance, token.decimals)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {token.isNative ? 'Nativo' : 'Token'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Total Value */}
      {balances.length > 0 && (
        <div className="px-4 py-3 bg-purple-50 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Valor Total (USD)</span>
            <span className="text-lg font-semibold text-gray-900">
              $1,234.56
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
