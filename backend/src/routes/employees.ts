import { Router, Request, Response } from 'express';
import { pool } from '../db';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

const toSnake = (s: string) => s.replace(/[A-Z]/g, m => '_' + m.toLowerCase());
const toCamel = (s: string) => s.replace(/_([a-z])/g, (_m, p1) => p1.toUpperCase());

// whitelist of allowed employee DB columns (snake_case)
const allowedColumns = new Set([
  'id','employee_number','name','email','position','department','manager','manager_id','hire_date','status','avatar','phone','date_of_birth',
  'emergency_contact','salary','gender','cadre','employment_type','engagement_type','job_group','ethnicity','national_id','kra_pin','children','work_county','home_county','postal_address','postal_code','station_name','skill_level','company','documents','skills',
  'first_name', 'middle_name', 'surname'
]);

function rowToCamel(row: any) {
  const out: any = {};
  for (const k of Object.keys(row || {})) {
    out[toCamel(k)] = row[k];
  }
  return out;
}

// GET /api/employees
router.get('/', async (req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM employees ORDER BY name ASC');
    res.json(result.rows.map(rowToCamel));
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// GET /api/employees/:id
router.get('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM employees WHERE id = $1 LIMIT 1', [id]);
    if (result.rowCount === 0) return res.status(404).json({ error: 'Not found' });
    res.json(rowToCamel(result.rows[0]));
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// POST /api/employees
router.post('/', async (req: Request, res: Response) => {
  const data = req.body || {};
  const id = data.id || uuidv4();
  try {
    // Construct full name from parts if they exist
    if (data.firstName || data.surname) {
      data.name = [data.firstName, data.middleName, data.surname].filter(Boolean).join(' ');
    }

    // map incoming camelCase keys to snake_case and whitelist
    const entries: Array<[string, any]> = [];
    // ensure id first
    entries.push(['id', id]);
    for (const k of Object.keys(data)) {
      const snake = toSnake(k);
      if (!allowedColumns.has(snake)) continue;
      // skip id if provided
      if (snake === 'id') continue;
      let v = (data as any)[k];
      if ((snake === 'documents' || snake === 'skills') && v !== undefined && v !== null) {
        v = JSON.stringify(v);
      }
      entries.push([snake, v == null ? null : v]);
    }

    const cols = entries.map(e => e[0]);
    const placeholders = entries.map((_, i) => `$${i+1}`);
    const vals = entries.map(e => e[1]);
    const q = `INSERT INTO employees(${cols.join(',')}) VALUES(${placeholders.join(',')}) RETURNING *`;
    const result = await pool.query(q, vals);
    res.status(201).json(rowToCamel(result.rows[0]));
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// PUT /api/employees/:id
router.put('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const updates = req.body || {};
  try {
    const entries: Array<[string, any]> = [];
    for (const k of Object.keys(updates)) {
      const snake = toSnake(k);
      if (!allowedColumns.has(snake)) continue;
      let v = (updates as any)[k];
      if ((snake === 'documents' || snake === 'skills') && v !== undefined && v !== null) {
        v = JSON.stringify(v);
      }
      entries.push([snake, v == null ? null : v]);
    }
    if (entries.length === 0) return res.status(400).json({ error: 'no valid updates provided' });

    const set = entries.map((e, i) => `${e[0]} = $${i+1}`).join(', ');
    const vals = entries.map(e => e[1]).concat([id]);
    const q = `UPDATE employees SET ${set} WHERE id = $${entries.length+1} RETURNING *`;
    const result = await pool.query(q, vals);
    if (result.rowCount === 0) return res.status(404).json({ error: 'Not found' });
    res.json(rowToCamel(result.rows[0]));
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// DELETE /api/employees/:id
router.delete('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM employees WHERE id = $1 RETURNING *', [id]);
    if (result.rowCount === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ deleted: true, row: rowToCamel(result.rows[0]) });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

export default router;
