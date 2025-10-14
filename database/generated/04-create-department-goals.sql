-- Create department_goals table
CREATE TABLE IF NOT EXISTS department_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  department VARCHAR(150) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  owner_id UUID,
  target_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Optional index to speed lookups by department
CREATE INDEX IF NOT EXISTS idx_department_goals_department ON department_goals(department);
