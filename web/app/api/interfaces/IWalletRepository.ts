export interface IWalletRepository {
  save(walletData: any): Promise<void>;
  getUserShareByPhoneNumber(phoneNumber: number): Promise<string | null>;
}