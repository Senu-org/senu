-- Development seed data for WhatsApp Remittances

-- Clear existing data
TRUNCATE users, custodial_wallets, transactions CASCADE;

-- Insert test users
INSERT INTO users (phone, name, country, wallet_address, kyc_status) VALUES
  ('+50688881111', 'Juan Pérez', 'CR', '0x1234567890123456789012345678901234567890', 'verified'),
  ('+50588882222', 'Miguel González', 'NI', '0x0987654321098765432109876543210987654321', 'verified'),
  ('+50688883333', 'Ana Rodríguez', 'CR', '0xabcdef1234567890abcdef1234567890abcdef12', 'pending'),
  ('+50588884444', 'Carlos Mendoza', 'NI', '0x567890abcdef1234567890abcdef1234567890ab', 'verified');

-- Insert custodial wallets
INSERT INTO custodial_wallets (user_phone, blockchain_address, private_key_ref, balance_usd) VALUES
  ('+50688881111', '0x1234567890123456789012345678901234567890', 'kms://key-1', 250.00),
  ('+50588882222', '0x0987654321098765432109876543210987654321', 'kms://key-2', 0.00),
  ('+50688883333', '0xabcdef1234567890abcdef1234567890abcdef12', 'kms://key-3', 75.50),
  ('+50588884444', '0x567890abcdef1234567890abcdef1234567890ab', 'kms://key-4', 120.25);

-- Insert sample transactions
INSERT INTO transactions (
  sender_phone, 
  receiver_phone, 
  amount_usd, 
  amount_local, 
  exchange_rate, 
  fees, 
  status, 
  onramp_reference, 
  blockchain_tx_hash,
  metadata,
  completed_at
) VALUES
  (
    '+50688881111',
    '+50588882222', 
    100.00, 
    63000.00, 
    630.00, 
    '{"platform_fee": 2.00, "onramp_fee": 1.50, "offramp_fee": 1.00}',
    'completed',
    'onramp_ref_123',
    '0x123abc456def789ghi012jkl345mno678pqr901stu234vwx567yz890',
    '{"onramp_provider": "test_provider", "offramp_provider": "sinpe", "user_agent": "Mozilla/5.0"}',
    NOW() - INTERVAL '2 hours'
  ),
  (
    '+50688883333',
    '+50588884444',
    50.00,
    31500.00,
    630.00,
    '{"platform_fee": 1.00, "onramp_fee": 0.75, "offramp_fee": 0.50}',
    'blockchain_confirmed',
    'onramp_ref_456',
    '0x456def789ghi012jkl345mno678pqr901stu234vwx567yz890abc123',
    '{"onramp_provider": "test_provider", "offramp_provider": "sinpe"}',
    NULL
  ),
  (
    '+50688881111',
    '+50588882222',
    25.00,
    15750.00,
    630.00,
    '{"platform_fee": 0.50, "onramp_fee": 0.38, "offramp_fee": 0.25}',
    'payment_pending',
    'onramp_ref_789',
    NULL,
    '{"onramp_provider": "test_provider", "offramp_provider": "sinpe"}',
    NULL
  );

-- Update wallet balances based on transactions
UPDATE custodial_wallets 
SET balance_usd = 145.00 
WHERE user_phone = '+50688881111'; -- 250 - 100 - 25 + fees

UPDATE custodial_wallets 
SET balance_usd = 100.00 
WHERE user_phone = '+50588882222'; -- 0 + 100 (first completed transaction)

UPDATE custodial_wallets 
SET balance_usd = 25.50 
WHERE user_phone = '+50688883333'; -- 75.5 - 50

UPDATE custodial_wallets 
SET balance_usd = 170.25 
WHERE user_phone = '+50588884444'; -- 120.25 + 50 (blockchain_confirmed, funds credited)

-- Add some transaction history for testing
INSERT INTO transactions (
  sender_phone, 
  receiver_phone, 
  amount_usd, 
  amount_local, 
  exchange_rate, 
  fees, 
  status, 
  metadata,
  created_at
) VALUES
  (
    '+50688881111',
    '+50588882222', 
    200.00, 
    126000.00, 
    630.00, 
    '{"platform_fee": 4.00, "onramp_fee": 3.00, "offramp_fee": 2.00}',
    'failed',
    '{"onramp_provider": "test_provider", "offramp_provider": "sinpe", "error": "Payment method declined"}',
    NOW() - INTERVAL '1 day'
  ),
  (
    '+50688883333',
    '+50588882222',
    75.00,
    47250.00,
    630.00,
    '{"platform_fee": 1.50, "onramp_fee": 1.13, "offramp_fee": 0.75}',
    'completed',
    '{"onramp_provider": "test_provider", "offramp_provider": "sinpe"}',
    NOW() - INTERVAL '3 days'
  );