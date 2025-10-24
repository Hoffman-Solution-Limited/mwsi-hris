// import { Request, Response } from 'express';
// import { pool } from '../db';

// export const createEmployeeFile = async (req: Request, res: Response) => {
//   const client = await pool.connect();
//   try {
//     const { employee_id, file_number, default_documents } = req.body;
//     await client.query('BEGIN');

//     const result = await client.query(
//       `INSERT INTO employee_files (employee_id, file_number, default_documents)
//        VALUES ($1, $2, $3) RETURNING *`,
//       [employee_id, file_number, default_documents]
//     );

//     await client.query('COMMIT');
//     res.json(result.rows[0]);
//   } catch (err) {
//     await client.query('ROLLBACK');
//     console.error('[createEmployeeFile]', err);
//     res.status(500).json({ error: 'Something went wrong' });
//   } finally {
//     client.release();
//   }
// };

// export const getFileByEmployee = async (req: Request, res: Response) => {
//   try {
//     const { employeeId } = req.params;
//     const result = await pool.query(
//       `SELECT * FROM employee_files WHERE employee_id = $1`,
//       [employeeId]
//     );
//     res.json(result.rows[0]);
//   } catch (err) {
//     console.error('[getFileByEmployee]', err);
//     res.status(500).json({ error: 'Something went wrong' });
//   }
// };

// export const updateEmployeeFile = async (req: Request, res: Response) => {
//   const client = await pool.connect();
//   try {
//     const { id } = req.params;
//     const { employee_id, file_number, default_documents } = req.body;

//     const result = await client.query(
//       `UPDATE employee_files SET employee_id = $1, file_number = $2, default_documents = $3 WHERE id = $4 RETURNING *`,
//       [employee_id, file_number, default_documents, id]
//     );

//     res.json(result.rows[0]);
//   } catch (err) {
//     console.error('[updateEmployeeFile]', err);
//     res.status(500).json({ error: 'Something went wrong' });
//   } finally {
//     client.release();
//   }
// };

// export const getAllEmployeeFiles = async (req: Request, res: Response) => {
//   try {
//     const result = await pool.query(`SELECT * FROM employee_files ORDER BY created_at DESC`);
//     res.json(result.rows);
//   } catch (err) {
//     console.error('[getAllEmployeeFiles]', err);
//     res.status(500).json({ error: 'Something went wrong' });
//   }
// };
import { Request, Response } from 'express';
import { pool } from '../db';

// CREATE Employee File (Manual)
export const createEmployeeFile = async (req: Request, res: Response) => {
  const client = await pool.connect();
  try {
    const { employee_id, file_number } = req.body;
    await client.query('BEGIN');

    // get all document types
    const docsResult = await client.query(`SELECT name FROM document_types`);
    const docs = docsResult.rows.map(r => r.name);

    const result = await client.query(
      `INSERT INTO employee_files (employee_id, file_number, default_documents)
       VALUES ($1, $2, $3) RETURNING *`,
      [employee_id, file_number, docs]
    );

    await client.query('COMMIT');
    res.json(result.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[createEmployeeFile]', err);
    res.status(500).json({ error: 'Something went wrong' });
  } finally {
    client.release();
  }
};

// GET all files
export const getAllEmployeeFiles = async (req: Request, res: Response) => {
  try {
    const result = await pool.query(`SELECT * FROM employee_files ORDER BY created_at DESC`);
    res.json(result.rows);
  } catch (err) {
    console.error('[getAllEmployeeFiles]', err);
    res.status(500).json({ error: 'Something went wrong' });
  }
};

// GET file by employee
export const getFileByEmployee = async (req: Request, res: Response) => {
  try {
    const { employeeId } = req.params;
    const result = await pool.query(
      `SELECT * FROM employee_files WHERE employee_id = $1`,
      [employeeId]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error('[getFileByEmployee]', err);
    res.status(500).json({ error: 'Something went wrong' });
  }
};

// UPDATE file info
export const updateEmployeeFile = async (req: Request, res: Response) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    const { current_location, assigned_user_id, assigned_user_name, status } = req.body;

    const result = await client.query(
      `UPDATE employee_files
       SET current_location = $1,
           assigned_user_id = $2,
           assigned_user_name = $3,
           status = $4,
           updated_at = NOW()
       WHERE id = $5
       RETURNING *`,
      [current_location, assigned_user_id, assigned_user_name, status, id]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error('[updateEmployeeFile]', err);
    res.status(500).json({ error: 'Something went wrong' });
  } finally {
    client.release();
  }
};
