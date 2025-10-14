// Mock data for hired candidates
export const mockHiredCandidates = [
  {
    id: "sc-1",
    name: "Jane A. Doe",
    firstName: "Jane",
    middleName: "A.",
    surname: "Doe",
    position: "Government Data Analyst",
    designation: "Government Data Analyst",
    employmentType: "Permanent",
    jobGroup: "JG 10",
    stationName: "IT Department - Head Office",
    skillLevel: "Senior",
    description: "Hired for the Government Data Analyst role.",
    closingDate: "2024-03-30",
    jobId: "gov-1",
    cv: { name: "JaneDoeCV.pdf" },
    hireReason: "Excellent technical skills and interview performance."
  },
  {
    id: "sc-3",
    name: "Alice Brown",
    firstName: "Alice",
    middleName: "",
    surname: "Brown",
    position: "Public Relations Officer",
    designation: "Public Relations Officer",
    employmentType: "Contract",
    jobGroup: "JG 8",
    stationName: "Marketing Department - Head Office",
    skillLevel: "Intermediate",
    description: "Hired for the Public Relations Officer role.",
    closingDate: "2024-04-10",
    jobId: "gov-2",
    cv: { name: "AliceBrownCV.pdf" },
    hireReason: "Strong communication and PR experience."
  }
];
// Shortlisted Candidate type
export interface ShortlistedCandidate {
  id: string;
  name: string;
  position: string;
  jobId: string;
  cv: { name: string };
}

// Mock data for shortlisted candidates per job
export const mockShortlistedCandidates: { [jobId: string]: ShortlistedCandidate[] } = {
  "gov-1": [
    {
      id: "sc-1",
      name: "Jane Doe",
      position: "Government Data Analyst",
      jobId: "gov-1",
      cv: { name: "JaneDoeCV.pdf" }
    },
    {
      id: "sc-2",
      name: "John Smith",
      position: "Government Data Analyst",
      jobId: "gov-1",
      cv: { name: "JohnSmithCV.pdf" }
    }
  ],
  "gov-2": [
    {
      id: "sc-3",
      name: "Alice Brown",
      position: "Public Relations Officer",
      jobId: "gov-2",
      cv: { name: "AliceBrownCV.pdf" }
    }
  ]
};
export type PerformanceTemplateType = 'quarterly' | 'half-yearly' | 'yearly';

export interface PerformanceTemplate {
  id: string;
  name: string;
  type: PerformanceTemplateType;
  description: string;
  // Optional: templates can be scoped to a department and generated from its goals
  department?: string;
  criteria: {
    id: string;
    name: string;
    weight: number;
    description: string;
  }[];
  createdBy: string;
  createdAt: string;
}

export interface PerformanceReview {
  id: string;
  employeeId: string;
  employeeName: string;
  // New: employee unique number for physical registry linkage
  employeeNumber?: string;
    templateId?: string;
  reviewPeriod: string;
  employeeSelfComments?: string;
  employeeAckStatus?: 'declined' | 'accepted';
  employeeAckComments?: string;
  employeeAckDate?: string;
  status: 'draft' | 'targets_set' | 'manager_review' | 'employee_ack' | 'hr_review' | 'completed';
    employeeTargets?: {
    criteriaId: string;
    target: string;
    description: string;
  }[];
    managerScores?: {
    criteriaId: string;
    score: number;
    comments: string;
  }[];
  employeeScores?: {
    criteriaId: string;
    score: number;
    comments: string;
  }[];
  overallScore?: number;
  score?: number;
  managerComments?: string;
  hrComments?: string;
  goals?: string[];
  feedback?: string;
  nextReviewDate: string;
  createdBy: string;
  createdAt: string;
}

export const mockPerformanceTemplates = [
  {
    id: 'template-1',
    name: 'Quarterly Appraisal',
    type: 'quarterly' as PerformanceTemplateType,
    description: 'Standard quarterly performance review template.',
    department: undefined,
    criteria: [
      { id: 'c1', name: 'Quality of Work', weight: 40, description: 'Accuracy, thoroughness, and effectiveness.' },
      { id: 'c2', name: 'Teamwork', weight: 30, description: 'Collaboration and communication.' },
      { id: 'c3', name: 'Initiative', weight: 30, description: 'Proactiveness and problem-solving.' }
    ],
    createdBy: 'Sarah Johnson',
    createdAt: '2025-09-01'
  }
];

// Departmental Goals (used to generate department-aligned templates)
export interface DepartmentGoal {
  id: string;
  department: string;
  title: string;
  description: string;
  weight: number; // should total 100 within a department when used as a template
  active: boolean;
  createdAt: string;
  createdBy: string;
}

export const mockDepartmentGoals: DepartmentGoal[] = [
  // Engineering sample goals
  { id: 'eng-1', department: 'Engineering', title: 'Quality of Deliverables', description: 'Maintain high code quality and test coverage', weight: 40, active: true, createdAt: '2025-09-01', createdBy: 'HR System' },
  { id: 'eng-2', department: 'Engineering', title: 'Team Collaboration', description: 'Effective collaboration with peers and stakeholders', weight: 30, active: true, createdAt: '2025-09-01', createdBy: 'HR System' },
  { id: 'eng-3', department: 'Engineering', title: 'Innovation & Initiative', description: 'Proactive solutions and process improvements', weight: 30, active: true, createdAt: '2025-09-01', createdBy: 'HR System' },
  // Marketing sample goals
  { id: 'mkt-1', department: 'Marketing', title: 'Campaign Effectiveness', description: 'Deliver measurable campaign results', weight: 50, active: true, createdAt: '2025-09-01', createdBy: 'HR System' },
  { id: 'mkt-2', department: 'Marketing', title: 'Content Quality', description: 'High-quality content aligned to brand', weight: 30, active: true, createdAt: '2025-09-01', createdBy: 'HR System' },
  { id: 'mkt-3', department: 'Marketing', title: 'Cross-team Collaboration', description: 'Coordinate effectively with Sales and Product', weight: 20, active: true, createdAt: '2025-09-01', createdBy: 'HR System' },
];
export interface Employee {
  id: string;
  // New: Employee Number (human identifier, used across physical and digital records)
  employeeNumber?: string;
  name: string;
  email: string;
  position: string;
  department: string;
  manager?: string;
  hireDate: string;
  status: 'active' | 'inactive' | 'terminated';
  avatar?: string;
  phone?: string;
  emergencyContact?: string;
  salary?: number;
  documents?: Document[];
  skills?: { name: string; level: string }[];
  // Additional fields for government form
  gender?: 'male' | 'female' | 'other';
  cadre?: 'Support' | 'Technical' | 'Management';
  employmentType?: string;
  // New HR attributes
  jobGroup?: string; // e.g., A-L
  engagementType?: string; // e.g., Permanent, Extended Service, Local Contract
  ethnicity?: string;
  nationalId?: string;
  kraPin?: string;
  children?: string;
  workCounty?: string;
  homeCounty?: string;
  postalAddress?: string;
  postalCode?: string;
  stationName?: string;
  skillLevel?: string;
  company?: string;
  dateOfBirth?: string;
}


export interface Document {
  id: string;
  name: string;
  type: 'contract' | 'certificate' | 'policy' | 'form' | 'report';
  uploadDate: string;
  size: string;
  status: 'pending' | 'approved' | 'rejected' | 'draft';
  uploadedBy: string;
  category: string;
  createdAt?: string;
  // Assignment fields (temporary assignment to an employee)
  assignedToEmployeeId?: string;
  assignedToName?: string;
  assignedToEmail?: string;
  assignedToDepartment?: string;
  assignedDate?: string;
  // Movement log entries
  movementLog?: {
    action: 'assigned' | 'returned' | 'moved';
    by: string; // actor name
    to?: string; // destination name when moved/assigned
    date: string; // ISO timestamp
    reason?: string;
    remarks?: string;
  }[];
}

export type Position = {
  id: string
  title: string
  department: string
  status: "open" | "filled" | "closed"
  priority: "high" | "medium" | "low"
  applicants: number
  postedDate: string
  closingDate: string
  description: string
  // Recruitment enhancements (optional)
  designation?: string
  skillLevel?: string
  stationName?: string
  jobGroup?: string
  employmentType?: string
}


export interface TrainingRecord {
  id: string;
  employeeId: string;
  title: string;
  type: 'mandatory' | 'development' | 'compliance';
  status: 'completed' | 'in_progress' | 'not_started';
  completionDate?: string;
  expiryDate?: string;
  provider: string;
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

export const mockEmployees: Employee[] = [
  {
    id: '1',
    name: 'John Smith',
    email: 'john.smith@mwsi.com',
    position: 'System Administrator',
    department: 'IT',
    manager: 'Sarah Johnson',
    hireDate: '2022-01-15',
    status: 'active',
    avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=JS',
    phone: '+254-700-123456',
    emergencyContact: 'Jane Smith (+254-700-123457)',
    salary: 75000,
    skills: [
      { name: 'Networking', level: 'Advanced' },
      { name: 'Linux Administration', level: 'Expert' },
      { name: 'Cybersecurity', level: 'Intermediate' },
    ],
    gender: 'male',
    cadre: 'Technical',
    employmentType: 'Permanent',
    engagementType: 'Permanent',
    jobGroup: 'G',
    ethnicity: 'Kikuyu',
    employeeNumber: '20221234567',
    nationalId: '32456789',
    kraPin: 'A012345678Z',
    children: '2',
    workCounty: 'Nairobi',
    homeCounty: 'Kiambu',
    postalAddress: 'P.O. Box 12345',
    postalCode: '00100',
    stationName: 'IT Department - Head Office',
    skillLevel: 'Diploma (Information Technology)',
    company: 'Ministry of Water, Sanitation and Irrigation',
    dateOfBirth: '1985-06-15'
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@mwsi.com',
    position: 'HR Manager',
    department: 'Human Resources',
    hireDate: '2021-03-20',
    status: 'active',
    avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=SJ',
    phone: '+254-700-234567',
    emergencyContact: 'Robert Johnson (+254-700-234568)',
    salary: 85000,
    skills: [
      { name: 'Recruitment', level: 'Expert' },
      { name: 'Employee Relations', level: 'Advanced' },
      { name: 'Conflict Resolution', level: 'Intermediate' },
    ],
    gender: 'female',
    cadre: 'Management',
    employmentType: 'Permanent',
    engagementType: 'Permanent',
    jobGroup: 'J',
    ethnicity: 'Luo',
    employeeNumber: '20211234568',
    nationalId: '28123456',
    kraPin: 'A012345679Z',
    children: '1',
    workCounty: 'Nairobi',
    homeCounty: 'Nairobi',
    postalAddress: 'P.O. Box 54321',
    postalCode: '00100',
    stationName: 'Human Resources - Head Office',
    skillLevel: 'Degree (Human Resource Management)',
    company: 'Ministry of Water, Sanitation and Irrigation',
    dateOfBirth: '1982-11-10'
  },
    {
      id: '10',
      name: 'David Manager',
      email: 'david.manager@mwsi.com',
      position: 'Operations Manager',
      department: 'Operations',
      manager: undefined,
      hireDate: '2019-03-10',
      status: 'active',
      avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=DM',
      phone: '+254-700-999999',
      emergencyContact: 'Linda Manager (+254-700-888888)',
      salary: 120000,
      skills: [
        { name: 'Operations Management', level: 'Expert' },
        { name: 'Leadership', level: 'Advanced' },
        { name: 'Process Improvement', level: 'Advanced' },
      ],
      gender: 'male',
      employmentType: 'Permanent',
      engagementType: 'Permanent',
      jobGroup: 'K',
      ethnicity: 'Kalenjin',
      employeeNumber: '2019031010',
      nationalId: '12345678',
      kraPin: 'A012345689Z',
      children: '2',
      workCounty: 'Nairobi',
      homeCounty: 'Machakos',
      postalAddress: 'P.O. Box 98765',
      postalCode: '00100',
      stationName: 'Operations Department - Head Office',
      skillLevel: 'MBA',
      company: 'Ministry of Water, Sanitation and Irrigation',
      dateOfBirth: '1980-07-22'
    },
  {
  id: '3',
  name: 'Michael Davis',
  email: 'michael.davis@mwsi.com',
  position: 'Software Developer',
  department: 'Engineering',
  manager: 'David Manager',
  hireDate: '2022-07-10',
  status: 'active',
  avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=MD',
  phone: '+254-700-345678',
    emergencyContact: 'Lisa Davis (+254-700-345679)',
    salary: 70000,
    skills: [
      { name: 'React', level: 'Advanced' },
      { name: 'Node.js', level: 'Intermediate' },
      { name: 'TypeScript', level: 'Intermediate' },
    ],
    gender: 'male',
    cadre: 'Technical',
    employmentType: 'Permanent',
    engagementType: 'Permanent',
    jobGroup: 'H',
    ethnicity: 'Kamba',
    employeeNumber: '20221234569',
    nationalId: '29876543',
    kraPin: 'A012345680Z',
    children: '0',
    workCounty: 'Nairobi',
    homeCounty: 'Machakos',
    postalAddress: 'P.O. Box 98765',
    postalCode: '00200',
    stationName: 'Engineering Department - Head Office',
    skillLevel: 'Degree (Computer Science)',
    company: 'Ministry of Water, Sanitation and Irrigation',
    dateOfBirth: '1990-03-22'
  },
  {
    id: '4',
    name: 'Emily Chen',
    email: 'emily.chen@mwsi.com',
    position: 'Marketing Coordinator',
    department: 'Marketing',
    manager: 'Sarah Johnson',
    hireDate: '2023-02-14',
    status: 'active',
    avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=EC',
    phone: '+254-700-456789',
    emergencyContact: 'David Chen (+254-700-456790)',
    salary: 55000,
    skills: [
      { name: 'Content Marketing', level: 'Intermediate' },
      { name: 'SEO', level: 'Beginner' },
      { name: 'Social Media', level: 'Advanced' },
    ],
    gender: 'female',
    cadre: 'Support',
    employmentType: 'Contract',
    engagementType: 'Contract',
    jobGroup: 'F',
    ethnicity: 'Kisii',
    employeeNumber: '20231234570',
    nationalId: '31234567',
    kraPin: 'A012345681Z',
    children: '0',
    workCounty: 'Nairobi',
    homeCounty: 'Nairobi',
    postalAddress: 'P.O. Box 13579',
    postalCode: '00100',
    stationName: 'Marketing Department - Head Office',
    skillLevel: 'Degree (Marketing)',
    company: 'Ministry of Water, Sanitation and Irrigation',
    dateOfBirth: '1995-08-05'
  },
  {
    id: '5',
    name: 'Robert Wilson',
    email: 'robert.wilson@mwsi.com',
    position: 'Finance Director',
    department: 'Finance',
    hireDate: '2020-11-30',
    status: 'active',
    avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=RW',
    phone: '+254-700-567890',
    emergencyContact: 'Mary Wilson (+254-700-567891)',
    salary: 95000,
    skills: [
      { name: 'Financial Planning', level: 'Expert' },
      { name: 'Risk Management', level: 'Advanced' },
      { name: 'Budgeting', level: 'Advanced' },
    ],
    gender: 'male',
    cadre: 'Management',
    employmentType: 'Permanent',
    engagementType: 'Permanent',
    jobGroup: 'L',
    ethnicity: 'Meru',
    employeeNumber: '20201234571',
    nationalId: '25987654',
    kraPin: 'A012345682Z',
    children: '3',
    workCounty: 'Nairobi',
    homeCounty: 'Nyeri',
    postalAddress: 'P.O. Box 24680',
    postalCode: '00100',
    stationName: 'Finance Department - Head Office',
    skillLevel: 'Masters (Finance)',
    company: 'Ministry of Water, Sanitation and Irrigation',
    dateOfBirth: '1978-12-18'
  },
  {
    id: '6',
    name: 'Jane Smith',
    email: 'jane.smith@mwsi.com',
    position: 'Senior Developer',
    department: 'Engineering',
    manager: 'David Manager',
    hireDate: '2021-08-15',
    status: 'active',
    avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=JS2',
    phone: '+254-700-666666',
    emergencyContact: 'John Smith (+254-700-666667)',
    salary: 85000,
    skills: [
      { name: 'Python', level: 'Expert' },
      { name: 'Django', level: 'Advanced' },
      { name: 'PostgreSQL', level: 'Advanced' }
    ],
    gender: 'female',
    cadre: 'Technical',
    employmentType: 'Permanent',
    engagementType: 'Permanent',
    jobGroup: 'I',
    ethnicity: 'Kikuyu',
    employeeNumber: '20210815001',
    nationalId: '33445566',
    kraPin: 'A012345685Z',
    children: '1',
    workCounty: 'Nairobi',
    homeCounty: 'Nyeri',
    postalAddress: 'P.O. Box 44556',
    postalCode: '00100',
    stationName: 'Engineering Department - Head Office',
    skillLevel: 'Degree (Computer Science)',
    company: 'Ministry of Water, Sanitation and Irrigation',
    dateOfBirth: '1988-05-20'
  },
  {
    id: '7',
    name: 'Robert Chen',
    email: 'robert.chen@mwsi.com',
    position: 'DevOps Engineer',
    department: 'Engineering',
    manager: 'David Manager',
    hireDate: '2022-03-01',
    status: 'active',
    avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=RC',
    phone: '+254-700-555555',
    emergencyContact: 'Lisa Chen (+254-700-555556)',
    salary: 80000,
    skills: [
      { name: 'Docker', level: 'Advanced' },
      { name: 'Kubernetes', level: 'Intermediate' },
      { name: 'AWS', level: 'Advanced' }
    ],
    gender: 'male',
    cadre: 'Technical',
    employmentType: 'Permanent',
    engagementType: 'Permanent',
    jobGroup: 'H',
    ethnicity: 'Luo',
    employeeNumber: '20220301002',
    nationalId: '34556677',
    kraPin: 'A012345686Z',
    children: '0',
    workCounty: 'Nairobi',
    homeCounty: 'Kisumu',
    postalAddress: 'P.O. Box 55667',
    postalCode: '00100',
    stationName: 'Engineering Department - Head Office',
    skillLevel: 'Degree (Information Technology)',
    company: 'Ministry of Water, Sanitation and Irrigation',
    dateOfBirth: '1992-11-08'
  },
  {
    id: '12',
    name: 'Rita Registry',
    email: 'registry@mwsi.com',
    position: 'Registry Manager',
    department: 'Registry',
    hireDate: '2021-08-15',
    status: 'active',
    avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=RR',
    phone: '+254-700-888888',
    emergencyContact: 'Paul Registry (+254-700-888889)',
    salary: 80000,
    skills: [
      { name: 'Document Management', level: 'Expert' },
      { name: 'Record Keeping', level: 'Advanced' },
      { name: 'Compliance', level: 'Advanced' },
    ],
    gender: 'female',
    cadre: 'Management',
    employmentType: 'Permanent',
    engagementType: 'Permanent',
    jobGroup: 'J',
    ethnicity: 'Luhya',
    employeeNumber: '20211234572',
    nationalId: '30987654',
    kraPin: 'A012345684Z',
    children: '2',
    workCounty: 'Nairobi',
    homeCounty: 'Kakamega',
    postalAddress: 'P.O. Box 33556',
    postalCode: '00100',
    stationName: 'Registry Department - Head Office',
    skillLevel: 'Degree (Records Management)',
    company: 'Ministry of Water, Sanitation and Irrigation',
    dateOfBirth: '1986-09-12'
  },
];

export const mockPositions: Position[] = [
  {
    id: "1",
    title: "Senior Software Engineer",
    department: "Engineering",
    status: "open",
    priority: "high",
    applicants: 24,
    postedDate: "2024-03-01",
    closingDate: "2024-03-30",
    description: "We are looking for a Senior Software Engineer with experience in full-stack development, React, and Node.js. You will lead a team of developers and collaborate with product managers to deliver scalable applications.",
    designation: "Senior Software Engineer",
    skillLevel: "Senior",
    stationName: "Nairobi HQ",
    jobGroup: "JG 12",
    employmentType: "Permanent"
  },
  {
    id: "2",
    title: "HR Assistant",
    department: "Human Resources",
    status: "open",
    priority: "medium",
    applicants: 10,
    postedDate: "2024-03-10",
    closingDate: "2024-04-10",
    description: "The HR Assistant will support recruitment, onboarding, and employee engagement activities. Strong organizational and communication skills are required.",
    designation: "HR Assistant",
    skillLevel: "Entry",
    stationName: "Human Resources - Head Office",
    jobGroup: "JG 6",
    employmentType: "Permanent"
  },
  {
    id: "3",
    title: "Marketing Manager",
    department: "Marketing",
    status: "filled",
    priority: "low",
    applicants: 15,
    postedDate: "2024-02-15",
    closingDate: "2024-03-15",
    description: "We are seeking a Marketing Manager to develop and execute campaigns, manage digital channels, and lead a small team. Experience in B2B marketing is a plus.",
    designation: "Marketing Manager",
    skillLevel: "Senior",
    stationName: "Operations Department - Head Office",
    jobGroup: "JG 11",
    employmentType: "Contract"
  }
]


export const mockTrainingRecords: TrainingRecord[] = [
  {
    id: '1',
    employeeId: '1',
    title: 'Cybersecurity Awareness Training',
    type: 'mandatory',
    status: 'completed',
    completionDate: '2024-02-15',
    expiryDate: '2025-02-15',
    provider: 'CyberSafe Institute'
  },
  {
    id: '2',
    employeeId: '2',
    title: 'Leadership Development Program',
    type: 'development',
    status: 'in_progress',
    provider: 'Management Excellence Academy'
  },
  {
    id: '3',
    employeeId: '3',
    title: 'React Advanced Patterns',
    type: 'development',
    status: 'completed',
    completionDate: '2024-03-10',
    provider: 'Tech Learning Hub'
  },
  // Added non-completed items for testing employee flows
  {
    id: 'T100',
    employeeId: '3',
    title: 'Data Protection & GDPR',
    type: 'compliance',
    status: 'in_progress',
    provider: 'Legal Compliance Corp',
    expiryDate: '2025-11-30'
  },
  {
    id: 'T101',
    employeeId: '3',
    title: 'Workplace Safety Basics',
    type: 'mandatory',
    status: 'not_started',
    provider: 'SafetyFirst Academy'
  },
  {
    id: 'T102',
    employeeId: '3',
    title: 'Advanced React Patterns',
    type: 'development',
    status: 'in_progress',
    provider: 'Tech Learning Hub',
    expiryDate: '2025-06-30'
  },
  // Manager records (David Manager, id: '10')
    {
      id: 'dm1',
      employeeId: '10',
      title: 'Cybersecurity Awareness Training',
      type: 'mandatory',
      status: 'in_progress',
      completionDate: '2024-03-01',
      expiryDate: '2025-03-01',
      provider: 'CyberSafe Institute'
    },
    {
      id: 'dm2',
      employeeId: '10',
      title: 'Leadership Development Program',
      type: 'development',
      status: 'completed',
      completionDate: '2024-06-15',
      expiryDate: '2025-06-15',
      provider: 'Management Excellence Academy'
    },
    {
      id: 'dm3',
      employeeId: '10',
      title: 'Data Protection & GDPR Compliance',
      type: 'compliance',
      status: 'in_progress',
      provider: 'Legal Compliance Corp'
    },
];

export const mockLeaveRequests: LeaveRequest[] = [
  // Records for testing manager account (David Manager, id: '10')
  {
    id: 'L100',
    employeeId: '10',
    employeeName: 'David Manager',
    type: 'annual',
    startDate: '2025-08-01',
    endDate: '2025-08-10',
    days: 10,
    status: 'approved',
    reason: 'Annual leave',
    appliedDate: '2025-07-15',
    managerComments: 'Enjoy your break!'
  },
  {
    id: 'L101',
    employeeId: '10',
    employeeName: 'David Manager',
    type: 'sick',
    startDate: '2025-09-01',
    endDate: '2025-09-03',
    days: 3,
    status: 'pending_manager',
    reason: 'Medical',
    appliedDate: '2025-08-31'
  },
  {
    id: '1',
    employeeId: '3',
    employeeName: 'Michael Davis',
    type: 'annual',
    startDate: '2024-03-25',
    endDate: '2024-03-29',
    days: 5,
    status: 'pending_manager',
    reason: 'Family vacation',
    appliedDate: '2024-03-10'
  },
  {
    id: '6',
    employeeId: '3',
    employeeName: 'Michael Davis',
    type: 'sick',
    startDate: '2025-09-10',
    endDate: '2025-09-12',
    days: 3,
    status: 'pending_hr',
    reason: 'Medical recovery',
    appliedDate: '2025-09-09'
  },
  {
    id: '7',
    employeeId: '3',
    employeeName: 'Michael Davis',
    type: 'emergency',
    startDate: '2025-09-15',
    endDate: '2025-09-16',
    days: 2,
    status: 'pending_manager',
    reason: 'Family emergency',
    appliedDate: '2025-09-14'
  },
  {
    id: '2',
    employeeId: '4',
    employeeName: 'Emily Chen',
    type: 'sick',
    startDate: '2024-03-15',
    endDate: '2024-03-16',
    days: 2,
    status: 'approved',
    reason: 'Medical appointment',
    appliedDate: '2024-03-14',
    approvedBy: 'Sarah Johnson',
    approvedDate: '2024-03-14'
  },
  {
    id: '3',
    employeeId: '1',
    employeeName: 'John Smith',
    type: 'study',
    startDate: '2024-04-01',
    endDate: '2024-04-05',
    days: 5,
    status: 'approved',
    reason: 'Professional certification exam',
    appliedDate: '2024-03-01',
    approvedBy: 'Sarah Johnson',
    approvedDate: '2024-03-01'
  },
  {
    id: '4',
    employeeId: '1',
    employeeName: 'John Smith',
    type: 'annual',
    startDate: '2025-09-20',
    endDate: '2025-09-25',
    days: 6,
    status: 'pending_hr',
    reason: 'Travel abroad',
    appliedDate: '2025-09-10'
  },
  {
    id: '5',
    employeeId: '1',
    employeeName: 'John Smith',
    type: 'sick',
    startDate: '2025-08-10',
    endDate: '2025-08-12',
    days: 3,
    status: 'pending_manager',
    reason: 'Flu recovery',
    appliedDate: '2025-08-09'
  }
];

export const mockPerformanceReviews: PerformanceReview[] = [
  // Records for testing manager account (David Manager, id: '10')
  {
    id: 'PR100',
    employeeId: '10',
    employeeName: 'David Manager',
    templateId: 'template-1',
    reviewPeriod: 'Q2 2025',
    status: 'completed',
    employeeTargets: [
      { criteriaId: 'c1', target: 'Deliver Q2 operational OKRs', description: 'Execute quarterly plan' },
      { criteriaId: 'c2', target: 'Monthly townhalls', description: 'Improve transparency' },
      { criteriaId: 'c3', target: 'Implement 2 process improvements', description: 'Lean practices' }
    ],
    employeeScores: [
      { criteriaId: 'c1', score: 5, comments: 'Successfully delivered all Q2 OKRs ahead of schedule' },
      { criteriaId: 'c2', score: 4, comments: 'Conducted monthly townhalls with high attendance and engagement' },
      { criteriaId: 'c3', score: 4, comments: 'Implemented 2 major process improvements that increased efficiency' }
    ],
    employeeSelfComments: 'Strong quarter with successful execution of all operational goals and team engagement initiatives.',
    managerScores: [
      { criteriaId: 'c1', score: 5, comments: 'Exceeded plan delivery' },
      { criteriaId: 'c2', score: 4, comments: 'Clear communication cadence' },
      { criteriaId: 'c3', score: 4, comments: 'Strong improvements' }
    ],
    managerComments: 'Excellent leadership and team management.',
    employeeAckStatus: 'accepted',
    employeeAckComments: 'Thank you for the feedback. I appreciate the recognition of the team\'s efforts.',
    employeeAckDate: '2025-07-05',
    hrComments: 'Consistently exceeds expectations.',
    overallScore: 4.7,
    score: 4.7,
    nextReviewDate: '2025-12-01',
    createdBy: 'HR System',
    createdAt: '2025-06-30'
  },
  {
    id: 'PR101',
    employeeId: '10',
    employeeName: 'David Manager',
    templateId: 'template-1',
    reviewPeriod: 'Q3 2025',
    status: 'draft',
    employeeTargets: [
      { criteriaId: 'c1', target: 'Align Q3 departmental KPIs', description: 'Weekly check-ins' },
      { criteriaId: 'c2', target: 'Improve cross-team updates', description: 'Bi-weekly reports' }
    ],
    nextReviewDate: '2026-03-01',
    createdBy: 'HR System',
    createdAt: '2025-09-01'
  },
  {
    id: '1',
    employeeId: '3',
    employeeName: 'Michael Davis',
    templateId: 'template-1',
    reviewPeriod: 'Q1 2024',
    status: 'completed',
    employeeTargets: [
      { criteriaId: 'c1', target: 'Complete React migration project', description: 'Focus on migration tasks.' },
      { criteriaId: 'c2', target: 'Mentor junior developers', description: 'Weekly mentorship sessions.' },
      { criteriaId: 'c3', target: 'Improve code review process', description: 'Document and share best practices.' }
    ],
    employeeScores: [
      { criteriaId: 'c1', score: 5, comments: 'Successfully completed React migration with zero production issues' },
      { criteriaId: 'c2', score: 4, comments: 'Conducted weekly mentorship sessions with 2 junior developers' },
      { criteriaId: 'c3', score: 4, comments: 'Created comprehensive code review guidelines and improved team practices' }
    ],
    employeeSelfComments: 'Excellent performance this quarter. Strong technical skills and great team collaboration.',
    managerScores: [
      { criteriaId: 'c1', score: 5, comments: 'Migration completed successfully' },
      { criteriaId: 'c2', score: 4, comments: 'Active mentorship observed' },
      { criteriaId: 'c3', score: 4, comments: 'Better review coverage' }
    ],
    managerComments: 'Outstanding technical delivery and team leadership.',
    employeeAckStatus: 'accepted',
    employeeAckComments: 'Thank you for the positive feedback. Looking forward to the next quarter.',
    employeeAckDate: '2024-04-10',
    hrComments: 'Approved. Excellent performance across all criteria.',
    overallScore: 4.5,
    score: 4.5,
    nextReviewDate: '2024-06-30',
    createdBy: 'Sarah Johnson',
    createdAt: '2025-09-01',
    goals: ['Complete React migration project', 'Mentor junior developers', 'Improve code review process'],
    feedback: 'Excellent performance this quarter. Strong technical skills and great team collaboration.'
  },
  {
    id: '2',
    employeeId: '3',
    employeeName: 'Michael Davis',
    templateId: 'template-1',
    reviewPeriod: 'Q3 2024',
    status: 'draft',
    employeeTargets: [
      { criteriaId: 'c1', target: 'Improve system uptime', description: 'Monitor and optimize servers.' },
      { criteriaId: 'c2', target: 'Document new features', description: 'Write user guides.' }
    ],
    managerScores: [],
    managerComments: '',
    hrComments: '',
    nextReviewDate: '2024-12-31',
    createdBy: 'Sarah Johnson',
    createdAt: '2025-09-01',
    goals: ['Improve system uptime', 'Document new features'],
    feedback: 'Work in progress.'
  },
  {
    id: '3',
    employeeId: '3',
    employeeName: 'Michael Davis',
    templateId: 'template-1',
    reviewPeriod: 'Q2 2024',
    status: 'draft',
    employeeTargets: [
      { criteriaId: 'c1', target: 'Maintain 98% accuracy in deliverables', description: 'Focus on code reviews and testing.' },
      { criteriaId: 'c2', target: 'Lead 2 team meetings per month', description: 'Encourage open communication.' },
      { criteriaId: 'c3', target: 'Propose 1 new feature', description: 'Identify and present new ideas.' }
    ],
    managerScores: [],
    managerComments: '',
    hrComments: '',
    nextReviewDate: '2024-09-30',
    createdBy: 'Sarah Johnson',
    createdAt: '2025-09-01',
    goals: [],
    feedback: ''
  },
  // Additional scenarios for Michael Davis (id: '3')
  {
    id: 'PR104',
    employeeId: '3',
    employeeName: 'Michael Davis',
    templateId: 'template-1',
    reviewPeriod: 'Q4 2024',
    status: 'targets_set',
    employeeTargets: [
      { criteriaId: 'c1', target: 'Reduce critical bugs by 30%', description: 'Increase test coverage and peer reviews' },
      { criteriaId: 'c2', target: 'Run bi-weekly knowledge shares', description: 'Friday sessions' }
    ],
    nextReviewDate: '2025-03-31',
    createdBy: 'Sarah Johnson',
    createdAt: '2024-12-15'
  },
  {
    id: 'PR105',
    employeeId: '3',
    employeeName: 'Michael Davis',
    templateId: 'template-1',
    reviewPeriod: 'Q1 2025',
    status: 'employee_ack',
    employeeTargets: [
      { criteriaId: 'c1', target: 'Ship v2 API', description: 'Stability and performance targets' },
      { criteriaId: 'c2', target: 'Improve team collaboration', description: 'Weekly sync meetings' },
      { criteriaId: 'c3', target: 'Propose 2 automation ideas', description: 'CI/CD improvements' }
    ],
    employeeScores: [
      { criteriaId: 'c1', score: 4, comments: 'Successfully shipped v2 API with 99.9% uptime' },
      { criteriaId: 'c2', score: 4, comments: 'Led weekly team syncs and knowledge sharing sessions' },
      { criteriaId: 'c3', score: 5, comments: 'Proposed and implemented 3 automation improvements' }
    ],
    employeeSelfComments: 'Exceeded targets this quarter with strong technical delivery and team collaboration.',
    managerScores: [
      { criteriaId: 'c1', score: 4, comments: 'Delivered with good quality and met deadlines' },
      { criteriaId: 'c2', score: 3, comments: 'Good collaboration, could improve cross-team communication' },
      { criteriaId: 'c3', score: 4, comments: 'Shows initiative and proactive problem-solving' }
    ],
    managerComments: 'Strong quarter with tangible outcomes. Keep up the good work on technical delivery.',
    overallScore: 3.7,
    nextReviewDate: '2025-06-30',
    createdBy: 'Sarah Johnson',
    createdAt: '2025-03-31'
  },
  {
    id: 'PR106',
    employeeId: '3',
    employeeName: 'Michael Davis',
    templateId: 'template-1',
    reviewPeriod: 'Q2 2025',
    status: 'hr_review',
    employeeTargets: [
      { criteriaId: 'c1', target: 'Improve performance tests', description: 'Add load tests to CI' },
      { criteriaId: 'c2', target: 'Mentor junior developers', description: 'Weekly 1-on-1 sessions' },
      { criteriaId: 'c3', target: 'Reduce technical debt', description: 'Refactor legacy code' }
    ],
    employeeScores: [
      { criteriaId: 'c1', score: 5, comments: 'Added comprehensive load tests to CI pipeline' },
      { criteriaId: 'c2', score: 4, comments: 'Mentored 2 junior developers with positive feedback' },
      { criteriaId: 'c3', score: 3, comments: 'Made progress on refactoring, ongoing work' }
    ],
    employeeSelfComments: 'Strong quarter focused on quality and team development.',
    managerScores: [
      { criteriaId: 'c1', score: 4, comments: 'Improved performance tests significantly' },
      { criteriaId: 'c2', score: 4, comments: 'Good team player and mentor' },
      { criteriaId: 'c3', score: 3, comments: 'Some initiative shown on technical debt' }
    ],
    managerComments: 'Ready for HR finalization. Good progress on quality initiatives.',
    overallScore: 3.7,
    employeeAckStatus: 'accepted',
    employeeAckComments: 'Thank you for the feedback. I agree with the assessment and will continue focusing on technical debt reduction in the next quarter.',
    employeeAckDate: '2025-07-05',
    nextReviewDate: '2025-09-30',
    createdBy: 'HR System',
    createdAt: '2025-06-30'
  },
  {
    id: 'PR107',
    employeeId: '3',
    employeeName: 'Michael Davis',
    templateId: 'template-1',
    reviewPeriod: 'Q3 2025',
    status: 'completed',
    employeeTargets: [
      { criteriaId: 'c1', target: 'Maintain code quality', description: 'Focus on best practices' },
      { criteriaId: 'c2', target: 'Team collaboration', description: 'Regular sync meetings' },
      { criteriaId: 'c3', target: 'Process improvements', description: 'Identify and implement improvements' }
    ],
    employeeScores: [
      { criteriaId: 'c1', score: 4, comments: 'Maintained high code quality standards' },
      { criteriaId: 'c2', score: 4, comments: 'Excellent team collaboration' },
      { criteriaId: 'c3', score: 4, comments: 'Implemented several process improvements' }
    ],
    employeeSelfComments: 'Solid quarter with consistent performance across all areas.',
    managerScores: [
      { criteriaId: 'c1', score: 4, comments: 'Consistent quality' },
      { criteriaId: 'c2', score: 4, comments: 'Great collaboration' },
      { criteriaId: 'c3', score: 4, comments: 'Proactive' }
    ],
    managerComments: 'Well rounded quarter',
    employeeAckStatus: 'accepted',
    employeeAckComments: 'Appreciate the feedback. Will continue maintaining these standards.',
    employeeAckDate: '2025-10-05',
    hrComments: 'Approved',
    overallScore: 4.0,
    score: 4.0,
    nextReviewDate: '2025-12-31',
    createdBy: 'HR System',
    createdAt: '2025-09-30'
  },
  // Additional scenarios for David Manager (id: '10') beyond PR100 and PR101
  {
    id: 'PR108',
    employeeId: '10',
    employeeName: 'David Manager',
    templateId: 'template-1',
    reviewPeriod: 'Q4 2025',
    status: 'targets_set',
    employeeTargets: [
      { criteriaId: 'c2', target: 'Monthly townhalls', description: 'Improve team communication' },
      { criteriaId: 'c3', target: 'Implement 1 process improvement', description: 'Streamline approvals' }
    ],
    nextReviewDate: '2026-03-31',
    createdBy: 'HR System',
    createdAt: '2025-12-01'
  },
  {
    id: 'PR109',
    employeeId: '10',
    employeeName: 'David Manager',
    templateId: 'template-1',
    reviewPeriod: 'Q1 2026',
    status: 'employee_ack',
    employeeTargets: [
      { criteriaId: 'c1', target: 'Department OKRs on track', description: 'Track weekly and report monthly' },
      { criteriaId: 'c2', target: 'Improve team engagement', description: 'Monthly team building activities' },
      { criteriaId: 'c3', target: 'Process optimization', description: 'Streamline approval workflows' }
    ],
    employeeScores: [
      { criteriaId: 'c1', score: 5, comments: 'All department OKRs met or exceeded' },
      { criteriaId: 'c2', score: 4, comments: 'Team engagement scores improved by 15%' },
      { criteriaId: 'c3', score: 4, comments: 'Reduced approval time by 30%' }
    ],
    employeeSelfComments: 'Successful quarter with strong team performance and operational improvements.',
    managerScores: [
      { criteriaId: 'c1', score: 4, comments: 'High quality execution on departmental goals' },
      { criteriaId: 'c2', score: 4, comments: 'Clear communication and team leadership' },
      { criteriaId: 'c3', score: 4, comments: 'Strong initiative on process improvements' }
    ],
    managerComments: 'Excellent leadership and execution. Ready for HR review.',
    overallScore: 4.0,
    nextReviewDate: '2026-06-30',
    createdBy: 'HR System',
    createdAt: '2026-03-31'
  },
  {
    id: 'PR110',
    employeeId: '10',
    employeeName: 'David Manager',
    templateId: 'template-1',
    reviewPeriod: 'Q2 2026',
    status: 'completed',
    employeeTargets: [
      { criteriaId: 'c1', target: 'Strategic planning', description: 'Q3-Q4 roadmap' },
      { criteriaId: 'c2', target: 'Team development', description: 'Leadership training program' },
      { criteriaId: 'c3', target: 'Innovation initiatives', description: 'Launch 2 new projects' }
    ],
    employeeScores: [
      { criteriaId: 'c1', score: 5, comments: 'Completed comprehensive strategic plan' },
      { criteriaId: 'c2', score: 4, comments: 'Launched leadership training with 95% participation' },
      { criteriaId: 'c3', score: 5, comments: 'Successfully launched 3 innovation projects' }
    ],
    employeeSelfComments: 'Exceptional quarter with strategic achievements and team growth.',
    managerScores: [
      { criteriaId: 'c1', score: 5, comments: 'Outstanding leadership and strategic vision' },
      { criteriaId: 'c2', score: 4, comments: 'Excellent communication and team development' },
      { criteriaId: 'c3', score: 4, comments: 'Proactively drives improvements and innovation' }
    ],
    managerComments: 'Top performance. Exemplary leadership this quarter.',
    overallScore: 4.5,
    employeeAckStatus: 'accepted',
    employeeAckComments: 'Appreciate the recognition. Looking forward to continuing the momentum in Q3.',
    employeeAckDate: '2026-07-02',
    hrComments: 'Approved and recorded. Outstanding performance across all criteria.',
    score: 4.5,
    nextReviewDate: '2026-09-30',
    createdBy: 'HR System',
    createdAt: '2026-06-30'
  },
  // Test scenarios for David Manager as a manager reviewing team submissions
  {
    id: 'PR112',
    employeeId: '6',
    employeeName: 'Jane Smith',
    employeeNumber: '20210815001',
    templateId: 'template-1',
    reviewPeriod: 'Q3 2025',
    status: 'manager_review',
    employeeTargets: [
      { criteriaId: 'c1', target: 'Optimize database queries', description: 'Reduce query time by 40%' },
      { criteriaId: 'c2', target: 'Mentor junior developers', description: 'Weekly code review sessions' },
      { criteriaId: 'c3', target: 'Implement caching layer', description: 'Redis implementation for API' }
    ],
    employeeScores: [
      { criteriaId: 'c1', score: 5, comments: 'Reduced query time by 45% through indexing and optimization' },
      { criteriaId: 'c2', score: 4, comments: 'Conducted weekly sessions, positive feedback from team' },
      { criteriaId: 'c3', score: 5, comments: 'Successfully implemented Redis, improved response time by 60%' }
    ],
    employeeSelfComments: 'Exceeded performance targets and contributed significantly to team development.',
    nextReviewDate: '2025-12-31',
    createdBy: 'HR System',
    createdAt: '2025-09-15'
  },
  {
    id: 'PR113',
    employeeId: '7',
    employeeName: 'Robert Chen',
    employeeNumber: '20220301002',
    templateId: 'template-1',
    reviewPeriod: 'Q3 2025',
    status: 'manager_review',
    employeeTargets: [
      { criteriaId: 'c1', target: 'Automate deployment pipeline', description: 'CI/CD for all services' },
      { criteriaId: 'c2', target: 'Infrastructure monitoring', description: 'Set up comprehensive monitoring' },
      { criteriaId: 'c3', target: 'Cost optimization', description: 'Reduce cloud costs by 20%' }
    ],
    employeeScores: [
      { criteriaId: 'c1', score: 4, comments: 'Automated 80% of deployment pipeline, remaining 20% in progress' },
      { criteriaId: 'c2', score: 5, comments: 'Implemented full monitoring with Prometheus and Grafana' },
      { criteriaId: 'c3', score: 4, comments: 'Reduced costs by 22% through resource optimization' }
    ],
    employeeSelfComments: 'Strong quarter with significant infrastructure improvements and cost savings.',
    nextReviewDate: '2025-12-31',
    createdBy: 'HR System',
    createdAt: '2025-09-15'
  },
  {
    id: 'PR114',
    employeeId: '3',
    employeeName: 'Michael Davis',
    employeeNumber: '20221234569',
    templateId: 'template-1',
    reviewPeriod: 'Q4 2025',
    status: 'manager_review',
    employeeTargets: [
      { criteriaId: 'c1', target: 'Refactor authentication system', description: 'Implement OAuth 2.0' },
      { criteriaId: 'c2', target: 'Code review participation', description: 'Review 50+ PRs per month' },
      { criteriaId: 'c3', target: 'Technical documentation', description: 'Document all API endpoints' }
    ],
    employeeScores: [
      { criteriaId: 'c1', score: 5, comments: 'Successfully implemented OAuth 2.0 with comprehensive testing' },
      { criteriaId: 'c2', score: 5, comments: 'Reviewed 65+ PRs per month, excellent feedback quality' },
      { criteriaId: 'c3', score: 4, comments: 'Documented 90% of endpoints with examples and use cases' }
    ],
    employeeSelfComments: 'Highly productive quarter with focus on security and code quality.',
    nextReviewDate: '2026-03-31',
    createdBy: 'HR System',
    createdAt: '2025-12-15'
  },
  // New test scenario: Employee declined manager review
  {
    id: 'PR111',
    employeeId: '3',
    employeeName: 'Michael Davis',
    templateId: 'template-1',
    reviewPeriod: 'Q3 2025 (Test - Declined)',
    status: 'hr_review',
    employeeTargets: [
      { criteriaId: 'c1', target: 'Lead migration project', description: 'Migrate legacy system to new platform' },
      { criteriaId: 'c2', target: 'Improve documentation', description: 'Create comprehensive API docs' },
      { criteriaId: 'c3', target: 'Code quality initiatives', description: 'Increase test coverage to 80%' }
    ],
    employeeScores: [
      { criteriaId: 'c1', score: 5, comments: 'Successfully led migration with zero downtime' },
      { criteriaId: 'c2', score: 5, comments: 'Created comprehensive documentation with examples' },
      { criteriaId: 'c3', score: 4, comments: 'Increased test coverage from 60% to 85%' }
    ],
    employeeSelfComments: 'Exceeded all targets with significant impact on team productivity and code quality.',
    managerScores: [
      { criteriaId: 'c1', score: 3, comments: 'Migration completed but with some delays' },
      { criteriaId: 'c2', score: 3, comments: 'Documentation is adequate but could be more detailed' },
      { criteriaId: 'c3', score: 3, comments: 'Test coverage improved but still needs work' }
    ],
    managerComments: 'Satisfactory performance. Need to work on meeting deadlines and attention to detail.',
    overallScore: 3.0,
    employeeAckStatus: 'declined',
    employeeAckComments: 'I respectfully disagree with this assessment. The migration was completed ahead of the revised timeline we agreed upon after scope changes. The documentation received positive feedback from the team. I would like to discuss the specific concerns about delays and detail, as I believe there may be a misunderstanding about the project scope and deliverables.',
    employeeAckDate: '2025-10-05',
    nextReviewDate: '2025-12-31',
    createdBy: 'HR System',
    createdAt: '2025-09-30'
  }
];