-- Add external wallet address to users
ALTER TABLE users 
  ADD COLUMN IF NOT EXISTS wallet_address_external VARCHAR(42);

-- Index for faster lookups by external address
CREATE INDEX IF NOT EXISTS idx_users_wallet_address_external 
  ON users(wallet_address_external);


