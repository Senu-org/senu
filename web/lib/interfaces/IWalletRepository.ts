export interface IWalletRepository {
  save(walletData: any): Promise<void>;
  getUserShareByPhoneNumber(phoneNumber: number): Promise<string | null>;
  hasWallet?(phoneNumber: number): Promise<boolean>;
  updateBalance?(phoneNumber: number, balance: number): Promise<void>;
  updateNonce?(phoneNumber: number, nonce: number): Promise<void>;
}