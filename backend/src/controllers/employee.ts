import { Request, Response } from 'express';
import { pool } from '../db';
import { v4 as uuidv4 } from 'uuid';

const toSnake = (s: string) => s.replace(/[A-Z]/g, m => '_' + m.toLowerCase());
const toCamel = (s: string) => s.replace(/_([a-z])/g, (_m, p1) => p1.toUpperCase());

// whitelist of allowed employee DB columns (snake_case)
const allowedColumns = new Set([
  'id','employee_number','name','email','position','department','manager','manager_id','hire_date','status','avatar','phone','date_of_birth',
  'emergency_contact','salary','gender','cadre','employment_type','engagement_type','job_group','ethnicity','national_id','kra_pin','children','work_county','home_county','postal_address','postal_code','station_name','skill_level','company'
]);
// include next of kin and special needs fields
(function extendAllowed() {
  [
    'next_of_kin_name',
    'next_of_kin_relationship',
    'next_of_kin_phone',
    'next_of_kin_email',
    'has_special_needs',
    'special_needs_description',
    'home_subcounty',
    'marital_status',
  ].forEach(c => allowedColumns.add(c))
})();

function rowToCamel(row: any) {
  const out: any = {};
  for (const k of Object.keys(row || {})) {
    out[toCamel(k)] = row[k];
  }
  return out;
}

// List employees
export const getAllEmployees= async (req: Request, res: Response) => {
  try {
    const { employeeNumber } = req.query as { employeeNumber?: string };
    if (employeeNumber && String(employeeNumber).trim().length > 0) {
      const result = await pool.query('SELECT * FROM employees WHERE LOWER(employee_number::text) = LOWER($1) ORDER BY name ASC', [String(employeeNumber)]);
      return res.json(result.rows.map(rowToCamel));
    }
    const result = await pool.query('SELECT * FROM employees ORDER BY name ASC');
    res.json(result.rows.map(rowToCamel));
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
};

// GET /api/employees/:id
export const getSingleEmployee= async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM employees WHERE id = $1 LIMIT 1', [id]);
    if (result.rowCount === 0) return res.status(404).json({ error: 'Not found' });
    res.json(rowToCamel(result.rows[0]));
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
};

// POST /api/employees
// export const createEmployee =  async (req: Request, res: Response) => {
//   const client = await pool.connect();
//   const data = req.body || {};
//   const id = data.id || uuidv4();
//   try {
//     await client.query('BEGIN');
//     // Construct full name from parts if they exist
//     if (data.firstName || data.surname) {
//       data.name = [data.firstName, data.middleName, data.surname].filter(Boolean).join(' ');
//     }
//     // Remove non-schema fields so they cannot accidentally be inserted
//     delete (data as any).firstName;
//     delete (data as any).middleName;
//     delete (data as any).surname;
//     delete (data as any).documents;
//     delete (data as any).skills;

//     // map incoming camelCase keys to snake_case and whitelist
//     const entries: Array<[string, any]> = [];
//     // ensure id first
//     entries.push(['id', id]);
//     for (const k of Object.keys(data)) {
//       const snake = toSnake(k);
//       if (!allowedColumns.has(snake)) continue;
//       // skip id if provided
//       if (snake === 'id') continue;
//       let v = (data as any)[k];
//       // no JSON columns in current schema
//       entries.push([snake, v == null ? null : v]);
//     }

//     const cols = entries.map(e => e[0]);
//     const placeholders = entries.map((_, i) => `$${i+1}`);
//     const vals = entries.map(e => e[1]);
//     // Debug log to help diagnose schema mismatches
//     try { console.log('employees.insert cols=', cols); } catch {}
//     const q = `INSERT INTO employees(${cols.join(',')}) VALUES(${placeholders.join(',')}) RETURNING *`;
//     const result = await pool.query(q, vals);
//      const employee = result.rows[0];

//       // Create employee file
//     const fileResult = await client.query(
//       `INSERT INTO employee_files (employee_id, file_number, current_location, status)
//        VALUES ($1, CONCAT('FILE-', $1), 'Registry', 'available')
//        RETURNING *`,
//       [employee.id]
//     );

//       // Log file movement
//     await client.query(
//       `INSERT INTO file_movements 
//        (employee_id, file_id, by_user_id, by_user_name, from_location, to_location, action, remarks)
//        VALUES ($1,$2,$3,$4,'Registry',$5,'APPROVE',$6)`,
//       [employeeId, fileId, registry_user_id, registry_user_name, toDepartment, remarks]
//     );

//     const employeeFile = fileResult.rows[0];

//     // Attach all existing document types as employee_documents
//     await client.query(
//       `
//       INSERT INTO employee_documents (employee_id, document_type_id, document_name, status, created_at)
//       SELECT $1 AS employee_id, dt.id AS document_type_id, dt.name AS document_name, 'pending', NOW()
//       FROM document_types dt
//       WHERE NOT EXISTS (
//         SELECT 1 FROM employee_documents ed
//         WHERE ed.employee_id = $1 AND ed.document_type_id = dt.id
//       )
//       `,
//       [employee.id]
//     );

//     // Update document_types.employee_count for all existing docs
//     await client.query(`
//       UPDATE document_types
//       SET employee_count = (
//         SELECT COUNT(*) FROM employee_documents ed WHERE ed.document_type_id = document_types.id
//       ),
//       updated_at = NOW()
//     `);

//     await client.query('COMMIT');
    
//     res.status(201).json(rowToCamel(employee));
//   } catch (err) {
//      await client.query('ROLLBACK');
//       console.error('[createEmployee]', err);
//     res.status(500).json({ error: String(err) });
//   }finally {
//     client.release();
//   }
// });

export const createEmployee = async (req: Request, res: Response) => {
  const client = await pool.connect();
  const data = req.body || {};
  const id = data.id || uuidv4();

  try {
    await client.query('BEGIN');

    // ✅ Construct full name
    if (data.firstName || data.surname) {
      data.name = [data.firstName, data.middleName, data.surname]
        .filter(Boolean)
        .join(' ');
    }

    // ✅ Clean up irrelevant fields
    delete (data as any).firstName;
    delete (data as any).middleName;
    delete (data as any).surname;
    delete (data as any).documents;
    delete (data as any).skills;

    // ✅ Map camelCase to snake_case, whitelist insertable columns
    const entries: Array<[string, any]> = [['id', id]];
    for (const k of Object.keys(data)) {
      const snake = toSnake(k);
      if (!allowedColumns.has(snake) || snake === 'id') continue;
      const v = (data as any)[k];
      entries.push([snake, v == null ? null : v]);
    }

    const cols = entries.map((e) => e[0]);
    const placeholders = entries.map((_, i) => `$${i + 1}`);
    const vals = entries.map((e) => e[1]);

    // ✅ Insert employee
    const q = `INSERT INTO employees(${cols.join(',')}) VALUES(${placeholders.join(',')}) RETURNING *`;
    const result = await client.query(q, vals);
    const employee = result.rows[0];

    // ✅ Create employee file
    const fileResult = await client.query(
      `
      INSERT INTO employee_files (employee_id, file_number, current_location, status)
      VALUES ($1, CONCAT('FILE-', $1), 'Registry', 'available')
      RETURNING *
      `,
      [employee.id]
    );
    const employeeFile = fileResult.rows[0];

    // ✅ Log initial movement: system-created file entry
    await client.query(
      `
      INSERT INTO file_movements
      (employee_id, file_id, by_user_id, by_user_name, from_location, to_location, action, remarks)
      VALUES ($1, $2, 'system', 'System', NULL, 'Registry Office', 'CREATE', 'Auto-created employee file')
      `,
      [employee.id, employeeFile.id]
    );

    // ✅ Attach all existing document types
    await client.query(
      `
      INSERT INTO employee_documents (employee_id, document_type_id, document_name, created_at)
      SELECT $1, dt.id, dt.name, NOW()
      FROM document_types dt
      WHERE NOT EXISTS (
        SELECT 1 FROM employee_documents ed
        WHERE ed.employee_id = $1 AND ed.document_type_id = dt.id
      )
      `,
      [employee.id]
    );

    // ✅ Update document type employee counts
    await client.query(`
      UPDATE document_types
      SET employee_count = (
        SELECT COUNT(*) FROM employee_documents ed WHERE ed.document_type_id = document_types.id
      ),
      updated_at = NOW()
    `);

    await client.query('COMMIT');

    res.status(201).json(rowToCamel(employee));
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[createEmployee]', err);
    res.status(500).json({ error: String(err) });
  } finally {
    client.release();
  }
};

// PUT /api/employees/:id
export const updateEmployee= async (req: Request, res: Response) => {
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
};

// DELETE /api/employees/:id
export const deleteEmployee= async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM employees WHERE id = $1 RETURNING *', [id]);
    if (result.rowCount === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ deleted: true, row: rowToCamel(result.rows[0]) });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
};
