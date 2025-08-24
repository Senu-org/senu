import { config } from './env';

export const reownConfig = {
  projectId: config.reown.projectId,
  clientId: config.reown.clientId,
  gaslessEnabled: config.reown.gaslessEnabled,
  
  // Monad network configuration
  networks: [
    {
      id: 10143, // Monad testnet
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
    },
  ],
  
  // WalletKit configuration
  walletKit: {
    // Only support Monad network
    supportedChains: [10143],
    
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
