
// import { Request, Response } from 'express';
// import { pool } from '../db';
// import { Leave } from '../types';
// import { v4 as uuidv4 } from 'uuid';

// // Create Leave
// export const applyForLeave = async (req: Request, res: Response): Promise<void> => {
//   try {
//     const {
//       employee_id,
//       employee_name,
//       leave_type_id,
//       start_date,
//       end_date,
//       days,
//       status,
//       reason
//     } = req.body as Leave;

//     const id = uuidv4();

//     const result = await pool.query<Leave>(
//       `INSERT INTO leave_requests (
//         id, employee_id, employee_name, leave_type_id,
//         start_date, end_date, days, status, reason,
//         applied_date, manager_comments, hr_comments,
//         approved_by, approved_date
//       ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,NOW(),NULL,NULL,NULL,NULL)
//       RETURNING *`,
//       [
//         id,
//         employee_id,
//         employee_name,
//         leave_type_id,
//         start_date,
//         end_date,
//         days,
//         status ?? 'pending_manager',
//         reason
//       ]
//     );

//     res.status(201).json(result.rows[0]);
//   } catch (error) {
//     console.error('[createLeave]', error);
//     res.status(500).json({ error: 'Failed to create leave' });
//   }
// };


// export const getLeaves = async (_req: Request, res: Response): Promise<void> => {
//   try {
//     const result = await pool.query<Leave>(
//       `SELECT l.*, lt.name AS type
//        FROM leave_requests l
//        JOIN leave_types lt ON lt.id = l.leave_type_id
//        ORDER BY l.id DESC`
//     )

//     const dto: Leave[] = result.rows
//     res.json(dto)
//   } catch (error) {
//     console.error('[getLeaves]', error)
//     res.status(500).json({ error: 'Failed to get leaves' })
//   }
// }

// export const getLeaveById = async (req: Request, res: Response): Promise<void> => {
//   try {
//     const { id } = req.params
//     const result = await pool.query<Leave>(
//       `SELECT l.*, lt.name AS type
//        FROM leave_requests l
//        JOIN leave_types lt ON lt.id = l.leave_type_id
//        WHERE l.id = $1`,
//       [id]
//     )

//     if (result.rows.length === 0) {
//       res.status(404).json({ error: 'Leave not found' })
//       return
//     }

//     res.json(result.rows[0])
//   } catch (error) {
//     console.error('[getLeaveById]', error)
//     res.status(500).json({ error: 'Failed to get leave' })
//   }
// }

// // Update Leave
// export const updateLeave = async (req: Request, res: Response): Promise<void> => {
//   try {
//     const { id } = req.params
//     const {
//       start_date,
//       end_date,
//       days,
//       status,
//       reason
//     } = req.body as Leave

//     const result = await pool.query<Leave>(
//       `UPDATE leave_requests SET
//         start_date = $1,
//         end_date = $2,
//         days = $3,
//         status = $4,
//         reason = $5
//        WHERE id = $6
//        RETURNING *`,
//       [start_date, end_date, days, status, reason, id]
//     )

//     if (result.rows.length === 0) {
//       res.status(404).json({ error: 'Leave not found' })
//       return
//     }

//     res.json(result.rows[0])
//   } catch (error) {
//     console.error('[updateLeave]', error)
//     res.status(500).json({ error: 'Failed to update leave' })
//   }
// }

// export const deleteLeave = async (req: Request, res: Response): Promise<void> => {
//   try {
//     const { id } = req.params
//     const result = await pool.query('DELETE FROM leave_requests WHERE id = $1 RETURNING *', [id])
//     if (result.rows.length === 0) {
//       res.status(404).json({ error: 'Leave not found' })
//       return
//     }
//     res.json({ message: 'Leave deleted successfully' })
//   } catch (error) {
//     console.error('[deleteLeave]', error)
//     res.status(500).json({ error: 'Failed to delete leave' })
//   }
// }

// // Assign leave to HR (set status to 'Pending HR')
// export const managerApproveLeave = async (req: Request, res: Response): Promise<void> => {
//   try {
//     const { id } = req.params;
//     const { approver_id } = req.body;
//     const result = await pool.query(
//       `UPDATE leave_requests SET status = 'pending_hr', approved_by = $1 WHERE id = $2 RETURNING *`,
//       [approver_id, id]
//     );
//     if (result.rows.length === 0) {
//       res.status(404).json({ error: 'Leave not found' });
//       return;
//     }
//     res.json(result.rows[0]);
//   } catch (error) {
//     console.error('[managerApproveLeave]', error);
//     res.status(500).json({ error: 'Failed to assign leave to HR' });
//   }
// };

// // // Assign leave to HR (set status to 'Pending HR')
// // export const assignLeaveToHr = async (req: Request, res: Response): Promise<void> => {
// //   try {
// //     const { id } = req.params;
// //     const { hr_id } = req.body;
// //     const result = await pool.query(
// //       `UPDATE leave_requests SET status = 'pending_hr', approved_by = $1 WHERE id = $2 RETURNING *`,
// //       [hr_id, id]
// //     );
// //     if (result.rows.length === 0) {
// //       res.status(404).json({ error: 'Leave not found' });
// //       return;
// //     }
// //     res.json(result.rows[0]);
// //   } catch (error) {
// //     console.error('[assignLeaveToHr]', error);
// //     res.status(500).json({ error: 'Failed to assign leave to HR' });
// //   }
// // };

// // Approve leave (manager or HR)
// export const approveLeave = async (req: Request, res: Response): Promise<void> => {
//   try {
//     const { id } = req.params;
//     const { approver_id} = req.body;
//     const newStatus = 'hr_approved';
//     const result = await pool.query(
//       `UPDATE leave_requests SET status = $1, approved_by = $2, approved_date = NOW() WHERE id = $3 RETURNING *`,
//       [newStatus, approver_id, id]
//     );
//     if (result.rows.length === 0) {
//       res.status(404).json({ error: 'Leave not found' });
//       return;
//     }
//     // If HR approved, recalculate days used for the employee/leave_type
//     if (newStatus === 'hr_approved') {
//       // No DB update needed here, but you may want to trigger recalculation elsewhere
//     }
//     res.json(result.rows[0]);
//   } catch (error) {
//     console.error('[approveLeave]', error);
//     res.status(500).json({ error: 'Failed to approve leave' });
//   }
// };

// // Reject leave (manager or HR)
// export const rejectLeave = async (req: Request, res: Response): Promise<void> => {
//   try {
//     const { id } = req.params;
//     const { rejector_id, rejector_role, comments } = req.body;
//     let newStatus: string;
//     let commentsField: string;
//     if (rejector_role === 'manager') {
//       newStatus = 'Manager Rejected';
//       commentsField = 'manager_comments';
//     } else if (rejector_role === 'hr') {
//       newStatus = 'Hr Rejected';
//       commentsField = 'hr_comments';
//     } else {
//       res.status(400).json({ error: 'Invalid rejector role' });
//       return;
//     }
//     const result = await pool.query(
//       `UPDATE leave_requests SET status = $1, ${commentsField} = $2, approved_by = $3, approved_date = NOW() WHERE id = $4 RETURNING *`,
//       [newStatus, comments, rejector_id, id]
//     );
//     if (result.rows.length === 0) {
//       res.status(404).json({ error: 'Leave not found' });
//       return;
//     }
//     res.json(result.rows[0]);
//   } catch (error) {
//     console.error('[rejectLeave]', error);
//     res.status(500).json({ error: 'Failed to reject leave' });
//   }
// };

// // Get all leaves for a specific employee, with days used and remaining for each leave type
// export const getEmployeeLeavesAndBalance = async (req: Request, res: Response): Promise<void> => {
//   try {
//     const { employee_id } = req.params;
//     // Get all leave types
//     const leaveTypesResult = await pool.query('SELECT * FROM leave_types');
//     const leaveTypes = leaveTypesResult.rows;
//     // Get all leaves for employee
//     const leavesResult = await pool.query(
//       `SELECT * FROM leave_requests WHERE employee_id = $1 ORDER BY applied_date DESC`,
//       [employee_id]
//     );
//     const leaves = leavesResult.rows;
//     // Calculate days used and remaining for each leave type
//     const balances = leaveTypes.map((lt: any) => {
//       const used = leaves
//         .filter((l: any) => l.leave_type_id === lt.id && l.status === 'hr_approved')
//         .reduce((sum: number, l: any) => sum + (l.days || 0), 0);
//       return {
//         leave_type_id: lt.id,
//         leave_type_name: lt.name,
//         max_days_per_year: lt.max_days_per_year,
//         days_used: used,
//         days_remaining: (lt.max_days_per_year || 0) - used
//       };
//     });
//     res.json({ leaves, balances });
//   } catch (error) {
//     console.error('[getEmployeeLeavesAndBalance]', error);
//     res.status(500).json({ error: 'Failed to get employee leaves and balance' });
//   }
// };

import { Request, Response } from 'express';
import { pool } from '../db';
import { Leave } from '../types';
import { v4 as uuidv4 } from 'uuid';

// Create Leave
export const applyForLeave = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      employee_id,
      employee_name,
      leave_type_id,
      start_date,
      end_date,
      days,
      status,
      reason
    } = req.body as Leave;

    const id = uuidv4();

    const result = await pool.query<Leave>(
      `INSERT INTO leave_requests (
        id, employee_id, employee_name, leave_type_id,
        start_date, end_date, days, status, reason,
        applied_date, manager_comments, hr_comments,
        approved_by, approved_date
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,NOW(),NULL,NULL,NULL,NULL)
      RETURNING *`,
      [
        id,
        employee_id,
        employee_name,
        leave_type_id,
        start_date,
        end_date,
        days,
        status ?? 'pending_manager',
        reason
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('[createLeave]', error);
    res.status(500).json({ error: 'Failed to create leave' });
  }
};


export const getLeaves = async (_req: Request, res: Response): Promise<void> => {
  try {
    const result = await pool.query<Leave>(
      `SELECT l.*, lt.name AS type
       FROM leave_requests l
       JOIN leave_types lt ON lt.id = l.leave_type_id
       ORDER BY l.id DESC`
    )

    const dto: Leave[] = result.rows
    res.json(dto)
  } catch (error) {
    console.error('[getLeaves]', error)
    res.status(500).json({ error: 'Failed to get leaves' })
  }
}

export const getLeaveById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const result = await pool.query<Leave>(
      `SELECT l.*, lt.name AS type
       FROM leave_requests l
       JOIN leave_types lt ON lt.id = l.leave_type_id
       WHERE l.id = $1`,
      [id]
    )

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Leave not found' })
      return
    }

    res.json(result.rows[0])
  } catch (error) {
    console.error('[getLeaveById]', error)
    res.status(500).json({ error: 'Failed to get leave' })
  }
}

// Update Leave
export const updateLeave = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const {
      start_date,
      end_date,
      days,
      status,
      reason
    } = req.body as Leave

    const result = await pool.query<Leave>(
      `UPDATE leave_requests SET
        start_date = $1,
        end_date = $2,
        days = $3,
        status = $4,
        reason = $5
       WHERE id = $6
       RETURNING *`,
      [start_date, end_date, days, status, reason, id]
    )

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Leave not found' })
      return
    }

    res.json(result.rows[0])
  } catch (error) {
    console.error('[updateLeave]', error)
    res.status(500).json({ error: 'Failed to update leave' })
  }
}

export const deleteLeave = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const result = await pool.query('DELETE FROM leave_requests WHERE id = $1 RETURNING *', [id])
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Leave not found' })
      return
    }
    res.json({ message: 'Leave deleted successfully' })
  } catch (error) {
    console.error('[deleteLeave]', error)
    res.status(500).json({ error: 'Failed to delete leave' })
  }
}

// Assign leave to HR (set status to 'Pending HR')
export const managerApproveLeave = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { approver_id } = req.body;
    const result = await pool.query(
      `UPDATE leave_requests SET status = 'pending_hr', approved_by = $1 WHERE id = $2 RETURNING *`,
      [approver_id, id]
    );
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Leave not found' });
      return;
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('[managerApproveLeave]', error);
    res.status(500).json({ error: 'Failed to assign leave to HR' });
  }
};

// Approve leave (manager or HR)
export const approveLeave = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { approver_id, approver_role, comments } = req.body;
    // Decide new status depending on who approves
    let newStatus = 'approved';
    let updateFields = `status = $1, approved_by = $2, approved_date = NOW()`;
  let params: (string | number | null)[];
    if (approver_role === 'manager') {
      // Manager approval moves the request to pending HR
      newStatus = 'pending_hr';
      // store manager comments if provided
      updateFields = `status = $1, manager_comments = $2, approved_by = $3, approved_date = NOW()`;
      params = [newStatus, comments || null, approver_id, id];
    } else if (approver_role === 'hr') {
      // HR approval is final
      newStatus = 'approved';
      updateFields = `status = $1, hr_comments = $2, approved_by = $3, approved_date = NOW()`;
      params = [newStatus, comments || null, approver_id, id];
    } else {
      // default to final approval if role not provided
      newStatus = 'approved';
      updateFields = `status = $1, approved_by = $2, approved_date = NOW()`;
      params = [newStatus, approver_id, id];
    }

    const result = await pool.query(
      `UPDATE leave_requests SET ${updateFields} WHERE id = $${params.length} RETURNING *`,
      params
    );
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Leave not found' });
      return;
    }
    // If HR approved, recalculate days used for the employee/leave_type
    if (newStatus === 'approved') {
      // No DB update needed here; balances are computed on-demand in getEmployeeLeavesAndBalance
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('[approveLeave]', error);
    res.status(500).json({ error: 'Failed to approve leave' });
  }
};

// Reject leave (manager or HR)
export const rejectLeave = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { rejector_id, rejector_role, comments } = req.body;
    let newStatus: string;
    let commentsField: string;
    if (rejector_role === 'manager') {
      newStatus = 'manager_rejected';
      commentsField = 'manager_comments';
    } else if (rejector_role === 'hr') {
      newStatus = 'hr_rejected';
      commentsField = 'hr_comments';
    } else {
      res.status(400).json({ error: 'Invalid rejector role' });
      return;
    }
    const result = await pool.query(
      `UPDATE leave_requests SET status = $1, ${commentsField} = $2, approved_by = $3, approved_date = NOW() WHERE id = $4 RETURNING *`,
      [newStatus, comments, rejector_id, id]
    );
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Leave not found' });
      return;
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('[rejectLeave]', error);
    res.status(500).json({ error: 'Failed to reject leave' });
  }
};

// Get all leaves for a specific employee, with days used and remaining for each leave type
export const getEmployeeLeavesAndBalance = async (req: Request, res: Response): Promise<void> => {
  try {
    const { employee_id } = req.params;
    // Get all leave types
    const leaveTypesResult = await pool.query('SELECT * FROM leave_types');
    const leaveTypes = leaveTypesResult.rows;
    // Get all leaves for employee
    const leavesResult = await pool.query(
      `SELECT * FROM leave_requests WHERE employee_id = $1 ORDER BY applied_date DESC`,
      [employee_id]
    );
    const leaves = leavesResult.rows;
    // Calculate days used and remaining for each leave type
    type LeaveTypeRow = { id: string; name: string; max_days_per_year: number };
    type LeaveRow = { leave_type_id: string; status: string; days: number };
    const balances = (leaveTypes as LeaveTypeRow[]).map((lt) => {
      const used = (leaves as LeaveRow[])
        .filter((l) => l.leave_type_id === lt.id && l.status === 'approved')
        .reduce((sum: number, l) => sum + (l.days || 0), 0);
      return {
        leave_type_id: lt.id,
        leave_type_name: lt.name,
        max_days_per_year: lt.max_days_per_year,
        days_used: used,
        days_remaining: (lt.max_days_per_year || 0) - used
      };
    });
    res.json({ leaves, balances });
  } catch (error) {
    console.error('[getEmployeeLeavesAndBalance]', error);
    res.status(500).json({ error: 'Failed to get employee leaves and balance' });
  }
};

