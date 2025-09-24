import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { mockEmployees, Employee } from '@/data/mockData';

export type EmployeeRecord = Employee;

type EmployeesContextType = {
  employees: EmployeeRecord[];
  addEmployee: (data: Omit<EmployeeRecord, 'id' | 'avatar' | 'status' | 'hireDate'> & Partial<Pick<EmployeeRecord, 'status' | 'hireDate'>>) => void;
  updateEmployee: (id: string, updates: Partial<EmployeeRecord>) => void;
  removeEmployee: (id: string) => void;
};

const STORAGE_KEY = 'hris-employees';

const EmployeesContext = createContext<EmployeesContextType | undefined>(undefined);

export const EmployeesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [employees, setEmployees] = useState<EmployeeRecord[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch {}
    return mockEmployees;
  });

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(employees)); } catch {}
  }, [employees]);

  const addEmployee: EmployeesContextType['addEmployee'] = (data) => {
    const id = crypto.randomUUID();
    const avatar = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(data.name || 'EMP')}`;
    const hireDate = data.hireDate || new Date().toISOString().slice(0,10);
    const status = data.status || 'active';
    const rec: EmployeeRecord = { id, avatar, hireDate, status, ...data } as EmployeeRecord;
    setEmployees(prev => [rec, ...prev]);
  };

  const updateEmployee: EmployeesContextType['updateEmployee'] = (id, updates) => {
    setEmployees(prev => prev.map(e => (e.id === id ? { ...e, ...updates } as EmployeeRecord : e)));
  };

  const removeEmployee: EmployeesContextType['removeEmployee'] = (id) => {
    setEmployees(prev => prev.filter(e => e.id !== id));
  };

  const value = useMemo(() => ({ employees, addEmployee, updateEmployee, removeEmployee }), [employees]);

  return <EmployeesContext.Provider value={value}>{children}</EmployeesContext.Provider>;
};

export const useEmployees = () => {
  const ctx = useContext(EmployeesContext);
  if (!ctx) throw new Error('useEmployees must be used within EmployeesProvider');
  return ctx;
};
