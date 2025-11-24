-- 07-positions-seed.sql
-- Seed initial positions for development

INSERT INTO positions (id, title, designation, stations, gross_salary, employment_type, status, description, posted_date, closing_date, applicants)
VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Software Engineer', 'Software Engineer', ARRAY['Nairobi'], 120000, 'Permanent', 'open', 'Build and maintain web applications', '2025-09-01', '2025-12-31', 12),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'HR Officer', 'HR Officer', ARRAY['Nairobi'], 60000, 'Permanent', 'open', 'Manage HR processes', '2025-09-01', '2025-11-30', 5);
