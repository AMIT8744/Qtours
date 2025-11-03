-- Create packages table
CREATE TABLE IF NOT EXISTS packages (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    cruise_line VARCHAR(50) NOT NULL, -- 'COSTA' or 'MSC'
    excursions_count INTEGER NOT NULL,
    adult_price DECIMAL(10,2) NOT NULL,
    child_price DECIMAL(10,2) NOT NULL,
    is_popular BOOLEAN DEFAULT FALSE,
    color_scheme VARCHAR(50) DEFAULT 'blue', -- 'blue' for COSTA, 'purple' for MSC
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default packages
INSERT INTO packages (name, description, cruise_line, excursions_count, adult_price, child_price, is_popular, color_scheme, sort_order) VALUES 
    ('Pacchetto 3 Escursioni - COSTA', 'Doha e Muscat + 1 escursione a scelta', 'COSTA', 3, 150.00, 90.00, FALSE, 'blue', 1),
    ('Pacchetto 4 Escursioni - COSTA', 'Doha e Muscat + 2 escursioni a scelta', 'COSTA', 4, 220.00, 120.00, TRUE, 'blue', 2),
    ('Pacchetto 3 Escursioni - MSC', 'Doha e Manama + 1 escursione a scelta', 'MSC', 3, 165.00, 90.00, FALSE, 'purple', 3),
    ('Pacchetto 4 Escursioni - MSC', 'Doha e Manama + 2 escursioni a scelta', 'MSC', 4, 235.00, 125.00, TRUE, 'purple', 4)
ON CONFLICT DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_packages_active ON packages(is_active);
CREATE INDEX IF NOT EXISTS idx_packages_sort_order ON packages(sort_order); 