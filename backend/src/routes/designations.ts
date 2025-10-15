import { Router, Request, Response } from 'express';
import { pool } from '../db';

const router = Router();

// GET all designations
router.get('/', async (_req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT name FROM system_designations ORDER BY name');
    res.json(result.rows.map(r => ({ value: r.name, active: true })));
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// ADD a new designation
router.post('/', async (req: Request, res: Response) => {
  const { name } = req.body;
  if (!name || !name.trim()) return res.status(400).json({ error: 'Designation name is required' });
  try {
    await pool.query('INSERT INTO system_designations(name) VALUES($1) ON CONFLICT(name) DO NOTHING', [name.trim()]);
    res.status(201).json({ value: name.trim(), active: true });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// UPDATE a designation name
router.put('/:name', async (req: Request, res: Response) => {
  const oldName = req.params.name;
  const { name: newName } = req.body;
  if (!newName || !newName.trim()) return res.status(400).json({ error: 'New designation name is required' });
  try {
    const result = await pool.query('UPDATE system_designations SET name=$1 WHERE name=$2 RETURNING name', [newName.trim(), oldName]);
    if (result.rowCount === 0) return res.status(404).json({ error: 'Designation not found' });
    res.json({ value: result.rows[0].name, active: true });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// DELETE a designation
router.delete('/:name', async (req: Request, res: Response) => {
  const { name } = req.params;
  try {
    const result = await pool.query('DELETE FROM system_designations WHERE name=$1 RETURNING name', [name]);
    if (result.rowCount === 0) return res.status(404).json({ error: 'Designation not found' });
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

export default router;
