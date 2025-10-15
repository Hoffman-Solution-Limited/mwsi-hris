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
    // Primary: newer schema with stations (text[]) and gross_salary
    const result = await pool.query(
      `INSERT INTO positions (title, designation, stations, gross_salary, employment_type, status, description, posted_date, closing_date, applicants)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
      [title, designation || null, stations || null, gross_salary || null, employment_type || null, status || 'open', description || null, posted_date || null, closing_date || null, applicants || 0]
    );
    res.status(201).json(result.rows[0]);
  } catch (err: any) {
    // Fallback: older mock schema without stations[]/gross_salary, using station_name
    const msg = String(err?.message || err);
    if (/column\s+\"?(stations|gross_salary)\"?\s+does not exist/i.test(msg)) {
      try {
        const station_name = Array.isArray(stations) && stations.length > 0 ? stations[0] : null;
        const result2 = await pool.query(
          `INSERT INTO positions (title, designation, station_name, employment_type, status, description, posted_date, closing_date, applicants)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
          [title, designation || null, station_name, employment_type || null, status || 'open', description || null, posted_date || null, closing_date || null, applicants || 0]
        );
        return res.status(201).json(result2.rows[0]);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('positions insert fallback failed', e);
        return res.status(500).json({ error: 'insert failed' });
      }
    }
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
  } catch (err: any) {
    // Fallback for older schema: map stations -> station_name and drop gross_salary
    const msg = String(err?.message || err);
    if (/column\s+\"?(stations|gross_salary)\"?\s+of\s+relation\s+\"positions\"\s+does not exist/i.test(msg)) {
      try {
        const map: Record<string,string> = { employment_type: 'employment_type', designation: 'designation', title: 'title', status: 'status', description: 'description', posted_date: 'posted_date', closing_date: 'closing_date', applicants: 'applicants' };
        const fields2: string[] = [];
        const values2: any[] = [];
        let j = 1;
        for (const [k,v] of Object.entries(updates)) {
          if (k === 'stations') {
            fields2.push(`station_name = $${j}`);
            values2.push(Array.isArray(v) && v.length > 0 ? v[0] : null);
            j++;
          } else if (k === 'gross_salary') {
            // ignore; not present in older schema
            continue;
          } else if (map[k]) {
            fields2.push(`${map[k]} = $${j}`);
            values2.push(v as any);
            j++;
          }
        }
        if (fields2.length === 0) return res.status(400).json({ error: 'no fields to update' });
        values2.push(id);
        const sql2 = `UPDATE positions SET ${fields2.join(', ')}, created_at = created_at WHERE id = $${j} RETURNING *`;
        const r2 = await pool.query(sql2, values2);
        if (r2.rowCount === 0) return res.status(404).json({ error: 'not found' });
        return res.json(r2.rows[0]);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('positions update fallback failed', e);
        return res.status(500).json({ error: 'update failed' });
      }
    }
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
