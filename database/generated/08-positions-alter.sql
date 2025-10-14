-- 08-positions-alter.sql
-- Add missing columns to existing positions table to support array stations and gross_salary

ALTER TABLE positions
  ADD COLUMN IF NOT EXISTS stations text[],
  ADD COLUMN IF NOT EXISTS gross_salary numeric,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Ensure stations is usable with array literals
