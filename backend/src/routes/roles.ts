import { Router, Request, Response } from 'express';
import { pool } from '../db';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT id, name, locked, meta, created_at FROM roles');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

router.get('/:id/permissions', async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT permission_key FROM role_permissions WHERE role_id = $1', [id]);
    res.json(result.rows.map(r => r.permission_key));
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

router.put('/:id/permissions', async (req: Request, res: Response) => {
  const { id } = req.params;
  const perms: string[] = req.body.permissions || [];
  try {
    // Replace permissions atomically
    await pool.query('BEGIN');
    await pool.query('DELETE FROM role_permissions WHERE role_id = $1', [id]);
    for (const p of perms) {
      await pool.query('INSERT INTO role_permissions(role_id, permission_key) VALUES($1,$2) ON CONFLICT DO NOTHING', [id, p]);
    }
    await pool.query('COMMIT');
    res.json({ role: id, permissions: perms });
  } catch (err) {
    await pool.query('ROLLBACK');
    res.status(500).json({ error: String(err) });
  }
});

export default router;
