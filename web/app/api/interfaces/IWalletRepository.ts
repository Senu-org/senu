export interface IWalletRepository {
  save(walletData: any): Promise<void>;
}