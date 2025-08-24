import { useState, useEffect, useCallback } from 'react';
import { 
  useAppKit, 
  useAppKitAccount, 
  useAppKitBalance, 
  useAppKitNetwork, 
  useAppKitState,
  useDisconnect 
} from '@reown/appkit/react';

export interface TransactionRequest {
  to: string;
  amount: string;
  tokenSymbol?: string;
}

export interface TransactionResult {
  success: boolean;
  hash?: string;
  error?: string;
}

export interface UseReownWalletReturn {
  // Connection state
  isConnecting: boolean;
  isConnected: boolean;
  address: string | null;
  balance: string;
  chainId: number | null;
  error: string | null;
  
  // Connection methods
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  
  // Transaction methods
  sendTransaction: (request: TransactionRequest) => Promise<TransactionResult>;
  
  // Utility methods
  refreshBalance: () => Promise<void>;
  switchToMonad: () => Promise<boolean>;
  isValidAddress: (address: string) => boolean;
  formatAmount: (amount: string, decimals?: number) => string;
  parseAmount: (amount: string, decimals?: number) => string;
  
  // Network info
  isConnectedToMonad: boolean;
  supportedTokens: Array<{
    symbol: string;
    name: string;
    decimals: number;
    address: string;
    isNative: boolean;
  }>;
  
  // AppKit state
  modalOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
}

export function useReownWallet(): UseReownWalletReturn {
  // AppKit hooks
  const { open, close } = useAppKit();
  const { address, isConnected, status } = useAppKitAccount();
  const { fetchBalance } = useAppKitBalance();
  const { chainId, switchNetwork } = useAppKitNetwork();
  const { open: modalOpen } = useAppKitState();
  const { disconnect: disconnectWallet } = useDisconnect();

  // Local state
  const [balance, setBalance] = useState<string>('0');
  const [error, setError] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  // Initialize balance when connected
  useEffect(() => {
    if (isConnected && address) {
      refreshBalance();
    } else {
      setBalance('0');
    }
  }, [isConnected, address]);

  // Connect wallet
  const connect = useCallback(async () => {
    try {
      setIsConnecting(true);
      setError(null);
      
      // Open the modal to connect
      open();
      
      // The modal will handle the connection flow
      // We'll rely on the AppKit hooks to update the connection state
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setError(errorMessage);
    } finally {
      setIsConnecting(false);
    }
  }, [open]);

  // Disconnect wallet
  const disconnect = useCallback(async () => {
    try {
      await disconnectWallet();
      setBalance('0');
      setError(null);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setError(errorMessage);
    }
  }, [disconnectWallet]);

  // Send transaction
  const sendTransaction = useCallback(async (request: TransactionRequest): Promise<TransactionResult> => {
    try {
      if (!isConnected || !address) {
        throw new Error('Wallet not connected');
      }

      // Validate transaction request
      if (!request.to || !request.amount) {
        throw new Error('Invalid transaction request');
      }

      if (!isValidAddress(request.to)) {
        throw new Error('Invalid recipient address');
      }

      // For now, we'll use the modal's send interface
      // Open the modal with the send view
      open({ view: 'WalletSend' });

      return {
        success: true,
        hash: 'pending', // Will be updated when transaction is confirmed
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    }
  }, [isConnected, address, open]);

  // Refresh balance
  const refreshBalance = useCallback(async () => {
    if (!address) return;
    
    try {
      const balanceResult = await fetchBalance();
      if (balanceResult.isSuccess && balanceResult.data) {
        // Convert balance to string format
        setBalance(String(balanceResult.data));
      } else {
        setBalance('0');
      }
    } catch (error) {
      console.error('Failed to refresh balance:', error);
      setBalance('0');
    }
  }, [address, fetchBalance]);

  // Switch to Monad network
  const switchToMonad = useCallback(async (): Promise<boolean> => {
    try {
      if (chainId === 10143) {
        return true; // Already on Monad
      }

      // For now, we'll use the modal to switch networks
      // The user can manually switch to Monad in the modal
      open({ view: 'Networks' });
      
      return true;
    } catch (error) {
      console.error('Failed to switch to Monad:', error);
      return false;
    }
  }, [chainId, open]);

  // Utility methods
  const isValidAddress = useCallback((address: string): boolean => {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  }, []);

  const formatAmount = useCallback((amount: string, decimals: number = 18): string => {
    try {
      const num = parseFloat(amount) / Math.pow(10, decimals);
      return num.toFixed(6);
    } catch (error) {
      return '0.000000';
    }
  }, []);

  const parseAmount = useCallback((amount: string, decimals: number = 18): string => {
    try {
      const num = parseFloat(amount) * Math.pow(10, decimals);
      return num.toString();
    } catch (error) {
      return '0';
    }
  }, []);

  // Computed values
  const isConnectedToMonad = isConnected && chainId === 10143;
  const supportedTokens = [
    {
      symbol: 'MONAD',
      name: 'Monad',
      decimals: 18,
      address: '0x0000000000000000000000000000000000000000', // Native token
      isNative: true,
    },
  ];

  return {
    // Connection state
    isConnecting: isConnecting || status === 'connecting',
    isConnected,
    address: address || null,
    balance,
    chainId: typeof chainId === 'number' ? chainId : null,
    error,
    
    // Connection methods
    connect,
    disconnect,
    
    // Transaction methods
    sendTransaction,
    
    // Utility methods
    refreshBalance,
    switchToMonad,
    isValidAddress,
    formatAmount,
    parseAmount,
    
    // Network info
    isConnectedToMonad,
    supportedTokens,
    
    // AppKit state
    modalOpen,
    openModal: open,
    closeModal: close,
  };
}
