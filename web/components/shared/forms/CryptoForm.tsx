'use client';

import { useState } from 'react';

interface CryptoFormData {
  cryptoType: string;
  walletAddress?: string;
  network?: string;
}

interface CryptoFormProps {
  mode?: 'funding' | 'receiving';
  onSubmit?: (data: CryptoFormData) => void;
  isLoading?: boolean;
  amount?: number | null;
  phoneNumber?: string | null;
  receiverPhone?: string | null;
}

export function CryptoForm({ 
  mode = 'funding', 
  onSubmit, 
  isLoading = false, 
  amount,
  phoneNumber,
  receiverPhone 
}: CryptoFormProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const isFunding = mode === 'funding';
  
  const title = isFunding ? 'Pago con Criptomonedas' : 'Recibir Criptomonedas';
  const description = isFunding 
    ? 'Paga con Bitcoin, USDC y Ethereum' 
    : 'Configura tu wallet para recibir criptomonedas';
  
  const buttonText = isFunding 
    ? 'Procesar Pago Crypto' 
    : 'Guardar Wallet Crypto';
  
  const buttonColor = isFunding 
    ? 'bg-purple-500 hover:bg-purple-600' 
    : 'bg-purple-500 hover:bg-purple-600';

  const handleSendTransaction = async () => {
    if (!amount || !phoneNumber || !receiverPhone) {
      setError('Missing required data: amount, phone number, or receiver phone');
      return;
    }

    try {
      setIsProcessing(true);
      setError(null);

      // Convert amount to MON (1 amount = 0.0001 MON)
      const amountInMon = amount * 0.0001;

      // Prepare transaction request
      const transactionRequest = {
        receiver_phone: receiverPhone,
        amount_usd: amount,
        onramp_provider: 'crypto',
        sender_phone: phoneNumber
      };

      // Call the transaction API without authentication
      const response = await fetch('/api/transactions/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(transactionRequest)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to send transaction');
      }

      const result = await response.json();
      
      console.log('Transaction sent successfully:', result);

      // Call the original onSubmit with success data
      const formData: CryptoFormData = {
        cryptoType: 'monad',
        walletAddress: result.data?.sender || '',
        network: 'monad'
      };
      
      onSubmit?.(formData);

    } catch (error) {
      console.error('Failed to send transaction:', error);
      setError(error instanceof Error ? error.message : 'Failed to send transaction');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="p-4 bg-white space-y-4">
      {/* iOS-style form header */}
      <div className="text-center pb-2">
        <h4 className="text-lg font-semibold text-gray-900">{title}</h4>
        <p className="text-sm text-gray-600 mt-1">
          {description}
        </p>
      </div>

      {/* Amount display */}
      {amount && (
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Monto a enviar:</span>
            <span className="text-lg font-semibold text-gray-900">${amount.toFixed(2)} USD</span>
          </div>
          <div className="flex items-center justify-between mt-1">
            <span className="text-sm text-gray-500">Equivale a:</span>
            <span className="text-sm font-medium text-purple-600">{(amount * 0.0001).toFixed(6)} MON</span>
          </div>
        </div>
      )}
      
      {/* iOS-style crypto badges */}
      <div className="grid grid-cols-3 gap-2">
        <div className="py-3 px-3 bg-orange-100 text-orange-800 rounded-xl text-sm font-semibold text-center border border-orange-200">
          ₿ Bitcoin
        </div>
        <div className="py-3 px-3 bg-purple-100 text-purple-800 rounded-xl text-sm font-semibold text-center border border-purple-200">
          💰 USDC
        </div>
        <div className="py-3 px-3 bg-purple-100 text-purple-800 rounded-xl text-sm font-semibold text-center border border-purple-200">
          ⟠ Ethereum
        </div>
      </div>
      
      {!isFunding && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Dirección de Wallet
            </label>
            <input
              type="text"
              placeholder="0x1234...abcd"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all font-mono text-sm"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Red Blockchain
            </label>
            <select className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-base appearance-none">
              <option value="">Selecciona la red</option>
              <option value="ethereum">Ethereum (ETH)</option>
              <option value="polygon">Polygon (MATIC)</option>
              <option value="bsc">Binance Smart Chain (BNB)</option>
              <option value="bitcoin">Bitcoin (BTC)</option>
              <option value="arbitrum">Arbitrum (ARB)</option>
            </select>
          </div>
        </div>
      )}

      {/* Error display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <svg className="w-5 h-5 text-red-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-red-900 mb-1">
                Error en la transacción
              </p>
              <p className="text-xs text-red-800 leading-relaxed">
                {error}
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* iOS-style info notice */}
      <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <svg className="w-5 h-5 text-purple-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-purple-900 mb-1">
              Transacción en Monad Blockchain
            </p>
            <p className="text-xs text-purple-800 leading-relaxed">
              Tu transacción será procesada en la red Monad. La conversión es 1 USD = 0.0001 MON.
            </p>
          </div>
        </div>
      </div>
      
      {/* iOS-style submit button */}
      <div className="pt-2">
        <button 
          onClick={isFunding ? handleSendTransaction : () => {
            // Collect form data (in real implementation, get from form state)
            const formData: CryptoFormData = {
              cryptoType: 'bitcoin', // Mock data
              walletAddress: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
              network: 'mainnet'
            };
            onSubmit?.(formData);
          }}
          disabled={isLoading || isProcessing}
          className={`
            w-full py-4 text-white font-semibold rounded-2xl shadow-sm transition-all duration-150 text-base
            ${(isLoading || isProcessing)
              ? 'bg-gray-400 cursor-not-allowed' 
              : `${buttonColor} active:shadow-md transform active:scale-95`
            }
          `}
        >
          {(isLoading || isProcessing) ? (
            <div className="flex items-center justify-center space-x-2">
              <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>{isFunding ? 'Enviando transacción...' : 'Procesando pago...'}</span>
            </div>
          ) : (
            buttonText
          )}
        </button>
      </div>

      {/* iOS-style security notice */}
      <div className="flex items-center justify-center space-x-2 pt-2">
        <svg className="w-4 h-4 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
        </svg>
        <span className="text-xs text-gray-600">Transacciones protegidas en blockchain</span>
      </div>
    </div>
  );
}
