-- Add execution fields to InvestmentOrder for product-specific logic
ALTER TABLE InvestmentOrder ADD COLUMN executedAt DATETIME;
ALTER TABLE InvestmentOrder ADD COLUMN allocation INT;
ALTER TABLE InvestmentOrder ADD COLUMN navUsed FLOAT;
ALTER TABLE InvestmentOrder ADD COLUMN discountRate FLOAT;
ALTER TABLE InvestmentOrder ADD COLUMN tradeConfirmation TEXT;
ALTER TABLE InvestmentOrder ADD COLUMN failureReason TEXT;
