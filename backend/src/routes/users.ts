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
    // If caller provided employeeNumber, try to resolve employee_id
    let employeeId = data.employee_id || null;
    if (!employeeId && data.employeeNumber) {
      const r = await pool.query('SELECT id FROM employees WHERE employee_number = $1 LIMIT 1', [data.employeeNumber]);
      if (r && r.rowCount && r.rowCount > 0 && r.rows && r.rows[0]) employeeId = r.rows[0].id;
    }
    // If still not resolved, try matching email to employee
    if (!employeeId && data.email) {
      const r2 = await pool.query('SELECT id FROM employees WHERE lower(email) = lower($1) LIMIT 1', [data.email]);
      if (r2 && r2.rowCount && r2.rowCount > 0 && r2.rows && r2.rows[0]) employeeId = r2.rows[0].id;
    }

    // Assemble name from parts if provided
    let name = data.name || null;
    if (!name) {
      const parts: string[] = [];
      if (data.firstName) parts.push(String(data.firstName).trim());
      if (data.middleName) parts.push(String(data.middleName).trim());
      if (data.lastName) parts.push(String(data.lastName).trim());
      if (parts.length > 0) name = parts.join(' ');
    }

    const q = `INSERT INTO users(id, employee_id, email, name, role, password, status) VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING id, email, name, role`;
    const vals = [id, employeeId || null, data.email || null, name || null, data.role || 'employee', password, data.status || 'active'];
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
