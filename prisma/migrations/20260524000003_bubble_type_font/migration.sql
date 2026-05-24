-- Add bubbleType and fontFamily columns to Bubble table
ALTER TABLE "Bubble" ADD COLUMN IF NOT EXISTS "bubbleType" TEXT NOT NULL DEFAULT 'speech';
ALTER TABLE "Bubble" ADD COLUMN IF NOT EXISTS "fontFamily" TEXT NOT NULL DEFAULT 'default';
