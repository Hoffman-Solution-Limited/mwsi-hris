import { Request, Response } from 'express';
import { pool } from '../db';

export const createDocumentType = async (req: Request, res: Response) => {
  const client = await pool.connect();
  try {
    const { name, created_by } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Document type name is required.' });
    }

    await client.query('BEGIN');

    const docTypeResult = await client.query(
      `INSERT INTO document_types (name, created_by)
       VALUES ($1, $2)
       RETURNING id, name, created_at, created_by || null`,
      [name, created_by]
    );

    const docType = docTypeResult.rows[0];

    const insertDocs = await client.query(
      `INSERT INTO employee_documents (employee_id, document_type_id, document_name, created_at)
      SELECT e.id, $1, $2, NOW()
      FROM employees e
      WHERE NOT EXISTS (
        SELECT 1 FROM employee_documents ed
        WHERE ed.employee_id = e.id AND ed.document_type_id = $1
      )
      RETURNING employee_id`,
      [docType.id, docType.name]
    );

    const employeeCount = insertDocs.rowCount || 0;

    await client.query(`UPDATE employee_files SET updated_at = NOW()`);

    await client.query(
      `UPDATE document_types
       SET employee_count = $1, updated_at = NOW()
       WHERE id = $2`,
      [employeeCount, docType.id]
    );

    await client.query('COMMIT');

    res.status(201).json({
      message: 'Document type created successfully',
      documentType: { ...docType, employee_count: employeeCount },
    });
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

export const getDocumentTypes = async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT dt.*, 
              COUNT(ed.id) AS employee_count
       FROM document_types dt
       LEFT JOIN employee_documents ed ON dt.id = ed.document_type_id
       GROUP BY dt.id
       ORDER BY dt.created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error('[getDocumentTypes]', err);
    res.status(500).json({ error: 'Something went wrong' });
  }
};

export const updateDocumentType = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, updated_by } = req.body;

    const result = await pool.query(
      `UPDATE document_types
       SET name = $1, updated_by = $2, updated_at = NOW()
       WHERE id = $3
       RETURNING *`,
      [name, updated_by, id]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error('[updateDocumentType]', err);
    res.status(500).json({ error: 'Something went wrong' });
  }
};

export const deleteDocumentType = async (req: Request, res: Response) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    await client.query('BEGIN');

    await client.query(`DELETE FROM employee_documents WHERE document_type_id = $1`, [id]);
    await client.query(`DELETE FROM document_types WHERE id = $1`, [id]);

    await client.query('COMMIT');
    res.status(204).send();
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[deleteDocumentType]', err);
    res.status(500).json({ error: 'Something went wrong' });
  } finally {
    client.release();
  }
};

