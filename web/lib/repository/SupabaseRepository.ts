import { supabaseServer, TABLES, setUserContext } from "../config/supabase";
import { IWalletRepository } from "../interfaces/IWalletRepository";
import { CustodialWallet } from "../types";

/**
 * Supabase implementation of wallet repository
 * Handles secure storage and retrieval of wallet data and encrypted user shares
 */
class SupabaseRepository implements IWalletRepository {
  
  /**
   * Saves wallet data to Supabase custodial_wallets table
   * @param walletData - CustodialWallet data to save
   */
  async save(walletData: CustodialWallet): Promise<void> {
    try {
      // Set user context for RLS policies
      await setUserContext(walletData.user_phone);

      // Insert wallet data into custodial_wallets table
      const { error } = await supabaseServer
        .from(TABLES.CUSTODIAL_WALLETS)
        .insert(walletData);

      if (error) {
        console.error('❌ Error saving wallet to Supabase:', error);
        throw new Error(`Failed to save wallet: ${error.message}`);
      }

      console.log(`✅ Wallet saved successfully for phone: ${walletData.user_phone}`);
    } catch (error) {
      console.error('❌ Error in SupabaseRepository.save:', error);
      throw error;
    }
  }

  /**
   * Retrieves encrypted user share by phone number from Supabase
   * @param phoneNumber - Phone number to lookup
   * @returns Encrypted user share string or null if not found
   */
  async getUserShareByPhoneNumber(phoneNumber: number): Promise<string | null> {
    try {
      // Set user context for RLS policies
      await setUserContext(`+${phoneNumber}`);

      // Query custodial_wallets table for the user's encrypted share
      const { data, error } = await supabaseServer
        .from(TABLES.CUSTODIAL_WALLETS)
        .select('private_key_ref')
        .eq('user_phone', `+${phoneNumber}`)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No rows returned - wallet not found
          console.log(`ℹ️ No wallet found for phone: +${phoneNumber}`);
          return null;
        }
        
        console.error('❌ Error retrieving user share from Supabase:', error);
        throw new Error(`Failed to retrieve user share: ${error.message}`);
      }

      if (!data?.private_key_ref) {
        console.log(`ℹ️ No encrypted share found for phone: +${phoneNumber}`);
        return null;
      }

      console.log(`✅ User share retrieved successfully for phone: +${phoneNumber}`);
      return data.private_key_ref;
    } catch (error) {
      console.error('❌ Error in SupabaseRepository.getUserShareByPhoneNumber:', error);
      
      // Re-throw the error unless it's a "not found" case
      if (error instanceof Error && error.message.includes('Failed to retrieve user share')) {
        throw error;
      }
      
      // For unexpected errors, wrap them
      throw new Error(`Database error while retrieving user share: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Checks if a wallet exists for the given phone number
   * @param phoneNumber - Phone number to check
   * @returns True if wallet exists, false otherwise
   */
  async hasWallet(phoneNumber: number): Promise<boolean> {
    try {
      await setUserContext(`+${phoneNumber}`);

      const { data, error } = await supabaseServer
        .from(TABLES.CUSTODIAL_WALLETS)
        .select('id')
        .eq('user_phone', `+${phoneNumber}`)
        .single();

      if (error && error.code === 'PGRST116') {
        return false; // No wallet found
      }

      if (error) {
        console.error('❌ Error checking wallet existence:', error);
        throw new Error(`Failed to check wallet existence: ${error.message}`);
      }

      return !!data;
    } catch (error) {
      console.error('❌ Error in SupabaseRepository.hasWallet:', error);
      throw error;
    }
  }

  /**
   * Updates wallet balance
   * @param phoneNumber - Phone number of wallet owner
   * @param balance - New balance in USD
   */
  async updateBalance(phoneNumber: number, balance: number): Promise<void> {
    try {
      await setUserContext(`+${phoneNumber}`);

      const { error } = await supabaseServer
        .from(TABLES.CUSTODIAL_WALLETS)
        .update({ balance_usd: balance })
        .eq('user_phone', `+${phoneNumber}`);

      if (error) {
        console.error('❌ Error updating wallet balance:', error);
        throw new Error(`Failed to update wallet balance: ${error.message}`);
      }

      console.log(`✅ Wallet balance updated for phone: +${phoneNumber}`);
    } catch (error) {
      console.error('❌ Error in SupabaseRepository.updateBalance:', error);
      throw error;
    }
  }

  /**
   * Updates wallet nonce
   * @param phoneNumber - Phone number of wallet owner
   * @param nonce - New nonce value
   */
  async updateNonce(phoneNumber: number, nonce: number): Promise<void> {
    try {
      await setUserContext(`+${phoneNumber}`);

      const { error } = await supabaseServer
        .from(TABLES.CUSTODIAL_WALLETS)
        .update({ nonce })
        .eq('user_phone', `+${phoneNumber}`);

      if (error) {
        console.error('❌ Error updating wallet nonce:', error);
        throw new Error(`Failed to update wallet nonce: ${error.message}`);
      }

      console.log(`✅ Wallet nonce updated for phone: +${phoneNumber}`);
    } catch (error) {
      console.error('❌ Error in SupabaseRepository.updateNonce:', error);
      throw error;
    }
  }

  /**
   * Retrieves wallet ID by phone number from Supabase
   * @param phoneNumber - Phone number to lookup
   * @returns Wallet ID string or null if not found
   */
  async getIdByPhoneNumber(phoneNumber: number): Promise<string | null> {
    try {
      await setUserContext(`+${phoneNumber}`);

      const { data, error } = await supabaseServer
        .from(TABLES.CUSTODIAL_WALLETS)
        .select('id')
        .eq('user_phone', `+${phoneNumber}`)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          console.log(`ℹ️ No wallet found for phone: +${phoneNumber}`);
          return null;
        }
        
        console.error('❌ Error retrieving wallet ID from Supabase:', error);
        throw new Error(`Failed to retrieve wallet ID: ${error.message}`);
      }

      return data?.id || null;
    } catch (error) {
      console.error('❌ Error in SupabaseRepository.getIdByPhoneNumber:', error);
      throw error;
    }
  }

  /**
   * Retrieves wallet address by phone number from Supabase
   * @param phoneNumber - Phone number to lookup
   * @returns Wallet address string or null if not found
   */
  async getAddressByPhoneNumber(phoneNumber: number): Promise<string | null> {
    try {
      await setUserContext(`+${phoneNumber}`);

      const { data, error } = await supabaseServer
        .from(TABLES.CUSTODIAL_WALLETS)
        .select('blockchain_address')
        .eq('user_phone', `+${phoneNumber}`)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          console.log(`ℹ️ No wallet found for phone: +${phoneNumber}`);
          return null;
        }
        
        console.error('❌ Error retrieving wallet address from Supabase:', error);
        throw new Error(`Failed to retrieve wallet address: ${error.message}`);
      }

      return data?.blockchain_address || null;
    } catch (error) {
      console.error('❌ Error in SupabaseRepository.getAddressByPhoneNumber:', error);
      throw error;
    }
  }
}

export default SupabaseRepository;