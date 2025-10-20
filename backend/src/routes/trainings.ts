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

router.get('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM training_records WHERE id = $1 LIMIT 1', [id]);
    if (result.rowCount === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

router.post('/', async (req: Request, res: Response) => {
  const data = req.body;
  const id = data.id || uuidv4();
  try {
    // Perform a minimal insert using core columns to avoid schema mismatch
    const qMin = `INSERT INTO training_records(id, employee_id, title, type, status, completion_date, expiry_date, provider, created_at) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`;
    const valsMin = [
      id,
      data.employeeId || null,
      data.title || null,
      data.type || null,
      data.status || null,
      data.completionDate || null,
      data.expiryDate || null,
      data.provider || null,
      data.created_at || new Date().toISOString()
    ];
    const resultMin = await pool.query(qMin, valsMin);
    const created = resultMin.rows[0];

    // Attempt to set optional extended fields (description, duration, archived, max_participants, prerequisites, category)
    try {
      const upd: Record<string, any> = {};
      if (data.description !== undefined) upd.description = data.description;
      if (data.duration !== undefined) upd.duration = data.duration;
      if (data.maxParticipants !== undefined || data.max_participants !== undefined) upd.max_participants = data.maxParticipants ?? data.max_participants;
      if (data.prerequisites !== undefined) upd.prerequisites = data.prerequisites;
      if (data.category !== undefined) upd.category = data.category;
      if (data.archived !== undefined) upd.archived = data.archived;

      const keys = Object.keys(upd);
      if (keys.length > 0) {
        const sets: string[] = [];
        const vals: any[] = [];
        let idx = 1;
        for (const k of keys) {
          sets.push(`${k} = $${idx}`);
          vals.push((upd as any)[k]);
          idx++;
        }
        vals.push(created.id);
        const qUpd = `UPDATE training_records SET ${sets.join(', ')} WHERE id = $${idx} RETURNING *`;
        const updRes = await pool.query(qUpd, vals);
        return res.status(201).json(updRes.rows[0]);
      }
    } catch (ignore) {
      // ignore errors updating optional fields (older schemas)
    }

    return res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// Batch create trainings
router.post('/batch', async (req: Request, res: Response) => {
  const items = Array.isArray(req.body?.items) ? req.body.items : [];
  if (items.length === 0) return res.status(400).json({ error: 'No items provided' });
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const created: any[] = [];
    for (const raw of items) {
      const {
        employeeId,
        title,
        type,
        provider,
        status = 'not_started',
        expiryDate,
        completionDate,
        description,
        duration,
        prerequisites,
        category,
        max_participants,
      } = raw || {};
      const q = `INSERT INTO training_records (employee_id, title, type, provider, status, expiry_date, completion_date, description, duration, prerequisites, category, max_participants)
                 VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
                 RETURNING *`;
      const vals = [employeeId, title, type, provider, status, expiryDate ?? null, completionDate ?? null, description ?? null, duration ?? null, prerequisites ?? null, category ?? null, max_participants ?? null];
      const result = await client.query(q, vals);
      created.push(result.rows[0]);
    }
    await client.query('COMMIT');
    res.json({ created });
  } catch (err: any) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: 'Failed to batch create trainings', details: err?.message });
  } finally {
    client.release();
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM training_records WHERE id = $1', [id]);
    if (result.rowCount === 0) return res.status(404).json({ error: 'Not found' });
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

router.put('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const updates = req.body;
  try {
    // normalize camelCase keys to snake_case to match DB column names
    const normalized: Record<string, any> = {};
    for (const k of Object.keys(updates)) {
      const snake = k.replace(/([A-Z])/g, '_$1').toLowerCase();
      normalized[snake] = (updates as any)[k];
    }
    const keys = Object.keys(normalized);
    if (keys.length === 0) return res.status(400).json({ error: 'no updates provided' });
    const sets: string[] = [];
    const vals: any[] = [];
    let idx = 1;
    for (const k of keys) {
      sets.push(`${k} = $${idx}`);
      vals.push((normalized as any)[k]);
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
