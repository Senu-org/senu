'use client';

import { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createAppKit } from '@reown/appkit/react';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { cookieStorage, createStorage } from '@wagmi/core';
import { WagmiProvider } from 'wagmi';
import { cookieToInitialState } from 'wagmi';
import { reownConfig } from '@/lib/config/reown';

// Set up queryClient
const queryClient = new QueryClient();

// Create Monad network configuration
const monadNetwork = {
  id: 10143,
  name: 'Monad Testnet',
  network: 'monad-testnet',
  nativeCurrency: {
    name: 'Monad',
    symbol: 'MONAD',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://testnet-rpc.monad.xyz'],
    },
    public: {
      http: ['https://testnet-rpc.monad.xyz'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Monad Explorer',
      url: 'https://explorer.testnet.monad.xyz',
    },
  },
};

// Set up the Wagmi Adapter
const wagmiAdapter = new WagmiAdapter({
  storage: createStorage({
    storage: cookieStorage
  }),
  ssr: true,
  projectId: reownConfig.projectId!,
  networks: [monadNetwork]
});

// Set up metadata
const metadata = {
  name: 'Senu - Monad Wallet',
  description: 'Send and receive money on Monad blockchain',
  url: typeof window !== 'undefined' ? window.location.origin : 'https://senu.app',
  icons: ['https://senu.app/senu.png']
};

// Create the modal
createAppKit({
  adapters: [wagmiAdapter],
  projectId: reownConfig.projectId!,
  networks: [monadNetwork],
  defaultNetwork: monadNetwork,
  metadata: metadata,
  features: {
    analytics: false // Disable analytics to avoid Coinbase errors
  }
});

interface AppKitProviderProps {
  children: ReactNode;
  cookies?: string | null;
}

export function AppKitProvider({ children, cookies }: AppKitProviderProps) {
  const initialState = cookies ? cookieToInitialState(wagmiAdapter.wagmiConfig, cookies) : undefined;

  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig} initialState={initialState}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}
