export enum TransactionStatus {
  INITIATED = 'initiated',
  PAYMENT_PENDING = 'payment_pending',
  PAYMENT_CONFIRMED = 'payment_confirmed',
  BLOCKCHAIN_PENDING = 'blockchain_pending',
  BLOCKCHAIN_CONFIRMED = 'blockchain_confirmed',
  WITHDRAWAL_PENDING = 'withdrawal_pending',
  COMPLETED = 'completed',
  FAILED = 'failed'
}

export enum ErrorCodes {
  // User errors (4xx)
  INVALID_PHONE = 'INVALID_PHONE',
  INSUFFICIENT_BALANCE = 'INSUFFICIENT_BALANCE',
  TRANSACTION_LIMIT_EXCEEDED = 'TRANSACTION_LIMIT_EXCEEDED',
  
  // System errors (5xx)
  ONRAMP_SERVICE_UNAVAILABLE = 'ONRAMP_SERVICE_UNAVAILABLE',
  BLOCKCHAIN_TIMEOUT = 'BLOCKCHAIN_TIMEOUT',
  WALLET_CREATION_FAILED = 'WALLET_CREATION_FAILED'
}

export interface User {
  id: string;
  phone: string; // WhatsApp number
  name: string;
  country: 'CR' | 'NI';
  wallet_address: string;
  kyc_status: 'pending' | 'verified' | 'rejected';
  created_at: Date;
  updated_at: Date;
}

export interface TransactionFees {
  platform_fee: number;
  onramp_fee: number;
  offramp_fee: number;
}

export interface TransactionMetadata {
  onramp_provider: string;
  offramp_provider: string;
  user_agent?: string;
}

export interface Transaction {
  id: string;
  sender_phone: string;
  receiver_phone: string;
  amount_usd: number;
  amount_local: number; // CRC
  exchange_rate: number;
  fees: TransactionFees;
  status: TransactionStatus;
  onramp_reference?: string;
  offramp_reference?: string;
  blockchain_tx_hash?: string;
  created_at: Date;
  completed_at?: Date;
  metadata: TransactionMetadata;
}

export interface CustodialWallet {
  id: string;
  user_phone: string;
  blockchain_address: string;
  private_key_ref: string; // KMS reference
  balance_usd: number;
  nonce: number;
  created_at: Date;
}

// API Request/Response Types
export interface RegisterUserRequest {
  phone: string;
  name: string;
  country: 'CR' | 'NI';
}

export interface RegisterUserResponse {
  user: User;
  wallet: CustodialWallet;
}

export interface SendTransactionRequest {
  receiver_phone: string;
  amount_usd: number;
  onramp_provider: string;
}

export interface SendTransactionResponse {
  transaction: Transaction;
  payment_url?: string;
}

export interface TransactionStatusResponse {
  transaction: Transaction;
  estimated_completion?: Date;
}

export interface WalletBalanceResponse {
  wallet: CustodialWallet;
  balance_usd: number;
  pending_transactions: Transaction[];
}

export interface WithdrawRequest {
  transaction_id: string;
  offramp_provider: string;
  bank_account_details: Record<string, any>;
}

export interface WithdrawResponse {
  transaction: Transaction;
  estimated_completion: Date;
  offramp_reference: string;
}

export interface CreateWalletRequest {
  user_phone: string;
}

export interface CreateWalletResponse {
  wallet: CustodialWallet;
  private_key_encrypted: boolean;
}

export interface TransferBetweenWalletsRequest {
  from_phone: string;
  to_phone: string;
  amount_usd: number;
  transaction_id: string;
}

export interface TransferBetweenWalletsResponse {
  blockchain_tx_hash: string;
  estimated_confirmation_time: number; // seconds
}

// WhatsApp Bot Types
export interface BotConversationContext {
  user_phone: string;
  current_flow: 'registration' | 'send_money' | 'check_status' | 'idle';
  step: string;
  data: Record<string, any>;
  last_activity: Date;
}

export interface BotMessageTemplate {
  template_name: string;
  language_code: string;
  components: Array<{
    type: string;
    parameters?: Array<{
      type: string;
      text?: string;
    }>;
  }>;
}

// Validation Types
export interface ValidationError {
  field: string;
  message: string;
  code: ErrorCodes;
}

export interface ApiError {
  code: ErrorCodes;
  message: string;
  details?: Record<string, any>;
  timestamp: Date;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
}

// MetaMask / Web3 Types
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      isMetaMask?: boolean;
      selectedAddress?: string;
      on?: (event: string, callback: (...args: any[]) => void) => void;
      removeListener?: (event: string, callback: (...args: any[]) => void) => void;
    };
  }
}