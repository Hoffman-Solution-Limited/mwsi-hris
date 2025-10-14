import { Router, Request, Response } from 'express';
import { pool } from '../db';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT id, employee_id, email, name, role, status, created_at FROM users ORDER BY created_at DESC LIMIT 200');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

router.post('/', async (req: Request, res: Response) => {
  const data = req.body;
  const id = data.id || uuidv4();
  const password = data.password ? await bcrypt.hash(data.password, 10) : null;
  try {
    const q = `INSERT INTO users(id, employee_id, email, name, role, password, status) VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING id, email, name, role`;
    const vals = [id, data.employee_id || null, data.email || null, data.name || null, data.role || 'employee', password, data.status || 'active'];
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

    // handle password separately (hash it)
    const values: any[] = [];
    const sets: string[] = [];
    let idx = 1;
    for (const k of keys) {
      if (k === 'password') {
        const hashed = updates.password ? await bcrypt.hash(updates.password, 10) : null;
        sets.push(`password = $${idx}`);
        values.push(hashed);
        idx++;
      } else {
        sets.push(`${k} = $${idx}`);
        values.push((updates as any)[k]);
        idx++;
      }
    }
    values.push(id);
    const q = `UPDATE users SET ${sets.join(', ')} WHERE id = $${idx} RETURNING id, email, name, role, status`;
    const result = await pool.query(q, values);
    if (result.rowCount === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

export default router;
