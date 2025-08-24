-- Add optional type_wallet column to users
ALTER TABLE users ADD COLUMN IF NOT EXISTS type_wallet VARCHAR(50);


