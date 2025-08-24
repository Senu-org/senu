import { createPublicClient, http, defineChain } from 'viem';

// Define Monad chain configuration
export const monadChain = defineChain({
  id: 10143,
  name: "Monad Testnet",
  nativeCurrency: { name: "Monad", symbol: "MON", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://testnet-rpc.monad.xyz"] },
    public: { http: ["https://testnet-rpc.monad.xyz"] },
  },
});

// Create public client for reading blockchain data
export const publicClient = createPublicClient({
  chain: monadChain,
  transport: http("https://testnet-rpc.monad.xyz"),
});

// Export RPC URL for convenience
export const MONAD_RPC_URL = "https://testnet-rpc.monad.xyz";

// Export chain ID for convenience
export const MONAD_CHAIN_ID = 10143;
