// Shared domain types copied from legacy mockData for typing reuse
export type PerformanceTemplateType = 'quarterly' | 'half-yearly' | 'yearly';

export interface PerformanceTemplate {
  id: string;
  name: string;
  type: PerformanceTemplateType;
  description: string;
  department?: string;
  criteria: { id: string; name: string; weight: number; description: string }[];
  createdBy: string;
  createdAt: string;
}

export interface PerformanceReview {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeNumber?: string;
  templateId?: string;
  reviewPeriod: string;
  status: 'draft' | 'targets_set' | 'manager_review' | 'employee_ack' | 'hr_review' | 'completed';
  employeeTargets?: { criteriaId: string; target: string; description: string }[];
  managerScores?: { criteriaId: string; score: number; comments: string }[];
  employeeScores?: { criteriaId: string; score: number; comments: string }[];
  overallScore?: number;
  managerComments?: string;
  hrComments?: string;
  nextReviewDate?: string;
  createdBy?: string;
  createdAt?: string;
}

export interface DepartmentGoal {
  id: string;
  department: string;
  title: string;
  description: string;
  weight: number;
  active: boolean;
  createdAt: string;
  createdBy: string;
}

export interface Employee {
  id: string;
  employeeNumber?: string;
  name: string;
  email?: string;
  position?: string;
  department?: string;
  manager?: string;
  managerId?: string;
  hireDate?: string;
  status?: 'active' | 'inactive' | 'terminated';
  avatar?: string;
  phone?: string;
  stationName?: string;
  skillLevel?: string;
  jobGroup?: string;
  engagementType?: string;
  ethnicity?: string;
  [key: string]: any;
}

export type Position = {
  id: string;
  title: string;
  department: string;
  status: 'open' | 'filled' | 'closed';
  priority: 'high' | 'medium' | 'low';
  applicants: number;
  postedDate: string;
  closingDate: string;
  description: string;
  designation?: string;
  skillLevel?: string;
  stationName?: string;
  jobGroup?: string;
  employmentType?: string;
};

export interface TrainingRecord {
  id: string;
  employeeId: string;
  title: string;
  type: 'mandatory' | 'development' | 'compliance';
  status: 'completed' | 'in_progress' | 'not_started' | 'closed' | 'active' | 'inactive';
  description?: string;
  duration?: number; // in hours
  max_participants?: number;
  prerequisites?: string;
  category?: 'mandatory' | 'skill_development' | 'compliance' | 'leadership';
  completionDate?: string;
  expiryDate?: string;
  provider?: string;
  archived?: boolean;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  type: 'annual' | 'sick' | 'emergency' | 'maternity' | 'study';
  startDate: string;
  endDate: string;
  days: number;
  status: 'pending_manager' | 'pending_hr' | 'approved' | 'rejected';
  reason: string;
  appliedDate: string;
  managerComments?: string;
  hrComments?: string;
  approvedBy?: string;
  approvedDate?: string;
}

export type DisciplinaryCaseMock = {
  id: string | number;
  employeeId: string;
  employeeName: string;
  caseType: string;
  status: 'open' | 'pending' | 'closed';
  date: string;
  description: string;
  verdict?: string;
  updates?: { timestamp: string; text: string }[];
};
