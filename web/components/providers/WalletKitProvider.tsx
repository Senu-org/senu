'use client';

import { ReactNode, createContext, useContext, useEffect, useState } from 'react';
import { useAccount, useBalance, useChainId, useConnect, useDisconnect, useSwitchChain, useSendTransaction } from 'wagmi';
import { UseReownWalletReturn, TransactionRequest } from '@/hooks/useReownWallet';
import { parseEther, formatEther } from 'viem';

const WalletKitContext = createContext<UseReownWalletReturn | undefined>(undefined);

interface WalletKitProviderProps {
  children: ReactNode;
}

export function WalletKitProvider({ children }: WalletKitProviderProps) {
  const [modalOpen, setModalOpen] = useState(false);
  
  // Wagmi hooks
  const { address, isConnected, isConnecting } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const { sendTransaction: wagmiSendTransaction, isPending: isSending } = useSendTransaction();
  
  // Balance hook
  const { data: balanceData, refetch: refetchBalance } = useBalance({
    address,
  });

    // Monad chain ID
  const MONAD_CHAIN_ID = 10143;
  const isConnectedToMonad = chainId === MONAD_CHAIN_ID;
  
  // Connect wallet function
  const connectWallet = async () => {
    try {
      if (connectors.length > 0) {
        await connect({ connector: connectors[0] });
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      throw error;
    }
  };

  // Disconnect wallet function
  const disconnectWallet = async () => {
    try {
      await disconnect();
    } catch (error) {
      console.error('Failed to disconnect wallet:', error);
      throw error;
    }
  };

  // Switch to Monad network
  const switchToMonad = async (): Promise<boolean> => {
    try {
      if (chainId !== MONAD_CHAIN_ID) {
        await switchChain({ chainId: MONAD_CHAIN_ID });
        return true;
      }
      return true;
    } catch (error) {
      console.error('Failed to switch to Monad:', error);
      return false;
    }
  };

  // Send transaction function
  const sendTransaction = async (request: TransactionRequest) => {
    try {
      console.log('🚀 Sending real transaction:', request);
      
      if (!isConnected || !address) {
        throw new Error('Wallet not connected');
      }

      if (!isConnectedToMonad) {
        throw new Error('Please switch to Monad network first');
      }

      // Validate the transaction request
      if (!request.to || !request.amount) {
        throw new Error('Invalid transaction request: missing to or amount');
      }

      if (!isValidAddress(request.to)) {
        throw new Error('Invalid recipient address');
      }

      // Prepare transaction data
      const transactionData = {
        to: request.to as `0x${string}`,
        value: BigInt(request.amount),
        chainId: MONAD_CHAIN_ID,
      };

      console.log('📤 Transaction data:', transactionData);

      // Send the transaction using wagmi
      const hash = await wagmiSendTransaction(transactionData);
      
      console.log('✅ Transaction sent successfully:', hash);

      return { 
        success: true, 
        hash: hash as unknown as string
      };
    } catch (error) {
      console.error('❌ Failed to send transaction:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      };
    }
  };

  // Refresh balance
  const refreshBalance = async () => {
    try {
      await refetchBalance();
    } catch (error) {
      console.error('Failed to refresh balance:', error);
    }
  };

  // Utility functions
  const isValidAddress = (address: string): boolean => {
    // Basic address validation for Monad (EVM-compatible)
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  };

  const formatAmount = (amount: string): string => {
    try {
      return formatEther(BigInt(amount));
    } catch {
      return '0';
    }
  };

  const parseAmount = (amount: string): string => {
    try {
      return parseEther(amount).toString();
    } catch {
      return '0';
    }
  };

  // Modal functions
  const openModal = () => setModalOpen(true);
  const closeModal = () => setModalOpen(false);

  // Auto-switch to Monad when connected
  useEffect(() => {
    if (isConnected && !isConnectedToMonad) {
      switchToMonad();
    }
  }, [isConnected, isConnectedToMonad]);

  const walletHook: UseReownWalletReturn = {
    isConnecting: isConnecting || isSending,
    isConnected,
    address: address || null,
    balance: balanceData ? formatEther(balanceData.value) : '0',
    chainId,
    error: null, // Would need to track errors from hooks
    connect: connectWallet,
    disconnect: disconnectWallet,
    sendTransaction,
    refreshBalance,
    switchToMonad,
    isValidAddress,
    formatAmount,
    parseAmount,
    isConnectedToMonad,
    supportedTokens: [
      { symbol: 'MONAD', name: 'Monad', decimals: 18, address: '0x0000000000000000000000000000000000000000', isNative: true }
    ],
    modalOpen,
    openModal,
    closeModal,
  };

  return (
    <WalletKitContext.Provider value={walletHook}>
      {children}
    </WalletKitContext.Provider>
  );
}

export function useWalletKit() {
  const context = useContext(WalletKitContext);
  if (context === undefined) {
    throw new Error('useWalletKit must be used within a WalletKitProvider');
  }
  return context;
}
