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

export default router;
