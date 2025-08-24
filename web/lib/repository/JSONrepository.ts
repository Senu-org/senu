import fs from "fs/promises";
import path from "path";
import { IWalletRepository } from "../interfaces/IWalletRepository";
import { CustodialWallet } from "../types";

class JSONRepository implements IWalletRepository {
  private readonly filePath: string;

  constructor(filePath: string = "./data/wallets.json") {
    this.filePath = path.resolve(filePath);
  }

  private async ensureFileExists(): Promise<void> {
    const dir = path.dirname(this.filePath);

    try {
      // Crear carpeta si no existe
      await fs.mkdir(dir, { recursive: true });

      // Crear archivo si no existe
      try {
        await fs.access(this.filePath);
      } catch {
        await fs.writeFile(this.filePath, JSON.stringify([]));
      }
    } catch (error) {
      console.error("Error ensuring wallets file exists:", error);
      throw error;
    }
  }

  async save(walletData: CustodialWallet): Promise<void> {
    await this.ensureFileExists();
    const wallets = await this.readWallets();

    // Add new wallet
    wallets.push({ ...walletData });
    await this.writeWallets(wallets);
  }

        async getUserShareByPhoneNumber(phoneNumber: number): Promise<string | null> {
            const wallets = await this.readWallets();
            const wallet = wallets.find((w: CustodialWallet) => w.phone === phoneNumber);
            if( wallet?.encrypterusershare) console.log('Found wallet share:');
            else console.log('No encrypted share found for this wallet');
            return wallet?.encrypterusershare || null;
        }

  async getIdByPhoneNumber(phoneNumber: number): Promise<string | null> {
    const wallets = await this.readWallets();
    const wallet = wallets.find(
      (w: CustodialWallet) => String(w.user_phone) === String(phoneNumber)
    );
    console.log("Found wallet id:", wallet?.id);
    return wallet ? wallet.id : null;
  }

  async getAddressByPhoneNumber(phoneNumber: number): Promise<string | null> {
    const wallets = await this.readWallets();
    const wallet = wallets.find(
      (w: CustodialWallet) => String(w.user_phone) === String(phoneNumber)
    );
    console.log("Found wallet id:", wallet?.id);
    return wallet ? wallet.blockchain_address : null;
  }

  private async writeWallets(wallets: CustodialWallet[]): Promise<void> {
    try {
      await fs.writeFile(this.filePath, JSON.stringify(wallets, null, 2));
    } catch (error) {
      console.error("Error writing wallets file:", error);
      throw error;
    }
  }

  private async readWallets(): Promise<CustodialWallet[]> {
    await this.ensureFileExists();
    try {
      const data = await fs.readFile(this.filePath, "utf-8");
      const wallets = JSON.parse(data);
      return wallets.map((wallet: CustodialWallet) => ({ ...wallet }));
    } catch (error) {
      console.error("Error reading wallets file:", error);
      return [];
    }
  }
}

export default JSONRepository;
