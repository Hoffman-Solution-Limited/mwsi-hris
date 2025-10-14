import { Router, Request, Response } from 'express';
import { pool } from '../db';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// GET /api/employees/:id
router.get('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM employees WHERE id = $1 LIMIT 1', [id]);
    if (result.rowCount === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// POST /api/employees
router.post('/', async (req: Request, res: Response) => {
  const data = req.body;
  const id = data.id || uuidv4();
  try {
    const cols = ['id','employee_number','name','email','position','department','manager','manager_id','hire_date','status','avatar','phone','date_of_birth'];
    const vals = cols.map(c => data[c] ?? null);
    const placeholders = cols.map((_, i) => `$${i+1}`).join(',');
    const q = `INSERT INTO employees(${cols.join(',')}) VALUES(${placeholders}) RETURNING *`;
    const result = await pool.query(q, vals.map((v, i) => i===0 ? id : v));
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// PUT /api/employees/:id
router.put('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const updates = req.body;
  try {
    const keys = Object.keys(updates);
    if (keys.length === 0) return res.status(400).json({ error: 'no updates provided' });
    const set = keys.map((k, i) => `${k} = $${i+1}`).join(', ');
    const q = `UPDATE employees SET ${set} WHERE id = $${keys.length+1} RETURNING *`;
    const vals = keys.map(k => (updates as any)[k]).concat([id]);
    const result = await pool.query(q, vals);
    if (result.rowCount === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// DELETE /api/employees/:id
router.delete('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM employees WHERE id = $1 RETURNING *', [id]);
    if (result.rowCount === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ deleted: true, row: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

export default router;
