import { Router, Request, Response } from 'express';
import { pool } from '../db';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// GET /api/disciplinary - list recent cases
router.get('/', async (_req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM disciplinary_cases ORDER BY created_at DESC LIMIT 200');
    res.json(result.rows.map(r => ({
      ...r,
      updates: r.updates || []
    })));
  } catch (err) {
    console.error('GET /api/disciplinary error:', err);
    res.json([]);
  }
});

// POST /api/disciplinary
router.post('/', async (req: Request, res: Response) => {
  const data = req.body;
  const id = data.id || uuidv4();
  try {
  const q = `INSERT INTO disciplinary_cases(id, employee_id, employee_name, case_type, status, date, description, verdict, updates) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`;
  const vals = [id, data.employeeId || null, data.employeeName || null, data.caseType || null, data.status || 'open', data.date || null, data.description || null, data.verdict || null, JSON.stringify(data.updates || [])];
    const result = await pool.query(q, vals);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('POST /api/disciplinary error:', err);
    res.status(500).json({ error: String(err) });
  }
});

// PUT /api/disciplinary/:id
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
      if (k === 'updates') {
        sets.push(`updates = $${idx}`);
        vals.push(JSON.stringify((updates as any)[k]));
      } else {
        sets.push(`${k} = $${idx}`);
        vals.push((updates as any)[k]);
      }
      idx++;
    }
    vals.push(id);
    const q = `UPDATE disciplinary_cases SET ${sets.join(', ')}, updated_at = now() WHERE id = $${idx} RETURNING *`;
    const result = await pool.query(q, vals);
    if (result.rowCount === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(`PUT /api/disciplinary/${id} error:`, err);
    res.status(500).json({ error: String(err) });
  }
});

// DELETE /api/disciplinary/:id
router.delete('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM disciplinary_cases WHERE id = $1 RETURNING *', [id]);
    if (result.rowCount === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ deleted: true, row: result.rows[0] });
  } catch (err) {
    console.error(`DELETE /api/disciplinary/${id} error:`, err);
    res.status(500).json({ error: String(err) });
  }
});

export default router;
