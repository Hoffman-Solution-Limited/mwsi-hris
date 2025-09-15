import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { mockLeaveRequests, LeaveRequest } from '@/data/mockData';
import { useAuth } from '@/contexts/AuthContext';

type LeaveContextType = {
  leaveRequests: LeaveRequest[];
  addLeaveRequest: (input: Omit<LeaveRequest, 'id' | 'status' | 'appliedDate' | 'employeeName'>) => void;
  approveRequest: (id: string) => void;
  rejectRequest: (id: string) => void;
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

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(leaveRequests));
  }, [leaveRequests]);

  const addLeaveRequest: LeaveContextType['addLeaveRequest'] = (input) => {
    if (!user) return;
    const newRequest: LeaveRequest = {
      id: crypto.randomUUID(),
      employeeId: input.employeeId,
      employeeName: user.name,
      type: input.type,
      startDate: input.startDate,
      endDate: input.endDate,
      days: input.days,
      status: 'pending',
      reason: input.reason,
      appliedDate: new Date().toISOString().slice(0, 10)
    };
    setLeaveRequests(prev => [newRequest, ...prev]);
  };

  const approveRequest = (id: string) => {
    setLeaveRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'approved' } : r));
  };

  const rejectRequest = (id: string) => {
    setLeaveRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'rejected' } : r));
  };

  const value = useMemo(() => ({ leaveRequests, addLeaveRequest, approveRequest, rejectRequest }), [leaveRequests]);

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


