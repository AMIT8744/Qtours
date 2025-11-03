-- Add images column to tours table to store base64 encoded images
ALTER TABLE tours 
ADD COLUMN IF NOT EXISTS images TEXT[];

-- Add a comment to document the column
COMMENT ON COLUMN tours.images IS 'Array of base64 encoded images for the tour';
