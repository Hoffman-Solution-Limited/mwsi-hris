// Mock data for hired candidates
export const mockHiredCandidates = [
  {
    id: "sc-1",
    name: "Jane Doe",
    position: "Government Data Analyst",
    jobId: "gov-1",
    cv: { name: "JaneDoeCV.pdf" },
    hireReason: "Excellent technical skills and interview performance."
  },
  {
    id: "sc-3",
    name: "Alice Brown",
    position: "Public Relations Officer",
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
    templateId?: string;
  reviewPeriod: string;
  status: 'draft' | 'targets_set' | 'manager_review' | 'hr_review' | 'completed';
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
    hrScores?: {
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
    criteria: [
      { id: 'c1', name: 'Quality of Work', weight: 40, description: 'Accuracy, thoroughness, and effectiveness.' },
      { id: 'c2', name: 'Teamwork', weight: 30, description: 'Collaboration and communication.' },
      { id: 'c3', name: 'Initiative', weight: 30, description: 'Proactiveness and problem-solving.' }
    ],
    createdBy: 'Sarah Johnson',
    createdAt: '2025-09-01'
  }
];
export interface Employee {
  id: string;
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
  employmentType?: string;
  staffNumber?: string;
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
    employmentType: 'Permanent',
    staffNumber: '20221234567',
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
    employmentType: 'Permanent',
    staffNumber: '20211234568',
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
      staffNumber: '2019031010',
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
    employmentType: 'Permanent',
    staffNumber: '20221234569',
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
    employmentType: 'Contract',
    staffNumber: '20231234570',
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
    employmentType: 'Permanent',
    staffNumber: '20201234571',
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
];


export const mockDocuments: Document[] = [
  {
    id: '1',
    name: 'Employee Handbook 2024.pdf',
    type: 'policy',
    uploadDate: '2024-01-15',
    createdAt: '2024-01-10',
    size: '2.3 MB',
    status: 'approved',
    uploadedBy: 'Sarah Johnson',
    category: 'Policies & Procedures'
  },
  {
    id: '2',
    name: 'Training Certificate - Data Protection.pdf',
    type: 'certificate',
    uploadDate: '2024-02-20',
    createdAt: '2024-02-18',
    size: '856 KB',
    status: 'approved',
    uploadedBy: 'Michael Davis',
    category: 'Training Records'
  },
  {
    id: '3',
    name: 'Performance Review Q1 2024.docx',
    type: 'form',
    uploadDate: '2024-03-10',
    size: '1.2 MB',
    status: 'pending',
    uploadedBy: 'John Smith',
    category: 'Performance Management'
  },
  {
    id: '4',
    name: 'Employment Contract - Emily Chen.pdf',
    type: 'contract',
    uploadDate: '2024-02-14',
    size: '945 KB',
    status: 'approved',
    uploadedBy: 'Sarah Johnson',
    category: 'Contracts'
  }
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
    description: "We are looking for a Senior Software Engineer with experience in full-stack development, React, and Node.js. You will lead a team of developers and collaborate with product managers to deliver scalable applications."
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
    description: "The HR Assistant will support recruitment, onboarding, and employee engagement activities. Strong organizational and communication skills are required."
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
    description: "We are seeking a Marketing Manager to develop and execute campaigns, manage digital channels, and lead a small team. Experience in B2B marketing is a plus."
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
    managerScores: [
      { criteriaId: 'c1', score: 5, comments: 'Exceeded plan delivery' },
      { criteriaId: 'c2', score: 4, comments: 'Clear communication cadence' },
      { criteriaId: 'c3', score: 4, comments: 'Strong improvements' }
    ],
    hrScores: [
      { criteriaId: 'c1', score: 5, comments: 'Outstanding execution' },
      { criteriaId: 'c2', score: 4, comments: 'Positive feedback from staff' },
      { criteriaId: 'c3', score: 5, comments: 'High impact changes' }
    ],
    overallScore: 4.7,
    managerComments: 'Excellent leadership and team management.',
    hrComments: 'Consistently exceeds expectations.',
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
    managerScores: [
      { criteriaId: 'c1', score: 5, comments: 'Migration completed successfully' },
      { criteriaId: 'c2', score: 4, comments: 'Active mentorship observed' },
      { criteriaId: 'c3', score: 4, comments: 'Better review coverage' }
    ],
    hrScores: [
      { criteriaId: 'c1', score: 4, comments: 'Delivery met expectations' },
      { criteriaId: 'c2', score: 4, comments: 'Positive peer feedback' },
      { criteriaId: 'c3', score: 5, comments: 'Process improved' }
    ],
    overallScore: 4.5,
    managerComments: '',
    hrComments: '',
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
    hrScores: [],
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
    hrScores: [],
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
    status: 'manager_review',
    employeeTargets: [
      { criteriaId: 'c1', target: 'Ship v2 API', description: 'Stability and performance targets' },
      { criteriaId: 'c3', target: 'Propose 2 automation ideas', description: 'CI/CD improvements' }
    ],
    managerScores: [
      { criteriaId: 'c1', score: 4, comments: 'Delivered with good quality' },
      { criteriaId: 'c2', score: 3, comments: 'Collaborates with team' },
      { criteriaId: 'c3', score: 4, comments: 'Shows initiative' }
    ],
    managerComments: 'Strong quarter with tangible outcomes.',
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
      { criteriaId: 'c1', target: 'Improve performance tests', description: 'Add load tests to CI' }
    ],
    managerScores: [
      { criteriaId: 'c1', score: 4, comments: 'Improved performance tests' },
      { criteriaId: 'c2', score: 4, comments: 'Good team player' },
      { criteriaId: 'c3', score: 3, comments: 'Some initiative shown' }
    ],
    hrScores: [],
    managerComments: 'Ready for HR finalization.',
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
    managerScores: [
      { criteriaId: 'c1', score: 4, comments: 'Consistent quality' },
      { criteriaId: 'c2', score: 4, comments: 'Great collaboration' },
      { criteriaId: 'c3', score: 4, comments: 'Proactive' }
    ],
    hrScores: [
      { criteriaId: 'c1', score: 4, comments: 'Meets standards' },
      { criteriaId: 'c2', score: 4, comments: 'Positive feedback from peers' },
      { criteriaId: 'c3', score: 4, comments: 'Initiatives recognized' }
    ],
    overallScore: 4.0,
    score: 4.0,
    managerComments: 'Well rounded quarter',
    hrComments: 'Approved',
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
    status: 'manager_review',
    employeeTargets: [
      { criteriaId: 'c1', target: 'Department OKRs on track', description: 'Track weekly' }
    ],
    managerScores: [
      { criteriaId: 'c1', score: 4, comments: 'High quality execution' },
      { criteriaId: 'c2', score: 4, comments: 'Clear communication' },
      { criteriaId: 'c3', score: 4, comments: 'Strong initiative' }
    ],
    managerComments: 'Submitting to HR.',
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
    managerScores: [
      { criteriaId: 'c1', score: 5, comments: 'Outstanding leadership' },
      { criteriaId: 'c2', score: 4, comments: 'Excellent communication' },
      { criteriaId: 'c3', score: 4, comments: 'Proactively drives improvements' }
    ],
    hrScores: [
      { criteriaId: 'c1', score: 5, comments: 'Exemplary performance' },
      { criteriaId: 'c2', score: 4, comments: 'Consistently clear' },
      { criteriaId: 'c3', score: 4, comments: 'Recognized initiatives' }
    ],
    overallScore: 4.5,
    score: 4.5,
    managerComments: 'Top performance',
    hrComments: 'Approved and recorded',
    nextReviewDate: '2026-09-30',
    createdBy: 'HR System',
    createdAt: '2026-06-30'
  }
];