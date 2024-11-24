-- Add new payment method types
ALTER TYPE payment_method_type ADD VALUE IF NOT EXISTS 'apple_pay';
ALTER TYPE payment_method_type ADD VALUE IF NOT EXISTS 'google_pay';
ALTER TYPE payment_method_type ADD VALUE IF NOT EXISTS 'paypal';
ALTER TYPE payment_method_type ADD VALUE IF NOT EXISTS 'bank_transfer';
ALTER TYPE payment_method_type ADD VALUE IF NOT EXISTS 'ach_debit';

-- Add new columns to payment_methods table
ALTER TABLE payment_methods
ADD COLUMN IF NOT EXISTS bank_account jsonb,
ADD COLUMN IF NOT EXISTS paypal jsonb,
ADD COLUMN IF NOT EXISTS wallet jsonb;

-- Add indexes for new payment types
CREATE INDEX IF NOT EXISTS idx_payment_methods_bank_account ON payment_methods USING gin (bank_account);
CREATE INDEX IF NOT EXISTS idx_payment_methods_paypal ON payment_methods USING gin (paypal);
CREATE INDEX IF NOT EXISTS idx_payment_methods_wallet ON payment_methods USING gin (wallet); 