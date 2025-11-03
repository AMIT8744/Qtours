-- Add available_dates column to tours table if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tours' AND column_name='available_dates') THEN
        ALTER TABLE tours ADD COLUMN available_dates TEXT[] DEFAULT '{}';
    END IF;
END $$;
