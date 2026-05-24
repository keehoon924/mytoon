-- Add REFUND to TransactionReason enum
ALTER TYPE "TransactionReason" ADD VALUE IF NOT EXISTS 'REFUND';
