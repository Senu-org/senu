import { CustodialWallet } from '../types';

export interface IWalletRepository {
  save(walletData: CustodialWallet): Promise<void>;
  getUserShareByPhoneNumber(phoneNumber: number): Promise<string | null>;
  getIdByPhoneNumber(phoneNumber: number): Promise<string | null>;
  getAddressByPhoneNumber(phoneNumber: number): Promise<string | null>;
}