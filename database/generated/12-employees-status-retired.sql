-- Migration: allow 'retired' in employees.status
ALTER TABLE employees
  DROP CONSTRAINT IF EXISTS employees_status_check;

ALTER TABLE employees
  ADD CONSTRAINT employees_status_check CHECK (status IN ('active','inactive','terminated','retired'));
