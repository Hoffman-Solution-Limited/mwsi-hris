import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { mockLeaveRequests, LeaveRequest } from '@/data/mockData';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

type LeaveContextType = {
  leaveRequests: LeaveRequest[];
  addLeaveRequest: (input: Omit<LeaveRequest, 'id' | 'status' | 'appliedDate' | 'employeeName'>) => void;
  approveManagerRequest: (id: string, comments?: string) => void;
  rejectManagerRequest: (id: string, comments?: string) => void;
  approveHrRequest: (id: string, comments?: string) => void;
  rejectHrRequest: (id: string, comments?: string) => void;
};

const LeaveContext = createContext<LeaveContextType | undefined>(undefined);

const STORAGE_KEY = 'hris-leave-requests';

export const LeaveProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {}
    }
    return mockLeaveRequests;
  });

  // Persist to localStorage and attempt to load from backend on mount (fallback to mock/local)
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(leaveRequests)); } catch {}
  }, [leaveRequests]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const rows = await api.get('/api/leaves');
        if (!mounted) return;
        if (Array.isArray(rows) && rows.length > 0) setLeaveRequests(rows as LeaveRequest[]);
      } catch (err) {
        // fallback to mock/local
      }
    })();
    return () => { mounted = false; };
  }, []);

  const addLeaveRequest: LeaveContextType['addLeaveRequest'] = (input) => {
    if (!user) return;
    (async () => {
      try {
        const payload = { ...input, employeeName: user.name, status: 'pending_manager', appliedDate: new Date().toISOString().slice(0,10) };
        const created = await api.post('/api/leaves', payload);
        setLeaveRequests(prev => [created as LeaveRequest, ...prev]);
      } catch (err) {
        const newRequest: LeaveRequest = {
          id: crypto.randomUUID(),
          employeeId: input.employeeId,
          employeeName: user.name,
          type: input.type,
          startDate: input.startDate,
          endDate: input.endDate,
          days: input.days,
          status: 'pending_manager',
          reason: input.reason,
          appliedDate: new Date().toISOString().slice(0, 10)
        };
        setLeaveRequests(prev => [newRequest, ...prev]);
      }
    })();
  };

  const approveManagerRequest = (id: string, comments?: string) => {
    if (!user) return;
    (async () => {
      try {
        const updated = await api.put(`/api/leaves/${id}`, { status: 'pending_hr', managerComments: comments, approvedBy: user.name, approvedDate: new Date().toISOString().slice(0,10) });
        setLeaveRequests(prev => prev.map(r => (r.id === id ? (updated as LeaveRequest) : r)));
      } catch (err) {
        setLeaveRequests(prev => prev.map(r => 
          r.id === id 
            ? { 
                ...r, 
                status: 'pending_hr', 
                managerComments: comments,
                approvedBy: user.name,
                approvedDate: new Date().toISOString().slice(0, 10)
              } 
            : r
        ));
      }
    })();
  };

  const rejectManagerRequest = (id: string, comments?: string) => {
    if (!user) return;
    (async () => {
      try {
        const updated = await api.put(`/api/leaves/${id}`, { status: 'rejected', managerComments: comments, approvedBy: user.name, approvedDate: new Date().toISOString().slice(0,10) });
        setLeaveRequests(prev => prev.map(r => (r.id === id ? (updated as LeaveRequest) : r)));
      } catch (err) {
        setLeaveRequests(prev => prev.map(r => 
          r.id === id 
            ? { 
                ...r, 
                status: 'rejected', 
                managerComments: comments,
                approvedBy: user.name,
                approvedDate: new Date().toISOString().slice(0, 10)
              } 
            : r
        ));
      }
    })();
  };

  const approveHrRequest = (id: string, comments?: string) => {
    if (!user) return;
    (async () => {
      try {
        const updated = await api.put(`/api/leaves/${id}`, { status: 'approved', hrComments: comments, approvedBy: user.name, approvedDate: new Date().toISOString().slice(0,10) });
        setLeaveRequests(prev => prev.map(r => (r.id === id ? (updated as LeaveRequest) : r)));
      } catch (err) {
        setLeaveRequests(prev => prev.map(r => 
          r.id === id 
            ? { 
                ...r, 
                status: 'approved', 
                hrComments: comments,
                approvedBy: user.name,
                approvedDate: new Date().toISOString().slice(0, 10)
              } 
            : r
        ));
      }
    })();
  };

  const rejectHrRequest = (id: string, comments?: string) => {
    if (!user) return;
    (async () => {
      try {
        const updated = await api.put(`/api/leaves/${id}`, { status: 'rejected', hrComments: comments, approvedBy: user.name, approvedDate: new Date().toISOString().slice(0,10) });
        setLeaveRequests(prev => prev.map(r => (r.id === id ? (updated as LeaveRequest) : r)));
      } catch (err) {
        setLeaveRequests(prev => prev.map(r => 
          r.id === id 
            ? { 
                ...r, 
                status: 'rejected', 
                hrComments: comments,
                approvedBy: user.name,
                approvedDate: new Date().toISOString().slice(0, 10)
              } 
            : r
        ));
      }
    })();
  };

  const value = useMemo(() => ({ 
    leaveRequests, 
    addLeaveRequest, 
    approveManagerRequest, 
    rejectManagerRequest,
    approveHrRequest,
    rejectHrRequest
  }), [leaveRequests]);

  return (
    <LeaveContext.Provider value={value}>
      {children}
    </LeaveContext.Provider>
  );
};

export const useLeave = () => {
  const ctx = useContext(LeaveContext);
  if (!ctx) throw new Error('useLeave must be used within LeaveProvider');
  return ctx;
};


