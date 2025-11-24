-- 03-department-goals-schema.sql
-- Creates department_goals table used by the frontend Department Goals feature

CREATE TABLE IF NOT EXISTS department_goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  department text NOT NULL,
  title text NOT NULL,
  description text,
  owner_employee_id text,
  target_date date,
  progress integer DEFAULT 0,
  status text DEFAULT 'active',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Optional index for quick lookup by department
CREATE INDEX IF NOT EXISTS idx_department_goals_department ON department_goals(department);
