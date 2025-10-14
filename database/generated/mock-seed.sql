-- Generated seed data derived from src/data mock arrays
-- Note: Run after applying mock-schema.sql

-- Departments: inferred from employee.department and mock data
-- department.id values must match the strings used on employees.department in the front-end
INSERT INTO departments (id, name) VALUES
('IT', 'IT Department'),
('Human Resources', 'Human Resources'),
('Engineering', 'Engineering Department'),
('Marketing', 'Marketing Department'),
('Finance', 'Finance Department'),
('Operations', 'Operations Department'),
('Registry', 'Registry Department')
ON CONFLICT DO NOTHING;

-- Employees
INSERT INTO employees (id, employee_number, name, email, position, department, manager, hire_date, status, avatar, phone, emergency_contact, salary, gender, cadre, employment_type, engagement_type, job_group, ethnicity, national_id, kra_pin, children, work_county, home_county, postal_address, postal_code, station_name, skill_level, company, date_of_birth)
VALUES
('1','20221234567','John Smith','john.smith@mwsi.com','System Administrator','IT','Sarah Johnson','2022-01-15','active','https://api.dicebear.com/7.x/initials/svg?seed=JS','+254-700-123456','Jane Smith (+254-700-123457)',75000,'male','Technical','Permanent','Permanent','G','Kikuyu','32456789','A012345678Z','2','Nairobi','Kiambu','P.O. Box 12345','00100','IT Department - Head Office','Diploma (Information Technology)','Ministry of Water, Sanitation and Irrigation','1985-06-15'),
('2','20211234568','Sarah Johnson','sarah.johnson@mwsi.com','HR Manager','Human Resources',NULL,'2021-03-20','active','https://api.dicebear.com/7.x/initials/svg?seed=SJ','+254-700-234567','Robert Johnson (+254-700-234568)',85000,'female','Management','Permanent','Permanent','J','Luo','28123456','A012345679Z','1','Nairobi','Nairobi','P.O. Box 54321','00100','Human Resources - Head Office','Degree (Human Resource Management)','Ministry of Water, Sanitation and Irrigation','1982-11-10'),
('10','2019031010','David Manager','david.manager@mwsi.com','Operations Manager','Operations',NULL,'2019-03-10','active','https://api.dicebear.com/7.x/initials/svg?seed=DM','+254-700-999999','Linda Manager (+254-700-888888)',120000,'male','Management','Permanent','Permanent','K','Kalenjin','12345678','A012345689Z','2','Nairobi','Machakos','P.O. Box 98765','00100','Operations Department - Head Office','MBA','Ministry of Water, Sanitation and Irrigation','1980-07-22'),
('3','20221234569','Michael Davis','michael.davis@mwsi.com','Software Developer','Engineering','David Manager','2022-07-10','active','https://api.dicebear.com/7.x/initials/svg?seed=MD','+254-700-345678','Lisa Davis (+254-700-345679)',70000,'male','Technical','Permanent','Permanent','H','Kamba','29876543','A012345680Z','0','Nairobi','Machakos','P.O. Box 98765','00200','Engineering Department - Head Office','Degree (Computer Science)','Ministry of Water, Sanitation and Irrigation','1990-03-22'),
('4','20231234570','Emily Chen','emily.chen@mwsi.com','Marketing Coordinator','Marketing','Sarah Johnson','2023-02-14','active','https://api.dicebear.com/7.x/initials/svg?seed=EC','+254-700-456789','David Chen (+254-700-456790)',55000,'female','Support','Contract','Contract','F','Kisii','31234567','A012345681Z','0','Nairobi','Nairobi','P.O. Box 13579','00100','Marketing Department - Head Office','Degree (Marketing)','Ministry of Water, Sanitation and Irrigation','1995-08-05'),
('5','20201234571','Robert Wilson','robert.wilson@mwsi.com','Finance Director','Finance',NULL,'2020-11-30','active','https://api.dicebear.com/7.x/initials/svg?seed=RW','+254-700-567890','Mary Wilson (+254-700-567891)',95000,'male','Management','Permanent','Permanent','L','Meru','25987654','A012345682Z','3','Nairobi','Nyeri','P.O. Box 24680','00100','Finance Department - Head Office','Masters (Finance)','Ministry of Water, Sanitation and Irrigation','1978-12-18'),
('6','20210815001','Jane Smith','jane.smith@mwsi.com','Senior Developer','Engineering','David Manager','2021-08-15','active','https://api.dicebear.com/7.x/initials/svg?seed=JS2','+254-700-666666','John Smith (+254-700-666667)',85000,'female','Technical','Permanent','Permanent','I','Kikuyu','33445566','A012345685Z','1','Nairobi','Nyeri','P.O. Box 44556','00100','Engineering Department - Head Office','Degree (Computer Science)','Ministry of Water, Sanitation and Irrigation','1988-05-20'),
('7','20220301002','Robert Chen','robert.chen@mwsi.com','DevOps Engineer','Engineering','David Manager','2022-03-01','active','https://api.dicebear.com/7.x/initials/svg?seed=RC','+254-700-555555','Lisa Chen (+254-700-555556)',80000,'male','Technical','Permanent','Permanent','H','Luo','34556677','A012345686Z','0','Nairobi','Kisumu','P.O. Box 55667','00100','Engineering Department - Head Office','Degree (Information Technology)','Ministry of Water, Sanitation and Irrigation','1992-11-08'),
('12','20211234572','Rita Registry','registry@mwsi.com','Registry Manager','Registry',NULL,'2021-08-15','active','https://api.dicebear.com/7.x/initials/svg?seed=RR','+254-700-888888','Paul Registry (+254-700-888889)',80000,'female','Management','Permanent','Permanent','J','Luhya','30987654','A012345684Z','2','Nairobi','Kakamega','P.O. Box 33556','00100','Registry Department - Head Office','Degree (Records Management)','Ministry of Water, Sanitation and Irrigation','1986-09-12')
ON CONFLICT DO NOTHING;

-- Populate manager_id where known (matches mockEmployees.managerId)
UPDATE employees SET manager_id = '2' WHERE id IN ('1','5','12');
UPDATE employees SET manager_id = '10' WHERE id IN ('3','6','7','4');

-- Employee skills
INSERT INTO employee_skills (employee_id, name, level) VALUES
('1','Networking','Advanced'),
('1','Linux Administration','Expert'),
('1','Cybersecurity','Intermediate'),
('2','Recruitment','Expert'),
('2','Employee Relations','Advanced'),
('2','Conflict Resolution','Intermediate'),
('3','React','Advanced'),
('3','Node.js','Intermediate'),
('3','TypeScript','Intermediate'),
('4','Content Marketing','Intermediate'),
('4','SEO','Beginner'),
('4','Social Media','Advanced'),
('5','Financial Planning','Expert'),
('5','Risk Management','Advanced'),
('5','Budgeting','Advanced'),
('6','Python','Expert'),
('6','Django','Advanced'),
('6','PostgreSQL','Advanced'),
('7','Docker','Advanced'),
('7','Kubernetes','Intermediate'),
('7','AWS','Advanced'),
('10','Operations Management','Expert'),
('10','Leadership','Advanced'),
('10','Process Improvement','Advanced'),
('12','Document Management','Expert'),
('12','Record Keeping','Advanced'),
('12','Compliance','Advanced')
ON CONFLICT DO NOTHING;

-- Positions
INSERT INTO positions (id, title, department, status, priority, applicants, posted_date, closing_date, description, designation, skill_level, station_name, job_group, employment_type)
VALUES
('1','Senior Software Engineer','Engineering','open','high',24,'2024-03-01','2024-03-30','We are looking for a Senior Software Engineer with experience in full-stack development, React, and Node.js. You will lead a team of developers and collaborate with product managers to deliver scalable applications.','Senior Software Engineer','Senior','Nairobi HQ','JG 12','Permanent'),
('2','HR Assistant','Human Resources','open','medium',10,'2024-03-10','2024-04-10','The HR Assistant will support recruitment, onboarding, and employee engagement activities. Strong organizational and communication skills are required.','HR Assistant','Entry','Human Resources - Head Office','JG 6','Permanent'),
('3','Marketing Manager','Marketing','filled','low',15,'2024-02-15','2024-03-15','We are seeking a Marketing Manager to develop and execute campaigns, manage digital channels, and lead a small team. Experience in B2B marketing is a plus.','Marketing Manager','Senior','Operations Department - Head Office','JG 11','Contract')
ON CONFLICT DO NOTHING;

-- Training records
INSERT INTO training_records (id, employee_id, title, type, status, completion_date, expiry_date, provider)
VALUES
('1','1','Cybersecurity Awareness Training','mandatory','completed','2024-02-15','2025-02-15','CyberSafe Institute'),
('2','2','Leadership Development Program','development','in_progress',NULL,NULL,'Management Excellence Academy'),
('3','3','React Advanced Patterns','development','completed','2024-03-10',NULL,'Tech Learning Hub'),
('T100','3','Data Protection & GDPR','compliance','in_progress',NULL,'2025-11-30','Legal Compliance Corp'),
('T101','3','Workplace Safety Basics','mandatory','not_started',NULL,NULL,'SafetyFirst Academy'),
('T102','3','Advanced React Patterns','development','in_progress',NULL,'2025-06-30','Tech Learning Hub'),
('dm1','10','Cybersecurity Awareness Training','mandatory','in_progress','2024-03-01','2025-03-01','CyberSafe Institute'),
('dm2','10','Leadership Development Program','development','completed','2024-06-15','2025-06-15','Management Excellence Academy'),
('dm3','10','Data Protection & GDPR Compliance','compliance','in_progress',NULL,NULL,'Legal Compliance Corp')
ON CONFLICT DO NOTHING;

-- Leave requests
INSERT INTO leave_requests (id, employee_id, employee_name, type, start_date, end_date, days, status, reason, applied_date, manager_comments, approved_by, approved_date)
VALUES
('L100','10','David Manager','annual','2025-08-01','2025-08-10',10,'approved','Annual leave','2025-07-15','Enjoy your break!','Sarah Johnson','2025-07-16'),
('L101','10','David Manager','sick','2025-09-01','2025-09-03',3,'pending_manager','Medical','2025-08-31',NULL,NULL,NULL),
('1','3','Michael Davis','annual','2024-03-25','2024-03-29',5,'pending_manager','Family vacation','2024-03-10',NULL,NULL,NULL),
('6','3','Michael Davis','sick','2025-09-10','2025-09-12',3,'pending_hr','Medical recovery','2025-09-09',NULL,NULL,NULL),
('7','3','Michael Davis','emergency','2025-09-15','2025-09-16',2,'pending_manager','Family emergency','2025-09-14',NULL,NULL,NULL),
('2','4','Emily Chen','sick','2024-03-15','2024-03-16',2,'approved','Medical appointment','2024-03-14',NULL,'Sarah Johnson','2024-03-14'),
('3','1','John Smith','study','2024-04-01','2024-04-05',5,'approved','Professional certification exam','2024-03-01',NULL,'Sarah Johnson','2024-03-01'),
('4','1','John Smith','annual','2025-09-20','2025-09-25',6,'pending_hr','Travel abroad','2025-09-10',NULL,NULL,NULL),
('5','1','John Smith','sick','2025-08-10','2025-08-12',3,'pending_manager','Flu recovery','2025-08-09',NULL,NULL,NULL)
ON CONFLICT DO NOTHING;

-- Performance templates
INSERT INTO performance_templates (id, name, type, description, department, created_by, created_at)
VALUES
('template-1','Quarterly Appraisal','quarterly','Standard quarterly performance review template.',NULL,'Sarah Johnson','2025-09-01')
ON CONFLICT DO NOTHING;

-- Performance template criteria
INSERT INTO performance_template_criteria (template_id, criteria_id, name, weight, description)
VALUES
('template-1','c1','Quality of Work',40,'Accuracy, thoroughness, and effectiveness.'),
('template-1','c2','Teamwork',30,'Collaboration and communication.'),
('template-1','c3','Initiative',30,'Proactiveness and problem-solving.')
ON CONFLICT DO NOTHING;

-- Performance reviews (core fields)
-- Use JSONB columns for structured fields to match frontend shapes
INSERT INTO performance_reviews (id, employee_id, employee_name, employee_number, template_id, review_period, employee_self_comments, employee_ack_status, employee_ack_comments, employee_ack_date, status, overall_score, score, manager_comments, hr_comments, goals, feedback, employee_targets, manager_scores, employee_scores, next_review_date, created_by, created_at)
VALUES
('PR100','10','David Manager','2019031010','template-1','Q2 2025','Strong quarter with successful execution of all operational goals and team engagement initiatives.',NULL,NULL,NULL,'completed',4.7,4.7,'Excellent leadership and team management.','Consistently exceeds expectations.',ARRAY['Deliver Q2 operational OKRs','Monthly townhalls','Implement 2 process improvements'],'Excellent performance this quarter. Strong technical skills and great team collaboration.','[{"criteriaId":"c1","target":"Deliver Q2 operational OKRs","description":"Execute quarterly plan"},{"criteriaId":"c2","target":"Monthly townhalls","description":"Improve transparency"},{"criteriaId":"c3","target":"Implement 2 process improvements","description":"Lean practices"}]'::jsonb,'[{"criteriaId":"c1","score":5,"comments":"Exceeded plan delivery"},{"criteriaId":"c2","score":4,"comments":"Clear communication cadence"},{"criteriaId":"c3","score":4,"comments":"Strong improvements"}]'::jsonb,'[{"criteriaId":"c1","score":5,"comments":"Successfully delivered all Q2 OKRs ahead of schedule"},{"criteriaId":"c2","score":4,"comments":"Conducted monthly townhalls with high attendance and engagement"},{"criteriaId":"c3","score":4,"comments":"Implemented 2 major process improvements that increased efficiency"}]'::jsonb,'2025-12-01','HR System','2025-06-30'),
('PR101','10','David Manager','2019031010','template-1','Q3 2025',NULL,NULL,NULL,NULL,'draft',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-03-01','HR System','2025-09-01'),
('PR001','3','Michael Davis','20221234569','template-1','Q1 2024','Excellent performance this quarter. Strong technical skills and great team collaboration.',NULL,NULL,NULL,'completed',4.5,4.5,'Outstanding technical delivery and team leadership.','Approved. Excellent performance across all criteria.',ARRAY['Complete React migration project','Mentor junior developers','Improve code review process'],'Excellent performance this quarter. Strong technical skills and great team collaboration.','[{"criteriaId":"c1","target":"Complete React migration project","description":"Focus on migration tasks."},{"criteriaId":"c2","target":"Mentor junior developers","description":"Weekly mentorship sessions."},{"criteriaId":"c3","target":"Improve code review process","description":"Document and share best practices."}]'::jsonb,'[{"criteriaId":"c1","score":5,"comments":"Migration completed successfully"},{"criteriaId":"c2","score":4,"comments":"Active mentorship observed"},{"criteriaId":"c3","score":4,"comments":"Better review coverage"}]'::jsonb,'[{"criteriaId":"c1","score":5,"comments":"Successfully completed React migration with zero production issues"},{"criteriaId":"c2","score":4,"comments":"Conducted weekly mentorship sessions with 2 junior developers"},{"criteriaId":"c3","score":4,"comments":"Created comprehensive code review guidelines and improved team practices"}]'::jsonb,'2024-06-30','Sarah Johnson','2025-09-01')
ON CONFLICT DO NOTHING;

-- Employee targets (examples)
INSERT INTO employee_targets (review_id, criteria_id, target, description)
VALUES
('PR100','c1','Deliver Q2 operational OKRs','Execute quarterly plan'),
('PR100','c2','Monthly townhalls','Improve transparency'),
('PR100','c3','Implement 2 process improvements','Lean practices'),
('PR101','c1','Align Q3 departmental KPIs','Weekly check-ins'),
('PR101','c2','Improve cross-team updates','Bi-weekly reports')
ON CONFLICT DO NOTHING;

-- Performance scores (examples)
INSERT INTO performance_scores (review_id, criteria_id, score_by, score, comments)
VALUES
('PR100','c1','employee',5,'Successfully delivered all Q2 OKRs ahead of schedule'),
('PR100','c2','employee',4,'Conducted monthly townhalls with high attendance and engagement'),
('PR100','c3','employee',4,'Implemented 2 major process improvements that increased efficiency'),
('PR100','c1','manager',5,'Exceeded plan delivery'),
('PR100','c2','manager',4,'Clear communication cadence'),
('PR100','c3','manager',4,'Strong improvements')
ON CONFLICT DO NOTHING;

-- Disciplinary cases
INSERT INTO disciplinary_cases (id, employee_id, employee_name, case_type, status, date, description, verdict)
VALUES
('1','1','John Smith','Absenteeism','open','2025-07-12','Missed work for 3 consecutive days without notice.',NULL),
('2','3','Michael Davis','Misconduct','pending','2025-08-01','Unprofessional behavior towards a colleague.',NULL),
('3','4','Emily Chen','Performance','closed','2025-06-20','Repeatedly failed to meet deadlines.','Final warning issued; performance improvement plan for 60 days.'),
('4','6','Jane Smith','Policy Violation','pending','2025-09-01','Breach of information security policy by sharing credentials.',NULL),
('5','7','Robert Chen','Health & Safety','open','2025-10-01','Unsafe conduct in the workplace that endangered others.',NULL)
ON CONFLICT DO NOTHING;

-- Disciplinary case updates
INSERT INTO disciplinary_case_updates (case_id, timestamp, text)
VALUES
('1','2025-07-13T10:15:00Z','HR reached out to employee for explanation.'),
('1','2025-07-14T08:30:00Z','Employee provided medical certificate; manager asked for formal leave application.'),
('2','2025-08-03T09:00:00Z','Waiting disciplinary committee update.'),
('2','2025-08-10T12:00:00Z','Committee requested witness statements; interviews scheduled.'),
('3','2025-06-15T14:30:00Z','Final meeting held with the employee and manager.'),
('3','2025-06-20T16:00:00Z','Case closed with final warning issued.'),
('4','2025-09-02T11:00:00Z','IT suspended affected accounts; investigation underway.'),
('4','2025-09-05T09:45:00Z','Employee interviewed; awaiting committee findings.'),
('5','2025-10-02T08:00:00Z','Safety officer filed incident report and recommended suspension pending review.')
ON CONFLICT DO NOTHING;

-- Document types (seed front-end defaults)
INSERT INTO document_types (name) VALUES
('Birth_Certificate'),
('National_ID_Card'),
('Current_Passport_Photo'),
('KRA_PIN'),
('Letter_of_First_Appointment'),
('Letter_of_Confirmation'),
('All_Promotion_Letters'),
('Secondment_Letter'),
('Next_of_Kin_GP25'),
('Professional_and_Academic_Certificates')
ON CONFLICT DO NOTHING;

-- Employee files: seed using employees above with default documents per front-end
INSERT INTO employee_files (employee_id, current_location, assigned_user_id, assigned_user_name, default_documents)
VALUES
('1','Registry Office',NULL,NULL,ARRAY['Birth_Certificate','National_ID_Card','Current_Passport_Photo','KRA_PIN','Letter_of_First_Appointment','Letter_of_Confirmation','All_Promotion_Letters','Secondment_Letter','Next_of_Kin_GP25','Professional_and_Academic_Certificates']),
('2','Registry Office',NULL,NULL,ARRAY['Birth_Certificate','National_ID_Card','Current_Passport_Photo','KRA_PIN','Letter_of_First_Appointment','Letter_of_Confirmation','All_Promotion_Letters','Secondment_Letter','Next_of_Kin_GP25','Professional_and_Academic_Certificates']),
('3','Registry Office',NULL,NULL,ARRAY['Birth_Certificate','National_ID_Card','Current_Passport_Photo','KRA_PIN','Letter_of_First_Appointment','Letter_of_Confirmation','All_Promotion_Letters','Secondment_Letter','Next_of_Kin_GP25','Professional_and_Academic_Certificates'])
ON CONFLICT DO NOTHING;

-- File requests (sample seeded by front-end behavior)
INSERT INTO file_requests (id, file_id, employee_id, document_type, requested_by_user_id, requested_by_name, requested_by_department, status, created_at, remarks)
VALUES
('req-1','1','1','Birth_Certificate','2','Sarah Johnson','Human Resources','pending','2025-09-01T10:00:00Z','Needed for onboarding'),
('req-2','2','2','National_ID_Card','10','David Manager','Operations','pending','2025-09-01T11:00:00Z','Verification')
ON CONFLICT DO NOTHING;

-- System catalog seeds (designations, stations, skill levels, job groups, engagement types, ethnicities)
INSERT INTO system_designations (name) VALUES
('System Administrator'),('HR Manager'),('Operations Manager'),('Software Developer'),('Marketing Coordinator'),('Finance Director'),('Senior Developer'),('DevOps Engineer'),('Registry Manager')
ON CONFLICT DO NOTHING;

INSERT INTO system_skill_levels (name) VALUES
('Diploma (Information Technology)'),('Degree (Human Resource Management)'),('MBA'),('Degree (Computer Science)'),('Degree (Marketing)'),('Masters (Finance)'),('Degree (Records Management)'),('Senior'),('Entry')
ON CONFLICT DO NOTHING;

INSERT INTO system_stations (name) VALUES
('IT Department - Head Office'),('Human Resources - Head Office'),('Operations Department - Head Office'),('Engineering Department - Head Office'),('Marketing Department - Head Office'),('Finance Department - Head Office'),('Registry Department - Head Office')
ON CONFLICT DO NOTHING;

INSERT INTO system_job_groups (name) VALUES
('G'),('J'),('K'),('H'),('F'),('L'),('I')
ON CONFLICT DO NOTHING;

INSERT INTO system_engagement_types (name) VALUES
('Permanent'),('Extended Service'),('Local Contract'),('Intern'),('Temporary')
ON CONFLICT DO NOTHING;

INSERT INTO system_ethnicities (name) VALUES
('Kikuyu'),('Luo'),('Luhya'),('Kalenjin'),('Kamba'),('Somali'),('Meru'),('Mijikenda'),('Maasai'),('Embu'),('Kisii'),('Other')
ON CONFLICT DO NOTHING;

-- End of generated seed

-- Users (application users) - map some mockEmployees into users table
INSERT INTO users (id, employee_id, email, name, role, password, status)
VALUES
('admin-001',NULL,'admin@mwsi.com','Main Admin','admin','demo123','active'),
('2','2','sarah.johnson@mwsi.com','Sarah Johnson','hr_manager','demo123','active'),
('10','10','david.manager@mwsi.com','David Manager','manager','demo123','active'),
('4','4','emily.chen@mwsi.com','Emily Chen','registry_manager','demo123','active'),
('testing-user',NULL,'testing@mwsi.com','Testing User','testing','demo123','active')
ON CONFLICT DO NOTHING;
-- Default roles (seed for admin-managed roles)
INSERT INTO roles (id, name, locked) VALUES
	('admin','Admin', TRUE),
	('hr_manager','HR', FALSE),
	('hr_staff','HR Staff', FALSE),
	('manager','Manager', FALSE),
	('employee','Employee', FALSE),
	('registry_manager','Registry Manager', FALSE),
	('registry_staff','Registry Staff', FALSE),
	('testing','Testing', FALSE)
ON CONFLICT DO NOTHING;

-- Default role permissions matching front-end DEFAULT_ROLE_PERMISSIONS
INSERT INTO role_permissions (role_id, permission_key) VALUES
	('admin','employee.view'),('admin','employee.edit'),('admin','employee.create'),('admin','employee.delete'),('admin','page.employee-files'),('admin','page.admin.requests'),('admin','page.registry.requests'),('admin','page.admin.users'),('admin','page.admin.roles'),('admin','page.admin.settings'),('admin','page.admin.data'),('admin','page.admin.performance-templates'),('admin','page.admin.department-goals'),('admin','page.admin.training-management'),('admin','page.admin.system-logs'),
	('hr_manager','employee.view'),('hr_manager','employee.edit'),('hr_manager','employee.create'),('hr_manager','page.employee-files'),
	('hr_staff','employee.view'),('hr_staff','employee.edit'),('hr_staff','page.employee-files'),
	('manager','employee.view'),('manager','page.employee-files'),
	('employee','employee.view'),
	('registry_manager','employee.view'),('registry_manager','page.employee-files'),('registry_manager','page.registry.requests'),
	('registry_staff','employee.view'),('registry_staff','page.employee-files'),('registry_staff','page.registry.requests'),
	('testing','')
ON CONFLICT DO NOTHING;

-- Notifications sample data
INSERT INTO notifications (id, user_id, title, message, link, type, read, created_at)
VALUES
('n-1','2','New File Request','John Smith requested Birth Certificate for employee 1','/employee-files','info',FALSE,'2025-09-01T10:05:00Z'),
('n-2','10','Leave Request Pending','Michael Davis submitted a leave request for manager approval','/leave/requests','info',FALSE,'2025-09-01T11:10:00Z')
ON CONFLICT DO NOTHING;
