import { Request, Response } from 'express';
import { pool } from '../db';
export const requestFile = async (req: Request, res: Response) => {
  const client = await pool.connect();
  try {
    const {
      employee_id,
      file_id,
      document_type_ids,
      requested_by_user_id,
      requested_by_name,
      requested_by_department,
      remarks,
    } = req.body;

    if (!Array.isArray(document_type_ids) || document_type_ids.length === 0) {
      return res.status(400).json({ error: 'At least one document_type_id is required' });
    }

    await client.query('BEGIN');

    // 1️⃣ Validate file
    const fileCheck = await client.query(
      `SELECT 1 FROM employee_files WHERE id = $1 AND employee_id = $2`,
      [file_id, employee_id]
    );
    if (fileCheck.rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Employee file not found' });
    }

    // 2️⃣ Create file request
    const requestResult = await client.query(
      `INSERT INTO file_requests 
        (employee_id, file_id, requested_by_user_id, requested_by_name, requested_by_department, remarks)
       VALUES ($1,$2,$3,$4,$5,$6)
       RETURNING *`,
      [employee_id, file_id, requested_by_user_id, requested_by_name, requested_by_department, remarks]
    );
    const request = requestResult.rows[0];

    // 3️⃣ Add all requested documents
    const insertValues: string[] = [];
    const params: any[] = [];
    let index = 1;

    document_type_ids.forEach((docId) => {
      insertValues.push(`($${index++}, $${index++})`);
      params.push(request.id, docId);
    });

    await client.query(
      `INSERT INTO file_request_documents (request_id, document_type_id) VALUES ${insertValues.join(', ')}`,
      params
    );

    await client.query('COMMIT');

    res.status(201).json({
      ...request,
      document_type_ids,
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[requestFile]', err);
    res.status(500).json({ error: 'Something went wrong creating request' });
  } finally {
    client.release();
  }
};
export const getAllFileRequests = async (req: Request, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT 
        fr.*,
        e.name AS employee_name,
        e.department AS employee_department,
        ef.file_number,
        ef.current_location,
        ef.assigned_user_name,
        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object(
              'id', dt.id,
              'name', dt.name
            )
          ) FILTER (WHERE dt.id IS NOT NULL),
          '[]'
        ) AS documents
      FROM file_requests fr
      LEFT JOIN employees e ON fr.employee_id = e.id
      LEFT JOIN employee_files ef ON fr.file_id = ef.id
      LEFT JOIN file_request_documents frd ON fr.id = frd.request_id
      LEFT JOIN document_types dt ON frd.document_type_id = dt.id
      GROUP BY fr.id, e.name, e.department, ef.file_number, ef.current_location, ef.assigned_user_name
      ORDER BY fr.created_at DESC
    `);

    res.json(result.rows);
  } catch (err) {
    console.error('[getAllFileRequests]', err);
    res.status(500).json({ error: 'Something went wrong fetching file requests' });
  }
};

export const getFileRequestsByEmployee = async (req: Request, res: Response) => {
  try {
    const { employeeId } = req.params;

    if (!employeeId) {
      return res.status(400).json({ error: 'Employee ID is required' });
    }

    const result = await pool.query(
      `
      SELECT 
        fr.*,
        e.name AS employee_name,
        e.department AS employee_department,
        ef.file_number,
        ef.current_location,
        ef.assigned_user_name,
        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object(
              'id', dt.id,
              'name', dt.name
            )
          ) FILTER (WHERE dt.id IS NOT NULL),
          '[]'
        ) AS documents
      FROM file_requests fr
      LEFT JOIN employees e ON fr.employee_id = e.id
      LEFT JOIN employee_files ef ON fr.file_id = ef.id
      LEFT JOIN file_request_documents frd ON fr.id = frd.request_id
      LEFT JOIN document_types dt ON frd.document_type_id = dt.id
      WHERE fr.employee_id = $1
      GROUP BY fr.id, e.name, e.department, ef.file_number, ef.current_location, ef.assigned_user_name
      ORDER BY fr.created_at DESC
      `,
      [employeeId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error('[getFileRequestsByEmployee]', err);
    res.status(500).json({ error: 'Something went wrong fetching file requests for the employee' });
  }
};

export const approveRequest = async (req: Request, res: Response) => {
  const client = await pool.connect();
  try {
    const { requestId } = req.params;
    const { registry_user_id, registry_user_name, remarks } = req.body;

    await client.query('BEGIN');

    const request = await client.query(`SELECT * FROM file_requests WHERE id=$1`, [requestId]);
    if (request.rowCount === 0) throw new Error('Request not found');

    const fileId = request.rows[0].file_id;
    const employeeId = request.rows[0].employee_id;
    const toUserId = request.rows[0].requested_by_user_id;
    const toUserName = request.rows[0].requested_by_name;
    const toDepartment = request.rows[0].requested_by_department;

    // Update file_requests table
    await client.query(
      `UPDATE file_requests SET status='approved', updated_at=NOW(), remarks=$2 WHERE id=$1`,
      [requestId, remarks]
    );

    // Update employee_files table
    await client.query(
      `UPDATE employee_files
       SET current_location=$1,
           assigned_user_id=$2,
           assigned_user_name=$3,
           updated_at=NOW()
       WHERE employee_id=$4`,
      [toDepartment,toUserId, toUserName, employeeId]
    );

    // Log file movement
    await client.query(
      `INSERT INTO file_movements 
       (employee_id, file_id, by_user_id, by_user_name, from_location, to_location, action, remarks)
       VALUES ($1,$2,$3,$4,'Registry',$5,'APPROVE',$6)`,
      [employeeId, fileId, registry_user_id, registry_user_name, toDepartment, remarks]
    );

    await client.query('COMMIT');
    res.json({ message: 'File request approved and file moved successfully' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[approveRequest]', err);
    res.status(500).json({ error: 'Something went wrong approving request' });
  } finally {
    client.release();
  }
};

export const rejectRequest = async (req: Request, res: Response) => {
  try {
    const { requestId } = req.params;
    const { remarks } = req.body;
    const result = await pool.query(
      `UPDATE file_requests 
       SET status='rejected', remarks=$2, updated_at=NOW() 
       WHERE id=$1 RETURNING *`,
      [requestId, remarks]
    );

    if (result.rowCount === 0) return res.status(404).json({ error: 'Request not found' });
    res.json({ message: 'File request rejected successfully', request: result.rows[0] });
  } catch (err) {
    console.error('[rejectRequest]', err);
    res.status(500).json({ error: 'Something went wrong rejecting request' });
  }
};

export const returnFile = async (req: Request, res: Response) => {
  const client = await pool.connect();
  try {
    const { requestId } = req.params;
    const { registry_user_id, registry_user_name, remarks } = req.body;

    await client.query('BEGIN');

    const request = await client.query(`SELECT * FROM file_requests WHERE id=$1`, [requestId]);
    if (request.rowCount === 0) throw new Error('Request not found');

    const fileId = request.rows[0].file_id;
    const employeeId = request.rows[0].employee_id;
    const fromDepartment = request.rows[0].requested_by_department;

    // Update file_requests status
    await client.query(
      `UPDATE file_requests 
       SET status='returned', updated_at=NOW(), remarks=$2 
       WHERE id=$1`,
      [requestId, remarks]
    );

    // Update employee_files
    await client.query(
      `UPDATE employee_files
       SET current_location='registry',
           assigned_user_id=NULL,
           assigned_user_name=NULL,
           updated_at=NOW()
       WHERE employee_id=$1`,
      [employeeId]
    );

    // Record file movement
    await client.query(
      `INSERT INTO file_movements 
       (employee_id, file_id, by_user_id, by_user_name, from_location, to_location, action, remarks)
       VALUES ($1,$2,$3,$4,$5,'Registry','RETURN',$6)`,
      [employeeId, fileId, registry_user_id, registry_user_name, fromDepartment, remarks]
    );

    await client.query('COMMIT');
    res.json({ message: 'File returned successfully' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[returnFile]', err);
    res.status(500).json({ error: 'Something went wrong returning file' });
  } finally {
    client.release();
  }
};

export const getFileRequestsByStatus = async (req: Request, res: Response) => {
  try {
    const { status } = req.query;
    const filterStatus = (status as string)?.toLowerCase() || 'pending';

    const result = await pool.query(
      `
      SELECT fr.*, 
             e.name AS employee_name,
             e.department AS employee_department,
             dt.name AS document_type_name,
             ef.file_number,
             ef.current_location,
             ef.assigned_user_name
      FROM file_requests fr
      LEFT JOIN employees e ON fr.employee_id = e.id
      LEFT JOIN employee_files ef ON fr.file_id = ef.id
      LEFT JOIN document_types dt ON fr.document_type_id = dt.id
      WHERE LOWER(fr.status) = $1
      ORDER BY fr.created_at DESC
      `,
      [filterStatus]
    );

    res.json(result.rows);
  } catch (err) {
    console.error('[getFileRequestsByStatus]', err);
    res.status(500).json({ error: 'Something went wrong fetching file requests by status' });
  }
};
