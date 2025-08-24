import { IWalletRepository } from '../interfaces/IWalletRepository';
import SupabaseRepository from '../repository/SupabaseRepository';
import { User } from '../types';

export interface UserData {
  phone: number;
  name?: string;
  country?: 'CR' | 'NI';
  wallet_address_external?: string;
  type_wallet?: string;
  created_at?: string;
  updated_at?: string;
}

export class UserService {
  private repository: IWalletRepository;

  constructor(repository?: IWalletRepository) {
    this.repository = repository || new SupabaseRepository();
  }

  /**
   * Get user data by phone number
   */
  async getUserByPhone(phone: number): Promise<UserData | null> {
    try {
      // Use the repository's getUserShareByPhoneNumber method to check if user exists
      const userShare = await this.repository.getUserShareByPhoneNumber(phone);
      if (!userShare) {
        return null;
      }

      // For now, return a basic user data structure
      // In a real implementation, you'd fetch full user data from the database
      const walletAddress = await this.repository.getAddressByPhoneNumber(phone);
      return {
        phone,
        wallet_address_external: walletAddress || undefined
      };
    } catch (error) {
      console.error('Failed to get user by phone:', error);
      return null;
    }
  }

  /**
   * Get user's wallet address by phone number
   */
  async getWalletAddress(phone: number): Promise<string | null> {
    try {
      return await this.repository.getAddressByPhoneNumber(phone);
    } catch (error) {
      console.error('Failed to get wallet address:', error);
      return null;
    }
  }

  /**
   * Validate if a wallet address is valid (EVM format)
   */
  isValidWalletAddress(address: string): boolean {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  }

  /**
   * Create or update user with wallet address
   * Note: This would need to be implemented in the repository
   */
  async setWalletAddress(phone: number, walletAddress: string, typeWallet?: string): Promise<UserData | null> {
    try {
      if (!this.isValidWalletAddress(walletAddress)) {
        throw new Error('Invalid wallet address format');
      }

      // This would need to be implemented in the repository
      // For now, just return the user data
      return {
        phone,
        wallet_address_external: walletAddress,
        type_wallet: typeWallet
      };
    } catch (error) {
      console.error('Failed to set wallet address:', error);
      return null;
    }
  }

  /**
   * Create a new user
   * Note: This would need to be implemented in the repository
   */
  async createUser(phone: number, userData: Partial<UserData>): Promise<UserData | null> {
    try {
      // This would need to be implemented in the repository
      // For now, just return the user data
      return {
        phone,
        ...userData
      };
    } catch (error) {
      console.error('Failed to create user:', error);
      return null;
    }
  }

  /**
   * Update user data
   * Note: This would need to be implemented in the repository
   */
  async updateUser(phone: number, updates: Partial<UserData>): Promise<UserData | null> {
    try {
      // This would need to be implemented in the repository
      // For now, just return the user data with updates
      const existingUser = await this.getUserByPhone(phone);
      if (!existingUser) {
        return null;
      }

      return {
        ...existingUser,
        ...updates
      };
    } catch (error) {
      console.error('Failed to update user:', error);
      return null;
    }
  }
}
