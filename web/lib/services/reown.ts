import { createAppKit } from '@reown/appkit/react';
import { reownConfig } from '@/lib/config/reown';

export interface WalletConnection {
  isConnected: boolean;
  address?: string;
  chainId?: number;
  balance?: string;
  error?: string;
}

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

export interface WalletState {
  isConnecting: boolean;
  isConnected: boolean;
  address: string | null;
  balance: string;
  chainId: number | null;
  error: string | null;
}

class ReownService {
  private static instance: ReownService;
  private appKit: any = null;
  private walletState: WalletState = {
    isConnecting: false,
    isConnected: false,
    address: null,
    balance: '0',
    chainId: null,
    error: null,
  };

  public static getInstance(): ReownService {
    if (!ReownService.instance) {
      ReownService.instance = new ReownService();
    }
    return ReownService.instance;
  }

  /**
   * Initialize the AppKit instance
   */
  private async initializeAppKit() {
    if (!this.appKit) {
      try {
        this.appKit = await createAppKit({
          ...reownConfig,
        } as any);
      } catch (error) {
        console.error('Failed to initialize AppKit:', error);
        throw new Error('Failed to initialize wallet connection');
      }
    }
    return this.appKit;
  }

  /**
   * Connect wallet using AppKit
   */
  async connectWallet(): Promise<WalletConnection> {
    try {
      this.walletState.isConnecting = true;
      this.walletState.error = null;

      const appKit = await this.initializeAppKit();
      
      // Connect to wallet
      const connection = await appKit.connect();
      
      if (connection.isConnected && connection.address) {
        this.walletState.isConnected = true;
        this.walletState.address = connection.address;
        this.walletState.chainId = connection.chainId || 1337; // Default to Monad testnet
        
        // Fetch initial balance
        const balance = await this.getWalletBalance(connection.address);
        this.walletState.balance = balance;
        
        return {
          isConnected: true,
          address: connection.address,
          chainId: this.walletState.chainId || undefined,
          balance: this.walletState.balance,
        };
      } else {
        throw new Error('Failed to connect wallet');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      this.walletState.error = errorMessage;
      this.walletState.isConnected = false;
      
      console.error('Failed to connect wallet:', error);
      return {
        isConnected: false,
        error: errorMessage,
      };
    } finally {
      this.walletState.isConnecting = false;
    }
  }

  /**
   * Disconnect wallet
   */
  async disconnectWallet(): Promise<void> {
    try {
      if (this.appKit) {
        await this.appKit.disconnect();
      }
      
      // Reset wallet state
      this.walletState = {
        isConnecting: false,
        isConnected: false,
        address: null,
        balance: '0',
        chainId: null,
        error: null,
      };
    } catch (error) {
      console.error('Failed to disconnect wallet:', error);
      throw new Error('Failed to disconnect wallet');
    }
  }

  /**
   * Get wallet balance
   */
  async getWalletBalance(address: string): Promise<string> {
    try {
      if (!this.appKit) {
        return '0';
      }

      const balance = await this.appKit.getBalance(address);
      return this.formatAmount(balance.toString());
    } catch (error) {
      console.error('Failed to get wallet balance:', error);
      return '0';
    }
  }

  /**
   * Send transaction using gasless mode
   */
  async sendTransaction(request: TransactionRequest): Promise<TransactionResult> {
    try {
      if (!this.appKit || !this.walletState.isConnected) {
        throw new Error('Wallet not connected');
      }

      // Validate transaction request
      if (!request.to || !request.amount) {
        throw new Error('Invalid transaction request');
      }

      if (!this.isValidAddress(request.to)) {
        throw new Error('Invalid recipient address');
      }

      // Parse amount to wei
      const amountInWei = this.parseAmount(request.amount);

      // Send transaction
      const transaction = await this.appKit.sendTransaction({
        to: request.to,
        value: amountInWei,
        gasLimit: reownConfig.walletKit.transactions.defaultGasLimit,
      });

      return {
        success: true,
        hash: transaction.hash,
      };
    } catch (error) {
      console.error('Failed to send transaction:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get current wallet state
   */
  getWalletState(): WalletState {
    return { ...this.walletState };
  }

  /**
   * Update wallet state (for use in components)
   */
  updateWalletState(updates: Partial<WalletState>): void {
    this.walletState = { ...this.walletState, ...updates };
  }

  /**
   * Get supported tokens for Monad network
   */
  getSupportedTokens() {
    return [
      {
        symbol: 'MONAD',
        name: 'Monad',
        decimals: 18,
        address: '0x0000000000000000000000000000000000000000', // Native token
        isNative: true,
      },
      // Add other supported tokens here
    ];
  }

  /**
   * Validate wallet address format
   */
  isValidAddress(address: string): boolean {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  }

  /**
   * Format amount for display
   */
  formatAmount(amount: string, decimals: number = 18): string {
    try {
      const num = parseFloat(amount) / Math.pow(10, decimals);
      return num.toFixed(6);
    } catch (error) {
      return '0.000000';
    }
  }

  /**
   * Parse amount from user input
   */
  parseAmount(amount: string, decimals: number = 18): string {
    try {
      const num = parseFloat(amount) * Math.pow(10, decimals);
      return num.toString();
    } catch (error) {
      return '0';
    }
  }

  /**
   * Check if wallet is connected to Monad network
   */
  isConnectedToMonad(): boolean {
    return this.walletState.isConnected && this.walletState.chainId === 1337;
  }

  /**
   * Switch to Monad network if needed
   */
  async switchToMonad(): Promise<boolean> {
    try {
      if (!this.appKit) {
        return false;
      }

      if (this.isConnectedToMonad()) {
        return true;
      }

      // Switch to Monad testnet
      await this.appKit.switchChain(1337);
      this.walletState.chainId = 1337;
      return true;
    } catch (error) {
      console.error('Failed to switch to Monad network:', error);
      return false;
    }
  }
}

// Export singleton instance
export const reownService = ReownService.getInstance();
