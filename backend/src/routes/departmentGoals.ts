import { Router, Request, Response } from 'express';
import { pool } from '../db';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM department_goals ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    // If table missing or other error, return empty array so frontend can fallback
    res.json([]);
  }
});

export default router;
