-- Seed some initial department goals
INSERT INTO department_goals (id, department, title, description, owner_id, target_date)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'Engineering', 'Improve CI build times', 'Reduce average CI build time by 30% by optimizing caching and parallelism', NULL, '2026-03-31'),
  ('00000000-0000-0000-0000-000000000002', 'Human Resources', 'Increase training completion', 'Achieve 90% completion for mandatory compliance trainings', NULL, '2026-06-30'),
  ('00000000-0000-0000-0000-000000000003', 'Marketing', 'Launch Q3 campaign', 'Deliver Q3 product marketing campaign and measure conversion lift', NULL, '2026-09-30');
