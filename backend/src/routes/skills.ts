import { Router, Request, Response } from 'express';
import { pool } from '../db';

const router = Router();

// --- System Skill Levels ---

// GET all skill levels
router.get('/levels', async (_req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT name FROM system_skill_levels ORDER BY name');
    res.json(result.rows.map(r => ({ value: r.name, active: true }))); // Match frontend Item shape
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// ADD a new skill level
router.post('/levels', async (req: Request, res: Response) => {
  const { name } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Skill level name is required' });
  }
  try {
    await pool.query('INSERT INTO system_skill_levels (name) VALUES ($1) ON CONFLICT (name) DO NOTHING', [name.trim()]);
    res.status(201).json({ value: name.trim(), active: true });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// UPDATE a skill level
router.put('/levels/:name', async (req: Request, res: Response) => {
  const oldName = req.params.name;
  const { name: newName } = req.body;
  if (!newName || !newName.trim()) {
    return res.status(400).json({ error: 'New skill level name is required' });
  }
  try {
    const result = await pool.query('UPDATE system_skill_levels SET name = $1 WHERE name = $2 RETURNING name', [newName.trim(), oldName]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Skill level not found' });
    }
    res.json({ value: result.rows[0].name, active: true });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// DELETE a skill level
router.delete('/levels/:name', async (req: Request, res: Response) => {
  const { name } = req.params;
  try {
    const result = await pool.query('DELETE FROM system_skill_levels WHERE name = $1 RETURNING name', [name]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Skill level not found' });
    }
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});


// --- Employee Skills ---

// GET an employee's skills
router.get('/employees/:id/skills', async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const result = await pool.query('SELECT id, name, level FROM employee_skills WHERE employee_id = $1 ORDER BY name', [id]);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: String(err) });
    }
});

// ADD a skill to an employee
router.post('/employees/:id/skills', async (req: Request, res: Response) => {
    const { id: employee_id } = req.params;
    const { name, level } = req.body;

    if (!name || !level) {
        return res.status(400).json({ error: 'Skill name and level are required' });
    }

    try {
        const result = await pool.query(
            'INSERT INTO employee_skills (employee_id, name, level) VALUES ($1, $2, $3) RETURNING *',
            [employee_id, name, level]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: String(err) });
    }
});

// UPDATE an employee's skill
router.put('/employees/:employeeId/skills/:skillId', async (req: Request, res: Response) => {
    const { skillId } = req.params;
    const { name, level } = req.body;

    if (!name || !level) {
        return res.status(400).json({ error: 'Skill name and level are required' });
    }

    try {
        const result = await pool.query(
            'UPDATE employee_skills SET name = $1, level = $2 WHERE id = $3 RETURNING *',
            [name, level, skillId]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Skill not found for this employee' });
        }

        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: String(err) });
    }
});

// DELETE an employee's skill
router.delete('/employees/:employeeId/skills/:skillId', async (req: Request, res: Response) => {
    const { skillId } = req.params;
    try {
        const result = await pool.query('DELETE FROM employee_skills WHERE id = $1 RETURNING *', [skillId]);
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Skill not found' });
        }
        res.status(204).send();
    } catch (err) {
        res.status(500).json({ error: String(err) });
    }
});


export default router;
