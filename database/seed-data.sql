-- Seed data for Government HR Management System

-- Insert departments
INSERT INTO departments (id, name, description) VALUES
('IT', 'IT Department', 'Information Technology Department'),
('Human Resources', 'Human Resources', 'Human Resources Department'),
('Engineering', 'Engineering Department', 'Software Engineering Department'),
('Marketing', 'Marketing Department', 'Marketing and Communications Department'),
('Finance', 'Finance Department', 'Finance and Accounting Department'),
('Operations', 'Operations Department', 'Operations Management Department'),
('Registry', 'Registry Department', 'Document Registry and Management Department');

-- Insert employees
INSERT INTO employees (
    id, employee_number, name, first_name, middle_name, surname, email, position, department, 
    manager_id, hire_date, status, avatar, phone, emergency_contact, salary, gender, cadre, 
    employment_type, engagement_type, job_group, ethnicity, national_id, kra_pin, children, 
    work_county, home_county, postal_address, postal_code, station_name, skill_level, company, date_of_birth
) VALUES 
(
    '1', '20221234567', 'John Smith', 'John', '', 'Smith', 'john.smith@mwsi.com', 
    'System Administrator', 'IT', '2', '2022-01-15', 'active', 
    'https://api.dicebear.com/7.x/initials/svg?seed=JS', '+254-700-123456', 
    'Jane Smith (+254-700-123457)', 75000, 'male', 'Technical', 'Permanent', 'Permanent', 
    'G', 'Kikuyu', '32456789', 'A012345678Z', '2', 'Nairobi', 'Kiambu', 
    'P.O. Box 12345', '00100', 'IT Department - Head Office', 'Diploma (Information Technology)', 
    'Ministry of Water, Sanitation and Irrigation', '1985-06-15'
),
(
    '2', '20211234568', 'Sarah Johnson', 'Sarah', '', 'Johnson', 'sarah.johnson@mwsi.com', 
    'HR Manager', 'Human Resources', NULL, '2021-03-20', 'active', 
    'https://api.dicebear.com/7.x/initials/svg?seed=SJ', '+254-700-234567', 
    'Robert Johnson (+254-700-234568)', 85000, 'female', 'Management', 'Permanent', 'Permanent', 
    'J', 'Luo', '28123456', 'A012345679Z', '1', 'Nairobi', 'Nairobi', 
    'P.O. Box 54321', '00100', 'Human Resources - Head Office', 'Degree (Human Resource Management)', 
    'Ministry of Water, Sanitation and Irrigation', '1982-11-10'
),
(
    '10', '2019031010', 'David Manager', 'David', '', 'Manager', 'david.manager@mwsi.com', 
    'Operations Manager', 'Operations', NULL, '2019-03-10', 'active', 
    'https://api.dicebear.com/7.x/initials/svg?seed=DM', '+254-700-999999', 
    'Linda Manager (+254-700-888888)', 120000, 'male', 'Management', 'Permanent', 'Permanent', 
    'K', 'Kalenjin', '12345678', 'A012345689Z', '2', 'Nairobi', 'Machakos', 
    'P.O. Box 98765', '00100', 'Operations Department - Head Office', 'MBA', 
    'Ministry of Water, Sanitation and Irrigation', '1980-07-22'
),
(
    '3', '20221234569', 'Michael Davis', 'Michael', '', 'Davis', 'michael.davis@mwsi.com', 
    'Software Developer', 'Engineering', '10', '2022-07-10', 'active', 
    'https://api.dicebear.com/7.x/initials/svg?seed=MD', '+254-700-345678', 
    'Lisa Davis (+254-700-345679)', 70000, 'male', 'Technical', 'Permanent', 'Permanent', 
    'H', 'Kamba', '29876543', 'A012345680Z', '0', 'Nairobi', 'Machakos', 
    'P.O. Box 98765', '00200', 'Engineering Department - Head Office', 'Degree (Computer Science)', 
    'Ministry of Water, Sanitation and Irrigation', '1990-03-22'
),
(
    '4', '20231234570', 'Emily Chen', 'Emily', '', 'Chen', 'emily.chen@mwsi.com', 
    'Marketing Coordinator', 'Marketing', '2', '2023-02-14', 'active', 
    'https://api.dicebear.com/7.x/initials/svg?seed=EC', '+254-700-456789', 
    'David Chen (+254-700-456790)', 55000, 'female', 'Support', 'Contract', 'Contract', 
    'F', 'Kisii', '31234567', 'A012345681Z', '0', 'Nairobi', 'Nairobi', 
    'P.O. Box 13579', '00100', 'Marketing Department - Head Office', 'Degree (Marketing)', 
    'Ministry of Water, Sanitation and Irrigation', '1995-08-05'
),
(
    '5', '20201234571', 'Robert Wilson', 'Robert', '', 'Wilson', 'robert.wilson@mwsi.com', 
    'Finance Director', 'Finance', NULL, '2020-11-30', 'active', 
    'https://api.dicebear.com/7.x/initials/svg?seed=RW', '+254-700-567890', 
    'Mary Wilson (+254-700-567891)', 95000, 'male', 'Management', 'Permanent', 'Permanent', 
    'L', 'Meru', '25987654', 'A012345682Z', '3', 'Nairobi', 'Nyeri', 
    'P.O. Box 24680', '00100', 'Finance Department - Head Office', 'Masters (Finance)', 
    'Ministry of Water, Sanitation and Irrigation', '1978-12-18'
),
(
    '6', '20210815001', 'Jane Smith', 'Jane', '', 'Smith', 'jane.smith@mwsi.com', 
    'Senior Developer', 'Engineering', '10', '2021-08-15', 'active', 
    'https://api.dicebear.com/7.x/initials/svg?seed=JS2', '+254-700-666666', 
    'John Smith (+254-700-666667)', 85000, 'female', 'Technical', 'Permanent', 'Permanent', 
    'I', 'Kikuyu', '33445566', 'A012345685Z', '1', 'Nairobi', 'Nyeri', 
    'P.O. Box 44556', '00100', 'Engineering Department - Head Office', 'Degree (Computer Science)', 
    'Ministry of Water, Sanitation and Irrigation', '1988-05-20'
),
(
    '7', '20220301002', 'Robert Chen', 'Robert', '', 'Chen', 'robert.chen@mwsi.com', 
    'DevOps Engineer', 'Engineering', '10', '2022-03-01', 'active', 
    'https://api.dicebear.com/7.x/initials/svg?seed=RC', '+254-700-555555', 
    'Lisa Chen (+254-700-555556)', 80000, 'male', 'Technical', 'Permanent', 'Permanent', 
    'H', 'Luo', '34556677', 'A012345686Z', '0', 'Nairobi', 'Kisumu', 
    'P.O. Box 55667', '00100', 'Engineering Department - Head Office', 'Degree (Information Technology)', 
    'Ministry of Water, Sanitation and Irrigation', '1992-11-08'
),
(
    '12', '20211234572', 'Rita Registry', 'Rita', '', 'Registry', 'registry@mwsi.com', 
    'Registry Manager', 'Registry', NULL, '2021-08-15', 'active', 
    'https://api.dicebear.com/7.x/initials/svg?seed=RR', '+254-700-888888', 
    'Paul Registry (+254-700-888889)', 80000, 'female', 'Management', 'Permanent', 'Permanent', 
    'J', 'Luhya', '30987654', 'A012345684Z', '2', 'Nairobi', 'Kakamega', 
    'P.O. Box 33556', '00100', 'Registry Department - Head Office', 'Degree (Records Management)', 
    'Ministry of Water, Sanitation and Irrigation', '1986-09-12'
);

-- Insert employee skills
INSERT INTO employee_skills (employee_id, name, level) VALUES
('1', 'Networking', 'Advanced'),
('1', 'Linux Administration', 'Expert'),
('1', 'Cybersecurity', 'Intermediate'),
('2', 'Recruitment', 'Expert'),
('2', 'Employee Relations', 'Advanced'),
('2', 'Conflict Resolution', 'Intermediate'),
('3', 'React', 'Advanced'),
('3', 'Node.js', 'Intermediate'),
('3', 'TypeScript', 'Intermediate'),
('4', 'Content Marketing', 'Intermediate'),
('4', 'SEO', 'Beginner'),
('4', 'Social Media', 'Advanced'),
('5', 'Financial Planning', 'Expert'),
('5', 'Risk Management', 'Advanced'),
('5', 'Budgeting', 'Advanced'),
('6', 'Python', 'Expert'),
('6', 'Django', 'Advanced'),
('6', 'PostgreSQL', 'Advanced'),
('7', 'Docker', 'Advanced'),
('7', 'Kubernetes', 'Intermediate'),
('7', 'AWS', 'Advanced'),
('10', 'Operations Management', 'Expert'),
('10', 'Leadership', 'Advanced'),
('10', 'Process Improvement', 'Advanced'),
('12', 'Document Management', 'Expert'),
('12', 'Record Keeping', 'Advanced'),
('12', 'Compliance', 'Advanced');

-- Insert positions
INSERT INTO positions (
    id, title, department, status, priority, applicants, posted_date, closing_date, 
    description, designation, skill_level, station_name, job_group, employment_type
) VALUES
(
    '1', 'Senior Software Engineer', 'Engineering', 'open', 'high', 24, '2024-03-01', '2024-03-30',
    'We are looking for a Senior Software Engineer with experience in full-stack development, React, and Node.js. You will lead a team of developers and collaborate with product managers to deliver scalable applications.',
    'Senior Software Engineer', 'Senior', 'Nairobi HQ', 'JG 12', 'Permanent'
),
(
    '2', 'HR Assistant', 'Human Resources', 'open', 'medium', 10, '2024-03-10', '2024-04-10',
    'The HR Assistant will support recruitment, onboarding, and employee engagement activities. Strong organizational and communication skills are required.',
    'HR Assistant', 'Entry', 'Human Resources - Head Office', 'JG 6', 'Permanent'
),
(
    '3', 'Marketing Manager', 'Marketing', 'filled', 'low', 15, '2024-02-15', '2024-03-15',
    'We are seeking a Marketing Manager to develop and execute campaigns, manage digital channels, and lead a small team. Experience in B2B marketing is a plus.',
    'Marketing Manager', 'Senior', 'Operations Department - Head Office', 'JG 11', 'Contract'
);

-- Insert shortlisted candidates
INSERT INTO shortlisted_candidates (
    id, name, first_name, middle_name, surname, position, job_id, cv_name, description, 
    closing_date, employment_type, job_group, station_name, skill_level
) VALUES
(
    'sc-1', 'Jane A. Doe', 'Jane', 'A.', 'Doe', 'Government Data Analyst', 'gov-1', 
    'JaneDoeCV.pdf', 'Hired for the Government Data Analyst role.', '2024-03-30',
    'Permanent', 'JG 10', 'IT Department - Head Office', 'Senior'
),
(
    'sc-2', 'John Smith', 'John', '', 'Smith', 'Government Data Analyst', 'gov-1',
    'JohnSmithCV.pdf', NULL, NULL, NULL, NULL, NULL, NULL
),
(
    'sc-3', 'Alice Brown', 'Alice', '', 'Brown', 'Public Relations Officer', 'gov-2',
    'AliceBrownCV.pdf', 'Hired for the Public Relations Officer role.', '2024-04-10',
    'Contract', 'JG 8', 'Marketing Department - Head Office', 'Intermediate'
);

-- Insert hired candidates
INSERT INTO hired_candidates (id, hire_reason, employee_id) VALUES
('sc-1', 'Excellent technical skills and interview performance.', '1'),
('sc-3', 'Strong communication and PR experience.', '4');

-- Insert documents
INSERT INTO documents (
    id, name, type, upload_date, created_at, size, status, uploaded_by, category,
    assigned_to_employee_id, assigned_to_name, assigned_to_email, assigned_to_department, assigned_date
) VALUES
(
    '1', 'Employee Handbook 2024.pdf', 'policy', '2024-01-15', '2024-01-10', '2.3 MB', 'approved', 
    'Sarah Johnson', 'Policies & Procedures', NULL, NULL, NULL, NULL, NULL
),
(
    '2', 'Training Certificate - Data Protection.pdf', 'certificate', '2024-02-20', '2024-02-18', 
    '856 KB', 'approved', 'Michael Davis', 'Training Records', NULL, NULL, NULL, NULL, NULL
),
(
    '3', 'Performance Review Q1 2024.docx', 'form', '2024-03-10', '2024-03-10', '1.2 MB', 'pending', 
    'John Smith', 'Performance Management', NULL, NULL, NULL, NULL, NULL
),
(
    '4', 'Employment Contract - Emily Chen.pdf', 'contract', '2024-02-14', '2024-02-14', '945 KB', 
    'approved', 'Sarah Johnson', 'Contracts', NULL, NULL, NULL, NULL, NULL
),
(
    'TEST-EMP-1', 'Test Upload from Employee.pdf', 'form', '2025-09-22', '2025-09-22', '123 KB', 
    'pending', 'Michael Davis', 'Employee Uploads', NULL, NULL, NULL, NULL, NULL
);

-- Insert performance templates
INSERT INTO performance_templates (id, name, type, description, department, created_by, created_at) VALUES
(
    'template-1', 'Quarterly Appraisal', 'quarterly', 'Standard quarterly performance review template.',
    NULL, 'Sarah Johnson', '2025-09-01'
);

-- Insert performance template criteria
INSERT INTO performance_template_criteria (template_id, criteria_id, name, weight, description) VALUES
('template-1', 'c1', 'Quality of Work', 40, 'Accuracy, thoroughness, and effectiveness.'),
('template-1', 'c2', 'Teamwork', 30, 'Collaboration and communication.'),
('template-1', 'c3', 'Initiative', 30, 'Proactiveness and problem-solving.');

-- Insert department goals
INSERT INTO department_goals (id, department, title, description, weight, active, created_at, created_by) VALUES
('eng-1', 'Engineering', 'Quality of Deliverables', 'Maintain high code quality and test coverage', 40, true, '2025-09-01', 'HR System'),
('eng-2', 'Engineering', 'Team Collaboration', 'Effective collaboration with peers and stakeholders', 30, true, '2025-09-01', 'HR System'),
('eng-3', 'Engineering', 'Innovation & Initiative', 'Proactive solutions and process improvements', 30, true, '2025-09-01', 'HR System'),
('mkt-1', 'Marketing', 'Campaign Effectiveness', 'Deliver measurable campaign results', 50, true, '2025-09-01', 'HR System'),
('mkt-2', 'Marketing', 'Content Quality', 'High-quality content aligned to brand', 30, true, '2025-09-01', 'HR System'),
('mkt-3', 'Marketing', 'Cross-team Collaboration', 'Coordinate effectively with Sales and Product', 20, true, '2025-09-01', 'HR System');

-- Insert performance reviews
INSERT INTO performance_reviews (
    id, employee_id, employee_name, employee_number, template_id, review_period, 
    employee_self_comments, employee_ack_status, employee_ack_comments, employee_ack_date,
    status, overall_score, score, manager_comments, hr_comments, goals, feedback,
    next_review_date, created_by, created_at
) VALUES
(
    'PR100', '10', 'David Manager', '2019031010', 'template-1', 'Q2 2025',
    'Strong quarter with successful execution of all operational goals and team engagement initiatives.',
    'accepted', 'Thank you for the feedback. I appreciate the recognition of the team''s efforts.', '2025-07-05',
    'completed', 4.7, 4.7, 'Excellent leadership and team management.', 'Consistently exceeds expectations.',
    '{"Deliver Q2 operational OKRs", "Monthly townhalls", "Implement 2 process improvements"}',
    'Excellent performance this quarter. Strong technical skills and great team collaboration.',
    '2025-12-01', 'HR System', '2025-06-30'
),
(
    'PR101', '10', 'David Manager', '2019031010', 'template-1', 'Q3 2025',
    NULL, NULL, NULL, NULL, 'draft', NULL, NULL, NULL, NULL, NULL, NULL,
    '2026-03-01', 'HR System', '2025-09-01'
);

-- Insert employee targets
INSERT INTO employee_targets (review_id, criteria_id, target, description) VALUES
('PR100', 'c1', 'Deliver Q2 operational OKRs', 'Execute quarterly plan'),
('PR100', 'c2', 'Monthly townhalls', 'Improve transparency'),
('PR100', 'c3', 'Implement 2 process improvements', 'Lean practices'),
('PR101', 'c1', 'Align Q3 departmental KPIs', 'Weekly check-ins'),
('PR101', 'c2', 'Improve cross-team updates', 'Bi-weekly reports');

-- Insert performance scores
INSERT INTO performance_scores (review_id, criteria_id, score_by, score, comments) VALUES
-- Employee self-scores for PR100
('PR100', 'c1', 'employee', 5, 'Successfully delivered all Q2 OKRs ahead of schedule'),
('PR100', 'c2', 'employee', 4, 'Conducted monthly townhalls with high attendance and engagement'),
('PR100', 'c3', 'employee', 4, 'Implemented 2 major process improvements that increased efficiency'),
-- Manager scores for PR100
('PR100', 'c1', 'manager', 5, 'Exceeded plan delivery'),
('PR100', 'c2', 'manager', 4, 'Clear communication cadence'),
('PR100', 'c3', 'manager', 4, 'Strong improvements');

-- Insert training records
INSERT INTO training_records (
    id, employee_id, title, type, status, completion_date, expiry_date, provider
) VALUES
('1', '1', 'Cybersecurity Awareness Training', 'mandatory', 'completed', '2024-02-15', '2025-02-15', 'CyberSafe Institute'),
('2', '2', 'Leadership Development Program', 'development', 'in_progress', NULL, NULL, 'Management Excellence Academy'),
('3', '3', 'React Advanced Patterns', 'development', 'completed', '2024-03-10', NULL, 'Tech Learning Hub'),
('T100', '3', 'Data Protection & GDPR', 'compliance', 'in_progress', NULL, '2025-11-30', 'Legal Compliance Corp'),
('T101', '3', 'Workplace Safety Basics', 'mandatory', 'not_started', NULL, NULL, 'SafetyFirst Academy'),
('dm1', '10', 'Cybersecurity Awareness Training', 'mandatory', 'in_progress', '2024-03-01', '2025-03-01', 'CyberSafe Institute'),
('dm2', '10', 'Leadership Development Program', 'development', 'completed', '2024-06-15', '2025-06-15', 'Management Excellence Academy');

-- Insert leave requests
INSERT INTO leave_requests (
    id, employee_id, employee_name, type, start_date, end_date, days, status, reason,
    applied_date, manager_comments, hr_comments, approved_by, approved_date
) VALUES
(
    'L100', '10', 'David Manager', 'annual', '2025-08-01', '2025-08-10', 10, 'approved',
    'Annual leave', '2025-07-15', 'Enjoy your break!', NULL, 'Sarah Johnson', '2025-07-16'
),
(
    'L101', '10', 'David Manager', 'sick', '2025-09-01', '2025-09-03', 3, 'pending_manager',
    'Medical', '2025-08-31', NULL, NULL, NULL, NULL
),
(
    '1', '3', 'Michael Davis', 'annual', '2024-03-25', '2024-03-29', 5, 'pending_manager',
    'Family vacation', '2024-03-10', NULL, NULL, NULL, NULL
),
(
    '2', '4', 'Emily Chen', 'sick', '2024-03-15', '2024-03-16', 2, 'approved',
    'Medical appointment', '2024-03-14', NULL, NULL, 'Sarah Johnson', '2024-03-14'
);