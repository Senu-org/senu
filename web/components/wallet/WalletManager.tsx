'use client';

import { useState, useEffect } from 'react';
import { TransactionHistory, WalletBalance, WalletAddress } from './index';
import { useAppKitAccount } from '@reown/appkit/react';

interface WalletManagerProps {
  onBack?: () => void;
}

export function WalletManager({ onBack }: WalletManagerProps) {
  const [activeTab, setActiveTab] = useState<'balance' | 'transactions' | 'address'>('balance');
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  
  // AppKit hooks
  const { address, isConnected } = useAppKitAccount();

  useEffect(() => {
    if (isConnected && address) {
      setWalletAddress(address);
    }
  }, [isConnected, address]);

  const connectWallet = async () => {
    try {
      setIsConnecting(true);
      
      // For now, simulate wallet connection
      // TODO: Implement real AppKit connection
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockAddress = '0x' + Math.random().toString(16).substr(2, 40);
      setWalletAddress(mockAddress);
      
      console.log('Wallet connected (simulated):', { address: mockAddress });
      
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      alert('Failed to connect wallet. Please try again.');
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setWalletAddress(null);
    console.log('Wallet disconnected');
  };

  const tabs = [
    { id: 'balance', name: 'Balance', icon: '💰' },
    { id: 'transactions', name: 'Transacciones', icon: '📊' },
    { id: 'address', name: 'Dirección', icon: '📍' }
  ] as const;

  if (!walletAddress) {
    return (
      <div className="w-full max-w-md mx-auto">
        <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="px-4 py-4 border-b border-gray-100 bg-purple-50">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Gestión de Wallet</h3>
              {onBack && (
                <button
                  onClick={onBack}
                  className="text-purple-600 hover:text-purple-700"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Connect Wallet */}
          <div className="p-8 text-center">
            <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">₿</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Conecta tu Wallet</h3>
            <p className="text-sm text-gray-500 mb-6">
              Conecta tu wallet para gestionar tus criptomonedas
            </p>
            <button
              onClick={connectWallet}
              disabled={isConnecting}
              className={`
                w-full py-3 px-4 rounded-2xl font-semibold transition-all duration-200
                ${isConnecting 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'bg-purple-600 text-white hover:bg-purple-700 active:bg-purple-800'
                }
              `}
            >
              {isConnecting ? (
                <div className="flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin mr-2"></div>
                  Conectando...
                </div>
              ) : (
                'Conectar Wallet'
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="px-4 py-4 border-b border-gray-100 bg-purple-50">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Gestión de Wallet</h3>
            <div className="flex items-center space-x-2">
              <button
                onClick={disconnectWallet}
                className="text-red-600 hover:text-red-700 text-sm"
              >
                Desconectar
              </button>
              {onBack && (
                <button
                  onClick={onBack}
                  className="text-purple-600 hover:text-purple-700"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
              )}
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex-1 py-3 px-4 text-sm font-medium transition-colors
                ${activeTab === tab.id
                  ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }
              `}
            >
              <div className="flex items-center justify-center space-x-2">
                <span>{tab.icon}</span>
                <span>{tab.name}</span>
              </div>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-4">
          {activeTab === 'balance' && (
            <WalletBalance walletAddress={walletAddress} />
          )}
          
          {activeTab === 'transactions' && (
            <TransactionHistory 
              walletAddress={walletAddress}
              onTransactionClick={(transaction) => {
                console.log('Transaction clicked:', transaction);
                // TODO: Show transaction details modal
              }}
            />
          )}
          
          {activeTab === 'address' && (
            <WalletAddress 
              address={walletAddress}
              chainId={1337}
              onCopy={() => {
                console.log('Address copied');
                // TODO: Show success notification
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
