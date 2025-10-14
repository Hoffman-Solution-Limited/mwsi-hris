-- Migration: Add Registry Staff role and ensure Registry Manager label
-- Idempotent: safe to run multiple times

-- Ensure roles exist
INSERT INTO roles (id, name, locked, meta)
VALUES ('registry_manager','Registry Manager', FALSE, '{}'::jsonb)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

INSERT INTO roles (id, name, locked, meta)
VALUES ('registry_staff','Registry Staff', FALSE, '{}'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- Seed default permissions if not present
INSERT INTO role_permissions (role_id, permission_key)
SELECT 'registry_staff', p
FROM (VALUES
  ('employee.view'),
  ('page.employee-files'),
  ('page.registry.requests')
) v(p)
ON CONFLICT DO NOTHING;

-- Ensure registry_manager has required permissions
INSERT INTO role_permissions (role_id, permission_key)
SELECT 'registry_manager', p
FROM (VALUES
  ('employee.view'),
  ('page.employee-files'),
  ('page.registry.requests')
) v(p)
ON CONFLICT DO NOTHING;
