import { Router, Request, Response } from 'express';
import { pool } from '../db';

const router = Router();

// GET all job groups
router.get('/', async (_req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT name FROM system_job_groups ORDER BY name');
    res.json(result.rows.map(r => ({ value: r.name, active: true })));
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// ADD a job group
router.post('/', async (req: Request, res: Response) => {
  const { name } = req.body as { name?: string };
  const n = (name || '').trim().toUpperCase();
  if (!n) return res.status(400).json({ error: 'Job group name is required' });
  try {
    await pool.query('INSERT INTO system_job_groups(name) VALUES($1) ON CONFLICT(name) DO NOTHING', [n]);
    res.status(201).json({ value: n, active: true });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// UPDATE a job group name
router.put('/:name', async (req: Request, res: Response) => {
  const oldName = req.params.name;
  const { name: newName } = req.body as { name?: string };
  const n = (newName || '').trim().toUpperCase();
  if (!n) return res.status(400).json({ error: 'New job group name is required' });
  try {
    const result = await pool.query('UPDATE system_job_groups SET name=$1 WHERE name=$2 RETURNING name', [n, oldName]);
    if (result.rowCount === 0) return res.status(404).json({ error: 'Job group not found' });
    res.json({ value: result.rows[0].name, active: true });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// DELETE a job group
router.delete('/:name', async (req: Request, res: Response) => {
  const { name } = req.params;
  try {
    const result = await pool.query('DELETE FROM system_job_groups WHERE name=$1 RETURNING name', [name]);
    if (result.rowCount === 0) return res.status(404).json({ error: 'Job group not found' });
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

export default router;
