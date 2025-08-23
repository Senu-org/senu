import { Para } from "@getpara/server-sdk";
import dotenv from "dotenv";
import { IWalletRepository } from "../interfaces/IWalletRepository";
import crypto from "crypto";
dotenv.config();

class WalletService {

  private paraServer : Para;
  private walletRepository: IWalletRepository;
  private encryptionKey: string;

  constructor(walletRepository: IWalletRepository) {
    this.paraServer = new Para(process.env.PARA_API_KEY || '');
    this.walletRepository = walletRepository;
    this.encryptionKey = process.env.ENCRYPTION_KEY || '';
  }

  async createWallet(number: number): Promise<void> {
    try {
      
      const hasWallet = await this.paraServer.hasPregenWallet({
        pregenId: { phone: `+${number}` },
      });
      
      if(hasWallet){
        throw new Error('Wallet already exists for this phone number');
      }

      const generatedWallet = await this.paraServer.createPregenWallet({
        type: 'EVM',
        pregenId: { phone: `+${number}` },
      });

      const userShare: string = this.paraServer.getUserShare() || '';
      const encryptedShare = this.encryptUserShare(userShare);

      const walletData = {
        id: generatedWallet.id,
        address: generatedWallet.address,
        type: generatedWallet.type,
        phoneNumber: number,
        encryptedUserShare: JSON.stringify(encryptedShare)
      };

      await this.walletRepository.save(walletData);

    } catch (error) {
      console.error('Error checking pregen wallet:', error);
      throw error;
    }
  }

  async recoverWallet(number : number){
    const userShareEncrypted = await this.walletRepository.getUserShareByPhoneNumber(number);
    if(!userShareEncrypted){
      throw new Error('No wallet found for this phone number');
    }
    const userShare = this.decryptUserShare(userShareEncrypted);
    this.paraServer.setUserShare(userShare);
    
  }

  private encryptUserShare(userShare: string): { encrypted: string; iv: string; tag: string } {
    const algorithm = 'aes-256-gcm'
    const key = Buffer.from(this.encryptionKey, 'hex')
    const iv = crypto.randomBytes(16)
    
    const cipher = crypto.createCipher(algorithm, key)
    cipher.setAAD(Buffer.from('wallet-share', 'utf8'))
    
    let encrypted = cipher.update(userShare, 'utf8', 'hex')
    encrypted += cipher.final('hex')
    
    const tag = cipher.getAuthTag()
    
    return {
      encrypted,
      iv: iv.toString('hex'),
      tag: tag.toString('hex')
    }
  }

  private decryptUserShare(encryptedData: string): string {
    try {
      const data = JSON.parse(encryptedData)
      const algorithm = 'aes-256-gcm'
      const key = Buffer.from(this.encryptionKey, 'hex')
      
      const decipher = crypto.createDecipher(algorithm, key)
      decipher.setAAD(Buffer.from('wallet-share', 'utf8'))
      decipher.setAuthTag(Buffer.from(data.tag, 'hex'))
      
      let decrypted = decipher.update(data.encrypted, 'hex', 'utf8')
      decrypted += decipher.final('utf8')
      
      return decrypted
    } catch (error) {
      console.error('❌ Failed to decrypt user share:', error)
      throw new Error('Failed to decrypt user share')
    }
  }


}

export default WalletService;