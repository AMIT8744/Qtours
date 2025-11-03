-- Add ship column to tours table
ALTER TABLE tours ADD COLUMN IF NOT EXISTS ship VARCHAR(255);

-- Update existing tours with default ship name if needed
UPDATE tours SET ship = 'MSC Cruises' WHERE ship IS NULL;

-- Add index for better performance on ship queries
CREATE INDEX IF NOT EXISTS idx_tours_ship ON tours(ship);
