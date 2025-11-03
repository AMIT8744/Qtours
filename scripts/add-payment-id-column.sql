-- Add payment_id column to bookings table
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS payment_id VARCHAR(255);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_bookings_payment_id ON bookings(payment_id);

-- Add comment to document the column
COMMENT ON COLUMN bookings.payment_id IS 'Dibsy payment ID for tracking payment status';
