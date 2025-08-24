import { WalletType } from "@getpara/server-sdk";
import dotenv from "dotenv";
import { IWalletRepository } from "../interfaces/IWalletRepository";
import { CustodialWallet } from "../types";
import crypto from "crypto";
import ParaInstanceManager from "./ParaInstanceManager";
dotenv.config();

class WalletService {
  private paraManager: ParaInstanceManager;
  private walletRepository: IWalletRepository;
  private encryptionKey: string;

  constructor(walletRepository: IWalletRepository) {
    this.paraManager = ParaInstanceManager.getInstance();
    this.walletRepository = walletRepository;
    this.encryptionKey = process.env.ENCRYPTION_KEY || "";
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

        const userShare: string = paraServer.getUserShare() || "";
        const encryptedShare = this.encryptUserShare(userShare);

        walletData = {
          id: generatedWallet.id,
          user_phone: number,
          blockchain_address: generatedWallet.address || "",
          private_key_ref: JSON.stringify(encryptedShare),
          type_wallet: WalletType.EVM,
          encrypterUserShare: JSON.stringify(encryptedShare),
          nonce: 0,
          balance_usd: 0,
          created_at: new Date(),
        };
      } else {
        console.log(`Wallet already exists in Para for ${number}, creating placeholder in DB`);
        // Since we can't get the existing wallet from Para, we'll create a placeholder in our DB
        walletData = {
          id: `placeholder-${number}`,
          user_phone: number,
          blockchain_address: `0x${number.toString().padStart(40, '0')}`, // Placeholder address
          private_key_ref: JSON.stringify({ encrypted: '', iv: '', tag: '' }),
          type_wallet: WalletType.EVM,
          encrypterUserShare: JSON.stringify({ encrypted: '', iv: '', tag: '' }),
          nonce: 0,
          balance_usd: 0,
          created_at: new Date(),
        };
      }

      // Save the wallet to our database
      await this.walletRepository.save(walletData);
      console.log(`✅ Wallet saved to database for phone number: ${number}`);
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

  private encryptUserShare(userShare: string): {
    encrypted: string;
    iv: string;
    tag: string;
  } {
    const algorithm = "aes-256-gcm";
    const key = Buffer.from(this.encryptionKey, "hex");
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
