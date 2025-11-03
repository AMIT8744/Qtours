-- Add location_name column to tours table if it doesn't exist
DO $$ 
BEGIN
    -- Check if location_name column exists
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'tours' 
        AND column_name = 'location_name'
    ) THEN
        -- Add the location_name column
        ALTER TABLE tours ADD COLUMN location_name VARCHAR(255);
        
        -- Update existing records to populate location_name from locations table
        UPDATE tours 
        SET location_name = l.name 
        FROM locations l 
        WHERE tours.location_id = l.id;
        
        RAISE NOTICE 'Added location_name column to tours table and populated with existing data';
    ELSE
        RAISE NOTICE 'location_name column already exists in tours table';
    END IF;
END $$;

-- Verify the column was added
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'tours' 
AND column_name IN ('location_name', 'location_id')
ORDER BY column_name;
