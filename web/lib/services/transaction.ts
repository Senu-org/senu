import { supabaseServer, TABLES, setUserContext } from "../config/supabase";
import { config } from "../config/env";
import { AuthService } from "./auth";
import { WalletService } from "./wallet";
import { NotificationService } from "./notification";
import type {
  Transaction,
  TransactionFees,
  TransactionMetadata,
  ErrorCodes,
  SendTransactionRequest,
  SendTransactionResponse,
  TransactionStatusResponse,
  User,
} from "../types";
import { TransactionStatus } from "../types";

// Transaction state machine configuration
const TRANSACTION_STATE_TRANSITIONS: Record<
  TransactionStatus,
  TransactionStatus[]
> = {
  [TransactionStatus.INITIATED]: [
    TransactionStatus.PAYMENT_PENDING,
    TransactionStatus.FAILED,
  ],
  [TransactionStatus.PAYMENT_PENDING]: [
    TransactionStatus.PAYMENT_CONFIRMED,
    TransactionStatus.FAILED,
  ],
  [TransactionStatus.PAYMENT_CONFIRMED]: [
    TransactionStatus.BLOCKCHAIN_PENDING,
    TransactionStatus.FAILED,
  ],
  [TransactionStatus.BLOCKCHAIN_PENDING]: [
    TransactionStatus.BLOCKCHAIN_CONFIRMED,
    TransactionStatus.FAILED,
  ],
  [TransactionStatus.BLOCKCHAIN_CONFIRMED]: [
    TransactionStatus.WITHDRAWAL_PENDING,
    TransactionStatus.COMPLETED,
  ],
  [TransactionStatus.WITHDRAWAL_PENDING]: [
    TransactionStatus.COMPLETED,
    TransactionStatus.FAILED,
  ],
  [TransactionStatus.COMPLETED]: [], // Final state
  [TransactionStatus.FAILED]: [TransactionStatus.INITIATED], // Allow retry
};

// Retry configuration
const RETRY_CONFIG = {
  maxAttempts: 3,
  backoffMs: [1000, 5000, 15000], // Progressive backoff
  retryableErrors: [
    "ONRAMP_SERVICE_UNAVAILABLE",
    "BLOCKCHAIN_TIMEOUT",
    "INTERNAL_SERVER_ERROR",
  ],
};

// Exchange rate and fee configuration (mock for now)
const EXCHANGE_RATES = {
  USD_CRC: 520.5, // Example rate
  USD_NIC: 36.8, // Example rate
};

const FEE_STRUCTURE = {
  platform_fee_percent: 2.5,
  onramp_fee_fixed: 3.0,
  offramp_fee_percent: 1.5,
};

/**
 * Transaction Service - centralized transaction logic with state machine
 * Implements secure state transitions, orchestration, and error handling
 * Requirements: 2.1, 2.4, 4.1, 5.1, 10.1, 10.2
 */
export class TransactionService {
  /**
   * Create a new transaction with validations
   * Requirements: 2.1, 2.4, 10.2, 10.3
   */
  static async createTransaction(
    senderPhone: string,
    request: SendTransactionRequest
  ): Promise<SendTransactionResponse> {
    try {
      // Validate sender exists
      const sender = await AuthService.getUserByPhone(senderPhone);
      if (!sender) {
        throw new Error("USER_NOT_FOUND");
      }

      // Validate receiver phone format
      if (!this.isValidPhoneNumber(request.receiver_phone)) {
        throw new Error("INVALID_PHONE");
      }

      // Validate amount
      if (request.amount_usd <= 0 || request.amount_usd > 10000) {
        throw new Error("INVALID_REQUEST");
      }

      // Check transaction limits for sender
      await this.validateTransactionLimits(senderPhone, request.amount_usd);

      // Calculate exchange rate and fees
      const country = sender.country;
      const exchangeRate =
        country === "CR" ? EXCHANGE_RATES.USD_CRC : EXCHANGE_RATES.USD_NIC;
      const amountLocal = request.amount_usd * exchangeRate;
      const fees = this.calculateFees(request.amount_usd);

      // Create transaction metadata
      const metadata: TransactionMetadata = {
        onramp_provider: request.onramp_provider,
        offramp_provider: "sinpe", // Default for Nicaragua/Costa Rica
        user_agent: "whatsapp-bot",
      };

      // Create transaction record
      const { data: transaction, error } = await supabaseServer
        .from(TABLES.TRANSACTIONS)
        .insert({
          sender_phone: senderPhone,
          receiver_phone: request.receiver_phone,
          amount_usd: request.amount_usd,
          amount_local: amountLocal,
          exchange_rate: exchangeRate,
          fees: fees,
          status: TransactionStatus.INITIATED,
          metadata: metadata,
        })
        .select()
        .single();

      if (error || !transaction) {
        console.error("Error creating transaction:", error);
        throw new Error("INTERNAL_SERVER_ERROR");
      }

      const transactionData = this.mapDbToTransaction(transaction);

      // Start asynchronous processing
      this.processTransactionAsync(transactionData.id).catch((err) => {
        console.error("Background transaction processing failed:", err);
      });

      // Send initial notification to sender
      await NotificationService.sendTransactionNotification(
        senderPhone,
        "TRANSACTION_INITIATED",
        { transactionId: transactionData.id, amount: request.amount_usd }
      ).catch((err: unknown) => console.error("Notification failed:", err));

      return {
        transaction: transactionData,
        payment_url: this.generateMockPaymentUrl(
          transactionData.id,
          request.onramp_provider
        ),
      };
    } catch (error) {
      console.error("TransactionService.createTransaction error:", error);
      throw error;
    }
  }

  /**
   * Get transaction status with detailed information
   * Requirements: 2.4, 10.2
   */
  static async getTransactionStatus(
    transactionId: string,
    userPhone: string
  ): Promise<TransactionStatusResponse> {
    try {
      // Set user context for RLS
      await setUserContext(userPhone);

      const { data: transaction, error } = await supabaseServer
        .from(TABLES.TRANSACTIONS)
        .select("*")
        .eq("id", transactionId)
        .single();

      if (error || !transaction) {
        throw new Error("TRANSACTION_NOT_FOUND");
      }

      const transactionData = this.mapDbToTransaction(transaction);
      const estimatedCompletion = this.estimateCompletionTime(
        transactionData.status
      );

      return {
        transaction: transactionData,
        estimated_completion: estimatedCompletion,
      };
    } catch (error) {
      console.error("TransactionService.getTransactionStatus error:", error);
      throw error;
    }
  }

  /**
   * Retry a failed transaction with exponential backoff
   * Requirements: 10.2, 10.3
   */
  static async retryTransaction(
    transactionId: string,
    userPhone: string
  ): Promise<Transaction> {
    try {
      // Set user context for RLS
      await setUserContext(userPhone);

      // Get current transaction
      const { data: transaction, error } = await supabaseServer
        .from(TABLES.TRANSACTIONS)
        .select("*")
        .eq("id", transactionId)
        .single();

      if (error || !transaction) {
        throw new Error("TRANSACTION_NOT_FOUND");
      }

      if (transaction.status !== TransactionStatus.FAILED) {
        throw new Error("TRANSACTION_NOT_RETRYABLE");
      }

      // Reset to initiated state
      const updatedTransaction = await this.updateTransactionStatus(
        transactionId,
        TransactionStatus.INITIATED,
        { retry_count: (transaction.retry_count || 0) + 1 }
      );

      // Start async processing again
      this.processTransactionAsync(transactionId).catch((err) => {
        console.error("Retry transaction processing failed:", err);
      });

      return updatedTransaction;
    } catch (error) {
      console.error("TransactionService.retryTransaction error:", error);
      throw error;
    }
  }

  /**
   * Update transaction status with validation
   * Requirements: 2.4, 10.1
   */
  static async updateTransactionStatus(
    transactionId: string,
    newStatus: TransactionStatus,
    metadata?: Record<string, any>
  ): Promise<Transaction> {
    try {
      // Get current transaction
      const { data: currentTransaction, error: fetchError } =
        await supabaseServer
          .from(TABLES.TRANSACTIONS)
          .select("*")
          .eq("id", transactionId)
          .single();

      if (fetchError || !currentTransaction) {
        throw new Error("TRANSACTION_NOT_FOUND");
      }

      // Validate state transition
      const currentStatus = currentTransaction.status as TransactionStatus;
      const allowedTransitions =
        TRANSACTION_STATE_TRANSITIONS[currentStatus] || [];

      if (!allowedTransitions.includes(newStatus)) {
        console.error(
          `Invalid transition from ${currentStatus} to ${newStatus}`
        );
        throw new Error("INVALID_STATE_TRANSITION");
      }

      // Update transaction
      const updateData: any = {
        status: newStatus,
      };

      // Add completion timestamp for final states
      if (
        newStatus === TransactionStatus.COMPLETED ||
        newStatus === TransactionStatus.FAILED
      ) {
        updateData.completed_at = new Date().toISOString();
      }

      // Merge metadata
      if (metadata) {
        updateData.metadata = {
          ...currentTransaction.metadata,
          ...metadata,
        };
      }

      const { data: updatedTransaction, error } = await supabaseServer
        .from(TABLES.TRANSACTIONS)
        .update(updateData)
        .eq("id", transactionId)
        .select()
        .single();

      if (error || !updatedTransaction) {
        console.error("Error updating transaction status:", error);
        throw new Error("INTERNAL_SERVER_ERROR");
      }

      const transactionData = this.mapDbToTransaction(updatedTransaction);

      // Send status update notification
      await NotificationService.sendTransactionNotification(
        transactionData.sender_phone,
        "STATUS_UPDATE",
        {
          transactionId: transactionData.id,
          status: newStatus,
          amount: transactionData.amount_usd,
        }
      ).catch((err: unknown) =>
        console.error("Status notification failed:", err)
      );

      return transactionData;
    } catch (error) {
      console.error("TransactionService.updateTransactionStatus error:", error);
      throw error;
    }
  }

  /**
   * End-to-end transaction processing orchestrator
   * Requirements: 2.1, 3.1, 6.1, 7.2
   */
  static async processTransactionAsync(transactionId: string): Promise<void> {
    try {
      console.log(`Starting transaction processing for ${transactionId}`);

      // Get transaction
      const { data: transaction, error } = await supabaseServer
        .from(TABLES.TRANSACTIONS)
        .select("*")
        .eq("id", transactionId)
        .single();

      if (error || !transaction) {
        throw new Error("TRANSACTION_NOT_FOUND");
      }

      const transactionData = this.mapDbToTransaction(transaction);

      try {
        // Phase 1: On-ramp payment processing
        await this.processOnRampPayment(transactionData);

        // Phase 2: Blockchain transfer
        await this.processBlockchainTransfer(transactionData);

        // Phase 3: Off-ramp withdrawal (if needed)
        await this.processOffRampWithdrawal(transactionData);

        // Mark as completed
        await this.updateTransactionStatus(
          transactionId,
          TransactionStatus.COMPLETED
        );

        console.log(`Transaction ${transactionId} completed successfully`);
      } catch (processError) {
        console.error(`Transaction ${transactionId} failed:`, processError);
        await this.handleTransactionFailure(
          transactionId,
          processError as Error
        );
      }
    } catch (error) {
      console.error("TransactionService.processTransactionAsync error:", error);
    }
  }

  /**
   * Process on-ramp payment phase
   */
  private static async processOnRampPayment(
    transaction: Transaction
  ): Promise<void> {
    console.log(`Processing on-ramp payment for transaction ${transaction.id}`);

    // Update to payment pending
    await this.updateTransactionStatus(
      transaction.id,
      TransactionStatus.PAYMENT_PENDING
    );

    // Simulate payment processing (replace with real integration)
    await this.simulateAsyncProcess(3000, 0.1); // 3s with 10% failure rate

    // Update to payment confirmed
    await this.updateTransactionStatus(
      transaction.id,
      TransactionStatus.PAYMENT_CONFIRMED,
      { onramp_reference: `onramp_${Date.now()}` }
    );
  }

  /**
   * Process blockchain transfer phase
   */
  private static async processBlockchainTransfer(
    transaction: Transaction
  ): Promise<void> {
    console.log(
      `Processing blockchain transfer for transaction ${transaction.id}`
    );

    // Update to blockchain pending
    await this.updateTransactionStatus(
      transaction.id,
      TransactionStatus.BLOCKCHAIN_PENDING
    );

    try {
      // Execute wallet transfer
      const transferResult = await WalletService.transferBetweenWallets({
        from_phone: transaction.sender_phone,
        to_phone: transaction.receiver_phone,
        amount_usd: transaction.amount_usd,
        transaction_id: transaction.id,
      });

      // Update with blockchain hash
      await this.updateTransactionStatus(
        transaction.id,
        TransactionStatus.BLOCKCHAIN_CONFIRMED,
        {
          blockchain_tx_hash: transferResult.blockchain_tx_hash,
          confirmation_time: transferResult.estimated_confirmation_time,
        }
      );
    } catch (walletError) {
      console.error("Blockchain transfer failed:", walletError);
      throw walletError;
    }
  }

  /**
   * Process off-ramp withdrawal phase (optional)
   */
  private static async processOffRampWithdrawal(
    transaction: Transaction
  ): Promise<void> {
    console.log(
      `Processing off-ramp withdrawal for transaction ${transaction.id}`
    );

    // Check if receiver wants automatic withdrawal
    const receiver = await AuthService.getUserByPhone(
      transaction.receiver_phone
    );
    if (!receiver) {
      // Direct wallet transfer completed, no off-ramp needed
      return;
    }

    // Update to withdrawal pending
    await this.updateTransactionStatus(
      transaction.id,
      TransactionStatus.WITHDRAWAL_PENDING
    );

    // Simulate withdrawal processing (replace with SINPE/bank integration)
    await this.simulateAsyncProcess(5000, 0.05); // 5s with 5% failure rate

    // Complete withdrawal
    await this.updateTransactionStatus(
      transaction.id,
      TransactionStatus.COMPLETED,
      { offramp_reference: `offramp_${Date.now()}` }
    );
  }

  /**
   * Handle transaction failure with rollback logic
   */
  private static async handleTransactionFailure(
    transactionId: string,
    error: Error
  ): Promise<void> {
    try {
      console.log(
        `Handling failure for transaction ${transactionId}:`,
        error.message
      );

      // Mark as failed
      await this.updateTransactionStatus(
        transactionId,
        TransactionStatus.FAILED,
        {
          error_message: error.message,
          failed_at: new Date().toISOString(),
        }
      );

      // TODO: Implement rollback logic for partial transactions
      // This would include refunding on-ramp payments if blockchain transfer fails
    } catch (rollbackError) {
      console.error("Rollback failed:", rollbackError);
    }
  }

  /**
   * Calculate transaction fees
   */
  private static calculateFees(amountUsd: number): TransactionFees {
    return {
      platform_fee: amountUsd * (FEE_STRUCTURE.platform_fee_percent / 100),
      onramp_fee: FEE_STRUCTURE.onramp_fee_fixed,
      offramp_fee: amountUsd * (FEE_STRUCTURE.offramp_fee_percent / 100),
    };
  }

  /**
   * Validate transaction limits for user
   */
  private static async validateTransactionLimits(
    senderPhone: string,
    amountUsd: number
  ): Promise<void> {
    // Get user's transactions from last 24 hours
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const { data: recentTransactions, error } = await supabaseServer
      .from(TABLES.TRANSACTIONS)
      .select("amount_usd")
      .eq("sender_phone", senderPhone)
      .gte("created_at", oneDayAgo.toISOString());

    if (error) {
      console.error("Error checking transaction limits:", error);
      return; // Allow transaction if we can't check limits
    }

    const dailyTotal = (recentTransactions || []).reduce(
      (sum, tx) => sum + tx.amount_usd,
      0
    );
    const DAILY_LIMIT = 1000; // $1000 daily limit

    if (dailyTotal + amountUsd > DAILY_LIMIT) {
      throw new Error("TRANSACTION_LIMIT_EXCEEDED");
    }
  }

  /**
   * Estimate completion time based on current status
   */
  private static estimateCompletionTime(status: TransactionStatus): Date {
    const now = new Date();
    const estimatesMs = {
      [TransactionStatus.INITIATED]: 2 * 60 * 1000, // 2 minutes
      [TransactionStatus.PAYMENT_PENDING]: 3 * 60 * 1000, // 3 minutes
      [TransactionStatus.PAYMENT_CONFIRMED]: 2 * 60 * 1000, // 2 minutes
      [TransactionStatus.BLOCKCHAIN_PENDING]: 5 * 60 * 1000, // 5 minutes
      [TransactionStatus.BLOCKCHAIN_CONFIRMED]: 3 * 60 * 1000, // 3 minutes
      [TransactionStatus.WITHDRAWAL_PENDING]: 10 * 60 * 1000, // 10 minutes
      [TransactionStatus.COMPLETED]: 0,
      [TransactionStatus.FAILED]: 0,
    };

    return new Date(now.getTime() + (estimatesMs[status] || 0));
  }

  /**
   * Generate mock payment URL (replace with real provider integration)
   */
  private static generateMockPaymentUrl(
    transactionId: string,
    provider: string
  ): string {
    return `https://mock-payment.${provider}.com/pay/${transactionId}`;
  }

  /**
   * Simulate async process with optional failure rate
   */
  private static async simulateAsyncProcess(
    delayMs: number,
    failureRate: number = 0
  ): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, delayMs));

    if (Math.random() < failureRate) {
      throw new Error("SIMULATED_FAILURE");
    }
  }

  /**
   * Validate phone number format
   */
  private static isValidPhoneNumber(phone: string): boolean {
    const phoneRegex = /^\+50[56]\d{8}$/;
    return phoneRegex.test(phone);
  }

  /**
   * Map database record to Transaction interface
   */
  private static mapDbToTransaction(dbTransaction: any): Transaction {
    return {
      id: dbTransaction.id,
      sender_phone: dbTransaction.sender_phone,
      receiver_phone: dbTransaction.receiver_phone,
      amount_usd: parseFloat(dbTransaction.amount_usd),
      amount_local: parseFloat(dbTransaction.amount_local),
      exchange_rate: parseFloat(dbTransaction.exchange_rate),
      fees: dbTransaction.fees,
      status: dbTransaction.status as TransactionStatus,
      onramp_reference: dbTransaction.onramp_reference,
      offramp_reference: dbTransaction.offramp_reference,
      blockchain_tx_hash: dbTransaction.blockchain_tx_hash,
      created_at: new Date(dbTransaction.created_at),
      completed_at: dbTransaction.completed_at
        ? new Date(dbTransaction.completed_at)
        : undefined,
      metadata: dbTransaction.metadata,
    };
  }

  /**
   * Get all transactions for a user
   */
  static async getUserTransactions(
    userPhone: string,
    limit: number = 50
  ): Promise<Transaction[]> {
    try {
      await setUserContext(userPhone);

      const { data: transactions, error } = await supabaseServer
        .from(TABLES.TRANSACTIONS)
        .select("*")
        .or(`sender_phone.eq.${userPhone},receiver_phone.eq.${userPhone}`)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) {
        console.error("Error fetching user transactions:", error);
        return [];
      }

      return (transactions || []).map(this.mapDbToTransaction);
    } catch (error) {
      console.error("TransactionService.getUserTransactions error:", error);
      return [];
    }
  }
}
