-- Seed data for development (small sample from mockData)
-- Employees
INSERT INTO employees (id, employee_number, name, email, position, department, manager, manager_id, hire_date, status, avatar, phone, date_of_birth)
VALUES
('1','20221234567','John Smith','john.smith@mwsi.com','System Administrator','IT','Sarah Johnson','2','2022-01-15','active','https://api.dicebear.com/7.x/initials/svg?seed=JS','+254-700-123456','1985-06-15'),
('2','20211234568','Sarah Johnson','sarah.johnson@mwsi.com','HR Manager','Human Resources',NULL,NULL,'2021-03-20','active','https://api.dicebear.com/7.x/initials/svg?seed=SJ','+254-700-234567','1982-11-10'),
('10','2019031010','David Manager','david.manager@mwsi.com','Operations Manager','Operations',NULL,NULL,'2019-03-10','active','https://api.dicebear.com/7.x/initials/svg?seed=DM','+254-700-999999','1980-07-22'),
('3','20221234569','Michael Davis','michael.davis@mwsi.com','Software Developer','Engineering','David Manager','10','2022-07-10','active','https://api.dicebear.com/7.x/initials/svg?seed=MD','+254-700-345678','1990-04-01')
ON CONFLICT (id) DO NOTHING;

-- Users (id equals employee id for convenience; password stored in plaintext for demo)
INSERT INTO users (id, employee_id, email, name, role, password, status)
VALUES
('1','1','john.smith@mwsi.com','John Smith','employee','demo123','active'),
('2','2','sarah.johnson@mwsi.com','Sarah Johnson','hr_manager','demo123','active'),
('10','10','david.manager@mwsi.com','David Manager','manager','demo123','active'),
('3','3','michael.davis@mwsi.com','Michael Davis','employee','demo123','active'),
('admin-test',NULL,'admin.test@mwsi.com','Test Admin','admin','demo123','active')
ON CONFLICT (id) DO NOTHING;

-- Roles
INSERT INTO roles (id, name, locked, meta)
VALUES
('admin','Administrator',false,'{}'),
('hr_manager','HR Manager',false,'{}'),
('hr_staff','HR Staff',false,'{}'),
('manager','Manager',false,'{}'),
('employee','Employee',false,'{}'),
('registry_manager','Registry Manager',false,'{}'),
('testing','Testing',false,'{}')
ON CONFLICT (id) DO NOTHING;

-- Role permissions (small subset from DEFAULT_ROLE_PERMISSIONS)
INSERT INTO role_permissions (role_id, permission_key) VALUES
('admin','employee.view'),
('admin','employee.edit'),
('admin','employee.create'),
('admin','employee.delete'),
('admin','page.employee-files'),
('admin','page.admin.requests'),
('admin','page.admin.users'),
('hr_manager','employee.view'),
('hr_manager','employee.edit'),
('hr_manager','employee.create'),
('hr_manager','page.employee-files'),
('hr_staff','employee.view'),
('manager','employee.view'),
('employee','employee.view'),
('registry_manager','page.registry.requests')
ON CONFLICT DO NOTHING;
