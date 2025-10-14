import { Router, Request, Response } from 'express';
import { pool } from '../db';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM leave_requests ORDER BY applied_date DESC LIMIT 200');
    res.json(result.rows);
  } catch (err) {
    // fallback: return empty array if table missing
    res.json([]);
  }
});

router.post('/', async (req: Request, res: Response) => {
  const data = req.body;
  const id = data.id || uuidv4();
  try {
    const q = `INSERT INTO leave_requests(id, employee_id, employee_name, type, start_date, end_date, days, status, reason, applied_date) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`;
    const vals = [id, data.employeeId || null, data.employeeName || null, data.type || null, data.startDate || null, data.endDate || null, data.days || null, data.status || 'pending_manager', data.reason || null, data.appliedDate || new Date().toISOString().slice(0,10)];
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
    const q = `UPDATE leave_requests SET ${sets.join(', ')} WHERE id = $${idx} RETURNING *`;
    const result = await pool.query(q, vals);
    if (result.rowCount === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

export default router;
