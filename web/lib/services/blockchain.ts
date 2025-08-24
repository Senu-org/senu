import { publicClient, monadChain } from '../utils';

/**
 * Blockchain service for common blockchain operations
 * Demonstrates how to use the shared Monad utilities
 */
export class BlockchainService {
  
  /**
   * Get the current block number
   */
  static async getCurrentBlockNumber(): Promise<bigint> {
    return await publicClient.getBlockNumber();
  }

  /**
   * Get balance for a given address
   */
  static async getBalance(address: string): Promise<bigint> {
    return await publicClient.getBalance({ address: address as `0x${string}` });
  }

  /**
   * Get gas price
   */
  static async getGasPrice(): Promise<bigint> {
    return await publicClient.getGasPrice();
  }

  /**
   * Get transaction count (nonce) for an address
   */
  static async getTransactionCount(address: string): Promise<number> {
    return await publicClient.getTransactionCount({ address: address as `0x${string}` });
  }

  /**
   * Get chain information
   */
  static getChainInfo() {
    return {
      id: monadChain.id,
      name: monadChain.name,
      nativeCurrency: monadChain.nativeCurrency,
      rpcUrls: monadChain.rpcUrls,
    };
  }

  /**
   * Check if an address is valid
   */
  static isValidAddress(address: string): boolean {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  }

  /**
   * Format balance from wei to MONAD
   */
  static formatBalance(balanceWei: bigint): string {
    const balanceInMonad = Number(balanceWei) / Math.pow(10, 18);
    return balanceInMonad.toFixed(6);
  }
}
