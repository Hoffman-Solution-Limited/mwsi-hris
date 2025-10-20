-- Seed data for development (small sample from mockData)
-- Employees
INSERT INTO employees (id, employee_number, name, email, position, department, manager, manager_id, hire_date, status, avatar, phone, date_of_birth, gender)
VALUES
('1','20221234567','John Smith','john.smith@mwsi.com','System Administrator','IT','Sarah Johnson','2','2022-01-15','active','https://api.dicebear.com/7.x/initials/svg?seed=JS','+254-700-123456','1985-06-15','male'),
('2','20211234568','Sarah Johnson','sarah.johnson@mwsi.com','HR Manager','Human Resources',NULL,NULL,'2021-03-20','active','https://api.dicebear.com/7.x/initials/svg?seed=SJ','+254-700-234567','1982-11-10','female'),
('10','2019031010','David Manager','david.manager@mwsi.com','Operations Manager','Operations',NULL,NULL,'2019-03-10','active','https://api.dicebear.com/7.x/initials/svg?seed=DM','+254-700-999999','1980-07-22','male'),
('3','20221234569','Michael Davis','michael.davis@mwsi.com','Software Developer','Engineering','David Manager','10','2022-07-10','active','https://api.dicebear.com/7.x/initials/svg?seed=MD','+254-700-345678','1990-04-01','male')
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
('registry_staff','Registry Staff',false,'{}'),
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

-- Seed data for leave_types
BEGIN;

-- ✅ Seed leave_types
INSERT INTO leave_types (name, description, max_days_per_year, created_at)
VALUES
    ('Annual Leave', 'Paid time off for vacation', 30, NOW()),
    ('Sick Leave', 'Leave for illness or medical reasons', 15, NOW()),
    ('Maternity Leave', 'Leave for maternity', 90, NOW()),
    ('Paternity Leave', 'Leave for paternity', 14, NOW()),
    ('Emergency Leave', 'Leave for urgent personal matters', 7, NOW()),
    ('Study Leave', 'Leave for study or exams', 30, NOW())
ON CONFLICT (name) DO NOTHING;

-- ✅ Seed leave_balances ONLY for missing records
INSERT INTO leave_balances (
    employee_id,
    leave_type_id,
    year,
    total_entitled,
    used_days,
    remaining_days,
    carried_forward,
    created_at
)
SELECT 
    e.id AS employee_id,
    lt.id AS leave_type_id,
    EXTRACT(YEAR FROM CURRENT_DATE) AS year,
    lt.max_days_per_year 
      + COALESCE(
            CASE
                WHEN lt.carry_forward = TRUE THEN
                    LEAST(
                        COALESCE(prev.remaining_days, 0),
                        COALESCE(lt.carry_forward_limit, 0)
                    )
                ELSE 0
            END, 0
        ) AS total_entitled,
    0 AS used_days,
    lt.max_days_per_year 
      + COALESCE(
            CASE
                WHEN lt.carry_forward = TRUE THEN
                    LEAST(
                        COALESCE(prev.remaining_days, 0),
                        COALESCE(lt.carry_forward_limit, 0)
                    )
                ELSE 0
            END, 0
        ) AS remaining_days,
    COALESCE(
        CASE
            WHEN lt.carry_forward = TRUE THEN
                LEAST(
                    COALESCE(prev.remaining_days, 0),
                    COALESCE(lt.carry_forward_limit, 0)
                )
            ELSE 0
        END, 0
    ) AS carried_forward,
    NOW()
FROM employees e
CROSS JOIN leave_types lt
LEFT JOIN leave_balances prev
    ON prev.employee_id = e.id
   AND prev.leave_type_id = lt.id
   AND prev.year = EXTRACT(YEAR FROM CURRENT_DATE) - 1
WHERE NOT EXISTS (
    SELECT 1 FROM leave_balances lb
    WHERE lb.employee_id = e.id
      AND lb.leave_type_id = lt.id
      AND lb.year = EXTRACT(YEAR FROM CURRENT_DATE)
);

COMMIT;
