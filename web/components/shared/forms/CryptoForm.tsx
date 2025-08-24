'use client';

import { useState, useEffect } from 'react';
import { useWalletKit } from '@/components/providers/WalletKitProvider';
import { useUserAddress } from '../../../hooks/useUserAddress';

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
  
  // WalletKit integration
  const {
    isConnected,
    address: senderAddress,
    balance,
    isConnectedToMonad,
    connect,
    sendTransaction,
    switchToMonad,
    isValidAddress,
    formatAmount,
    parseAmount
  } = useWalletKit();

  // User address hook
  const {
    receiverAddress,
    isLoading: isLoadingReceiver,
    error: addressError,
    fetchReceiverAddress,
    clearError: clearAddressError
  } = useUserAddress();
  
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

  // Fetch receiver address when receiverPhone changes
  useEffect(() => {
    if (receiverPhone && isFunding) {
      fetchReceiverAddress(receiverPhone);
    }
  }, [receiverPhone, isFunding, fetchReceiverAddress]);

  // Combine errors
  useEffect(() => {
    if (addressError) {
      setError(addressError);
    }
  }, [addressError]);

  const handleSendTransaction = async () => {
    if (!amount || !phoneNumber || !receiverPhone) {
      setError('Missing required data: amount, phone number, or receiver phone');
      return;
    }

    if (!isConnected) {
      setError('Please connect your wallet first');
      return;
    }

    if (!isConnectedToMonad) {
      setError('Please switch to Monad network');
      return;
    }

    if (!receiverAddress) {
      setError('Receiver wallet address not available');
      return;
    }

    if (!senderAddress) {
      setError('Sender wallet address not available');
      return;
    }

    try {
      setIsProcessing(true);
      setError(null);

      // Convert amount to MON (1 USD = 0.0001 MON)
      const amountInMon = amount * 0.0001;
      const amountInWei = parseAmount(amountInMon.toString());

      // Prepare transaction request for WalletKit
      const transactionRequest = {
        to: receiverAddress,
        amount: amountInWei,
        tokenSymbol: 'MONAD'
      };

      // Send transaction using WalletKit
      const result = await sendTransaction(transactionRequest);

      if (!result.success) {
        throw new Error(result.error || 'Failed to send transaction');
      }

      console.log('Transaction sent successfully:', result);

      // Call the original onSubmit with success data
      const formData: CryptoFormData = {
        cryptoType: 'monad',
        walletAddress: senderAddress,
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

  const handleConnectWallet = async () => {
    try {
      await connect();
    } catch (error) {
      setError('Failed to connect wallet');
    }
  };

  const handleSwitchToMonad = async () => {
    try {
      const success = await switchToMonad();
      if (!success) {
        setError('Failed to switch to Monad network');
      }
    } catch (error) {
      setError('Failed to switch to Monad network');
    }
  };

  const handleRefreshReceiverAddress = () => {
    if (receiverPhone) {
      clearAddressError();
      fetchReceiverAddress(receiverPhone);
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

      {/* Wallet Connection Status */}
      {isFunding && (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Wallet Status:</span>
              <span className={`text-sm px-2 py-1 rounded-full ${
                isConnected 
                  ? 'text-green-600 bg-green-100' 
                  : 'text-red-600 bg-red-100'
              }`}>
                {isConnected ? 'Connected' : 'Not Connected'}
              </span>
            </div>
            
            {isConnected && (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Network:</span>
                  <span className={`text-sm px-2 py-1 rounded-full ${
                    isConnectedToMonad 
                      ? 'text-green-600 bg-green-100' 
                      : 'text-yellow-600 bg-yellow-100'
                  }`}>
                    {isConnectedToMonad ? 'Monad' : 'Wrong Network'}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Balance:</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {formatAmount(balance)} MONAD
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Address:</span>
                  <span className="text-xs text-gray-500 font-mono truncate max-w-32">
                    {senderAddress}
                  </span>
                </div>
              </>
            )}
          </div>
          
          {!isConnected && (
            <button
              onClick={handleConnectWallet}
              className="w-full mt-3 py-2 px-4 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors"
            >
              Connect Wallet
            </button>
          )}
          
          {isConnected && !isConnectedToMonad && (
            <button
              onClick={handleSwitchToMonad}
              className="w-full mt-3 py-2 px-4 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors"
            >
              Switch to Monad
            </button>
          )}
        </div>
      )}

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

      {/* Receiver Address Display */}
      {isFunding && receiverPhone && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Receiver:</span>
              <span className="text-sm text-gray-900">{receiverPhone}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Wallet Address:</span>
              <div className="flex items-center space-x-2">
                {isLoadingReceiver ? (
                  <span className="text-xs text-gray-500">Loading...</span>
                ) : receiverAddress ? (
                  <span className="text-xs text-gray-500 font-mono truncate max-w-32">
                    {receiverAddress}
                  </span>
                ) : (
                  <span className="text-xs text-red-500">Not configured</span>
                )}
                <button
                  onClick={handleRefreshReceiverAddress}
                  disabled={isLoadingReceiver}
                  className="text-xs text-blue-600 hover:text-blue-700 disabled:text-gray-400"
                >
                  ↻
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* iOS-style crypto badges */}
      <div className="grid grid-cols-3 gap-2">
        <div className="py-3 px-3 bg-white text-purple-800 rounded-xl text-sm font-semibold text-center">

        </div>
        <div className="py-3 px-3 bg-purple-100 text-purple-800 rounded-xl text-sm font-semibold text-center border border-purple-200">
          💰 Monad
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
          disabled={isLoading || isProcessing || (isFunding && (!isConnected || !isConnectedToMonad || !receiverAddress))}
          className={`
            w-full py-4 text-white font-semibold rounded-2xl shadow-sm transition-all duration-150 text-base
            ${(isLoading || isProcessing || (isFunding && (!isConnected || !isConnectedToMonad || !receiverAddress)))
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
