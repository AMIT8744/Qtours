-- First, safely delete existing tours and related data
-- Delete booking_tours first (foreign key constraint)
DELETE FROM booking_tours;

-- Delete existing tours
DELETE FROM tours;

-- Reset the sequence for tours table
ALTER SEQUENCE tours_id_seq RESTART WITH 1;

-- Insert new locations if they don't exist
INSERT INTO locations (name) 
SELECT * FROM (VALUES 
  ('Abu Dhabi'),
  ('Dubai'),
  ('Doha'),
  ('Manama'),
  ('Muscat'),
  ('Qatar Desert'),
  ('Dubai Desert')
) AS v(name)
WHERE NOT EXISTS (SELECT 1 FROM locations WHERE locations.name = v.name);

-- Insert the new tours based on the Italian tour descriptions
INSERT INTO tours (name, price, location_id, status, duration, capacity, description, images) VALUES

-- ABU DHABI XL
('ABU DHABI XL', 70.00, 
 (SELECT id FROM locations WHERE name = 'Abu Dhabi' LIMIT 1), 
 'active', '7 hours (10:00-18:00)', 25,
 'Discover Abu Dhabi with visits to the Corniche, Heritage Village, Emirates Palace, Etihad Towers, Sheikh Zayed Grand Mosque, Ferrari World, and Louvre Museum. MSC every Wednesday (Nov 12 - Apr 2), COSTA every Friday (Dec 26 - Mar 6).',
 ARRAY['/vast-desert-landscape.png']),

-- DUBAI XL  
('DUBAI XL', 70.00,
 (SELECT id FROM locations WHERE name = 'Dubai' LIMIT 1),
 'active', '9 hours (11:00-19:00)', 25,
 'Complete Dubai tour including Dubai Marina, Palm Jumeirah, Atlantis, Burj Al Arab, Souq Madinat Jumeirah, Bastakia Quarter, Creek Abra ride, Gold & Spice Souqs, Dubai Mall, and Burj Khalifa. MSC every Friday (Nov 12 - Apr 2), COSTA every Sunday (Dec 21 - Mar 7).',
 ARRAY['/vibrant-cityscape.png']),

-- DUBAI BY NIGHT
('DUBAI BY NIGHT', 60.00,
 (SELECT id FROM locations WHERE name = 'Dubai' LIMIT 1),
 'active', '7 hours (16:00-23:00)', 20,
 'Experience Dubai illuminated at night. Visit Souq Madinat Jumeirah, traditional souqs, Museum of the Future, Dubai Frame, Dubai Mall, Dancing Fountains, Dubai Marina, and Palm Jumeirah. COSTA every Saturday (Dec 20 - Mar 6).',
 ARRAY['/vibrant-cityscape.png']),

-- DUBAI HALF DAY
('DUBAI MEZZA GIORNATA', 55.00,
 (SELECT id FROM locations WHERE name = 'Dubai' LIMIT 1),
 'active', '5 hours (12:30-17:30)', 20,
 'Half-day Dubai tour covering Dubai Marina, The Point & Atlantis, Souq Madinat Jumeirah & Burj Al Arab, Al Bastakiya historic quarter, Abra ride on Dubai Creek, and Gold & Spice Souqs. MSC every Saturday (Nov 13 - Apr 3).',
 ARRAY['/vibrant-cityscape.png']),

-- DOHA AIRPORT
('DOHA AEROPORTO', 50.00,
 (SELECT id FROM locations WHERE name = 'Doha' LIMIT 1),
 'active', '5 hours (7:00-12:30)', 20,
 'Pre-embarkation tour from airport. Explore Doha Corniche, The Pearl artificial island, Katara Cultural Village, Lusail futuristic district, and Souq Waqif traditional market. MSC every Sunday (Nov 9 - Apr 5).',
 ARRAY['/museum-interior.png']),

-- DOHA XL
('DOHA XL', 55.00,
 (SELECT id FROM locations WHERE name = 'Doha' LIMIT 1),
 'active', '6 hours (9:00-15:00)', 25,
 'Extended Doha tour with Corniche, The Pearl, Katara Cultural Village, Lusail, and 2-hour stop at Souq Waqif including Falcon Souq and Hospital. Optional National Museum visit (+20€). MSC every Sunday (Nov 9 - Apr 5), COSTA every Thursday (Dec 25 - Mar 4).',
 ARRAY['/museum-interior.png']),

-- MANAMA CITY
('MANAMA CITY', 55.00,
 (SELECT id FROM locations WHERE name = 'Manama' LIMIT 1),
 'active', '5 hours (9:00-14:00)', 20,
 'Explore Bahrain National Museum, Al Fateh Mosque, vibrant Bahrain Souq, and Bahrain Fort (Portuguese Fort) archaeological site. MSC every Monday (Nov 10 - Apr 6).',
 ARRAY['/museum-interior.png']),

-- MANAMA & F1 CIRCUIT
('MANAMA & CIRCUITO F1', 65.00,
 (SELECT id FROM locations WHERE name = 'Manama' LIMIT 1),
 'active', '6 hours (9:00-15:00)', 20,
 'Visit Bahrain International Circuit (F1 track) with optional VIP tour (+25€), Al Fateh Mosque, and Bahrain Souq. Includes camel farm visit during VIP tour wait. MSC every Monday (Nov 10 - Apr 6).',
 ARRAY['/museum-interior.png']),

-- MUSCAT CITY
('MUSCAT CITY', 50.00,
 (SELECT id FROM locations WHERE name = 'Muscat' LIMIT 1),
 'active', '5 hours (9:00-14:00)', 20,
 'Visit Sultan Qaboos Grand Mosque, Royal Opera House, historic Muscat with Al Jalali and Al Mirani forts, Al Alam Palace, and Mutrah Souq. COSTA every Tuesday (Dec 20 - Mar 7).',
 ARRAY['/museum-interior.png']),

-- DOHA DESERT SAFARI
('DOHA DESERT SAFARI & SOUK WAKIF', 70.00,
 (SELECT id FROM locations WHERE name = 'Qatar Desert' LIMIT 1),
 'active', '5 hours (9:00-14:00)', 15,
 'Desert adventure with 4x4 dune bashing, sandboarding, visit to UNESCO site Khor Al-Udaid (Inland Sea), and Souq Waqif exploration. Optional camel ride (+6-8€). MSC every Sunday (Nov 9 - Apr 5), COSTA every Thursday (Dec 25 - Mar 4).',
 ARRAY['/vast-desert-landscape.png']),

-- DUBAI DESERT + DINNER SHOW
('DUBAI DESERTO+CENA SPETTACOLO', 70.00,
 (SELECT id FROM locations WHERE name = 'Dubai Desert' LIMIT 1),
 'active', '6-7 hours (14:30-21:00)', 20,
 'Desert safari with 4x4 dune bashing, sandboarding, traditional camp experience, camel ride, henna painting, Arabic costume photos, buffet dinner under stars, and live entertainment (belly dance & Tanoura show). Optional Quad/Dune Buggy. MSC every Friday (Nov 12 - Apr 2), COSTA every Saturday & Sunday (Dec 20 - Mar 7).',
 ARRAY['/vast-desert-landscape.png']);

-- Update tour pricing for children (40€ for most tours, 30€ for some)
UPDATE tours SET 
  description = CONCAT(description, ' Adult: €', price::text, ', Child: €40')
WHERE name IN ('ABU DHABI XL', 'DUBAI XL', 'DUBAI BY NIGHT', 'DUBAI MEZZA GIORNATA', 'MANAMA & CIRCUITO F1', 'DOHA DESERT SAFARI & SOUK WAKIF', 'DUBAI DESERTO+CENA SPETTACOLO');

UPDATE tours SET 
  description = CONCAT(description, ' Adult: €', price::text, ', Child: €30')
WHERE name IN ('DOHA AEROPORTO', 'DOHA XL', 'MANAMA CITY', 'MUSCAT CITY');

-- Display results
SELECT 
  t.id,
  t.name,
  t.price,
  t.duration,
  l.name as location,
  t.status
FROM tours t
LEFT JOIN locations l ON t.location_id = l.id
ORDER BY t.id;
