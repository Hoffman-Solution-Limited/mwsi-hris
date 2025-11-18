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
// import { Request, Response } from 'express';
// import { pool } from '../db';

// // CREATE Employee File (Manual)
// export const createEmployeeFile = async (req: Request, res: Response) => {
//   const client = await pool.connect();
//   try {
//     const { employee_id, file_number } = req.body;
//     await client.query('BEGIN');

//     // get all document types
//     const docsResult = await client.query(`SELECT name FROM document_types`);
//     const docs = docsResult.rows.map(r => r.name);

//     const result = await client.query(
//       `INSERT INTO employee_files (employee_id, file_number, default_documents)
//        VALUES ($1, $2, $3) RETURNING *`,
//       [employee_id, file_number, docs]
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

// // GET all files
// export const getAllEmployeeFiles = async (req: Request, res: Response) => {
//   try {
//     const result = await pool.query(`SELECT * FROM employee_files ORDER BY created_at DESC`);
//     res.json(result.rows);
//   } catch (err) {
//     console.error('[getAllEmployeeFiles]', err);
//     res.status(500).json({ error: 'Something went wrong' });
//   }
// };

// // GET file by employee
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

// // UPDATE file info
// export const updateEmployeeFile = async (req: Request, res: Response) => {
//   const client = await pool.connect();
//   try {
//     const { id } = req.params;
//     const { current_location, assigned_user_id, assigned_user_name, status } = req.body;

//     const result = await client.query(
//       `UPDATE employee_files
//        SET current_location = $1,
//            assigned_user_id = $2,
//            assigned_user_name = $3,
//            status = $4,
//            updated_at = NOW()
//        WHERE id = $5
//        RETURNING *`,
//       [current_location, assigned_user_id, assigned_user_name, status, id]
//     );

//     res.json(result.rows[0]);
//   } catch (err) {
//     console.error('[updateEmployeeFile]', err);
//     res.status(500).json({ error: 'Something went wrong' });
//   } finally {
//     client.release();
//   }
// };
import { Request, Response } from 'express';
import { pool } from '../db';

// ======================================================
// CREATE Employee File
// ======================================================
// export const createEmployeeFile = async (req: Request, res: Response) => {
//   const client = await pool.connect();
//   try {
//     const { employee_id, file_number } = req.body;

//     // 1️⃣ Create employee file
//     const fileResult = await client.query(
//       `INSERT INTO employee_files (employee_id, file_number)
//        VALUES ($1, $2)
//        RETURNING *`,
//       [employee_id, file_number]
//     );
//     const employeeFile = fileResult.rows[0];

//       // Create default movement entry
//     await client.query(
//       `INSERT INTO file_movements 
//         (employee_id, file_id, by_user_id, by_user_name, from_location, to_location, action, remarks)
//        VALUES ($1, $2, $3, $4, '-', 'Registry', 'CREATE',
//        COALESCE($5, 'Auto-created employee file'))`,
//       [
//         employee_id,
//         file.id,
//         created_by_user_id || null,
//         created_by_user_name || 'System',
//         remarks
//       ]
//     );

//     // 2️⃣ Get all document types
//     const docTypesResult = await client.query(
//       `SELECT id, name FROM document_types`
//     );
//     const docTypes = docTypesResult.rows;

//     // 3️⃣ Create an employee document entry for each document type
//     if (docTypes.length > 0) {
//       const values: string[] = [];
//       const params: any[] = [];
//       let paramIndex = 1;

//       docTypes.forEach((dt) => {
//         values.push(`($${paramIndex++}, $${paramIndex++}, $${paramIndex++})`);
//         params.push(employee_id, dt.id, dt.name);
//       });

//       await client.query(
//         `
//         INSERT INTO employee_documents (employee_id, document_type_id, document_name)
//         VALUES ${values.join(', ')}
//         ON CONFLICT (employee_id, document_type_id) DO NOTHING
//         `,
//         params
//       );
//     }

//     // 4️⃣ Get full file details with documents
//     const fileWithDocs = await client.query(
//       `
//       SELECT ef.*,
//              COALESCE(
//                json_agg(
//                  json_build_object(
//                    'id', ed.id,
//                    'document_type_id', ed.document_type_id,
//                    'document_name', ed.document_name,
//                    'file_url', ed.file_url,
//                    'file_type', ed.file_type,
//                    'is_verified', ed.is_verified,
//                    'uploaded_by_name', ed.uploaded_by_name,
//                    'uploaded_at', ed.uploaded_at
//                  )
//                  ORDER BY ed.created_at
//                ) FILTER (WHERE ed.id IS NOT NULL),
//                '[]'
//              ) AS documents
//       FROM employee_files ef
//       LEFT JOIN employee_documents ed ON ed.employee_id = ef.employee_id
//       WHERE ef.id = $1
//       GROUP BY ef.id
//       `,
//       [employeeFile.id]
//     );

//     res.status(201).json(fileWithDocs.rows[0]);
//   } catch (err) {
//     console.error('[createEmployeeFile]', err);
//     res.status(500).json({ error: 'Something went wrong creating employee file' });
//   } finally {
//     client.release();
//   }
// };
export const createEmployeeFile = async (req: Request, res: Response) => {
  const client = await pool.connect();
  try {
    const {
      employee_id,
      file_number,
      created_by_user_id,
      created_by_user_name,
      remarks
    } = req.body;

    if (!employee_id) {
      return res.status(400).json({ error: "Employee ID is required" });
    }

    await client.query("BEGIN");

    // 1️⃣ Create employee file
    const fileResult = await client.query(
      `INSERT INTO employee_files (employee_id, file_number, current_location, status)
       VALUES ($1, COALESCE($2, CONCAT('FILE-', $1)), 'Registry', 'available')
       RETURNING *`,
      [employee_id, file_number]
    );
    const employeeFile = fileResult.rows[0];

    // 2️⃣ Log default movement (auto-created)
    await client.query(
      `INSERT INTO file_movements 
        (employee_id, file_id, by_user_id, by_user_name, from_location, to_location, action, remarks)
       VALUES ($1, $2, $3, $4, '-', 'Registry', 'CREATE',
       COALESCE($5, 'Auto-created employee file'))`,
      [
        employee_id,
        employeeFile.id,
        created_by_user_id || null,
        created_by_user_name || "System",
        remarks,
      ]
    );

    // 3️⃣ Get all document types
    const docTypesResult = await client.query(`SELECT id, name FROM document_types`);
    const docTypes = docTypesResult.rows;

    // 4️⃣ Create employee_documents for each doc type
    if (docTypes.length > 0) {
      const values: string[] = [];
      const params: any[] = [];
      let i = 1;

      for (const dt of docTypes) {
        values.push(`($${i++}, $${i++}, $${i++}, NOW())`);
        params.push(employee_id, dt.id, dt.name);
      }

      await client.query(
        `INSERT INTO employee_documents (employee_id, document_type_id, document_name, created_at)
         VALUES ${values.join(", ")}
         ON CONFLICT (employee_id, document_type_id) DO NOTHING`,
        params
      );
    }

    // 5️⃣ Update document_types employee count
    await client.query(`
      UPDATE document_types
      SET employee_count = (
        SELECT COUNT(*) FROM employee_documents ed WHERE ed.document_type_id = document_types.id
      ),
      updated_at = NOW()
    `);

    // 6️⃣ Get full file details with documents
    const fileWithDocs = await client.query(
      `
      SELECT ef.*,
             COALESCE(
               json_agg(
                 json_build_object(
                   'id', ed.id,
                   'document_type_id', ed.document_type_id,
                   'document_name', ed.document_name,
                   'file_url', ed.file_url,
                   'file_type', ed.file_type,
                   'is_verified', ed.is_verified,
                   'uploaded_by_name', ed.uploaded_by_name,
                   'uploaded_at', ed.uploaded_at
                 )
                 ORDER BY ed.created_at
               ) FILTER (WHERE ed.id IS NOT NULL),
               '[]'
             ) AS documents
      FROM employee_files ef
      LEFT JOIN employee_documents ed ON ed.employee_id = ef.employee_id
      WHERE ef.id = $1
      GROUP BY ef.id
      `,
      [employeeFile.id]
    );

    await client.query("COMMIT");
    res.status(201).json(fileWithDocs.rows[0]);
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("[createEmployeeFile]", err);
    res.status(500).json({ error: "Something went wrong creating employee file" });
  } finally {
    client.release();
  }
};

// ======================================================
// GET All Employee Files
// ======================================================
export const getAllEmployeeFiles = async (_req: Request, res: Response) => {
  try {
    const result = await pool.query(
      `
      SELECT ef.*,
             COALESCE(
               json_agg(
                 json_build_object(
                   'id', ed.id,
                   'document_type_id', ed.document_type_id,
                   'document_name', ed.document_name,
                   'file_url', ed.file_url,
                   'file_type', ed.file_type,
                   'is_verified', ed.is_verified,
                   'uploaded_by_name', ed.uploaded_by_name,
                   'uploaded_at', ed.uploaded_at
                 )
                 ORDER BY ed.created_at
               ) FILTER (WHERE ed.id IS NOT NULL),
               '[]'
             ) AS documents
      FROM employee_files ef
      LEFT JOIN employee_documents ed ON ed.employee_id = ef.employee_id
      GROUP BY ef.id
      ORDER BY ef.created_at DESC
      `
    );

    res.json(result.rows);
  } catch (err) {
    console.error('[getAllEmployeeFiles]', err);
    res.status(500).json({ error: 'Something went wrong fetching employee files' });
  }
};

// ======================================================
// GET File by Employee
// ======================================================
export const getFileByEmployee = async (req: Request, res: Response) => {
  try {
    const { employeeId } = req.params;

    const result = await pool.query(
      `
      SELECT ef.*,
             COALESCE(
               json_agg(
                 json_build_object(
                   'id', ed.id,
                   'document_type_id', ed.document_type_id,
                   'document_name', ed.document_name,
                   'file_url', ed.file_url,
                   'file_type', ed.file_type,
                   'is_verified', ed.is_verified,
                   'uploaded_by_name', ed.uploaded_by_name,
                   'uploaded_at', ed.uploaded_at
                 )
                 ORDER BY ed.created_at
               ) FILTER (WHERE ed.id IS NOT NULL),
               '[]'
             ) AS documents
      FROM employee_files ef
      LEFT JOIN employee_documents ed ON ed.employee_id = ef.employee_id
      WHERE ef.employee_id = $1
      GROUP BY ef.id
      `,
      [employeeId]
    );

    if (result.rowCount === 0)
      return res.status(404).json({ error: 'Employee file not found' });

    res.json(result.rows[0]);
  } catch (err) {
    console.error('[getFileByEmployee]', err);
    res.status(500).json({ error: 'Something went wrong fetching employee file' });
  }
};

// ======================================================
// UPDATE Employee File Info
// ======================================================
export const updateEmployeeFile = async (req: Request, res: Response) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    const { current_location, assigned_user_id, assigned_user_name, status } = req.body;

    const result = await client.query(
      `
      UPDATE employee_files
      SET current_location = COALESCE($1, current_location),
          assigned_user_id = COALESCE($2, assigned_user_id),
          assigned_user_name = COALESCE($3, assigned_user_name),
          status = COALESCE($4, status),
          updated_at = NOW()
      WHERE id = $5
      RETURNING *
      `,
      [current_location, assigned_user_id, assigned_user_name, status, id]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error('[updateEmployeeFile]', err);
    res.status(500).json({ error: 'Something went wrong updating file info' });
  } finally {
    client.release();
  }
};
