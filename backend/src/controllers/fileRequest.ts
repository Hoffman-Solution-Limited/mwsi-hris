import { Request, Response } from 'express';
import { pool } from '../db';

export const requestFile = async (req: Request, res: Response) => {
  try {
    const { employee_id, file_id, document_type, requested_by_user_id, requested_by_name, requested_by_department, remarks } = req.body;
    const result = await pool.query(
      `INSERT INTO file_requests (employee_id, file_id, document_type, requested_by_user_id, requested_by_name, requested_by_department, remarks)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [employee_id, file_id, document_type, requested_by_user_id, requested_by_name, requested_by_department, remarks]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error('[requestFile]', err);
    res.status(500).json({ error: 'Something went wrong' });
  }
};

export const approveRequest = async (req: Request, res: Response) => {
  const client = await pool.connect();
  try {
    const { requestId } = req.params;
    const { registry_user_id, registry_user_name, to_location, to_assignee_user_id, to_assignee_name, remarks } = req.body;

    await client.query('BEGIN');

    const request = await client.query(`SELECT * FROM file_requests WHERE id=$1`, [requestId]);
    if (request.rowCount === 0) throw new Error('Request not found');
    const fileId = request.rows[0].file_id;

    await client.query(`UPDATE file_requests SET status='APPROVED', updated_at=NOW() WHERE id=$1`, [requestId]);

    await client.query(
      `INSERT INTO file_movements (employee_id, file_id, by_user_id, by_user_name, from_location, to_location, to_assignee_user_id, to_assignee_name, action, remarks)
       VALUES ($1,$2,$3,$4,'Registry',$5,$6,$7,'APPROVE',$8)`,
      [request.rows[0].employee_id, fileId, registry_user_id, registry_user_name, to_location, to_assignee_user_id, to_assignee_name, remarks]
    );

    await client.query(
      `UPDATE employee_files
       SET current_location=$1, assigned_user_id=$2, assigned_user_name=$3, updated_at=NOW()
       WHERE employee_id=$4`,
      [to_location, to_assignee_user_id, to_assignee_name, request.rows[0].employee_id]
    );

    await client.query('COMMIT');
    res.json({ message: 'File request approved and file moved successfully' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[approveRequest]', err);
    res.status(500).json({ error: 'Something went wrong' });
  } finally {
    client.release();
  }
};

export const rejectRequest = async (req: Request, res: Response) => {
  try {
    const { requestId } = req.params;
    const { remarks } = req.body;
    await pool.query(
      `UPDATE file_requests SET status='REJECTED', remarks=$2, updated_at=NOW() WHERE id=$1`,
      [requestId, remarks]
    );
    res.json({ message: 'File request rejected' });
  } catch (err) {
    console.error('[rejectRequest]', err);
    res.status(500).json({ error: 'Something went wrong' });
  }
};

export const getAllFileRequests = async (req: Request, res: Response) => {
  try {
    const result = await pool.query(`SELECT * FROM file_requests ORDER BY created_at DESC`);
    res.json(result.rows);
  } catch (err) {
    console.error('[getAllFileRequests]', err);
    res.status(500).json({ error: 'Something went wrong' });
  }
};