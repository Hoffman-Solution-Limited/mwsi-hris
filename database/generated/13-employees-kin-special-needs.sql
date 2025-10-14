-- Migration: add next of kin and special needs fields to employees
-- Safe to run multiple times: uses IF NOT EXISTS where possible

ALTER TABLE employees
  ADD COLUMN IF NOT EXISTS next_of_kin_name text,
  ADD COLUMN IF NOT EXISTS next_of_kin_relationship text,
  ADD COLUMN IF NOT EXISTS next_of_kin_phone text,
  ADD COLUMN IF NOT EXISTS next_of_kin_email text,
  ADD COLUMN IF NOT EXISTS has_special_needs boolean,
  ADD COLUMN IF NOT EXISTS special_needs_description text;
