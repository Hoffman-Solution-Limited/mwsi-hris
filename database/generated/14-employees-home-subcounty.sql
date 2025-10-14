-- Add home_subcounty column to employees if missing
ALTER TABLE IF EXISTS employees
  ADD COLUMN IF NOT EXISTS home_subcounty TEXT;
