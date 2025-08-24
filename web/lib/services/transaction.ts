import {parseEther,isAddress, http} from 'viem'
import WalletService from './wallet'
import { IWalletRepository } from '../interfaces/IWalletRepository';
import dotenv from "dotenv";
import { createParaAccount, createParaViemClient } from "@getpara/viem-v2-integration";
import { monadChain, publicClient, MONAD_RPC_URL } from '../utils';
import ParaInstanceManager from './ParaInstanceManager';
dotenv.config();

export class TransactionService {

  private walletService: WalletService; 
  private paraManager: ParaInstanceManager;
  private walletRepository: IWalletRepository;

  constructor(walletRepository: IWalletRepository) {
    this.walletService = new WalletService(walletRepository);
    this.paraManager = ParaInstanceManager.getInstance();
    this.walletRepository = walletRepository;
  }

  async createTransaction(senderPhone: number, receiverPhone: number, amount: string) {
    try {
      // Validate amount
      const amountInWei = parseEther(amount);
      if (amountInWei <= BigInt(0)) {
        throw new Error('Invalid amount');
      }

      // Recover sender wallet
      await this.walletService.recoverWallet(senderPhone);
      
      // Get receiver wallet address
      const receiverAddress = await this.walletRepository.getAddressByPhoneNumber(receiverPhone);
      if (!receiverAddress) {
        throw new Error('Receiver wallet not found');
      }

      // Validate receiver address
      if (!isAddress(receiverAddress)) {
        throw new Error('Invalid receiver address');
      }

      // Get sender address
      const senderAddress = await this.walletRepository.getAddressByPhoneNumber(senderPhone);
      if (!senderAddress) {
        throw new Error('Sender wallet not found');
      }

      // Create Para account and Viem client using shared Para instance
      const paraServer = this.paraManager.getParaServer();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const paraAccount = createParaAccount(paraServer as any);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const viemClient = createParaViemClient(paraServer as any, {
        account: paraAccount,
        chain: monadChain,
        transport: http(MONAD_RPC_URL),
      });

      // Get transaction parameters
      const gasPrice = await publicClient.getGasPrice();
      const nonce = await publicClient.getTransactionCount({ address: senderAddress as `0x${string}` });
      
      // Prepare transaction
      const transaction = {
        account: paraAccount,
        to: receiverAddress as `0x${string}`,
        value: amountInWei,
        gas: BigInt(21000), // Standard transfer gas limit
        gasPrice: gasPrice,
        nonce: nonce,
        chain: monadChain,
      };

      // Send transaction
      const hash = await viemClient.sendTransaction(transaction);
      
      // Wait for transaction confirmation
      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      
      // Clear user share for security
      this.paraManager.clearUserShare();
      
      // Return transaction details
      return {
        transactionId: hash,
        sender: senderAddress,
        receiver: receiverAddress,
        amount: amount,
        status: receipt.status === 'success' ? 'confirmed' : 'failed',
        timestamp: new Date().toISOString(),
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
        effectiveGasPrice: receipt.effectiveGasPrice.toString(),
      };

    } catch (error) {
      // Clear user share on error for security
      this.paraManager.clearUserShare();
      console.error('Error creating transaction:', error);
      throw error;
    }
  }
    
  static async getTransactionStatus(transactionId: string) {
    try {
      // Get transaction receipt from blockchain
      const receipt = await publicClient.getTransactionReceipt({ hash: transactionId as `0x${string}` });
      
      return {
        transactionId,
        status: receipt.status === 'success' ? 'confirmed' : 'failed',
        timestamp: new Date().toISOString(),
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
        effectiveGasPrice: receipt.effectiveGasPrice.toString(),
      };
    } catch (error) {
      console.error('Error getting transaction status:', error);
      throw error;
    }
  }

  static async retryTransaction(transactionId: string) {
    try {
      // Get the original transaction
      const originalTx = await publicClient.getTransaction({ hash: transactionId as `0x${string}` });
      
      if (!originalTx) {
        throw new Error('Original transaction not found');
      }

      // Create a new transaction with higher gas price for retry
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const newGasPrice = (originalTx.gasPrice || BigInt(0)) * BigInt(120) / BigInt(100); // 20% increase
      
      // Note: For retry, we would need the original sender's Para account
      // This is a simplified implementation - in practice, you'd need to recover the sender's wallet
      
      return {
        originalTransactionId: transactionId,
        status: 'retry_requires_sender_account',
        timestamp: new Date().toISOString(),
        gasPriceIncrease: '20%',
        message: 'Retry requires sender account recovery - implement in instance method',
      };
    } catch (error) {
      console.error('Error retrying transaction:', error);
      throw error;
    }
  }

  static async processTransaction(transactionId: string) {
    try {
      // Get transaction status
      const status = await TransactionService.getTransactionStatus(transactionId);
      
      if (status.status === 'confirmed') {
        // TODO: Update database records, send notifications, etc.
        console.log(`Transaction ${transactionId} processed successfully`);
      } else {
        console.log(`Transaction ${transactionId} failed or pending`);
      }
      
      return {
        transactionId,
        status: 'processed',
        timestamp: new Date().toISOString(),
        processedAt: new Date().toISOString(),
        blockchainStatus: status.status,
      };
    } catch (error) {
      console.error('Error processing transaction:', error);
      throw error;
    }
  }

  static async getUserTransactions(userPhone: string, limit: number = 50): Promise<Array<{
    transactionId: string;
    sender: string;
    receiver: string;
    amount: number;
    status: string;
    timestamp: string;
  }>> {
    try {
      // TODO: Implement actual database query to get user transactions
      // For now, return empty array as placeholder
      console.log(`Getting transactions for user: ${userPhone}, limit: ${limit}`);
      
      // This should query the database for transactions where userPhone is either sender or receiver
      // Return transactions sorted by created_at descending
      
      return [];
    } catch (error) {
      console.error('Error getting user transactions:', error);
      throw error;
    }
  }
}
