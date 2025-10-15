import { Request, Response } from 'express'
import { pool } from '../db'
import { Leave} from '../types'

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
    } = req.body as Leave

    const result = await pool.query<Leave>(
      `INSERT INTO leave_requests (
        employee_id, employee_name, leave_type_id,
        start_date, end_date, days, status, reason,
        applied_date, manager_comments, hr_comments,
        approved_by, approved_date
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,NOW(),NULL,NULL,NULL,NULL)
      RETURNING *`,
      [
        employee_id,
        employee_name,
        leave_type_id,
        start_date,
        end_date,
        days,
        status ?? 'Pending',
        reason
      ]
    )

    res.status(201).json(result.rows[0])
  } catch (error) {
    console.error('[createLeave]', error)
    res.status(500).json({ error: 'Failed to create leave' })
  }
}


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
