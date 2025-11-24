-- 04-department-goals-seed.sql
-- Seed some initial department goals records for development

INSERT INTO department_goals (id, department, title, description, owner_employee_id, target_date, progress, status)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'Engineering', 'Improve deployment cadence', 'Reduce release cycle time by improving CI/CD and automation', NULL, '2026-03-31', 10, 'active'),
  ('22222222-2222-2222-2222-222222222222', 'Human Resources', 'Increase employee engagement', 'Run quarterly engagement surveys and follow-up actions', NULL, '2026-12-31', 25, 'active'),
  ('33333333-3333-3333-3333-333333333333', 'Marketing', 'Boost inbound leads', 'Improve content pipeline and channel mix to increase inbound leads', NULL, '2026-06-30', 5, 'active');
