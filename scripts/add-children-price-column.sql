-- Add children_price column to tours table with default value of 0
ALTER TABLE tours ADD COLUMN IF NOT EXISTS children_price DECIMAL(10,2) DEFAULT 0;

-- Update existing tours to have children_price as 50% of adult price (or main price)
UPDATE tours 
SET children_price = ROUND(price * 0.5, 2) 
WHERE children_price IS NULL OR children_price = 0;
