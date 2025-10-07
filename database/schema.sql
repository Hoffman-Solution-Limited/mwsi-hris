-- Schema for Government HR Management System

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Departments table
CREATE TABLE departments (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Employees table
CREATE TABLE employees (
    id VARCHAR(50) PRIMARY KEY,
    employee_number VARCHAR(20) UNIQUE,
    name VARCHAR(100) NOT NULL,
    first_name VARCHAR(50),
    middle_name VARCHAR(50),
    surname VARCHAR(50),
    email VARCHAR(100) UNIQUE NOT NULL,
    position VARCHAR(100) NOT NULL,
    department VARCHAR(50) REFERENCES departments(id),
    manager_id VARCHAR(50) REFERENCES employees(id),
    hire_date DATE NOT NULL,
    status VARCHAR(20) CHECK (status IN ('active', 'inactive', 'terminated')) DEFAULT 'active',
    avatar TEXT,
    phone VARCHAR(20),
    emergency_contact TEXT,
    salary DECIMAL(12,2),
    gender VARCHAR(10) CHECK (gender IN ('male', 'female', 'other')),
    cadre VARCHAR(20) CHECK (cadre IN ('Support', 'Technical', 'Management')),
    employment_type VARCHAR(50),
    engagement_type VARCHAR(50),
    job_group VARCHAR(10),
    ethnicity VARCHAR(50),
    national_id VARCHAR(20),
    kra_pin VARCHAR(20),
    children VARCHAR(10),
    work_county VARCHAR(100),
    home_county VARCHAR(100),
    postal_address TEXT,
    postal_code VARCHAR(20),
    station_name VARCHAR(200),
    skill_level VARCHAR(200),
    company VARCHAR(200),
    date_of_birth DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Employee skills table
CREATE TABLE employee_skills (
    id SERIAL PRIMARY KEY,
    employee_id VARCHAR(50) REFERENCES employees(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    level VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Positions/Jobs table
CREATE TABLE positions (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    department VARCHAR(50) REFERENCES departments(id),
    status VARCHAR(20) CHECK (status IN ('open', 'filled', 'closed')) DEFAULT 'open',
    priority VARCHAR(20) CHECK (priority IN ('high', 'medium', 'low')) DEFAULT 'medium',
    applicants INTEGER DEFAULT 0,
    posted_date DATE NOT NULL,
    closing_date DATE NOT NULL,
    description TEXT,
    designation VARCHAR(200),
    skill_level VARCHAR(100),
    station_name VARCHAR(200),
    job_group VARCHAR(20),
    employment_type VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Shortlisted candidates table
CREATE TABLE shortlisted_candidates (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    first_name VARCHAR(50),
    middle_name VARCHAR(50),
    surname VARCHAR(50),
    position VARCHAR(200) NOT NULL,
    job_id VARCHAR(50) REFERENCES positions(id),
    cv_name VARCHAR(200),
    description TEXT,
    closing_date DATE,
    hire_reason TEXT,
    employment_type VARCHAR(50),
    job_group VARCHAR(20),
    station_name VARCHAR(200),
    skill_level VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Hired candidates table (extends shortlisted candidates)
CREATE TABLE hired_candidates (
    id VARCHAR(50) PRIMARY KEY REFERENCES shortlisted_candidates(id),
    hire_date DATE DEFAULT CURRENT_DATE,
    hire_reason TEXT,
    employee_id VARCHAR(50) REFERENCES employees(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Documents table
CREATE TABLE documents (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    type VARCHAR(20) CHECK (type IN ('contract', 'certificate', 'policy', 'form', 'report')),
    upload_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    size VARCHAR(20),
    status VARCHAR(20) CHECK (status IN ('pending', 'approved', 'rejected', 'draft')) DEFAULT 'pending',
    uploaded_by VARCHAR(100) NOT NULL,
    category VARCHAR(100),
    assigned_to_employee_id VARCHAR(50) REFERENCES employees(id),
    assigned_to_name VARCHAR(100),
    assigned_to_email VARCHAR(100),
    assigned_to_department VARCHAR(100),
    assigned_date DATE
);

-- Document movement log table
CREATE TABLE document_movement_log (
    id SERIAL PRIMARY KEY,
    document_id VARCHAR(50) REFERENCES documents(id) ON DELETE CASCADE,
    action VARCHAR(20) CHECK (action IN ('assigned', 'returned', 'moved')),
    by_user VARCHAR(100) NOT NULL,
    to_destination VARCHAR(100),
    date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reason TEXT,
    remarks TEXT
);

-- Performance templates table
CREATE TABLE performance_templates (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    type VARCHAR(20) CHECK (type IN ('quarterly', 'half-yearly', 'yearly')) NOT NULL,
    description TEXT,
    department VARCHAR(50) REFERENCES departments(id),
    created_by VARCHAR(100) NOT NULL,
    created_at DATE NOT NULL
);

-- Performance template criteria table
CREATE TABLE performance_template_criteria (
    id SERIAL PRIMARY KEY,
    template_id VARCHAR(50) REFERENCES performance_templates(id) ON DELETE CASCADE,
    criteria_id VARCHAR(50) NOT NULL,
    name VARCHAR(200) NOT NULL,
    weight DECIMAL(5,2) NOT NULL,
    description TEXT,
    UNIQUE(template_id, criteria_id)
);

-- Department goals table
CREATE TABLE department_goals (
    id VARCHAR(50) PRIMARY KEY,
    department VARCHAR(50) REFERENCES departments(id),
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    weight DECIMAL(5,2) NOT NULL,
    active BOOLEAN DEFAULT TRUE,
    created_at DATE NOT NULL,
    created_by VARCHAR(100) NOT NULL
);

-- Performance reviews table
CREATE TABLE performance_reviews (
    id VARCHAR(50) PRIMARY KEY,
    employee_id VARCHAR(50) REFERENCES employees(id) ON DELETE CASCADE,
    employee_name VARCHAR(100) NOT NULL,
    employee_number VARCHAR(20),
    template_id VARCHAR(50) REFERENCES performance_templates(id),
    review_period VARCHAR(100) NOT NULL,
    employee_self_comments TEXT,
    employee_ack_status VARCHAR(20) CHECK (employee_ack_status IN ('declined', 'accepted')),
    employee_ack_comments TEXT,
    employee_ack_date DATE,
    status VARCHAR(50) CHECK (status IN ('draft', 'targets_set', 'manager_review', 'employee_ack', 'hr_review', 'completed')) DEFAULT 'draft',
    overall_score DECIMAL(5,2),
    score DECIMAL(5,2),
    manager_comments TEXT,
    hr_comments TEXT,
    goals TEXT[],
    feedback TEXT,
    next_review_date DATE NOT NULL,
    created_by VARCHAR(100) NOT NULL,
    created_at DATE NOT NULL
);

-- Employee targets table
CREATE TABLE employee_targets (
    id SERIAL PRIMARY KEY,
    review_id VARCHAR(50) REFERENCES performance_reviews(id) ON DELETE CASCADE,
    criteria_id VARCHAR(50) NOT NULL,
    target TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Performance scores table
CREATE TABLE performance_scores (
    id SERIAL PRIMARY KEY,
    review_id VARCHAR(50) REFERENCES performance_reviews(id) ON DELETE CASCADE,
    criteria_id VARCHAR(50) NOT NULL,
    score_by VARCHAR(20) CHECK (score_by IN ('employee', 'manager')) NOT NULL,
    score INTEGER CHECK (score >= 1 AND score <= 5),
    comments TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(review_id, criteria_id, score_by)
);

-- Training records table
CREATE TABLE training_records (
    id VARCHAR(50) PRIMARY KEY,
    employee_id VARCHAR(50) REFERENCES employees(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    type VARCHAR(20) CHECK (type IN ('mandatory', 'development', 'compliance')) NOT NULL,
    status VARCHAR(20) CHECK (status IN ('completed', 'in_progress', 'not_started')) DEFAULT 'not_started',
    completion_date DATE,
    expiry_date DATE,
    provider VARCHAR(200) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Leave requests table
CREATE TABLE leave_requests (
    id VARCHAR(50) PRIMARY KEY,
    employee_id VARCHAR(50) REFERENCES employees(id) ON DELETE CASCADE,
    employee_name VARCHAR(100) NOT NULL,
    type VARCHAR(20) CHECK (type IN ('annual', 'sick', 'emergency', 'maternity', 'study')) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    days INTEGER NOT NULL,
    status VARCHAR(30) CHECK (status IN ('pending_manager', 'pending_hr', 'approved', 'rejected')) DEFAULT 'pending_manager',
    reason TEXT NOT NULL,
    applied_date DATE NOT NULL,
    manager_comments TEXT,
    hr_comments TEXT,
    approved_by VARCHAR(100),
    approved_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better performance
CREATE INDEX idx_employees_department ON employees(department);
CREATE INDEX idx_employees_status ON employees(status);
CREATE INDEX idx_positions_department ON positions(department);
CREATE INDEX idx_positions_status ON positions(status);
CREATE INDEX idx_documents_status ON documents(status);
CREATE INDEX idx_documents_assigned_to ON documents(assigned_to_employee_id);
CREATE INDEX idx_performance_reviews_employee ON performance_reviews(employee_id);
CREATE INDEX idx_performance_reviews_status ON performance_reviews(status);
CREATE INDEX idx_training_records_employee ON training_records(employee_id);
CREATE INDEX idx_leave_requests_employee ON leave_requests(employee_id);
CREATE INDEX idx_leave_requests_status ON leave_requests(status);
CREATE INDEX idx_shortlisted_candidates_job ON shortlisted_candidates(job_id);

-- Update timestamp function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for updating employees updated_at
CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON employees
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();