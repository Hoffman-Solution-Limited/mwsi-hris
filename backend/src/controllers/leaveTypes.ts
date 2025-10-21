import { Request, Response } from 'express'
import { pool } from '../db'
import { LeaveTypeRow, LeaveType } from '../types'

export const createLeaveType = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, description, maxDaysPerYear } = req.body as LeaveType

    const result = await pool.query<LeaveTypeRow>(
      `INSERT INTO leave_types (name, description, max_days_per_year)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [name, description, maxDaysPerYear]
    )

    const row = result.rows[0]
    const dto: LeaveType = {
      id: row.id,
      name: row.name,
      description: row.description,
      maxDaysPerYear: row.max_days_per_year,
      createdAt: row.created_at
    }

    res.status(201).json(dto)
  } catch (error) {
    console.error('[createLeaveType]', error)
    res.status(500).json({ error: 'Failed to create leave type' })
  }
}

export const getLeaveTypes = async (_req: Request, res: Response): Promise<void> => {
  try {
    const result = await pool.query<LeaveTypeRow>('SELECT * FROM leave_types ORDER BY id')
    const dto: LeaveType[] = result.rows.map(row => ({
      id: row.id,
      name: row.name,
      description: row.description,
      maxDaysPerYear: row.max_days_per_year,
      createdAt: row.created_at
    }))
    res.json(dto)
  } catch (error) {
    console.error('[getLeaveTypes]', error)
    res.status(500).json({ error: 'Failed to get leave types' })
  }
}

export const getLeaveTypeById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const result = await pool.query<LeaveTypeRow>('SELECT * FROM leave_types WHERE id = $1', [id])
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Leave type not found' })
      return
    }

    const row = result.rows[0]
    const dto: LeaveType = {
      id: row.id,
      name: row.name,
      description: row.description,
      maxDaysPerYear: row.max_days_per_year,
      createdAt: row.created_at
    }

    res.json(dto)
  } catch (error) {
    console.error('[getLeaveTypeById]', error)
    res.status(500).json({ error: 'Failed to get leave type' })
  }
}

export const updateLeaveType = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const { name, description, maxDaysPerYear } = req.body as LeaveType

    const result = await pool.query<LeaveTypeRow>(
      `UPDATE leave_types
       SET name = $1, description = $2, max_days_per_year = $3
       WHERE id = $4
       RETURNING *`,
      [name, description, maxDaysPerYear, id]
    )

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Leave type not found' })
      return
    }

    const row = result.rows[0]
    const dto: LeaveType = {
      id: row.id,
      name: row.name,
      description: row.description,
      maxDaysPerYear: row.max_days_per_year,
      createdAt: row.created_at
    }

    res.json(dto)
  } catch (error) {
    console.error('[updateLeaveType]', error)
    res.status(500).json({ error: 'Failed to update leave type' })
  }
}

export const deleteLeaveType = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const result = await pool.query('DELETE FROM leave_types WHERE id = $1 RETURNING *', [id])
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Leave type not found' })
      return
    }
    res.json({ message: 'Leave type deleted successfully' })
  } catch (error) {
    console.error('[deleteLeaveType]', error)
    res.status(500).json({ error: 'Failed to delete leave type' })
  }
}
