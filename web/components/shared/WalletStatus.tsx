'use client';

import { useWalletKit } from '@/components/providers/WalletKitProvider';

export function WalletStatus() {
  // WalletKit hooks
  const {
    isConnected,
    address,
    balance,
    chainId,
    isConnectedToMonad,
    connect,
    disconnect,
    switchToMonad,
    refreshBalance,
    modalOpen,
    openModal,
    closeModal
  } = useWalletKit();

  // Monad chain ID
  const MONAD_CHAIN_ID = 10143;

  const handleConnect = () => {
    connect();
  };

  const handleDisconnect = async () => {
    try {
      await disconnect();
    } catch (error) {
      console.error('Failed to disconnect:', error);
    }
  };

  const handleSwitchToMonad = async () => {
    try {
      if (chainId !== MONAD_CHAIN_ID) {
        await switchToMonad();
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
                  {balance ? `${parseFloat(balance).toFixed(4)} MONAD` : '0.0000 MONAD'}
                </span>
                <button
                  onClick={refreshBalance}
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
                onClick={handleSwitchToMonad}
                className="flex-1 py-2 px-3 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors"
              >
                Switch to Monad
              </button>
            )}
            
            <button
              onClick={handleDisconnect}
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
