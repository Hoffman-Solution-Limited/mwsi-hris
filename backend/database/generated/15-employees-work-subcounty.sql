-- Add work_subcounty column to employees if missing
ALTER TABLE IF EXISTS employees
  ADD COLUMN IF NOT EXISTS work_subcounty TEXT;
