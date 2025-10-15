import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useEmployees } from '@/contexts/EmployeesContext';
import { useAuth, UserRole } from '@/contexts/AuthContext';
import { useNotifications } from '@/contexts/NotificationsContext';

// Document types are flexible strings to allow adding new document names at runtime
export type DocumentType = string;

export type MovementEntry = {
  byUserId: string;
  byUserName: string;
  fromLocation: string;
  toLocation: string;
  toAssigneeUserId?: string;
  toAssigneeName?: string;
  timestamp: string; // ISO
  remarks?: string;
};

// One physical file per employee
export type EmployeeFile = {
  employeeId: string; // Unique file identifier
  currentLocation: string; // e.g., Registry Office, HR, Finance, Room 101
  assignedUserId?: string; // current holder
  assignedUserName?: string;
  // Placeholder documents for reference only (flexible list of document names)
  defaultDocuments: DocumentType[];
  movementHistory: MovementEntry[];
};

const DEFAULT_LOCATION = 'Registry Office';

export const DEFAULT_DOCUMENT_TYPES: DocumentType[] = [
  'Birth_Certificate',
  'National_ID_Card',
  'Current_Passport_Photo',
  'KRA_PIN',
  'Letter_of_First_Appointment',
  'Letter_of_Confirmation',
  'All_Promotion_Letters',
  'Secondment_Letter',
  'Next_of_Kin_GP25',
  'Professional_and_Academic_Certificates',
];

const STORAGE_KEY = 'hris-file-tracking-v2';
const STORAGE_REQUESTS_KEY = 'hris-file-requests';

// File Request type (top-level)
export type FileRequest = {
  id: string;
  fileId: string;
  employeeId: string; // owner of the file (same as part before underscore)
  documentType: string; // flexible document name (e.g., 'Birth_Certificate')
  requestedByUserId: string;
  requestedByName: string;
  requestedByDepartment?: string;
  status: 'pending' | 'approved' | 'rejected' | 'fulfilled';
  createdAt: string;
  remarks?: string;
};

type FileTrackingContextType = {
  files: EmployeeFile[];
  getFileByEmployeeId: (employeeId: string) => EmployeeFile | undefined;
  moveFile: (employeeId: string, params: { toLocation: string; toAssigneeUserId?: string; toAssigneeName?: string; remarks?: string }) => void;
  ensureDefaultsForEmployee: (employeeId: string) => void;
  // Document types management
  knownDocumentTypes: DocumentType[];
  addDocumentType: (name: string) => void;
  renameDocumentType: (oldName: string, newName: string) => void;
  deleteDocumentType: (name: string) => void;
  // Requests
  requests: FileRequest[];
  listMyRequests: (userId: string) => FileRequest[];
  listAllRequests: () => FileRequest[];
  requestFile: (employeeId: string, remarks?: string, documentType?: string) => void;
  approveRequest: (requestId: string, params: { toLocation: string; comment?: string }) => void;
  rejectRequest: (requestId: string, reason?: string) => void;
  listAssignedToUser: (userId: string) => EmployeeFile[];
};

const FileTrackingContext = createContext<FileTrackingContextType | undefined>(undefined);

export const FileTrackingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { employees } = useEmployees();
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const [files, setFiles] = useState<EmployeeFile[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
      // Migration path: check legacy storage 'hris-file-tracking'
      const legacy = localStorage.getItem('hris-file-tracking');
      if (legacy) {
        try {
          const legacyItems = JSON.parse(legacy) as any[];
          // legacy had id like "<empId>_<DocumentType>"
          const map = new Map<string, EmployeeFile>();
          for (const it of legacyItems) {
            const empId = (it.employeeId) || (typeof it.id === 'string' ? String(it.id).split('_')[0] : undefined);
            if (!empId) continue;
            if (!map.has(empId)) {
              map.set(empId, {
                employeeId: empId,
                currentLocation: 'Registry Office',
                assignedUserId: undefined,
                assignedUserName: undefined,
                defaultDocuments: DEFAULT_DOCUMENT_TYPES,
                movementHistory: [
                  {
                    byUserId: 'system',
                    byUserName: 'System',
                    fromLocation: '—',
                    toLocation: 'Registry Office',
                    timestamp: new Date().toISOString(),
                    remarks: 'Migrated from legacy tracking',
                  },
                ],
              });
            }
          }
          return Array.from(map.values());
        } catch {}
      }
    } catch {}
    return [];
  });
  const [requests, setRequests] = useState<FileRequest[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_REQUESTS_KEY);
      if (raw) return JSON.parse(raw);
    } catch {}
    // If no stored requests, seed a few sample pending requests for testing if employees exist
    try {
      const rawEmps = localStorage.getItem('hris-employees');
      // fallback: if employees are available via context at runtime we also seed in useEffect below
      const sample: FileRequest[] = [];
      return sample;
    } catch {}
    return [];
  });

  // Persist known document types so admins can add new names
  const DOCS_KEY = 'hris-document-types';
  const [knownDocumentTypes, setKnownDocumentTypes] = useState<DocumentType[]>(() => {
    try {
      const raw = localStorage.getItem(DOCS_KEY);
      if (raw) return JSON.parse(raw);
    } catch {}
    return DEFAULT_DOCUMENT_TYPES.slice();
  });
  useEffect(() => { try { localStorage.setItem(DOCS_KEY, JSON.stringify(knownDocumentTypes)); } catch {} }, [knownDocumentTypes]);

  const addDocumentType = (name: string) => {
    const n = (name || '').toString().trim();
    if (!n) return;
    setKnownDocumentTypes(prev => prev.includes(n) ? prev : [...prev, n]);
    // Add to all employee files as a default document if not present
    setFiles(prev => prev.map(f => ({ ...f, defaultDocuments: f.defaultDocuments.includes(n) ? f.defaultDocuments : [...f.defaultDocuments, n] })));
  };

  const renameDocumentType: FileTrackingContextType['renameDocumentType'] = (oldName, newName) => {
    const o = (oldName || '').toString().trim();
    const n = (newName || '').toString().trim();
    if (!o || !n || o === n) return;
    setKnownDocumentTypes(prev => {
      if (!prev.includes(o)) return prev;
      if (prev.includes(n)) {
        // If new already exists, just remove old to avoid duplicates
        return prev.filter(d => d !== o);
      }
      return prev.map(d => (d === o ? n : d));
    });
    // Update all employee files defaultDocuments
    setFiles(prev => prev.map(f => {
      if (!f.defaultDocuments.includes(o)) return f;
      const updated = f.defaultDocuments.map(d => (d === o ? n : d));
      return { ...f, defaultDocuments: Array.from(new Set(updated)) };
    }));
    // Update requests that referenced old name
    setRequests(prev => prev.map(r => (r.documentType === o ? { ...r, documentType: n } : r)));
  };

  const deleteDocumentType: FileTrackingContextType['deleteDocumentType'] = (name) => {
    const n = (name || '').toString().trim();
    if (!n) return;
    setKnownDocumentTypes(prev => prev.filter(d => d !== n));
    // Remove from all employee files defaultDocuments
    setFiles(prev => prev.map(f => ({ ...f, defaultDocuments: f.defaultDocuments.filter(d => d !== n) })));
    // We intentionally do not mutate existing requests; historical records may still refer to removed types
  };

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(files)); } catch {}
  }, [files]);
  useEffect(() => {
    try { localStorage.setItem(STORAGE_REQUESTS_KEY, JSON.stringify(requests)); } catch {}
  }, [requests]);

  // Auto-create file per employee when employees list changes
  useEffect(() => {
    if (!employees || employees.length === 0) return;
    setFiles(prev => {
      const existing = new Map(prev.map(f => [f.employeeId, f]));
      const next: EmployeeFile[] = [...prev];
      for (const emp of employees) {
        if (!existing.has(emp.id)) {
          next.push({
            employeeId: emp.id,
            currentLocation: DEFAULT_LOCATION,
            assignedUserId: undefined,
            assignedUserName: undefined,
            defaultDocuments: DEFAULT_DOCUMENT_TYPES,
            movementHistory: [
              {
                byUserId: user?.id || 'system',
                byUserName: user?.name || 'System',
                fromLocation: '—',
                toLocation: DEFAULT_LOCATION,
                timestamp: new Date().toISOString(),
                remarks: 'Auto-created employee file',
              },
            ],
          });
        }
      }
      return next;
    });
  // We intentionally depend only on employees length and ids to avoid infinite loops
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify((employees || []).map(e => e.id))]);

  // Seed sample pending requests for testing when none exist and employees are available
  useEffect(() => {
    if (!employees || employees.length === 0) return;
    if (requests && requests.length > 0) return;
    // Create a few sample requests using existing employees
    const samples: FileRequest[] = employees.slice(0, 3).map((emp, idx) => ({
      id: crypto.randomUUID(),
      fileId: emp.id,
      employeeId: emp.id,
      documentType: idx === 0 ? 'Birth_Certificate' : idx === 1 ? 'National_ID_Card' : 'KRA_PIN',
      requestedByUserId: (employees[1] && employees[1].id) || 'system',
      requestedByName: (employees[1] && employees[1].name) || 'System',
      requestedByDepartment: (employees[1] && employees[1].department) || undefined,
      status: 'pending',
      createdAt: new Date(Date.now() - (idx * 1000 * 60 * 60)).toISOString(),
      remarks: idx === 0 ? 'Needed for onboarding' : idx === 1 ? 'Verification' : 'Audit',
    }));
    setRequests(samples);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify((employees || []).map(e => e.id)), requests.length]);

  const getFileByEmployeeId = (employeeId: string) => files.find(f => f.employeeId === employeeId);

  const canAdmin = (role?: UserRole) => role === 'admin';
  const canRequest = (role?: UserRole) => role === 'hr_manager' || role === 'manager';
  const canRegistryApprove = (role?: UserRole) => role === 'registry_manager' || role === 'registry_staff';

  const moveFile: FileTrackingContextType['moveFile'] = (employeeId, { toLocation, toAssigneeUserId, toAssigneeName, remarks }) => {
    if (!user) return;
    // Only Admin can move directly
    if (!canAdmin(user.role)) return;
    setFiles(prev => prev.map(f => {
      if (f.employeeId !== employeeId) return f;
      const entry: MovementEntry = {
        byUserId: user.id,
        byUserName: user.name,
        fromLocation: f.currentLocation,
        toLocation,
        toAssigneeUserId,
        toAssigneeName,
        timestamp: new Date().toISOString(),
        remarks,
      };
      return {
        ...f,
        currentLocation: toLocation,
        assignedUserId: toAssigneeUserId,
        assignedUserName: toAssigneeName,
        movementHistory: [...f.movementHistory, entry],
      };
    }));
  };

  const listAssignedToUser: FileTrackingContextType['listAssignedToUser'] = (userId) =>
    files.filter(f => f.assignedUserId === userId);

  const ensureDefaultsForEmployee: FileTrackingContextType['ensureDefaultsForEmployee'] = (employeeId) => {
    setFiles(prev => {
      const existing = prev.find(f => f.employeeId === employeeId);
      if (existing) return prev;
      return [
        ...prev,
        {
          employeeId,
          currentLocation: DEFAULT_LOCATION,
          assignedUserId: undefined,
          assignedUserName: undefined,
          defaultDocuments: DEFAULT_DOCUMENT_TYPES,
          movementHistory: [
            {
              byUserId: user?.id || 'system',
              byUserName: user?.name || 'System',
              fromLocation: '—',
              toLocation: DEFAULT_LOCATION,
              timestamp: new Date().toISOString(),
              remarks: 'Auto-created employee file',
            },
          ],
        },
      ];
    });
  };

  const listMyRequests: FileTrackingContextType['listMyRequests'] = (userId) =>
    requests.filter(r => r.requestedByUserId === userId).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const listAllRequests: FileTrackingContextType['listAllRequests'] = () =>
    [...requests].sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const requestFile: FileTrackingContextType['requestFile'] = (employeeId, remarks, documentType) => {
    if (!user) return;
    if (!canRequest(user.role) && !canAdmin(user.role)) return; // Only HR Manager/Manager/Admin can request
    const file = files.find(f => f.employeeId === employeeId);
    if (!file) return;
    const req: FileRequest = {
      id: crypto.randomUUID(),
      fileId: employeeId,
      employeeId: file.employeeId,
      documentType: documentType || 'All_Promotion_Letters', // optional specific document requested
      requestedByUserId: user.id,
      requestedByName: user.name,
      requestedByDepartment: user.department,
      status: 'pending',
      createdAt: new Date().toISOString(),
      remarks,
    };
    setRequests(prev => [req, ...prev]);
    // Notify HR Manager (mock user id '2' from AuthContext)
    try {
      addNotification({
        userId: '2',
        title: 'New File Request',
        message: `${user.name} requested employee file ${employeeId}`,
        link: '/employee-files',
        type: 'info',
      });
    } catch {}
  };

  const approveRequest: FileTrackingContextType['approveRequest'] = (requestId, { toLocation, comment }) => {
    if (!user || !canRegistryApprove(user.role)) return;
    const req = requests.find(r => r.id === requestId);
    if (!req) return;
    // Move file to requester
    setFiles(prev => prev.map(f => {
      if (f.employeeId !== req.employeeId) return f;
      const entry: MovementEntry = {
        byUserId: user.id,
        byUserName: user.name,
        fromLocation: f.currentLocation,
        toLocation,
        toAssigneeUserId: req.requestedByUserId,
        toAssigneeName: req.requestedByName,
        timestamp: new Date().toISOString(),
        remarks: comment || 'Request approved',
      };
      return {
        ...f,
        currentLocation: toLocation,
        assignedUserId: req.requestedByUserId,
        assignedUserName: req.requestedByName,
        movementHistory: [...f.movementHistory, entry],
      };
    }));
    // Mark request as fulfilled
    setRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: 'fulfilled' } : r));
    // Notify requester
    try {
      addNotification({
        userId: req.requestedByUserId,
        title: 'File Request Approved',
        message: `Your request for employee file ${req.employeeId} has been approved.`,
        link: '/my-files',
        type: 'success',
      });
    } catch {}
  };

  const rejectRequest: FileTrackingContextType['rejectRequest'] = (requestId, reason) => {
    if (!user || !canRegistryApprove(user.role)) return;
    const req = requests.find(r => r.id === requestId);
    setRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: 'rejected', remarks: reason || r.remarks } : r));
    // Notify requester
    if (req) {
      try {
        addNotification({
          userId: req.requestedByUserId,
          title: 'File Request Rejected',
          message: `Your request for employee file ${req.employeeId} was rejected.${reason ? ' Reason: ' + reason : ''}`,
          link: '/my-files',
          type: 'warning',
        });
      } catch {}
    }
  };

  const value = useMemo(() => ({ files, getFileByEmployeeId, moveFile, ensureDefaultsForEmployee, knownDocumentTypes, addDocumentType, renameDocumentType, deleteDocumentType, requests, listMyRequests, listAllRequests, requestFile, approveRequest, rejectRequest, listAssignedToUser }), [files, requests, knownDocumentTypes]);

  return (
    <FileTrackingContext.Provider value={value}>
      {children}
    </FileTrackingContext.Provider>
  );
};

export const useFileTracking = () => {
  const ctx = useContext(FileTrackingContext);
  if (!ctx) throw new Error('useFileTracking must be used within FileTrackingProvider');
  return ctx;
};
