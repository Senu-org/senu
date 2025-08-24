export interface Token {
  symbol: string;
  name: string;
  decimals: number;
  address: string;
  isNative: boolean;
}

export interface WalletState {
  isConnected: boolean;
  address?: string;
  chainId?: number;
  balance?: string;
  isConnecting: boolean;
  error?: string;
}

export interface TransactionState {
  isPending: boolean;
  hash?: string;
  error?: string;
  success?: boolean;
}

export interface WalletKitConfig {
  projectId: string;
  clientId: string;
  gaslessEnabled: boolean;
  supportedChains: number[];
}

export interface ConnectWalletOptions {
  chainId?: number;
  autoConnect?: boolean;
}

export interface SendTransactionOptions {
  gasless?: boolean;
  gasLimit?: string;
  maxFeePerGas?: string;
  maxPriorityFeePerGas?: string;
}
