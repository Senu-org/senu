'use client';

import { ReactNode } from 'react';
import ReownWalletKitProvider from '@reown/walletkit';
import { reownConfig } from '@/lib/config/reown';

interface WalletKitProviderProps {
  children: ReactNode;
}

export function WalletKitProvider({ children }: WalletKitProviderProps) {
  return (
    <ReownWalletKitProvider
      projectId={reownConfig.projectId!}
      clientId={reownConfig.clientId!}
      chains={reownConfig.chains}
      gasless={{
        enabled: reownConfig.gaslessEnabled,
      }}
      // Only support Monad network
      supportedChains={reownConfig.walletKit.supportedChains}
      // Configure for mobile-first experience
      ui={{
        theme: 'dark',
        accentColor: '#000000', // Black theme to match Senu
        borderRadius: 'medium',
      }}
    >
      {children}
    </ReownWalletKitProvider>
  );
}
