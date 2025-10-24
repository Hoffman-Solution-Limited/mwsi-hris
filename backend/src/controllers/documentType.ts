import { Request, Response } from 'express';
import { pool } from '../db';

// export const createDocumentType = async (req: Request, res: Response) => {
//   try {
//     const { name, created_by } = req.body;
//     const result = await pool.query(
//       `INSERT INTO document_types (name, created_by)
//        VALUES ($1, $2) RETURNING *`,
//       [name, created_by]
//     );
//     res.json(result.rows[0]);
//   } catch (err) {
//     console.error('[createDocumentType]', err);
//     res.status(500).json({ error: 'Something went wrong' });
//   }
// };
export const createDocumentType = async (req: Request, res: Response) => {
  const client = await pool.connect();
  try {
    const { name, created_by } = req.body;

    await client.query('BEGIN');

    // 1. Create the new document type
    const docResult = await client.query(
      `INSERT INTO document_types (name, created_by)
       VALUES ($1, $2) RETURNING *`,
      [name, created_by]
    );

    const docType = docResult.rows[0];

    // 2. Update all existing employee files to include the new document
    // (Assuming default_documents is an array column)
    await client.query(
      `UPDATE employee_files 
       SET default_documents = array_append(default_documents, $1)
       WHERE NOT default_documents @> ARRAY[$1]`,
      [docType.name]
    );

    await client.query('COMMIT');

    res.status(201).json(docType);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[createDocumentType]', err);
    res.status(500).json({ error: 'Something went wrong' });
  } finally {
    client.release();
  }
};


export const getDocumentType = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query(`SELECT * FROM document_types WHERE id = $1`, [id]);
    res.json(result.rows[0]);
  } catch (err) {
    console.error('[getDocumentType]', err);
    res.status(500).json({ error: 'Something went wrong' });
  }
};

export const updateDocumentType = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, updated_by } = req.body;
    const result = await pool.query(
      `UPDATE document_types SET name = $1, updated_by = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *`,
      [name, updated_by, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error('[updateDocumentType]', err);
    res.status(500).json({ error: 'Something went wrong' });
  }
};

export const getDocumentTypes = async (req: Request, res: Response) => {
  try {
    const result = await pool.query(`SELECT * FROM document_types ORDER BY created_at DESC`);
    res.json(result.rows);
  } catch (err) {
    console.error('[getDocumentTypes]', err);
    res.status(500).json({ error: 'Something went wrong' });
  }
};

export const deleteDocumentType = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await pool.query(`DELETE FROM document_types WHERE id = $1`, [id]);
    res.status(204).send();
  } catch (err) {
    console.error('[deleteDocumentType]', err);
    res.status(500).json({ error: 'Something went wrong' });
  }
};
