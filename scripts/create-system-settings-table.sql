-- Drop existing trigger and function if they exist
DROP TRIGGER IF EXISTS update_system_settings_updated_at ON system_settings;
DROP FUNCTION IF EXISTS update_updated_at_column();

-- Create the system_settings table if it doesn't exist
CREATE TABLE IF NOT EXISTS system_settings (
    id SERIAL PRIMARY KEY,
    key VARCHAR(255) UNIQUE NOT NULL,
    content TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create function to update the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_system_settings_updated_at
    BEFORE UPDATE ON system_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert default values if they don't exist
INSERT INTO system_settings (key, content) VALUES 
    ('business_email', 'info@viaggidelqatar.com'),
    ('business_phone', '+974 xxxx xxxx'),
    ('business_location', 'Doha, Qatar'),
    ('terms_and_conditions', 'Terms and conditions have not been set yet. Please contact the administrator.'),
    ('booking_notifications_email', 'palma@qtours.tours'),
    ('dibsy_mode', 'sandbox')
ON CONFLICT (key) DO NOTHING;
