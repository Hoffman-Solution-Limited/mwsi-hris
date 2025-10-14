import { Router, Request, Response } from 'express';
import { pool } from '../db';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM department_goals ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    // If table missing or other error, log and return empty array so frontend can fallback
    // This keeps the frontend resilient while allowing operators to see the server-side error.
    // eslint-disable-next-line no-console
    console.error('department_goals query failed', err);
    res.status(500).json({ error: 'department_goals unavailable' });
  }
});

// Create a new department goal
router.post('/', async (req: Request, res: Response) => {
  const { department, title, description, owner_employee_id, target_date, progress, status } = req.body || {};
  if (!department || !title) return res.status(400).json({ error: 'department and title required' });
  try {
    const result = await pool.query(
      `INSERT INTO department_goals (department, title, description, owner_employee_id, target_date, progress, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [department, title, description || null, owner_employee_id || null, target_date || null, progress || 0, status || 'active']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('department_goals insert failed', err);
    res.status(500).json({ error: 'insert failed' });
  }
});

// Update an existing goal
router.put('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const updates = req.body || {};
  const fields: string[] = [];
  const values: any[] = [];
  let idx = 1;
  for (const key of ['department', 'title', 'description', 'owner_employee_id', 'target_date', 'progress', 'status']) {
    if (Object.prototype.hasOwnProperty.call(updates, key)) {
      fields.push(`${key} = $${idx}`);
      values.push((updates as any)[key]);
      idx++;
    }
  }
  if (fields.length === 0) return res.status(400).json({ error: 'no fields to update' });
  values.push(id);
  const sql = `UPDATE department_goals SET ${fields.join(', ')}, updated_at = now() WHERE id = $${idx} RETURNING *`;
  try {
    const result = await pool.query(sql, values);
    if (result.rowCount === 0) return res.status(404).json({ error: 'not found' });
    res.json(result.rows[0]);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('department_goals update failed', err);
    res.status(500).json({ error: 'update failed' });
  }
});

// Delete a goal
router.delete('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM department_goals WHERE id = $1 RETURNING id', [id]);
    if (result.rowCount === 0) return res.status(404).json({ error: 'not found' });
    res.json({ id: result.rows[0].id });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('department_goals delete failed', err);
    res.status(500).json({ error: 'delete failed' });
  }
});

export default router;
