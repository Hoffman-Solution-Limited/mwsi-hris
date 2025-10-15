// src/types/index.ts

export type LeaveStatus = 'Pending' | 'Approved' | 'Rejected' | 'Cancelled';

// --- LeaveType (API / DTO) ---
export interface LeaveType {
  id?: number;
  name: string;
  description?: string | null;
  maxDaysPerYear?: number | null;
  createdAt?: Date;
}

// --- DB row shape for leave_types (matches DB column names) ---
export interface LeaveTypeRow {
  id: number;
  name: string;
  description: string | null;
  max_days_per_year: number | null;
  created_at: Date;
}

// --- Leave (API / DTO) ---
// export interface Leave {
//   id?: number;
//   employeeId?: string | null;       // stored as string in API layer
//   employeeName?: string | null;
//   type?: string | null;             // leave type name (joined)
//   leaveTypeId?: number;             // FK to leave_types.id
//   startDate?: string | null;        // ISO date string 'YYYY-MM-DD'
//   endDate?: string | null;          // ISO date string
//   days?: number | null;
//   status?: LeaveStatus;
//   reason?: string | null;
//   appliedDate?: Date | null;
//   managerComments?: string | null;
//   hrComments?: string | null;
//   approvedBy?: string | null;
//   approvedDate?: Date | null;
// }

// --- DB row shape for leaves (matches DB column names) ---
export interface Leave {
  id: number;
  employee_id: string | null;
  employee_name: string | null;
  leave_type_id: number;
  start_date: string;      // Postgres DATE comes back as string
  end_date: string;
  days: number | null;
  status: LeaveStatus;
  reason: string | null;
  applied_date: Date;
  manager_comments: string | null;
  hr_comments: string | null;
  approved_by: string | null;
  approved_date: Date | null;
}

// --- Mapper: DB row -> API DTO ---
// Use this in controllers to normalize types/format before sending to client.
// export const mapLeaveRowToDto = (row: Leave): Leave => ({
//   id: row.id,
//   employeeId: row.employee_id !== null ? String(row.employee_id) : null,
//   employeeName: row.employee_name,
//   type: row.type ?? null,
//   leaveTypeId: row.leave_type_id,
//   startDate: row.start_date ?? null,
//   endDate: row.end_date ?? null,
//   days: row.days !== null && row.days !== undefined ? Number(row.days) : null,
//   status: row.status,
//   reason: row.reason,
//   appliedDate: row.applied_date ?? null,
//   managerComments: row.manager_comments,
//   hrComments: row.hr_comments,
//   approvedBy: row.approved_by,
//   approvedDate: row.approved_date ?? null,
// });
