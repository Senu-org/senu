'use client';

import { useState, useEffect, useCallback } from 'react';
import { CreditCardForm, CryptoForm } from '../shared/forms';
import { CompletionAnimation } from '../shared';
import { config } from '@/lib/config/env';
import { useWalletKit } from '../providers/WalletKitProvider';

interface PaymentMethod {
  id: string;
  name: string;
  icon: string;
  available: boolean;
}

const paymentMethods: PaymentMethod[] = [
  {
    id: 'card',
    name: 'Tarjeta de Crédito/Débito',
    icon: '💳',
    available: true,
  },
  {
    id: 'crypto',
    name: 'Criptomonedas',
    icon: '₿',
    available: true
  }
];

interface FundingMethodsProps {
  phoneNumber?: string | null;
  amount?: number | null;
}

interface WalletData {
  walletId: string;
  phoneNumber: string;
  createdAt: string;
}

type CreditCardFormData = {
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  holderName: string;
}

type CryptoFormData = {
  cryptoType: string;
  walletAddress?: string;
  network?: string;
}

export function FundingMethods({ phoneNumber, amount }: FundingMethodsProps) {
  const [expandedMethod, setExpandedMethod] = useState<string | null>(null);
  const [showCompletion, setShowCompletion] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [mounted, setMounted] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  
  // Wallet creation states
  const [walletCreationStatus, setWalletCreationStatus] = useState<'creating' | 'success' | 'error' | null>(null);
  const [walletData, setWalletData] = useState<WalletData | null>(null);
  
  // Use the unified wallet hook
  const {
    isConnected,
    address: walletAddress,
    balance: walletBalance,
    isConnecting: isWalletConnecting,
    connect: connectWallet,
    isConnectedToMonad,
    switchToMonad,
    error: walletError
  } = useWalletKit();

  useEffect(() => {
    setMounted(true);
  }, []);

  const createWalletInBackground = useCallback(async () => {
    if (!phoneNumber) return;
    
    try {
      setWalletCreationStatus('creating');
      
      // TODO: Replace with actual wallet creation API
      // Example: const wallet = await walletService.createWallet({ phoneNumber });
      
      // Simulate wallet creation (remove when implementing real API)
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const mockWalletData: WalletData = {
        walletId: `wallet_${Date.now()}`,
        phoneNumber,
        createdAt: new Date().toISOString()
      };
      
      setWalletData(mockWalletData);
      setWalletCreationStatus('success');
      console.log('Wallet ready:', mockWalletData);
      
    } catch (error) {
      console.error('Background wallet creation failed:', error);
      setWalletCreationStatus('error');
    }
  }, [phoneNumber]);

  // Background wallet creation on component mount
  useEffect(() => {
    if (phoneNumber && mounted) {
      createWalletInBackground();
    }
  }, [phoneNumber, mounted, createWalletInBackground]);

  // Handle wallet connection
  const handleConnectWallet = async () => {
    try {
      await connectWallet();
      
      // If not connected to Monad, try to switch
      if (isConnected && !isConnectedToMonad) {
        await switchToMonad();
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      alert('Failed to connect wallet. Please try again.');
    }
  };

  const handleMethodClick = (methodId: string) => {
    const method = paymentMethods.find(m => m.id === methodId);
    if (method?.available) {
      setExpandedMethod(expandedMethod === methodId ? null : methodId);
    }
  };

  const handlePaymentSubmit = async (methodId: string, paymentData: CreditCardFormData | CryptoFormData) => {
    const method = paymentMethods.find(m => m.id === methodId);
    if (!method) return;

    try {
      setSelectedMethod(method.name);
      setIsProcessingPayment(true);
      
      // Show completion modal immediately (in loading state if wallet not ready)
      setShowCompletion(true);
      
      // Check if wallet creation is still in progress
      if (walletCreationStatus === 'creating') {
        // Modal is already showing in loading state
        // Wait for wallet creation to complete
        while (walletCreationStatus === 'creating') {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
      
      // Check if wallet creation failed
      if (walletCreationStatus === 'error') {
        throw new Error('Wallet creation failed. Please try again.');
      }
      
      // Wallet should be ready now, create user with wallet + payment info
      if (walletCreationStatus === 'success' && walletData) {
        // TODO: Replace with actual user creation API call
        // Example: await userService.createUser({
        //   walletData,
        //   paymentMethod: { methodId, ...paymentData },
        //   phoneNumber
        // });
        
        // Simulate user creation (remove when implementing real API)
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        console.log('User created with:', {
          wallet: walletData,
          paymentMethod: { methodId, ...paymentData },
          phoneNumber
        });
        
        // Stop loading state - this will trigger the success animation
        setIsProcessingPayment(false);
      } else {
        throw new Error('Wallet not ready. Please try again.');
      }
      
    } catch (error) {
      console.error('Failed to process payment:', error);
      // TODO: Show error message to user
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      alert(`Error: ${errorMessage}`);
      setShowCompletion(false);
      setIsProcessingPayment(false);
    }
  };

  const handleCompletionFinish = () => {
    setShowCompletion(false);
    setExpandedMethod(null);
    // Here you could redirect to the next step or update the UI
  };

  const renderExpandedContent = (methodId: string) => {
    switch (methodId) {
      case 'card':
        return (
          <CreditCardForm 
            mode="funding" 
            onSubmit={(paymentData) => handlePaymentSubmit(methodId, paymentData)}
            isLoading={isProcessingPayment}
          />
        );
      case 'crypto':
        return (
          <div className="p-4 space-y-4">
            {!isConnected ? (
              <div className="text-center">
                <div className="mb-4">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl">₿</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Conecta tu Wallet</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Conecta tu wallet para enviar criptomonedas
                  </p>
                  {walletError && (
                    <p className="text-sm text-red-500 mb-4">
                      Error: {walletError}
                    </p>
                  )}
                </div>
                <button
                  onClick={handleConnectWallet}
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
                  {!isConnectedToMonad && (
                    <div className="mt-2">
                      <button
                        onClick={switchToMonad}
                        className="text-xs text-purple-600 hover:text-purple-700"
                      >
                        Cambiar a red Monad
                      </button>
                    </div>
                  )}
                </div>
                
                <div className="bg-gray-50 rounded-2xl p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Balance MONAD</span>
                    <span className="text-lg font-semibold text-gray-900">{walletBalance}</span>
                  </div>
                </div>
                
                <CryptoForm 
                  mode="funding" 
                  onSubmit={(paymentData) => handlePaymentSubmit(methodId, paymentData)}
                  isLoading={isProcessingPayment}
                  amount={amount || 0}
                  phoneNumber={phoneNumber || undefined}
                  receiverPhone={phoneNumber || undefined}
                />
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  // Use safe defaults for SSR to prevent hydration mismatch
  const safeExpandedMethod = mounted ? expandedMethod : null;

  return (
    <>
      <div className="w-full max-w-sm mx-auto">
        <div className="bg-white rounded-3xl shadow-lg overflow-hidden border border-gray-100">
        
        {/* iOS-style header */}
        <div className="px-4 py-4 border-b border-gray-100" style={{ backgroundColor: 'rgb(243 232 255 / var(--tw-bg-opacity, 1))' }}>
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900">Métodos de Financiamiento</h3>
            <p className="text-sm text-gray-500 mt-1">Selecciona tu método preferido</p>
          </div>
        </div>

        {/* Payment Methods List */}
        <div className="divide-y divide-gray-100">
          {paymentMethods.map((method) => (
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

                {/* Title */}
                <div className="flex-1 min-w-0">
                  <h3 className={`
                    text-base font-semibold truncate
                    ${safeExpandedMethod === method.id ? 'text-purple-900' : 'text-gray-900'}
                  `}>
                    {method.name}
                  </h3>
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

        {/* iOS-style Security Footer */}
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
          <div className="flex items-center justify-center space-x-2" />
        </div>
        </div>
      </div>

      {/* Completion Animation */}
      <CompletionAnimation
        isVisible={showCompletion}
        onComplete={handleCompletionFinish}
        title="¡Método Configurado!"
        subtitle={`${selectedMethod} ha sido configurado exitosamente. Ahora puedes enviar tu remesa por WhatsApp`}
        redirectTo={config.whatsapp.getWhatsAppUrl("Hola, ya configuré mi método de pago y quiero enviar una remesa")}
        isLoading={isProcessingPayment || walletCreationStatus === 'creating'}
        loadingMessage="Creando tu perfil de usuario..."
      />
    </>
  );
}