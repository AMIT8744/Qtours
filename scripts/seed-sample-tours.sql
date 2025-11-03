-- Insert sample locations if they don't exist
INSERT INTO locations (name) 
SELECT * FROM (VALUES 
  ('Doha City Center'),
  ('Qatar Desert'),
  ('Museum District'),
  ('Katara Cultural Village'),
  ('The Pearl Qatar')
) AS v(name)
WHERE NOT EXISTS (SELECT 1 FROM locations WHERE locations.name = v.name);

-- Insert sample tours if the tours table is empty
INSERT INTO tours (name, price, location_id, status, duration, capacity, description)
SELECT * FROM (VALUES 
  ('Desert Safari Adventure', 120.00, (SELECT id FROM locations WHERE name = 'Qatar Desert' LIMIT 1), 'active', '4 hours', 15, 'Experience the thrill of dune bashing and camel riding in the Qatar desert'),
  ('Doha City Tour', 85.00, (SELECT id FROM locations WHERE name = 'Doha City Center' LIMIT 1), 'active', '6 hours', 20, 'Explore the modern skyline and traditional souks of Doha'),
  ('Museum & Culture Experience', 95.00, (SELECT id FROM locations WHERE name = 'Museum District' LIMIT 1), 'active', '5 hours', 12, 'Discover Qatar''s rich heritage through world-class museums'),
  ('Qatar Heritage Village Tour', 70.00, (SELECT id FROM locations WHERE name = 'Katara Cultural Village' LIMIT 1), 'active', '3 hours', 18, 'Immerse yourself in traditional Qatari culture and crafts'),
  ('The Pearl Qatar Experience', 110.00, (SELECT id FROM locations WHERE name = 'The Pearl Qatar' LIMIT 1), 'active', '4 hours', 10, 'Luxury shopping and dining experience at The Pearl'),
  ('Sunset Desert Camp', 150.00, (SELECT id FROM locations WHERE name = 'Qatar Desert' LIMIT 1), 'active', '6 hours', 12, 'Evening desert experience with traditional dinner and entertainment')
) AS v(name, price, location_id, status, duration, capacity, description)
WHERE NOT EXISTS (SELECT 1 FROM tours LIMIT 1);
