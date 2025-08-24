import {parseEther,isAddress,parseGwei} from 'viem'
import { Para, Environment, WalletType } from "@getpara/server-sdk";
import WalletService from './wallet'
import { IWalletRepository } from '../interfaces/IWalletRepository';
import dotenv from "dotenv";
import { createParaAccount ,createParaViemClient} from "@getpara/viem-v2-integration";
//import { createParaAccount, createParaViemClient } from "@getpara/viem";
dotenv.config();

class TransactionService {

  private walletService: WalletService; 
  private paraServer : Para;

  constructor(walletRepository: IWalletRepository) {
    this.walletService = new WalletService(walletRepository);
    this.paraServer = new Para(process.env.PARA_API_KEY || '');
  }

  async createTransaction(senderPhone: number, receiverPhone: number, amount: string) {
  
  }
    
  static async getTransactionStatus(transactionId: string) {
    // Implementation will be added here
    throw new Error('Not implemented')
  }

  static async retryTransaction(transactionId: string) {
    // Implementation will be added here
    throw new Error('Not implemented')
  }

  static async processTransaction(transactionId: string) {
    // Implementation will be added here
    throw new Error('Not implemented')
  }
}

export default TransactionService;