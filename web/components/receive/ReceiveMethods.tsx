'use client';

import { useState, useEffect } from 'react';
import { BankAccountForm, CryptoForm } from '../shared/forms';
import { useAppKitAccount, useAppKitBalance } from '@reown/appkit/react';
import { walletKitService } from '@/lib/services/walletkit';

interface ReceiveMethod {
  id: string;
  name: string;
  icon: string;
  available: boolean;
  description: string;
}

const receiveMethods: ReceiveMethod[] = [
  {
    id: 'bank',
    name: 'Cuenta Bancaria',
    icon: '🏦',
    available: true,
    description: 'Recibe transferencias directamente a tu cuenta bancaria'
  },
  {
    id: 'crypto',
    name: 'Wallet de Criptomonedas',
    icon: '₿',
    available: true,
    description: 'Recibe Bitcoin, USDC y Ethereum en tu wallet'
  }
];

export function ReceiveMethods() {
  const [expandedMethod, setExpandedMethod] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  
  // AppKit wallet states
  const [isWalletConnecting, setIsWalletConnecting] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [walletBalance, setWalletBalance] = useState<string>('0');
  const [recentTransactions, setRecentTransactions] = useState<Array<{
    hash: string;
    amount: string;
    from: string;
    status: 'pending' | 'confirmed' | 'failed';
    timestamp: Date;
  }>>([]);
  
  // AppKit hooks
  const { address, isConnected } = useAppKitAccount();
  const { fetchBalance } = useAppKitBalance();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Wallet connection function
  const connectWallet = async () => {
    try {
      setIsWalletConnecting(true);
      
      // For now, simulate wallet connection
      // TODO: Implement real AppKit connection
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate successful connection
      const mockAddress = '0x' + Math.random().toString(16).substr(2, 40);
      const mockBalance = (Math.random() * 100).toFixed(6);
      
      setWalletAddress(mockAddress);
      setWalletBalance(mockBalance);
      
      console.log('Wallet connected (simulated):', { 
        address: mockAddress, 
        balance: mockBalance,
        chainId: 1337 
      });
      
      // Start monitoring for incoming transactions
      startTransactionMonitoring(mockAddress);
      
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      alert('Failed to connect wallet. Please try again.');
    } finally {
      setIsWalletConnecting(false);
    }
  };

  // Transaction monitoring function
  const startTransactionMonitoring = (address: string) => {
    // TODO: Implement real transaction monitoring
    // This would poll the Monad RPC for incoming transactions
    console.log('Started monitoring transactions for address:', address);
    
    // For now, simulate transaction monitoring
    setInterval(() => {
      // Check for new transactions
      console.log('Checking for new transactions...');
    }, 30000); // Check every 30 seconds
  };

  // Use safe defaults for SSR to prevent hydration mismatch
  const safeExpandedMethod = mounted ? expandedMethod : null;

  const handleMethodClick = (methodId: string) => {
    const method = receiveMethods.find(m => m.id === methodId);
    if (method?.available) {
      setExpandedMethod(expandedMethod === methodId ? null : methodId);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const BankTransferInfo = () => (
    <div className="p-4 bg-gray-50 border-t border-gray-200 space-y-4">
      <div className="text-center">
        <h4 className="font-semibold text-gray-800 mb-2">Información Bancaria</h4>
        <p className="text-sm text-gray-600 mb-4">
          Comparte esta información con quien te vaya a enviar dinero
        </p>
      </div>

      {/* Bank Information Display */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
        <div className="grid grid-cols-1 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              BANCO
            </label>
            <p className="text-sm font-semibold text-gray-800">Banco Nacional de Costa Rica</p>
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              NÚMERO DE CUENTA
            </label>
            <p className="text-sm font-mono font-semibold text-gray-800">200-01-000-123456</p>
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              TITULAR DE LA CUENTA
            </label>
            <p className="text-sm font-semibold text-gray-800">Tu Nombre Completo</p>
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              CÉDULA
            </label>
            <p className="text-sm font-semibold text-gray-800">1-2345-6789</p>
          </div>
        </div>
      </div>

      {/* Copy Button */}
      <button 
        onClick={() => {
          const bankInfo = `
Banco: Banco Nacional de Costa Rica
Cuenta: 200-01-000-123456
Titular: Tu Nombre Completo
Cédula: 1-2345-6789
Tipo: Cuenta Corriente Colones
          `.trim();
          navigator.clipboard.writeText(bankInfo);
        }}
        className="w-full py-3 bg-purple-500 hover:bg-purple-600 text-white font-semibold rounded-lg transition-colors flex items-center justify-center space-x-2"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
        <span>Copiar Información Bancaria</span>
      </button>

      <div className="text-xs text-gray-500 text-center">
        <p>💡 Comparte esta información con la persona que te va a enviar dinero</p>
      </div>
    </div>
  );

  const renderExpandedContent = (methodId: string) => {
    switch (methodId) {
      case 'bank':
        return <BankAccountForm mode="receiving" />;
      case 'crypto':
        return (
          <div className="p-4 space-y-4">
            {!walletAddress ? (
              <div className="text-center">
                <div className="mb-4">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl">₿</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Conecta tu Wallet</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Conecta tu wallet para recibir criptomonedas
                  </p>
                </div>
                <button
                  onClick={connectWallet}
                  disabled={isWalletConnecting}
                  className={`
                    w-full py-3 px-4 rounded-2xl font-semibold transition-all duration-200
                    ${isWalletConnecting 
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                      : 'bg-purple-600 text-white hover:bg-purple-700 active:bg-purple-800'
                    }
                  `}
                >
                  {isWalletConnecting ? (
                    <div className="flex items-center justify-center">
                      <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin mr-2"></div>
                      Conectando...
                    </div>
                  ) : (
                    'Conectar Wallet'
                  )}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-purple-50 rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Wallet Conectada</span>
                    <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">Conectado</span>
                  </div>
                  <div className="text-xs text-gray-500 font-mono break-all">
                    {walletAddress}
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-2xl p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Balance MONAD</span>
                    <span className="text-lg font-semibold text-gray-900">{walletBalance}</span>
                  </div>
                </div>
                
                {/* QR Code for wallet address */}
                <div className="bg-white border border-gray-200 rounded-2xl p-4">
                  <div className="text-center">
                    <h4 className="text-sm font-semibold text-gray-900 mb-3">Código QR</h4>
                    <div className="w-48 h-48 bg-gray-100 rounded-lg mx-auto flex items-center justify-center">
                      <span className="text-xs text-gray-500">QR Code</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Escanea para compartir tu dirección
                    </p>
                  </div>
                </div>
                
                {/* Copy address button */}
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(walletAddress);
                    alert('Dirección copiada al portapapeles');
                  }}
                  className="w-full py-3 bg-purple-600 text-white font-semibold rounded-2xl transition-colors flex items-center justify-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <span>Copiar Dirección</span>
                </button>
                
                {/* Recent Transactions */}
                <div className="bg-white border border-gray-200 rounded-2xl p-4">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">Transacciones Recientes</h4>
                  {recentTransactions.length === 0 ? (
                    <div className="text-center py-4">
                      <p className="text-xs text-gray-500">No hay transacciones recientes</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {recentTransactions.map((tx, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                          <div className="flex-1">
                            <p className="text-xs font-mono text-gray-600 truncate">{tx.hash}</p>
                            <p className="text-xs text-gray-500">De: {tx.from}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-semibold text-gray-900">{tx.amount} MONAD</p>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              tx.status === 'confirmed' ? 'bg-green-100 text-green-600' :
                              tx.status === 'pending' ? 'bg-yellow-100 text-yellow-600' :
                              'bg-red-100 text-red-600'
                            }`}>
                              {tx.status === 'confirmed' ? 'Confirmado' :
                               tx.status === 'pending' ? 'Pendiente' : 'Fallido'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <CryptoForm 
                  mode="receiving" 
                />
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="bg-white rounded-3xl shadow-lg overflow-hidden border border-gray-100">
        
        {/* iOS-style header */}
        <div className="px-4 py-4 border-b border-gray-100" style={{ backgroundColor: 'rgb(220 252 231 / var(--tw-bg-opacity, 1))' }}>
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900">Métodos de Recepción</h3>
            <p className="text-sm text-gray-500 mt-1">Selecciona tu método preferido</p>
          </div>
        </div>

        {/* Receive Methods List */}
        <div className="divide-y divide-gray-100">
          {receiveMethods.map((method) => (
            <div key={method.id} className="overflow-hidden">
              {/* Method Header - Always Visible */}
              <div
                onClick={() => handleMethodClick(method.id)}
                className={`
                  flex items-center p-4 transition-all duration-200
                  ${method.available 
                    ? 'cursor-pointer active:bg-gray-100' 
                    : 'cursor-not-allowed opacity-60'
                  }
                  ${safeExpandedMethod === method.id ? 'bg-purple-50' : 'hover:bg-gray-50'}
                `}
              >
                {/* Icon */}
                <div className={`
                  flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center mr-4 transition-colors
                  ${safeExpandedMethod === method.id ? 'bg-purple-100' : 'bg-gray-100'}
                `}>
                  <span className="text-xl">{method.icon}</span>
                </div>

                {/* Title and Description */}
                <div className="flex-1 min-w-0">
                  <h3 className={`
                    text-base font-semibold truncate
                    ${safeExpandedMethod === method.id ? 'text-purple-900' : 'text-gray-900'}
                  `}>
                    {method.name}
                  </h3>
                  <p className="text-sm text-gray-500 truncate">
                    {method.description}
                  </p>
                  {!method.available && (
                    <p className="text-xs text-gray-500 mt-1">Próximamente disponible</p>
                  )}
                </div>

                {/* Expand/Collapse Indicator */}
                <div className="flex-shrink-0 ml-3">
                  {method.available ? (
                    <svg 
                      className={`
                        w-5 h-5 text-gray-400 transition-transform duration-200
                        ${safeExpandedMethod === method.id ? 'rotate-180' : ''}
                      `} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  ) : (
                    <div className="w-5 h-5 flex items-center justify-center">
                      <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                    </div>
                  )}
                </div>
              </div>

              {/* Expanded Content */}
              {safeExpandedMethod === method.id && (
                <div className="animate-fade-in">
                  {renderExpandedContent(method.id)}
                </div>
              )}
            </div>
          ))}
        </div>


        <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
          <div className="flex items-center justify-center space-x-2" />
        </div>
      </div>
    </div>
  );
}
