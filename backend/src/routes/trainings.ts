import { Router, Request, Response } from 'express';
import { pool } from '../db';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM training_records ORDER BY created_at DESC LIMIT 200');
    res.json(result.rows);
  } catch (err) {
    res.json([]);
  }
});

router.post('/', async (req: Request, res: Response) => {
  const data = req.body;
  const id = data.id || uuidv4();
  try {
    const q = `INSERT INTO training_records(id, employee_id, title, type, status, completion_date, expiry_date, provider, archived, created_at) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`;
    const vals = [id, data.employeeId || null, data.title || null, data.type || null, data.status || null, data.completionDate || null, data.expiryDate || null, data.provider || null, data.archived || false, data.created_at || new Date().toISOString()];
    const result = await pool.query(q, vals);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

router.put('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const updates = req.body;
  try {
    const keys = Object.keys(updates);
    if (keys.length === 0) return res.status(400).json({ error: 'no updates provided' });
    const sets: string[] = [];
    const vals: any[] = [];
    let idx = 1;
    for (const k of keys) {
      sets.push(`${k} = $${idx}`);
      vals.push((updates as any)[k]);
      idx++;
    }
    vals.push(id);
    const q = `UPDATE training_records SET ${sets.join(', ')} WHERE id = $${idx} RETURNING *`;
    const result = await pool.query(q, vals);
    if (result.rowCount === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

export default router;
