import { config } from './env';

export const reownConfig = {
  projectId: config.reown.projectId,
  clientId: config.reown.clientId,
  gaslessEnabled: config.reown.gaslessEnabled,
  
  // Monad network configuration
  chains: [
    {
      id: 1337, // Monad testnet
      name: 'Monad Testnet',
      network: 'monad-testnet',
      nativeCurrency: {
        name: 'Monad',
        symbol: 'MONAD',
        decimals: 18,
      },
      rpcUrls: {
        default: {
          http: ['https://rpc.testnet.monad.xyz'],
        },
        public: {
          http: ['https://rpc.testnet.monad.xyz'],
        },
      },
      blockExplorers: {
        default: {
          name: 'Monad Explorer',
          url: 'https://explorer.testnet.monad.xyz',
        },
      },
    },
  ],
  
  // WalletKit configuration
  walletKit: {
    // Only support Monad network
    supportedChains: [1337],
    
    // Gasless transaction configuration
    gasless: {
      enabled: config.reown.gaslessEnabled,
      // App covers gas fees
      paymasterUrl: undefined, // Will use Reown's default paymaster
    },
    
    // Transaction configuration
    transactions: {
      // No transaction limits
      maxAmount: undefined,
      // Default gas limit for Monad
      defaultGasLimit: 21000,
    },
  },
};
