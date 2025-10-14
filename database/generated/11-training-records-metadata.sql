-- Migration: add metadata columns to training_records for program templates
ALTER TABLE IF EXISTS training_records
  ADD COLUMN IF NOT EXISTS description text,
  ADD COLUMN IF NOT EXISTS duration integer,
  ADD COLUMN IF NOT EXISTS max_participants integer,
  ADD COLUMN IF NOT EXISTS prerequisites text,
  ADD COLUMN IF NOT EXISTS category text;
