-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable Row Level Security
ALTER DATABASE postgres SET row_security = on;

-- Create users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone VARCHAR(20) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  country VARCHAR(2) NOT NULL CHECK (country IN ('CR', 'NI')),
  wallet_address VARCHAR(42) NOT NULL,
  kyc_status VARCHAR(20) DEFAULT 'pending' CHECK (kyc_status IN ('pending', 'verified', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create custodial_wallets table
CREATE TABLE custodial_wallets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_phone VARCHAR(20) REFERENCES users(phone) ON DELETE CASCADE,
  blockchain_address VARCHAR(42) UNIQUE NOT NULL,
  private_key_ref VARCHAR(200) NOT NULL,
  balance_usd DECIMAL(12,6) DEFAULT 0 CHECK (balance_usd >= 0),
  nonce INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create transactions table
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_phone VARCHAR(20) REFERENCES users(phone),
  receiver_phone VARCHAR(20) NOT NULL,
  amount_usd DECIMAL(10,2) NOT NULL CHECK (amount_usd > 0),
  amount_local DECIMAL(12,2) NOT NULL CHECK (amount_local > 0),
  exchange_rate DECIMAL(8,4) NOT NULL CHECK (exchange_rate > 0),
  fees JSONB NOT NULL,
  status VARCHAR(30) NOT NULL CHECK (status IN ('initiated', 'payment_pending', 'payment_confirmed', 'blockchain_pending', 'blockchain_confirmed', 'withdrawal_pending', 'completed', 'failed')),
  onramp_reference VARCHAR(100),
  offramp_reference VARCHAR(100),
  blockchain_tx_hash VARCHAR(66),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for better performance
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_wallet_address ON users(wallet_address);
CREATE INDEX idx_custodial_wallets_user_phone ON custodial_wallets(user_phone);
CREATE INDEX idx_custodial_wallets_address ON custodial_wallets(blockchain_address);
CREATE INDEX idx_transactions_sender ON transactions(sender_phone);
CREATE INDEX idx_transactions_receiver ON transactions(receiver_phone);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_created_at ON transactions(created_at);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for users table
CREATE TRIGGER update_users_updated_at 
  BEFORE UPDATE ON users 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security Policies

-- Users can only see their own data
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (phone = current_setting('app.current_user_phone', true));

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (phone = current_setting('app.current_user_phone', true));

-- Custodial wallets can only be accessed by the owner
ALTER TABLE custodial_wallets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own wallet" ON custodial_wallets
  FOR SELECT USING (user_phone = current_setting('app.current_user_phone', true));

-- Transactions can be viewed by sender or receiver
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own transactions" ON transactions
  FOR SELECT USING (
    sender_phone = current_setting('app.current_user_phone', true) OR 
    receiver_phone = current_setting('app.current_user_phone', true)
  );

CREATE POLICY "Users can create transactions as sender" ON transactions
  FOR INSERT WITH CHECK (sender_phone = current_setting('app.current_user_phone', true));

-- Create service role policies (for backend services)
CREATE POLICY "Service role full access users" ON users
  FOR ALL USING (current_setting('role') = 'service_role');

CREATE POLICY "Service role full access wallets" ON custodial_wallets
  FOR ALL USING (current_setting('role') = 'service_role');

CREATE POLICY "Service role full access transactions" ON transactions
  FOR ALL USING (current_setting('role') = 'service_role');

-- Create views for common queries
CREATE VIEW user_wallet_summary AS
SELECT 
  u.id,
  u.phone,
  u.name,
  u.country,
  u.kyc_status,
  cw.blockchain_address,
  cw.balance_usd,
  u.created_at
FROM users u
LEFT JOIN custodial_wallets cw ON u.phone = cw.user_phone;

-- Create view for transaction history with user names
CREATE VIEW transaction_history AS
SELECT 
  t.id,
  t.sender_phone,
  sender.name as sender_name,
  t.receiver_phone,
  receiver.name as receiver_name,
  t.amount_usd,
  t.amount_local,
  t.exchange_rate,
  t.fees,
  t.status,
  t.blockchain_tx_hash,
  t.created_at,
  t.completed_at
FROM transactions t
LEFT JOIN users sender ON t.sender_phone = sender.phone
LEFT JOIN users receiver ON t.receiver_phone = receiver.phone;

-- Insert initial test data (for development)
INSERT INTO users (phone, name, country, wallet_address, kyc_status) VALUES
  ('+50688881111', 'Juan Pérez', 'CR', '0x1234567890123456789012345678901234567890', 'verified'),
  ('+50588882222', 'Miguel González', 'NI', '0x0987654321098765432109876543210987654321', 'verified');

INSERT INTO custodial_wallets (user_phone, blockchain_address, private_key_ref, balance_usd) VALUES
  ('+50688881111', '0x1234567890123456789012345678901234567890', 'kms://key-1', 100.00),
  ('+50588882222', '0x0987654321098765432109876543210987654321', 'kms://key-2', 0.00);