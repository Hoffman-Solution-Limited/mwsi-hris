import { Request, Response } from 'express';
import { pool } from '../db';

export const getFileMovements = async (req: Request, res: Response) => {
  try {
    const { employeeId } = req.params;

    // 1️⃣ Get all movements for the employee
    const movementResult = await pool.query(
      `
      SELECT 
        fm.id AS movement_id,
        fm.employee_id,
        e.name AS employee_name,
        ef.id AS file_id,
        ef.file_number,
        fm.by_user_name,
        fm.from_location,
        fm.to_location,
        fm.action,
        fm.remarks,
        fm.timestamp
      FROM file_movements fm
      JOIN employees e ON e.id = fm.employee_id
      JOIN employee_files ef ON ef.id = fm.file_id
      WHERE fm.employee_id = $1
      ORDER BY fm.timestamp DESC
      `,
      [employeeId]
    );

    if (movementResult.rowCount === 0) {
      return res.status(404).json({ message: 'No file movement history found' });
    }

    // 2️⃣ Get all documents for this employee's file
    const documentsResult = await pool.query(
      `
      SELECT 
        ed.id AS document_id,
        ed.employee_id,
        ed.document_type_id,
        dt.name AS document_type_name,
        ed.file_url,
        ed.file_type,
        ed.uploaded_at
      FROM employee_documents ed
      JOIN document_types dt ON dt.id = ed.document_type_id
      WHERE ed.employee_id = $1
      ORDER BY dt.name ASC
      `,
      [employeeId]
    );

    // Combine results
    const data = {
      employee_id: employeeId,
      employee_name: movementResult.rows[0].employee_name,
      file_id: movementResult.rows[0].file_id,
      file_number: movementResult.rows[0].file_number,
      documents: documentsResult.rows,
      movements: movementResult.rows,
    };

    res.json(data);
  } catch (err) {
    console.error('[getFileMovements]', err);
    res.status(500).json({ error: 'Something went wrong while fetching file movements' });
  }
};

export const getAllFileMovements = async (_req: Request, res: Response) => {
  try {
    const result = await pool.query(
      `
      SELECT 
        fm.id AS movement_id,
        fm.employee_id,
        e.name AS employee_name,
        ef.id AS file_id,
        ef.file_number,
        ef.current_location,
        ef.assigned_user_name,
        fm.by_user_name,
        fm.from_location,
        fm.to_location,
        fm.action,
        fm.remarks,
        fm.timestamp,
        COUNT(ed.id) AS total_documents
      FROM file_movements fm
      JOIN employees e ON e.id = fm.employee_id
      JOIN employee_files ef ON ef.id = fm.file_id
      LEFT JOIN employee_documents ed ON ed.employee_id = fm.employee_id
      GROUP BY 
        fm.id, 
        e.name, 
        ef.id, 
        ef.file_number, 
        ef.current_location, 
        ef.assigned_user_name
      ORDER BY fm.timestamp DESC
      `
    );

    res.json(result.rows);
  } catch (err) {
    console.error('[getAllFileMovements]', err);
    res.status(500).json({ error: 'Something went wrong while fetching file movement records' });
  }
};

