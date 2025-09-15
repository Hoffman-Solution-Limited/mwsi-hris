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

export interface PerformanceReview {
  id: string;
  employeeId: string;
  employeeName: string;
  reviewPeriod: string;
  status: 'draft' | 'in_review' | 'completed';
  score?: number;
  goals: string[];
  feedback: string;
  nextReviewDate: string;
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
    id: '3',
    name: 'Michael Davis',
    email: 'michael.davis@mwsi.com',
    position: 'Software Developer',
    department: 'Engineering',
    manager: 'John Smith',
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
  }
];

export const mockLeaveRequests: LeaveRequest[] = [
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
  }
];

export const mockPerformanceReviews: PerformanceReview[] = [
  {
    id: '1',
    employeeId: '3',
    employeeName: 'Michael Davis',
    reviewPeriod: 'Q1 2024',
    status: 'completed',
    score: 4.5,
    goals: ['Complete React migration project', 'Mentor junior developers', 'Improve code review process'],
    feedback: 'Excellent performance this quarter. Strong technical skills and great team collaboration.',
    nextReviewDate: '2024-06-30'
  },
  {
    id: '2',
    employeeId: '4',
    employeeName: 'Emily Chen',
    reviewPeriod: 'Q1 2024',
    status: 'in_review',
    goals: ['Launch new marketing campaign', 'Increase social media engagement', 'Develop content strategy'],
    feedback: 'Good progress on marketing initiatives. Need to focus more on analytics.',
    nextReviewDate: '2024-06-30'
  }
];