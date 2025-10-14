import { Router, Request, Response } from 'express';
import { pool } from '../db';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM positions ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('positions query failed', err);
    res.status(500).json({ error: 'positions unavailable' });
  }
});

router.post('/', async (req: Request, res: Response) => {
  const { title, designation, stations, gross_salary, employment_type, status, description, posted_date, closing_date, applicants } = req.body || {};
  if (!title) return res.status(400).json({ error: 'title required' });
  try {
    const result = await pool.query(
      `INSERT INTO positions (title, designation, stations, gross_salary, employment_type, status, description, posted_date, closing_date, applicants)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
      [title, designation || null, stations || null, gross_salary || null, employment_type || null, status || 'open', description || null, posted_date || null, closing_date || null, applicants || 0]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('positions insert failed', err);
    res.status(500).json({ error: 'insert failed' });
  }
});

router.put('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const updates = req.body || {};
  const fields: string[] = [];
  const values: any[] = [];
  let idx = 1;
  for (const key of ['title','designation','stations','gross_salary','employment_type','status','description','posted_date','closing_date','applicants']) {
    if (Object.prototype.hasOwnProperty.call(updates, key)) {
      fields.push(`${key} = $${idx}`);
      values.push((updates as any)[key]);
      idx++;
    }
  }
  if (fields.length === 0) return res.status(400).json({ error: 'no fields to update' });
  values.push(id);
  const sql = `UPDATE positions SET ${fields.join(', ')}, updated_at = now() WHERE id = $${idx} RETURNING *`;
  try {
    const result = await pool.query(sql, values);
    if (result.rowCount === 0) return res.status(404).json({ error: 'not found' });
    res.json(result.rows[0]);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('positions update failed', err);
    res.status(500).json({ error: 'update failed' });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM positions WHERE id = $1 RETURNING id', [id]);
    if (result.rowCount === 0) return res.status(404).json({ error: 'not found' });
    res.json({ id: result.rows[0].id });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('positions delete failed', err);
    res.status(500).json({ error: 'delete failed' });
  }
});

export default router;
