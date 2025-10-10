-- Generated schema derived from src/data mock structures
-- PostgreSQL dialect

-- Enable UUID extension (optional, IDs kept as text in mocks so using VARCHAR for compatibility)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Departments
-- Front-end treats department as a simple string on employees; provide a lightweight table without description
CREATE TABLE departments (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Employees
CREATE TABLE employees (
  id VARCHAR(50) PRIMARY KEY,
  employee_number VARCHAR(50),
  name VARCHAR(200) NOT NULL,
  email VARCHAR(200) UNIQUE,
  position VARCHAR(200),
  department VARCHAR(100),
  manager VARCHAR(200),
  manager_id VARCHAR(50),
  hire_date DATE,
  status VARCHAR(20) CHECK (status IN ('active', 'inactive', 'terminated')) DEFAULT 'active',
  avatar TEXT,
  phone VARCHAR(50),
  emergency_contact TEXT,
  salary NUMERIC(12,2),
  gender VARCHAR(20),
  cadre VARCHAR(50),
  employment_type VARCHAR(100),
  engagement_type VARCHAR(100),
  job_group VARCHAR(50),
  ethnicity VARCHAR(100),
  national_id VARCHAR(50),
  kra_pin VARCHAR(50),
  children VARCHAR(10),
  work_county VARCHAR(100),
  home_county VARCHAR(100),
  postal_address TEXT,
  postal_code VARCHAR(20),
  station_name VARCHAR(200),
  skill_level TEXT,
  company TEXT,
  date_of_birth DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Employee skills (one-to-many)
CREATE TABLE employee_skills (
  id SERIAL PRIMARY KEY,
  employee_id VARCHAR(50) REFERENCES employees(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  level VARCHAR(50) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Positions
CREATE TABLE positions (
  id VARCHAR(50) PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  department VARCHAR(100),
  status VARCHAR(20) CHECK (status IN ('open', 'filled', 'closed')) DEFAULT 'open',
  priority VARCHAR(20),
  applicants INTEGER DEFAULT 0,
  posted_date DATE,
  closing_date DATE,
  description TEXT,
  designation VARCHAR(200),
  skill_level VARCHAR(200),
  station_name VARCHAR(200),
  job_group VARCHAR(50),
  employment_type VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Training records
CREATE TABLE training_records (
  id VARCHAR(50) PRIMARY KEY,
  employee_id VARCHAR(50) REFERENCES employees(id) ON DELETE CASCADE,
  title VARCHAR(300) NOT NULL,
  type VARCHAR(50),
  status VARCHAR(50),
  completion_date DATE,
  expiry_date DATE,
  provider VARCHAR(200),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Leave requests
CREATE TABLE leave_requests (
  id VARCHAR(50) PRIMARY KEY,
  employee_id VARCHAR(50) REFERENCES employees(id) ON DELETE CASCADE,
  employee_name VARCHAR(200),
  type VARCHAR(50),
  start_date DATE,
  end_date DATE,
  days INTEGER,
  status VARCHAR(50),
  reason TEXT,
  applied_date DATE,
  manager_comments TEXT,
  hr_comments TEXT,
  approved_by VARCHAR(200),
  approved_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Performance templates
CREATE TABLE performance_templates (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  type VARCHAR(50),
  description TEXT,
  department VARCHAR(100),
  created_by VARCHAR(200),
  created_at DATE
);

-- Performance template criteria
CREATE TABLE performance_template_criteria (
  id SERIAL PRIMARY KEY,
  template_id VARCHAR(50) REFERENCES performance_templates(id) ON DELETE CASCADE,
  criteria_id VARCHAR(50) NOT NULL,
  name VARCHAR(200) NOT NULL,
  weight NUMERIC(5,2) NOT NULL,
  description TEXT,
  UNIQUE(template_id, criteria_id)
);

-- Performance reviews
CREATE TABLE performance_reviews (
  id VARCHAR(50) PRIMARY KEY,
  employee_id VARCHAR(50) REFERENCES employees(id) ON DELETE CASCADE,
  employee_name VARCHAR(200),
  employee_number VARCHAR(50),
  template_id VARCHAR(50) REFERENCES performance_templates(id),
  review_period VARCHAR(100),
  employee_self_comments TEXT,
  employee_ack_status VARCHAR(20),
  employee_ack_comments TEXT,
  employee_ack_date DATE,
  status VARCHAR(50),
  overall_score NUMERIC(5,2),
  score NUMERIC(5,2),
  manager_comments TEXT,
  hr_comments TEXT,
  goals TEXT[],
  feedback TEXT,
  -- Store flexible structured parts as JSON to match frontend shapes
  employee_targets JSONB,
  manager_scores JSONB,
  employee_scores JSONB,
  next_review_date DATE,
  created_by VARCHAR(200),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Employee targets
CREATE TABLE employee_targets (
  id SERIAL PRIMARY KEY,
  review_id VARCHAR(50) REFERENCES performance_reviews(id) ON DELETE CASCADE,
  criteria_id VARCHAR(50) NOT NULL,
  target TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Performance scores
CREATE TABLE performance_scores (
  id SERIAL PRIMARY KEY,
  review_id VARCHAR(50) REFERENCES performance_reviews(id) ON DELETE CASCADE,
  criteria_id VARCHAR(50) NOT NULL,
  score_by VARCHAR(20),
  score INTEGER,
  comments TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
-- Disciplinary cases
CREATE TABLE disciplinary_cases (
  id VARCHAR(50) PRIMARY KEY,
  employee_id VARCHAR(50) REFERENCES employees(id) ON DELETE CASCADE,
  employee_name VARCHAR(200),
  case_type VARCHAR(200),
  status VARCHAR(50),
  date DATE,
  description TEXT,
  verdict TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Disciplinary case updates
CREATE TABLE disciplinary_case_updates (
  id SERIAL PRIMARY KEY,
  case_id VARCHAR(50) REFERENCES disciplinary_cases(id) ON DELETE CASCADE,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  text TEXT
);

-- File tracking & flexible document types (matches front-end FileTrackingContext)

-- Document types: flexible strings managed on the front-end
CREATE TABLE document_types (
  name VARCHAR(200) PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Employee files: one physical file per employee
CREATE TABLE employee_files (
  employee_id VARCHAR(50) PRIMARY KEY REFERENCES employees(id) ON DELETE CASCADE,
  current_location VARCHAR(200) NOT NULL,
  assigned_user_id VARCHAR(50),
  assigned_user_name VARCHAR(200),
  default_documents TEXT[], -- array of document type names
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Movements/history for employee files
CREATE TABLE file_movements (
  id SERIAL PRIMARY KEY,
  employee_id VARCHAR(50) REFERENCES employees(id) ON DELETE CASCADE,
  by_user_id VARCHAR(50),
  by_user_name VARCHAR(200),
  from_location VARCHAR(200),
  to_location VARCHAR(200),
  to_assignee_user_id VARCHAR(50),
  to_assignee_name VARCHAR(200),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  remarks TEXT
);

-- File requests (matches FileRequest type in front-end)
CREATE TABLE file_requests (
  id VARCHAR(100) PRIMARY KEY,
  file_id VARCHAR(50) REFERENCES employee_files(employee_id) ON DELETE CASCADE,
  employee_id VARCHAR(50),
  document_type VARCHAR(200),
  requested_by_user_id VARCHAR(50),
  requested_by_name VARCHAR(200),
  requested_by_department VARCHAR(200),
  status VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  remarks TEXT
);

-- System catalog tables (designations, stations, skill levels, job groups, engagement types, ethnicities)
CREATE TABLE system_designations (name VARCHAR(200) PRIMARY KEY, created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE system_skill_levels (name VARCHAR(200) PRIMARY KEY, created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE system_stations (name VARCHAR(200) PRIMARY KEY, created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE system_job_groups (name VARCHAR(50) PRIMARY KEY, created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE system_engagement_types (name VARCHAR(200) PRIMARY KEY, created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE system_ethnicities (name VARCHAR(200) PRIMARY KEY, created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP);

-- Notifications
CREATE TABLE notifications (
  id VARCHAR(50) PRIMARY KEY,
  user_id VARCHAR(50),
  title VARCHAR(300),
  message TEXT,
  link VARCHAR(300),
  type VARCHAR(50),
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- System logs
CREATE TABLE system_logs (
  id VARCHAR(50) PRIMARY KEY,
  action VARCHAR(300),
  user_id VARCHAR(50),
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Helpful indexes
CREATE INDEX idx_employees_department ON employees(department);
CREATE INDEX idx_employee_skills_employee_id ON employee_skills(employee_id);
CREATE INDEX idx_positions_department ON positions(department);
CREATE INDEX idx_training_records_employee_id ON training_records(employee_id);
CREATE INDEX idx_leave_requests_employee_id ON leave_requests(employee_id);
CREATE INDEX idx_performance_reviews_employee_id ON performance_reviews(employee_id);
CREATE INDEX idx_users_email ON users(email);

-- Trigger to update updated_at on employees
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON employees
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Users table: App users (may map to employees)
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(50) PRIMARY KEY,
  employee_id VARCHAR(50) REFERENCES employees(id) ON DELETE SET NULL,
  email VARCHAR(200) UNIQUE NOT NULL,
  name VARCHAR(200),
  role VARCHAR(100),
  password TEXT,
  status VARCHAR(20) CHECK (status IN ('active','inactive','terminated')) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
