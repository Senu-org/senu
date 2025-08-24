'use client';

import { useAppKit, useAppKitAccount, useAppKitBalance, useAppKitNetwork, useDisconnect } from '@reown/appkit/react';
import { useState, useEffect } from 'react';

export function WalletStatus() {
  // AppKit hooks
  const { open, close } = useAppKit();
  const { address, isConnected, status } = useAppKitAccount();
  const { fetchBalance } = useAppKitBalance();
  const { chainId, switchNetwork } = useAppKitNetwork();
  const { disconnect: disconnectWallet } = useDisconnect();

  // Local state
  const [balance, setBalance] = useState<string>('0');
  const [isLoading, setIsLoading] = useState(false);

  // Monad chain ID
  const MONAD_CHAIN_ID = 10143;
  const isConnectedToMonad = chainId === MONAD_CHAIN_ID;

  // Fetch balance when connected
  useEffect(() => {
    if (isConnected && address) {
      fetchBalanceAndUpdate();
    } else {
      setBalance('0');
    }
  }, [isConnected, address]);

  const fetchBalanceAndUpdate = async () => {
    try {
      setIsLoading(true);
      const balanceResult = await fetchBalance();
      console.log('Balance result:', balanceResult); // Debug log
      
      if (balanceResult.isSuccess && balanceResult.data) {
        // The balance is already formatted correctly from the API
        const balanceData = balanceResult.data;
        
        if (typeof balanceData === 'object' && balanceData.balance) {
          // Handle the object format: { balance: "0.2", symbol: "MONAD" }
          setBalance(balanceData.balance);
        } else if (typeof balanceData === 'string') {
          // Handle string format directly
          setBalance(balanceData);
        } else {
          // Fallback to converting from wei
          let balanceValue: number;
          
          if (typeof balanceData === 'bigint') {
            balanceValue = Number(balanceData);
          } else {
            balanceValue = Number(balanceData);
          }
          
          // Convert from wei to MONAD (18 decimals)
          const balanceInMonad = balanceValue / Math.pow(10, 18);
          setBalance(balanceInMonad.toString());
        }
      } else {
        setBalance('0');
      }
    } catch (error) {
      console.error('Failed to fetch balance:', error);
      setBalance('0');
    } finally {
      setIsLoading(false);
    }
  };

  const connect = () => {
    open();
  };

  const disconnect = async () => {
    try {
      await disconnectWallet();
      setBalance('0');
    } catch (error) {
      console.error('Failed to disconnect:', error);
    }
  };

  const switchToMonad = async () => {
    try {
      if (chainId !== MONAD_CHAIN_ID) {
        // Open the modal to let user switch networks manually
        open();
      }
    } catch (error) {
      console.error('Failed to switch to Monad:', error);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-4 shadow-lg border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Wallet Status</h3>
      
      {!isConnected ? (
        <div className="space-y-4">
          <p className="text-gray-600">Wallet not connected</p>
          <appkit-button />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Status:</span>
              <span className="text-sm text-green-600 bg-green-100 px-2 py-1 rounded-full">
                Connected
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Network:</span>
              <span className={`text-sm px-2 py-1 rounded-full ${
                isConnectedToMonad 
                  ? 'text-green-600 bg-green-100' 
                  : 'text-yellow-600 bg-yellow-100'
              }`}>
                {chainId === 10143 ? 'Monad Testnet' : `Chain ID: ${chainId}`}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Balance:</span>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-semibold text-gray-900">
                  {isLoading ? (
                    <span className="text-gray-500">Loading...</span>
                  ) : (
                    `${parseFloat(balance || '0').toFixed(4)} MONAD`
                  )}
                </span>
                <button
                  onClick={fetchBalanceAndUpdate}
                  disabled={isLoading}
                  className="text-xs text-purple-600 hover:text-purple-700 disabled:text-gray-400"
                >
                  ↻
                </button>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Address:</span>
              <span className="text-xs text-gray-500 font-mono truncate max-w-32">
                {address}
              </span>
            </div>
          </div>
          
          <div className="flex space-x-2">
            {!isConnectedToMonad && (
              <button
                onClick={() => switchToMonad()}
                className="flex-1 py-2 px-3 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors"
              >
                Switch to Monad
              </button>
            )}
            
            <button
              onClick={() => disconnect()}
              className="flex-1 py-2 px-3 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
            >
              Disconnect
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
