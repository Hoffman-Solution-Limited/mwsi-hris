import { Router, Request, Response } from 'express';
import { pool } from '../db';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// GET templates
router.get('/templates', async (_req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM performance_templates ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

router.post('/templates', async (req: Request, res: Response) => {
  const data = req.body;
  const id = data.id || uuidv4();
  try {
    const q = `INSERT INTO performance_templates(id, name, type, description, department, created_by, created_at) VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING *`;
    const vals = [id, data.name || null, data.type || null, data.description || null, data.department || null, data.createdBy || null, data.createdAt || new Date().toISOString()];
    const result = await pool.query(q, vals);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// GET reviews
router.get('/reviews', async (_req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM performance_reviews ORDER BY created_at DESC LIMIT 200');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

router.post('/reviews', async (req: Request, res: Response) => {
  const data = req.body;
  const id = data.id || uuidv4();
  try {
    const q = `INSERT INTO performance_reviews(id, employee_id, employee_name, employee_number, template_id, review_period, employee_self_comments, employee_ack_status, employee_ack_comments, employee_ack_date, status, overall_score, score, manager_comments, hr_comments, goals, feedback, employee_targets, manager_scores, employee_scores, next_review_date, created_by, created_at) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23) RETURNING *`;
    const vals = [
      id,
      data.employee_id || null,
      data.employee_name || null,
      data.employee_number || null,
      data.template_id || null,
      data.review_period || null,
      data.employee_self_comments || null,
      data.employee_ack_status || null,
      data.employee_ack_comments || null,
      data.employee_ack_date || null,
      data.status || null,
      data.overall_score || null,
      data.score || null,
      data.manager_comments || null,
      data.hr_comments || null,
      data.goals || null,
      data.feedback || null,
      data.employee_targets ? JSON.stringify(data.employee_targets) : null,
      data.manager_scores ? JSON.stringify(data.manager_scores) : null,
      data.employee_scores ? JSON.stringify(data.employee_scores) : null,
      data.next_review_date || null,
      data.created_by || null,
      data.created_at || new Date().toISOString(),
    ];
    const result = await pool.query(q, vals);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

router.put('/reviews/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const updates = req.body;
  try {
    const keys = Object.keys(updates);
    if (keys.length === 0) return res.status(400).json({ error: 'no updates provided' });
    const sets: string[] = [];
    const values: any[] = [];
    let idx = 1;
    for (const k of keys) {
      if (['employee_targets','manager_scores','employee_scores'].includes(k)) {
        sets.push(`${k} = $${idx}`);
        values.push(JSON.stringify((updates as any)[k]));
      } else {
        sets.push(`${k} = $${idx}`);
        values.push((updates as any)[k]);
      }
      idx++;
    }
    values.push(id);
    const q = `UPDATE performance_reviews SET ${sets.join(', ')} WHERE id = $${idx} RETURNING *`;
    const result = await pool.query(q, values);
    if (result.rowCount === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

export default router;
