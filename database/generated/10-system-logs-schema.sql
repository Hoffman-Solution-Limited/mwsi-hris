-- Migration: create system_logs table and seed sample rows for UAT
-- Idempotent: will only create table if not exists

CREATE TABLE IF NOT EXISTS system_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  action text NOT NULL,
  action_type text NOT NULL,
  user_id text,
  user_name text,
  user_role text,
  details text,
  entity_type text,
  entity_id text,
  timestamp timestamptz NOT NULL DEFAULT now(),
  status text,
  ip_address text
);

-- simple index for recent queries
CREATE INDEX IF NOT EXISTS idx_system_logs_timestamp ON system_logs(timestamp DESC);

-- Seed a few rows for UAT (INSERT ... ON CONFLICT DO NOTHING to be safe)
INSERT INTO system_logs(id, action, action_type, user_id, user_name, user_role, details, entity_type, entity_id, timestamp, status, ip_address)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'User logged in', 'login', '1', 'Alice Johnson', 'admin', 'Successful login from dashboard', NULL, NULL, now() - interval '2 days', 'success', '127.0.0.1')
ON CONFLICT (id) DO NOTHING;

INSERT INTO system_logs(id, action, action_type, user_id, user_name, user_role, details, entity_type, entity_id, timestamp, status, ip_address)
VALUES
  ('00000000-0000-0000-0000-000000000002', 'Training program assigned', 'assign', '3', 'Carol Davis', 'hr_manager', 'Assigned cybersecurity training to 15 employees', 'training_assignment', 'T-uat-1', now() - interval '1 day', 'success', '127.0.0.1')
ON CONFLICT (id) DO NOTHING;

INSERT INTO system_logs(id, action, action_type, user_id, user_name, user_role, details, entity_type, entity_id, timestamp, status, ip_address)
VALUES
  ('00000000-0000-0000-0000-000000000003', 'Data export queued', 'create', '2', 'Brian Smith', 'employee', 'User data export queued', 'export', 'EXP-1', now() - interval '6 hours', 'success', '127.0.0.1')
ON CONFLICT (id) DO NOTHING;
