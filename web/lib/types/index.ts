export enum TransactionStatus {
  INITIATED = "initiated",
  PAYMENT_PENDING = "payment_pending",
  PAYMENT_CONFIRMED = "payment_confirmed",
  BLOCKCHAIN_PENDING = "blockchain_pending",
  BLOCKCHAIN_CONFIRMED = "blockchain_confirmed",
  WITHDRAWAL_PENDING = "withdrawal_pending",
  COMPLETED = "completed",
  FAILED = "failed",
}

export enum ErrorCodes {
  // User errors (4xx)
  INVALID_PHONE = "INVALID_PHONE",
  INVALID_REQUEST = "INVALID_REQUEST",
  INVALID_COUNTRY = "INVALID_COUNTRY",
  INSUFFICIENT_BALANCE = "INSUFFICIENT_BALANCE",
  TRANSACTION_LIMIT_EXCEEDED = "TRANSACTION_LIMIT_EXCEEDED",
  USER_NOT_FOUND = "USER_NOT_FOUND",
  USER_ALREADY_EXISTS = "USER_ALREADY_EXISTS",
  RATE_LIMIT_EXCEEDED = "RATE_LIMIT_EXCEEDED",
  UNAUTHORIZED = "UNAUTHORIZED",
  INVALID_TOKEN = "INVALID_TOKEN",
  TOKEN_EXPIRED = "TOKEN_EXPIRED",
  MISSING_AUTH_HEADER = "MISSING_AUTH_HEADER",

  // System errors (5xx)
  ONRAMP_SERVICE_UNAVAILABLE = "ONRAMP_SERVICE_UNAVAILABLE",
  BLOCKCHAIN_TIMEOUT = "BLOCKCHAIN_TIMEOUT",
  WALLET_CREATION_FAILED = "WALLET_CREATION_FAILED",
  USER_CREATION_FAILED = "USER_CREATION_FAILED",
  INTERNAL_SERVER_ERROR = "INTERNAL_SERVER_ERROR",
  AUTH_ERROR = "AUTH_ERROR",
}

export interface User {
  id: string;
  phone: string; // WhatsApp number
  name?: string;
  country?: "CR" | "NI";
  wallet_address: string;
  wallet_address_external?: string;
  type_wallet?: string;
  kyc_status: "pending" | "verified" | "rejected";
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
  phone: number;
  wallet_address: string;
  encrypterusershare: string;
}

// API Request/Response Types
export interface RegisterUserRequest {
  phone: string;
  name: string;
  country: "CR" | "NI";
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
  bank_account_details: Record<string, string | number | boolean>;
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
  current_flow: "registration" | "send_money" | "check_status" | "idle";
  step: string;
  data: Record<string, string | number | boolean | object>;
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
  details?: Record<string, string | number | boolean | object>;
  timestamp: Date;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
}

// JWT Types
export interface JWTPayload {
  phone: string;
  userId: string;
  iat?: number;
  exp?: number;
}

// Transaction State Machine Types
export interface TransactionStateTransition {
  from: TransactionStatus;
  to: TransactionStatus;
  conditions?: Record<string, string | number | boolean>;
  metadata?: Record<string, string | number | boolean | object>;
}

export interface TransactionProcessingPhase {
  phase: "onramp" | "blockchain" | "offramp";
  status: "pending" | "processing" | "completed" | "failed";
  started_at: Date;
  completed_at?: Date;
  error_message?: string;
  retry_count: number;
  next_retry_at?: Date;
}

// Enhanced Transaction Types
export interface TransactionSummary {
  total_transactions: number;
  total_sent: number;
  total_received: number;
  completed_count: number;
  pending_count: number;
  failed_count: number;
}

export interface TransactionHistoryRequest {
  limit?: number;
  status?: TransactionStatus;
  start_date?: string;
  end_date?: string;
  sender_phone?: string;
  receiver_phone?: string;
}

export interface TransactionHistoryResponse {
  transactions: Transaction[];
  summary: TransactionSummary;
  pagination?: {
    current_page: number;
    total_pages: number;
    has_next: boolean;
    has_previous: boolean;
  };
}

// Retry Logic Types
export interface RetryPolicy {
  max_attempts: number;
  backoff_strategy: "fixed" | "exponential" | "linear";
  base_delay_ms: number;
  max_delay_ms: number;
  retryable_errors: ErrorCodes[];
}

export interface RetryAttempt {
  attempt_number: number;
  attempted_at: Date;
  error_code?: ErrorCodes;
  error_message?: string;
  next_attempt_at?: Date;
}

// Orchestration Types
export interface TransactionOrchestrationContext {
  transaction_id: string;
  current_phase: "onramp" | "blockchain" | "offramp";
  phases_completed: string[];
  rollback_points: Array<{
    phase: string;
    rollback_data: Record<string, string | number | boolean | object>;
  }>;
  processing_metadata: Record<string, string | number | boolean | object>;
}

export interface OrchestrationStep {
  step_name: string;
  phase: "onramp" | "blockchain" | "offramp";
  handler: string;
  timeout_ms: number;
  retry_policy: RetryPolicy;
  rollback_handler?: string;
}

// Payment Provider Integration Types
export interface OnRampProvider {
  provider_id: string;
  name: string;
  supported_countries: string[];
  supported_currencies: string[];
  fee_structure: {
    fixed_fee: number;
    percentage_fee: number;
    minimum_amount: number;
    maximum_amount: number;
  };
  processing_time_estimate: number; // minutes
  api_endpoint: string;
  webhook_endpoint: string;
}

export interface OffRampProvider {
  provider_id: string;
  name: string;
  supported_countries: string[];
  supported_methods: ("bank_transfer" | "sinpe" | "mobile_money")[];
  fee_structure: {
    fixed_fee: number;
    percentage_fee: number;
    minimum_amount: number;
    maximum_amount: number;
  };
  processing_time_estimate: number; // minutes
}

// Enhanced Error Types
export interface TransactionError {
  code: ErrorCodes;
  message: string;
  phase: "validation" | "onramp" | "blockchain" | "offramp";
  retryable: boolean;
  user_message: string;
  technical_details?: Record<string, string | number | boolean | object>;
  timestamp: Date;
}

// Notification Types for Transactions
export interface TransactionNotification {
  type:
    | "TRANSACTION_INITIATED"
    | "STATUS_UPDATE"
    | "TRANSACTION_COMPLETED"
    | "TRANSACTION_FAILED";
  transaction_id: string;
  recipient_phone: string;
  template_data: {
    amount?: number;
    status?: TransactionStatus;
    sender_name?: string;
    receiver_name?: string;
    completion_time?: Date;
    payment_url?: string;
    error_message?: string;
  };
  delivery_method: "whatsapp" | "push" | "email";
  priority: "high" | "normal" | "low";
}

// Compliance and Limits Types
export interface TransactionLimits {
  daily_limit_usd: number;
  monthly_limit_usd: number;
  per_transaction_max: number;
  per_transaction_min: number;
  velocity_check_enabled: boolean;
  suspicious_activity_threshold: number;
}

export interface KycRequirement {
  level: "basic" | "enhanced" | "premium";
  transaction_limit: number;
  required_documents: string[];
  verification_status: "pending" | "approved" | "rejected";
}

// Analytics and Monitoring Types
export interface TransactionMetrics {
  success_rate: number;
  average_completion_time: number;
  total_volume_24h: number;
  active_transactions: number;
  failed_transactions_24h: number;
  revenue_24h: number;
}

export interface SystemHealth {
  onramp_providers: Record<string, "healthy" | "degraded" | "down">;
  offramp_providers: Record<string, "healthy" | "degraded" | "down">;
  blockchain_status: "healthy" | "congested" | "down";
  database_status: "healthy" | "slow" | "down";
  last_health_check: Date;
}

// Testing Types
export interface MockTransactionConfig {
  simulate_failures: boolean;
  failure_rate: number;
  processing_delays: {
    onramp: number;
    blockchain: number;
    offramp: number;
  };
  force_status?: TransactionStatus;
}

export interface TestScenario {
  scenario_id: string;
  description: string;
  initial_conditions: Record<string, string | number | boolean | object>;
  expected_outcomes: Record<string, string | number | boolean | object>;
  steps: Array<{
    action: string;
    parameters: Record<string, string | number | boolean | object>;
    expected_result: string | number | boolean | object;
  }>;
}

// MetaMask / Web3 Types
declare global {
  interface Window {
    ethereum?: {
      request: (args: {
        method: string;
        params?: unknown[];
      }) => Promise<unknown>;
      isMetaMask?: boolean;
      selectedAddress?: string;
      on?: (event: string, callback: (...args: unknown[]) => void) => void;
      removeListener?: (
        event: string,
        callback: (...args: unknown[]) => void
      ) => void;
    };
  }
}
