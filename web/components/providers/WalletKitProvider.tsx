'use client';

import { ReactNode, createContext, useContext, useEffect, useState } from 'react';
import { walletKitService, WalletConnection } from '@/lib/services/walletkit';

interface WalletKitContextType {
  connection: WalletConnection;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  isLoading: boolean;
}

const WalletKitContext = createContext<WalletKitContextType | undefined>(undefined);

interface WalletKitProviderProps {
  children: ReactNode;
}

export function WalletKitProvider({ children }: WalletKitProviderProps) {
  const [connection, setConnection] = useState<WalletConnection>({ isConnected: false });
  const [isLoading, setIsLoading] = useState(false);

  const connect = async () => {
    setIsLoading(true);
    try {
      const walletConnection = await walletKitService.connectWallet();
      setConnection(walletConnection);
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const disconnect = async () => {
    setIsLoading(true);
    try {
      await walletKitService.disconnectWallet();
      setConnection({ isConnected: false });
    } catch (error) {
      console.error('Failed to disconnect wallet:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const value: WalletKitContextType = {
    connection,
    connect,
    disconnect,
    isLoading,
  };

  return (
    <WalletKitContext.Provider value={value}>
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
