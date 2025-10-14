import { Router, Request, Response } from 'express';
import { pool } from '../db';

const router = Router();

// GET /api/system_logs - return recent system logs (if table exists)
router.get('/', async (_req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM system_logs ORDER BY timestamp DESC LIMIT 200');
    res.json(result.rows);
  } catch (err) {
    // If table doesn't exist or any error, return an empty array for graceful UAT behavior
    res.json([]);
  }
});

router.post('/', async (req: Request, res: Response) => {
  const data = req.body;
  try {
    const q = `INSERT INTO system_logs(id, action, action_type, user_id, user_name, user_role, details, entity_type, entity_id, timestamp, status, ip_address)
      VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *`;
    const id = data.id || undefined;
    const vals = [id, data.action || null, data.action_type || data.actionType || null, data.user_id || data.userId || null, data.user_name || data.userName || null, data.user_role || data.userRole || null, data.details || null, data.entity_type || data.entityType || null, data.entity_id || data.entityId || null, data.timestamp || new Date().toISOString(), data.status || null, data.ip_address || data.ipAddress || null];
    const result = await pool.query(q, vals);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

export default router;
