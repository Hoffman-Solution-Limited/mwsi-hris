-- 09-disciplinary-cases-schema.sql
-- Create disciplinary_cases table
CREATE TABLE IF NOT EXISTS disciplinary_cases (
  id TEXT PRIMARY KEY,
  employee_id TEXT,
  employee_name TEXT,
  case_type TEXT,
  status TEXT,
  case_date DATE,
  description TEXT,
  verdict TEXT,
  updates JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- index for quick employee lookups
CREATE INDEX IF NOT EXISTS disciplinary_cases_employee_idx ON disciplinary_cases(employee_id);
