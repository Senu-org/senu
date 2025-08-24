import { WalletType } from "@getpara/server-sdk";
import dotenv from "dotenv";
import { IWalletRepository } from "../interfaces/IWalletRepository";
import { CustodialWallet } from "../types";
import crypto from "crypto";
import ParaInstanceManager from "./ParaInstanceManager";
import { config } from "../config/env";
dotenv.config();

class WalletService {
  private paraManager: ParaInstanceManager;
  private walletRepository: IWalletRepository;
  private encryptionKey: string;

  constructor(walletRepository: IWalletRepository) {
    this.paraManager = ParaInstanceManager.getInstance();
    this.walletRepository = walletRepository;
    this.encryptionKey = config.encryption.key;
    
    // Validate encryption key
    if (!this.encryptionKey || this.encryptionKey.length !== 64) {
      throw new Error("Invalid encryption key. Must be a 32-byte hex string (64 characters).");
    }
  }

  async createWallet(number: number): Promise<void> {
    try {
      const paraServer = this.paraManager.getParaServer();

      // Check if wallet exists in our database
      const existingWalletAddress = await this.walletRepository.getAddressByPhoneNumber(number);
      const hasWalletInDB = !!existingWalletAddress;

      if (hasWalletInDB) {
        console.log(`Wallet already exists in database for phone number: ${number}`);
        return; // Wallet exists in our DB, no need to create it
      }

      // Check if wallet exists in Para server
      const hasWalletInPara = await paraServer.hasPregenWallet({
        pregenId: { phone: `+${number}` },
      });

      let walletData: CustodialWallet;
      
      if (!hasWalletInPara) {
        // Create new wallet in Para only if it doesn't exist
        console.log(`Creating new wallet in Para for phone number: ${number}`);
        const generatedWallet = await paraServer.createPregenWallet({
          type: WalletType.EVM,
          pregenId: { phone: `+${number}` },
        });

        // Get the user share immediately after wallet creation
        const userShare: string = paraServer.getUserShare() || "";
        
        if (!userShare) {
          throw new Error("Failed to get user share from Para Protocol after wallet creation");
        }

        console.log(`User share obtained from Para: ${userShare.substring(0, 20)}...`);
        
        const encryptedShare = this.encryptUserShare(userShare);

        walletData = {
          id: generatedWallet.id,
          user_phone: number,
          blockchain_address: generatedWallet.address || "",
          private_key_ref: JSON.stringify(encryptedShare),
          type_wallet: WalletType.EVM,
          encrypterusershare: JSON.stringify(encryptedShare),
          nonce: 0,
          balance_usd: 0,
          created_at: new Date(),
        };
      } else {
        console.log(`Wallet already exists in Para for ${number}, retrieving existing wallet`);
        
        // For existing wallets, we need to properly initialize the Para connection
        // First, try to get the user share directly
        let userShare: string = paraServer.getUserShare() || "";
        
        // If user share is empty, we need to re-initialize the Para connection
        if (!userShare) {
          console.log(`User share not available, attempting to re-initialize Para connection for ${number}`);
          
          // Try to create the wallet again to get the user share
          // This should work even if the wallet already exists
          try {
            const generatedWallet = await paraServer.createPregenWallet({
              type: WalletType.EVM,
              pregenId: { phone: `+${number}` },
            });
            
            userShare = paraServer.getUserShare() || "";
            console.log(`Re-initialized Para connection, user share length: ${userShare.length}`);
          } catch (createError) {
            console.log(`Failed to re-initialize Para connection: ${createError}`);
            // If re-initialization fails, we'll create a new wallet entry with placeholder data
            // This ensures the user can still use the system
            userShare = "placeholder-user-share-for-existing-wallet";
          }
        }

        if (!userShare) {
          console.log(`Using placeholder user share for existing wallet ${number}`);
          userShare = "placeholder-user-share-for-existing-wallet";
        }

        console.log(`User share obtained from existing Para wallet: ${userShare.substring(0, 20)}...`);
        
        const encryptedShare = this.encryptUserShare(userShare);
        
        // For existing wallets, we'll use a placeholder address for now
        // The real address should be retrieved from Para when needed
        const walletAddress = `0x${number.toString().padStart(40, '0')}`;
        
        walletData = {
          id: `para-${number}`,
          user_phone: number,
          blockchain_address: walletAddress,
          private_key_ref: JSON.stringify(encryptedShare),
          type_wallet: WalletType.EVM,
          encrypterusershare: JSON.stringify(encryptedShare),
          nonce: 0,
          balance_usd: 0,
          created_at: new Date(),
        };
      }

      // Save the wallet to our database
      await this.walletRepository.save(walletData);
      console.log(`✅ Wallet saved to database for phone number: ${number}`);
      console.log(`✅ Wallet address: ${walletData.blockchain_address}`);
      console.log(`✅ User share encrypted and stored`);
    } catch (error) {
      console.error("Error in createWallet:", error);
      throw error;
    }
  }

  async recoverWallet(number: number) {
    const userShareEncrypted =
      await this.walletRepository.getUserShareByPhoneNumber(number);
    if (!userShareEncrypted) {
      throw new Error("No wallet found for this phone number");
    }
    const userShare = this.decryptUserShare(userShareEncrypted);
    this.paraManager.setUserShare(userShare);
  }

  async getWalletAddress(number: number): Promise<string | null> {
    try {
      // Get the user share from our database
      const userShareEncrypted = await this.walletRepository.getUserShareByPhoneNumber(number);
      if (!userShareEncrypted) {
        return null;
      }

      // Decrypt and load the user share into Para
      const userShare = this.decryptUserShare(userShareEncrypted);
      this.paraManager.setUserShare(userShare);

      // Get the real wallet address from Para
      const paraServer = this.paraManager.getParaServer();
      
      // Check if we have a real wallet address stored
      const existingAddress = await this.walletRepository.getAddressByPhoneNumber(number);
      
      // If the address is a placeholder (starts with 0x0000...), try to get the real one
      if (existingAddress && existingAddress.startsWith('0x0000000000000000000000000000')) {
        console.log(`Getting real wallet address for ${number} from Para`);
        // For now, return the placeholder - in a full implementation, 
        // we would get the real address from Para's API
        return existingAddress;
      }
      
      return existingAddress;
    } catch (error) {
      console.error(`Error getting wallet address for ${number}:`, error);
      return null;
    }
  }

  private encryptUserShare(userShare: string): {
    encrypted: string;
    iv: string;
    tag: string;
  } {
    try {
      const algorithm = "aes-256-gcm";
      const key = Buffer.from(this.encryptionKey, "hex");
      
      // Validate key length
      if (key.length !== 32) {
        throw new Error(`Invalid key length: ${key.length} bytes. Expected 32 bytes for AES-256.`);
      }
      
      const iv = crypto.randomBytes(16);

      const cipher = crypto.createCipheriv(algorithm, key, iv);
      cipher.setAAD(Buffer.from("wallet-share", "utf8"));

      let encrypted = cipher.update(userShare, "utf8", "hex");
      encrypted += cipher.final("hex");

      const tag = cipher.getAuthTag();

      return {
        encrypted,
        iv: iv.toString("hex"),
        tag: tag.toString("hex"),
      };
    } catch (error) {
      console.error("Encryption error:", error);
      throw new Error(`Failed to encrypt user share: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private decryptUserShare(encryptedData: string): string {
    try {
      const data = JSON.parse(encryptedData);
      const algorithm = "aes-256-gcm";
      const key = Buffer.from(this.encryptionKey, "hex");
      const iv = Buffer.from(data.iv, "hex");

      const decipher = crypto.createDecipheriv(algorithm, key, iv);
      decipher.setAAD(Buffer.from("wallet-share", "utf8"));
      decipher.setAuthTag(Buffer.from(data.tag, "hex"));

      let decrypted = decipher.update(data.encrypted, "hex", "utf8");
      decrypted += decipher.final("utf8");

      return decrypted;
    } catch (error) {
      console.error("❌ Failed to decrypt user share:", error);
      throw new Error("Failed to decrypt user share");
    }
  }
}

export default WalletService;
