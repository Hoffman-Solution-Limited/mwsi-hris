-- Add marital_status to employees table
ALTER TABLE employees
  ADD COLUMN IF NOT EXISTS marital_status VARCHAR(32);
