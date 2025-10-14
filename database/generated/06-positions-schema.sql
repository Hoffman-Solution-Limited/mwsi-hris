-- 06-positions-schema.sql
-- Positions table for Recruitment page

CREATE TABLE IF NOT EXISTS positions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  designation text,
  stations text[],
  gross_salary numeric,
  employment_type text,
  status text DEFAULT 'open',
  description text,
  posted_date date,
  closing_date date,
  applicants integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_positions_status ON positions(status);
CREATE INDEX IF NOT EXISTS idx_positions_designation ON positions(designation);
