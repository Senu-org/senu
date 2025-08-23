import { Para } from "@getpara/server-sdk";
import dotenv from "dotenv";
import { IWalletRepository } from "../interfaces/IWalletRepository";

dotenv.config();

class CreationWalletService {

  private paraServer : Para;
  private walletRepository: IWalletRepository;

  constructor(walletRepository: IWalletRepository) {
    this.paraServer = new Para(process.env.PARA_API_KEY || '');
    this.walletRepository = walletRepository;
  }

  async createWallet(telegramUserId: string): Promise<void> {
    try {
      console.log(`🔍 Checking wallet for Telegram ID: ${telegramUserId}`);
      
      const hasWallet = await this.paraServer.hasPregenWallet({
        pregenId: { telegramUserId },
      });
      
      console.log(`Wallet exists: ${hasWallet}`);
      if(hasWallet){
        throw new Error('Wallet already exists for this Telegram ID');
      }

      const generatedWallet = await this.paraServer.createPregenWallet({
        type: 'EVM',
        pregenId: { telegramUserId },
      });

      console.log('✅ Generated Wallet:', {
        id: generatedWallet.id,
        address: generatedWallet.address,
        type: generatedWallet.type,
      });

      const walletData = {
        id: generatedWallet.id,
        address: generatedWallet.address,
        type: generatedWallet.type,
        telegramUserId: telegramUserId
      };

      await this.walletRepository.save(walletData);
      //const userShare = await this.paraServer.getUserShare();
    } catch (error) {
      console.error('Error checking pregen wallet:', error);
      throw error;
    }
  }

}
