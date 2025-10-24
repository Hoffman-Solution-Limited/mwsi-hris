import { Request, Response } from 'express';
import { pool } from '../db';

export const getFileMovements = async (req: Request, res: Response) => {
  try {
    const { employeeId } = req.params;
    const result = await pool.query(
      `SELECT * FROM file_movements WHERE employee_id = $1 ORDER BY timestamp DESC`,
      [employeeId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('[getFileMovements]', err);
    res.status(500).json({ error: 'Something went wrong' });
  }
};

export const returnFileToRegistry = async (req: Request, res: Response) => {
  const client = await pool.connect();
  try {
    const { fileId } = req.params;
    const { by_user_id, by_user_name, remarks } = req.body;

    const file = await client.query(`SELECT * FROM employee_files WHERE employee_id=$1`, [fileId]);
    if (file.rowCount === 0) throw new Error('File not found');

    await client.query('BEGIN');

    await client.query(
      `INSERT INTO file_movements (employee_id, file_id, by_user_id, by_user_name, from_location, to_location, action, remarks)
       VALUES ($1,$1,$2,$3,$4,'Registry','RETURN',$5)`,
      [fileId, by_user_id, by_user_name, file.rows[0].current_location, remarks]
    );

    await client.query(
      `UPDATE employee_files SET current_location='Registry', assigned_user_id=NULL, assigned_user_name=NULL, updated_at=NOW()
       WHERE employee_id=$1`,
      [fileId]
    );

    await client.query(
      `UPDATE file_requests SET status='RETURNED', updated_at=NOW() WHERE file_id=$1 AND status='APPROVED'`,
      [fileId]
    );

    await client.query('COMMIT');
    res.json({ message: 'File returned to registry successfully' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[returnFileToRegistry]', err);
    res.status(500).json({ error: 'Something went wrong' });
  } finally {
    client.release();
  }
};
