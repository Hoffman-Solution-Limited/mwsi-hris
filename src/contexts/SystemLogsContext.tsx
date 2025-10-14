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


export const SystemLogsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  // Start with an empty logs list — UAT should source logs from the backend
  const [logs, setLogs] = useState<SystemLog[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {}
    }
    return [];
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