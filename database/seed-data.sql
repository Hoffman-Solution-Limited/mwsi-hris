-- ============================================
-- MWSI HR Management System - Seed Data
-- ============================================
-- Sample data for testing and development

-- ============================================
-- DEPARTMENTS
-- ============================================
INSERT INTO departments (id, name, code, description) VALUES
('d1111111-1111-1111-1111-111111111111', 'Human Resources', 'HR', 'Manages employee relations and administration'),
('d2222222-2222-2222-2222-222222222222', 'Information Technology', 'IT', 'Technology infrastructure and support'),
('d3333333-3333-3333-3333-333333333333', 'Finance', 'FIN', 'Financial planning and management'),
('d4444444-4444-4444-4444-444444444444', 'Operations', 'OPS', 'Day-to-day business operations');

-- ============================================
-- EMPLOYEES
-- ============================================
INSERT INTO employees (id, employee_number, name, email, phone, department, position, manager, hire_date, status, county, workstation, designation) VALUES
('e1111111-1111-1111-1111-111111111111', 'EMP001', 'John Doe', 'john.doe@mwsi.com', '+254700000001', 'Human Resources', 'HR Manager', NULL, '2020-01-15', 'active', 'Nairobi', 'Headquarters', 'Manager'),
('e2222222-2222-2222-2222-222222222222', 'EMP002', 'Jane Smith', 'jane.smith@mwsi.com', '+254700000002', 'Information Technology', 'IT Specialist', 'John Doe', '2021-03-20', 'active', 'Nairobi', 'Headquarters', 'Specialist'),
('e3333333-3333-3333-3333-333333333333', 'EMP003', 'Mike Johnson', 'mike.johnson@mwsi.com', '+254700000003', 'Finance', 'Accountant', 'John Doe', '2021-06-10', 'active', 'Mombasa', 'Coast Office', 'Accountant'),
('e4444444-4444-4444-4444-444444444444', 'EMP004', 'Sarah Williams', 'sarah.williams@mwsi.com', '+254700000004', 'Operations', 'Operations Officer', 'John Doe', '2022-02-01', 'active', 'Kisumu', 'Western Office', 'Officer');

-- ============================================
-- USERS (passwords are hashed - in production use proper bcrypt)
-- ============================================
-- Note: Replace password_hash with actual bcrypt hashes
INSERT INTO users (id, email, password_hash, role, employee_id, is_active) VALUES
('u1111111-1111-1111-1111-111111111111', 'admin@mwsi.com', '$2b$10$example_hash_admin', 'admin', NULL, true),
('u2222222-2222-2222-2222-222222222222', 'hr@mwsi.com', '$2b$10$example_hash_hr', 'hr', 'e1111111-1111-1111-1111-111111111111', true),
('u3333333-3333-3333-3333-333333333333', 'john.doe@mwsi.com', '$2b$10$example_hash_john', 'manager', 'e1111111-1111-1111-1111-111111111111', true),
('u4444444-4444-4444-4444-444444444444', 'jane.smith@mwsi.com', '$2b$10$example_hash_jane', 'employee', 'e2222222-2222-2222-2222-222222222222', true);

-- ============================================
-- LEAVE TYPES
-- ============================================
INSERT INTO leave_types (id, name, days_allowed, description) VALUES
('lt111111-1111-1111-1111-111111111111', 'Annual Leave', 30, 'Standard annual leave entitlement'),
('lt222222-2222-2222-2222-222222222222', 'Sick Leave', 14, 'Medical leave for illness'),
('lt333333-3333-3333-3333-333333333333', 'Maternity Leave', 90, 'Maternity leave for expecting mothers'),
('lt444444-4444-4444-4444-444444444444', 'Paternity Leave', 14, 'Paternity leave for new fathers');

-- ============================================
-- PERMISSIONS
-- ============================================
INSERT INTO permissions (id, name, description, category) VALUES
('p1111111-1111-1111-1111-111111111111', 'view_employees', 'View employee records', 'Employees'),
('p2222222-2222-2222-2222-222222222222', 'edit_employees', 'Edit employee information', 'Employees'),
('p3333333-3333-3333-3333-333333333333', 'view_leave', 'View leave requests', 'Leave'),
('p4444444-4444-4444-4444-444444444444', 'approve_leave', 'Approve leave requests', 'Leave'),
('p5555555-5555-5555-5555-555555555555', 'manage_performance', 'Manage performance reviews', 'Performance'),
('p6666666-6666-6666-6666-666666666666', 'manage_training', 'Manage training programs', 'Training'),
('p7777777-7777-7777-7777-777777777777', 'view_reports', 'View system reports', 'Reports'),
('p8888888-8888-8888-8888-888888888888', 'system_admin', 'Full system administration', 'System');

-- ============================================
-- ROLE PERMISSIONS
-- ============================================
-- Admin gets all permissions
INSERT INTO role_permissions (role, permission_id) VALUES
('admin', 'p1111111-1111-1111-1111-111111111111'),
('admin', 'p2222222-2222-2222-2222-222222222222'),
('admin', 'p3333333-3333-3333-3333-333333333333'),
('admin', 'p4444444-4444-4444-4444-444444444444'),
('admin', 'p5555555-5555-5555-5555-555555555555'),
('admin', 'p6666666-6666-6666-6666-666666666666'),
('admin', 'p7777777-7777-7777-7777-777777777777'),
('admin', 'p8888888-8888-8888-8888-888888888888');

-- HR permissions
INSERT INTO role_permissions (role, permission_id) VALUES
('hr', 'p1111111-1111-1111-1111-111111111111'),
('hr', 'p2222222-2222-2222-2222-222222222222'),
('hr', 'p3333333-3333-3333-3333-333333333333'),
('hr', 'p4444444-4444-4444-4444-444444444444'),
('hr', 'p5555555-5555-5555-5555-555555555555'),
('hr', 'p6666666-6666-6666-6666-666666666666'),
('hr', 'p7777777-7777-7777-7777-777777777777');

-- Manager permissions
INSERT INTO role_permissions (role, permission_id) VALUES
('manager', 'p1111111-1111-1111-1111-111111111111'),
('manager', 'p3333333-3333-3333-3333-333333333333'),
('manager', 'p4444444-4444-4444-4444-444444444444'),
('manager', 'p5555555-5555-5555-5555-555555555555');

-- Employee permissions
INSERT INTO role_permissions (role, permission_id) VALUES
('employee', 'p1111111-1111-1111-1111-111111111111'),
('employee', 'p3333333-3333-3333-3333-333333333333');

-- ============================================
-- SYSTEM SETTINGS
-- ============================================
INSERT INTO system_settings (key, value, data_type, category, description) VALUES
('company_name', 'MWSI', 'string', 'General', 'Company name'),
('max_leave_days', '30', 'number', 'Leave', 'Maximum leave days per year'),
('working_days_per_week', '5', 'number', 'General', 'Working days per week'),
('probation_period_months', '6', 'number', 'HR', 'Probation period in months'),
('performance_review_frequency', 'annual', 'string', 'Performance', 'How often performance reviews occur');

-- ============================================
-- SAMPLE LEAVE REQUESTS
-- ============================================
INSERT INTO leave_requests (employee_id, leave_type_id, start_date, end_date, days_requested, reason, status, applied_by) VALUES
('e2222222-2222-2222-2222-222222222222', 'lt111111-1111-1111-1111-111111111111', '2025-11-01', '2025-11-05', 5, 'Family vacation', 'pending', 'u4444444-4444-4444-4444-444444444444'),
('e3333333-3333-3333-3333-333333333333', 'lt222222-2222-2222-2222-222222222222', '2025-10-15', '2025-10-17', 3, 'Medical appointment', 'approved', 'u4444444-4444-4444-4444-444444444444');

-- ============================================
-- SAMPLE NOTIFICATIONS
-- ============================================
INSERT INTO notifications (user_id, title, message, type, link) VALUES
('u4444444-4444-4444-4444-444444444444', 'Leave Request Submitted', 'Your leave request for 5 days has been submitted successfully', 'success', '/leave/my-requests'),
('u3333333-3333-3333-3333-333333333333', 'New Leave Request', 'Jane Smith has submitted a leave request for your approval', 'info', '/leave/team');
