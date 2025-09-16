import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export interface SystemLog {
  id: string;
  action: string;
  actionType: 'login' | 'logout' | 'create' | 'update' | 'delete' | 'assign' | 'approve' | 'reject' | 'upload' | 'download';
  userId: string;
  userName: string;
  userRole: string;
  details: string;
  entityType?: string;
  entityId?: string;
  timestamp: string;
  status: 'success' | 'error' | 'warning';
  ipAddress?: string;
}

type SystemLogsContextType = {
  logs: SystemLog[];
  addLog: (log: Omit<SystemLog, 'id' | 'timestamp' | 'userId' | 'userName' | 'userRole'>) => void;
  clearLogs: () => void;
  getLogsByDateRange: (startDate: string, endDate: string) => SystemLog[];
  getLogsByActionType: (actionType: SystemLog['actionType']) => SystemLog[];
  getLogsByUser: (userId: string) => SystemLog[];
};

const STORAGE_KEY = 'hris-system-logs';

const SystemLogsContext = createContext<SystemLogsContextType | undefined>(undefined);

// Mock initial logs
const mockLogs: SystemLog[] = [
  {
    id: '1',
    action: 'User logged in',
    actionType: 'login',
    userId: '1',
    userName: 'Alice Johnson',
    userRole: 'admin',
    details: 'Successful login from dashboard',
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    status: 'success',
    ipAddress: '192.168.1.100'
  },
  {
    id: '2',
    action: 'Leave request submitted',
    actionType: 'create',
    userId: '2',
    userName: 'Brian Smith',
    userRole: 'employee',
    details: 'Annual leave request for 5 days',
    entityType: 'leave_request',
    entityId: 'leave_001',
    timestamp: new Date(Date.now() - 172800000).toISOString(),
    status: 'success',
    ipAddress: '192.168.1.101'
  },
  {
    id: '3',
    action: 'Performance template created',
    actionType: 'create',
    userId: '1',
    userName: 'Alice Johnson',
    userRole: 'admin',
    details: 'Created new quarterly review template',
    entityType: 'performance_template',
    entityId: 'template_001',
    timestamp: new Date(Date.now() - 259200000).toISOString(),
    status: 'success',
    ipAddress: '192.168.1.100'
  },
  {
    id: '4',
    action: 'Training program assigned',
    actionType: 'assign',
    userId: '3',
    userName: 'Carol Davis',
    userRole: 'hr_manager',
    details: 'Assigned cybersecurity training to 15 employees',
    entityType: 'training_assignment',
    timestamp: new Date(Date.now() - 345600000).toISOString(),
    status: 'success',
    ipAddress: '192.168.1.102'
  },
  {
    id: '5',
    action: 'Document uploaded',
    actionType: 'upload',
    userId: '2',
    userName: 'Brian Smith',
    userRole: 'employee',
    details: 'Uploaded medical certificate',
    entityType: 'document',
    entityId: 'doc_001',
    timestamp: new Date(Date.now() - 432000000).toISOString(),
    status: 'success',
    ipAddress: '192.168.1.101'
  }
];

export const SystemLogsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [logs, setLogs] = useState<SystemLog[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {}
    }
    return mockLogs;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
  }, [logs]);

  const addLog = (log: Omit<SystemLog, 'id' | 'timestamp' | 'userId' | 'userName' | 'userRole'>) => {
    if (!user) return;
    
    const newLog: SystemLog = {
      ...log,
      id: crypto.randomUUID(),
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      timestamp: new Date().toISOString()
    };

    setLogs(prev => [newLog, ...prev]);
  };

  const clearLogs = () => {
    setLogs([]);
  };

  const getLogsByDateRange = (startDate: string, endDate: string) => {
    return logs.filter(log => {
      const logDate = new Date(log.timestamp);
      return logDate >= new Date(startDate) && logDate <= new Date(endDate);
    });
  };

  const getLogsByActionType = (actionType: SystemLog['actionType']) => {
    return logs.filter(log => log.actionType === actionType);
  };

  const getLogsByUser = (userId: string) => {
    return logs.filter(log => log.userId === userId);
  };

  const value = useMemo(() => ({
    logs,
    addLog,
    clearLogs,
    getLogsByDateRange,
    getLogsByActionType,
    getLogsByUser
  }), [logs, user]);

  return (
    <SystemLogsContext.Provider value={value}>
      {children}
    </SystemLogsContext.Provider>
  );
};

export const useSystemLogs = () => {
  const context = useContext(SystemLogsContext);
  if (!context) throw new Error('useSystemLogs must be used within SystemLogsProvider');
  return context;
};