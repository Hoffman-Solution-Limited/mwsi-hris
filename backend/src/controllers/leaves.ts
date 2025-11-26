import { Request, Response } from 'express';
import { pool } from '../db';

function calculateBusinessDays(startDate: Date, endDate: Date): number {
  let count = 0;
  const curDate = new Date(startDate);

  while (curDate <= endDate) {
    const dayOfWeek = curDate.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) count++;
    curDate.setDate(curDate.getDate() + 1);
  }

  return count;
}

//   const { employee_id, leave_type_id, start_date, end_date, reason, number_of_days } = req.body;

//   try {
//     // Step 1: Get max days for this leave type
//     const leaveTypeResult = await pool.query(
//       `SELECT max_days_per_year FROM leave_types WHERE id = $1`,
//       [leave_type_id]
//     );
//     if (leaveTypeResult.rows.length === 0) {
//       return res.status(400).json({ error: 'Invalid leave type' });
//     }

//     const maxDays = leaveTypeResult.rows[0].max_days_per_year;

//     // Step 2: Calculate total used leave days for this employee & leave type in the current year
//     const usedResult = await pool.query(
//       `
//       SELECT COALESCE(SUM(number_of_days), 0) AS used_days
//       FROM leave_requests
//       WHERE employee_id = $1
//       AND leave_type_id = $2
//       AND EXTRACT(YEAR FROM start_date) = EXTRACT(YEAR FROM CURRENT_DATE)
//       AND status IN ('approved', 'pending_manager', 'pending_hr') -- optional: exclude rejected/cancelled
//       `,
//       [employee_id, leave_type_id]
//     );

//     const usedDays = usedResult.rows[0].used_days;
//     const remainingDays = maxDays - usedDays;

//     // Step 3: Check if applying days exceed remaining days
//     if (number_of_days > remainingDays) {
//       return res.status(400).json({
//         error: `You only have ${remainingDays} remaining day(s) for this leave type. Requested: ${number_of_days}`
//       });
//     }

//     // Step 4: Insert leave application
//     await pool.query(
//       `
//       INSERT INTO leave_requests (employee_id, leave_type_id, start_date, end_date, number_of_days, status, reason, created_at)
//       VALUES ($1, $2, $3, $4, $5, 'pending_manager', $6, NOW())
//       `,
//       [employee_id, leave_type_id, start_date, end_date, number_of_days, reason]
//     );

//     const totalEntitled = maxDays;
//     const year = new Date().getFullYear();
//     // 2️⃣ Insert into leave_balances using totalEntitled
//     const result = await pool.query(
//       `INSERT INTO leave_balances (
//         employee_id, leave_type_id, year, total_entitled, remaining_days
//       ) VALUES ($1, $2, $3, $4, $4)
//       RETURNING *`,
//       [employee_id, leave_type_id, year, totalEntitled]
//     );

//     res.status(201).json({ message: 'Leave request submitted successfully' });
//   } catch (err) {
//     console.error('Error applying for leave:', err);
//     res.status(500).json({ error: 'Something went wrong' });
//   }
// };
export const applyForLeave = async (req: Request, res: Response) => {
  const { employee_id, employee_name, leave_type_id, start_date, end_date, reason, number_of_days } = req.body;
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const leaveTypeResult = await client.query(
      `SELECT max_days_per_year FROM leave_types WHERE id = $1`,
      [leave_type_id]
    );
    if (leaveTypeResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Invalid leave type' });
    }

    const maxDays = leaveTypeResult.rows[0].max_days_per_year;
    const currentYear = new Date().getFullYear();

    const balanceResult = await client.query(
      `
      SELECT *
      FROM leave_balances
      WHERE employee_id = $1
      AND leave_type_id = $2
      AND year = $3
      FOR UPDATE;
      `,
      [employee_id, leave_type_id, currentYear]
    );

    let balanceRow;
    if (balanceResult.rowCount === 0) {
      const insertBal = await client.query(
        `
        INSERT INTO leave_balances (employee_id, leave_type_id, year, total_entitled, used_days, remaining_days, created_at)
        VALUES ($1, $2, $3, $4, 0, $4, NOW())
        RETURNING *;
        `,
        [employee_id, leave_type_id, currentYear, maxDays]
      );
      balanceRow = insertBal.rows[0];
    } else {
      balanceRow = balanceResult.rows[0];
    }

    const { remaining_days, used_days, total_entitled } = balanceRow;

    if (number_of_days > remaining_days) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        error: `You only have ${remaining_days} remaining day(s) for this leave type. Requested: ${number_of_days}`,
      });
    }

    await client.query(
      `
      INSERT INTO leave_requests (employee_id, employee_name, leave_type_id, start_date, end_date, number_of_days, status, reason, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, 'pending_manager', $7, NOW())
      `,
      [employee_id, employee_name, leave_type_id, start_date, end_date, number_of_days, reason]
    );

    const newUsedDays = used_days + number_of_days;
    const newRemainingDays = total_entitled - newUsedDays;

    await client.query(
      `
      UPDATE leave_balances
      SET used_days = $1,
          remaining_days = $2,
          updated_at = NOW()
      WHERE employee_id = $3
      AND leave_type_id = $4
      AND year = $5
      `,
      [newUsedDays, newRemainingDays, employee_id, leave_type_id, currentYear]
    );

    await client.query('COMMIT');
    res.status(201).json({ message: 'Leave request submitted successfully' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[applyForLeave]', err);
    res.status(500).json({ error: 'Something went wrong' });
  } finally {
    client.release();
  }
};

export const getLeaves = async (_req: Request, res: Response) => {
  try {

    const result = await pool.query(
      `
      SELECT l.*, lt.name AS type
      FROM leave_requests l
      JOIN leave_types lt ON lt.id = l.leave_type_id
      ORDER BY l.id DESC;
      `
    );
    res.json(result.rows);
  } catch (error) {
    console.error('[getLeaves]', error);
    res.status(500).json({ error: 'Failed to get leaves' });
  }
};


export const getLeaveById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `
      SELECT l.*, lt.name AS leave_type_name
      FROM leave_requests l
      JOIN leave_types lt ON lt.id = l.leave_type_id
      WHERE l.id = $1
      `,
      [id]
    );

    if (result.rowCount === 0) return res.status(404).json({ error: 'Leave not found' });

    res.json(result.rows[0]);
  } catch (error) {
    console.error('[getLeaveById]', error);
    res.status(500).json({ error: 'Failed to get leave' });
  }
};

export const updateLeave = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { start_date, end_date, reason } = req.body;

  try {
    const start = new Date(start_date);
    const end = new Date(end_date);
    const number_of_days = calculateBusinessDays(start, end);

    const result = await pool.query(
      `
      UPDATE leave_requests
      SET start_date = $1,
          end_date = $2,
          number_of_days = $3,
          reason = $4,
          updated_at = NOW()
      WHERE id = $5 AND status = 'pending_manager'
      RETURNING *;
      `,
      [start, end, number_of_days, reason, id]
    );

    if (result.rowCount === 0) return res.status(404).json({ error: 'Leave not found or already processed' });

    res.json(result.rows[0]);
  } catch (error) {
    console.error('[updateLeave]', error);
    res.status(500).json({ error: 'Failed to update leave' });
  }
};

export const deleteLeave = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `DELETE FROM leave_requests WHERE id = $1 AND status = 'pending_manager' RETURNING *;`,
      [id]
    );

    if (result.rowCount === 0) return res.status(404).json({ error: 'Leave not found or already processed' });

    res.json({ message: 'Leave deleted successfully' });
  } catch (error) {
    console.error('[deleteLeave]', error);
    res.status(500).json({ error: 'Failed to delete leave' });
  }
};

export const managerApproveLeave = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { manager_id } = req.body;

  try {
    const result = await pool.query(
      `
      UPDATE leave_requests
      SET status = 'pending_hr',
          manager_id = $1,
          manager_action_status = 'approved',
          manager_action_date = NOW()
      WHERE id = $2 AND status = 'pending_manager'
      RETURNING *;
      `,
      [manager_id, id]
    );

    if (result.rowCount === 0) return res.status(400).json({ message: 'Invalid leave or already processed' });

    res.json({ message: 'Manager approved successfully', leave: result.rows[0] });
  } catch (error) {
    console.error('[managerApproveLeave]', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const managerRejectLeave = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { manager_id, manager_remarks } = req.body;

  try {
    const result = await pool.query(
      `
      UPDATE leave_requests
      SET status = 'manager_rejected',
          manager_id = $1,
          manager_action_status = 'rejected',
          manager_action_date = NOW(),
          manager_remarks = $2
      WHERE id = $3 AND status = 'pending_manager'
      RETURNING *;
      `,
      [manager_id, manager_remarks, id]
    );

    if (result.rowCount === 0) return res.status(400).json({ message: 'Invalid leave or already processed' });

    res.json({ message: 'Manager rejected successfully', leave: result.rows[0] });
  } catch (error) {
    console.error('[managerRejectLeave]', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const hrApproveLeave = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { hr_id, remarks } = req.body;

  try {
    const result = await pool.query(
      `
      UPDATE leave_requests
      SET status = 'approved',
          hr_id = $1,
          hr_action_status = 'approved',
          hr_action_date = NOW(),
          hr_remarks = $2,
          updated_at = NOW()
      WHERE id = $3 AND status = 'pending_hr'
      RETURNING *;
      `,
      [hr_id, remarks || null, id]
    );

    if (result.rowCount === 0) {
      return res.status(400).json({ message: 'Leave not in pending_hr status' });
    }

    res.json({
      message: 'HR approved successfully',
      leave: result.rows[0],
    });
  } catch (error) {
    console.error('[hrApproveLeave]', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const hrRejectLeave = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { hr_id, hr_remarks } = req.body;
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const leaveResult = await client.query(
      `
      SELECT employee_id, leave_type_id, number_of_days
      FROM leave_requests
      WHERE id = $1 AND status = 'pending_hr'
      FOR UPDATE;
      `,
      [id]
    );

    if (leaveResult.rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Leave not found or already processed' });
    }

    const { employee_id, leave_type_id, number_of_days } = leaveResult.rows[0];
    const year = new Date().getFullYear();

    await client.query(
      `
      UPDATE leave_balances
      SET used_days = used_days - $1,
          remaining_days = remaining_days + $1,
          updated_at = NOW()
      WHERE employee_id = $2
      AND leave_type_id = $3
      AND year = $4
      `,
      [number_of_days, employee_id, leave_type_id, year]
    );

    const updateLeave = await client.query(
      `
      UPDATE leave_requests
      SET status = 'hr_rejected',
          hr_id = $1,
          hr_action_status = 'rejected',
          hr_action_date = NOW(),
          hr_remarks = $2,
          updated_at = NOW()
      WHERE id = $3
      RETURNING *;
      `,
      [hr_id, hr_remarks, id]
    );

    await client.query('COMMIT');
    res.json({ message: 'HR rejected and balance reversed successfully', leave: updateLeave.rows[0] });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('[hrRejectLeave]', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
};

export const getLeaveBalance = async (req: Request, res: Response) => {
  const { employee_id } = req.params;

  console.log("Fetching leave balance for employee:", employee_id);
  
  try {
    const result = await pool.query(
      `
      SELECT 
        e.id AS employee_id,
        e.name AS employee_name,
        lt.id AS leave_type_id,
        lt.name AS leave_type_name,
        lt.max_days_per_year,
        COALESCE(lb.used_days, 0) AS used_days,
        COALESCE(lb.remaining_days, lt.max_days_per_year) AS remaining_days,
        COALESCE(lb.carried_forward, 0) AS carried_forward
      FROM employees e
      CROSS JOIN leave_types lt
      LEFT JOIN leave_balances lb
        ON lb.employee_id = e.id
        AND lb.leave_type_id = lt.id
        AND lb.year = EXTRACT(YEAR FROM CURRENT_DATE)
      WHERE e.id = $1
      ORDER BY lt.name;
      `,
      [employee_id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'No leave types or balances found for this employee' });
    }

    res.json(result.rows);
  } catch (error) {
    console.error('[getLeaveBalance]', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getAllLeaveBalance = async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      `
      SELECT 
        e.id AS employee_id,
        e.name AS employee_name,
        e.department,
        e.station_name,
        lt.id AS leave_type_id,
        lt.name AS leave_type_name,
        lt.max_days_per_year,
        COALESCE(lb.used_days, 0) AS used_days,
        COALESCE(lb.remaining_days, lt.max_days_per_year) AS remaining_days
      FROM employees e
      CROSS JOIN leave_types lt
      LEFT JOIN leave_balances lb
        ON lb.employee_id = e.id
        AND lb.leave_type_id = lt.id
        AND lb.year = EXTRACT(YEAR FROM CURRENT_DATE)
      ORDER BY e.name, lt.name;
      `
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'No leave balances found' });
    }

    res.json(result.rows);
  } catch (error) {
    console.error('[getAllLeaveBalance]', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getUsedLeaveDays = async (req: Request, res: Response) => {
  const { employee_id, leave_type_id } = req.params;
  try {
    const result = await pool.query(
      `
      SELECT used_days
      FROM leave_balances
      WHERE employee_id = $1
      AND leave_type_id = $2
      AND year = EXTRACT(YEAR FROM CURRENT_DATE);
      `,
      [employee_id, leave_type_id]
    );

    if (result.rowCount === 0) return res.status(404).json({ message: 'Used days not found for the specified employee and leave type' });

    res.json({ usedDays: result.rows[0].used_days });
  } catch (error) {
    console.error('[getUsedLeaveDays]', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getPendingApprovalsForManager = async (req: Request, res: Response) => {
  const { manager_id } = req.params;
  try {
    const result = await pool.query(
      `
      SELECT l.*, lt.name as leave_type_name
      FROM leave_requests l
      JOIN leave_types lt ON lt.id = l.leave_type_id
      WHERE l.manager_id = $1 AND l.status = 'pending_manager';
      `,
      [manager_id]
    );
    res.json({ pending: result.rows });
  } catch (error) {
    console.error('[getPendingApprovalsForManager]', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


export const getPendingApprovalsForHR = async (_req: Request, res: Response) => {
  try {
    const result = await pool.query(
      `
      SELECT l.*, lt.name as leave_type_name
      FROM leave_requests l
      JOIN leave_types lt ON lt.id = l.leave_type_id
      WHERE l.status = 'pending_hr';
      `
    );
    res.json({ pending: result.rows });
  } catch (error) {
    console.error('[getPendingApprovalsForHR]', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};



