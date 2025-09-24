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

  // Removed legacy backfill from staffNumber; employeeNumber must be managed by HR

  // One-time migration: if localStorage employees are missing employeeNumber, backfill from mockData by id
  useEffect(() => {
    const missing = employees.some((e: any) => !e.employeeNumber);
    if (!missing) return;
    setEmployees(prev => prev.map((e: any) => {
      if (e.employeeNumber) return e;
      const seed = (mockEmployees as any[]).find(m => m.id === e.id);
      if (seed && seed.employeeNumber) {
        return { ...e, employeeNumber: seed.employeeNumber } as EmployeeRecord;
      }
      return e;
    }));
  }, []);

  // One-time deduplication: if many employees share the same employeeNumber, restore from mock where possible
  useEffect(() => {
    const FLAG = 'hris-empno-dedupe-v1';
    try {
      if (localStorage.getItem(FLAG)) return;
    } catch {}
    const nums = employees.map((e: any) => e.employeeNumber).filter(Boolean) as string[];
    if (nums.length < 2) return;
    const unique = new Set(nums);
    const hasDupes = unique.size < nums.length;
    if (!hasDupes) return;
    // perform dedupe using mock as source of truth
    setEmployees(prev => prev.map((e: any) => {
      const seed = (mockEmployees as any[]).find(m => m.id === e.id);
      if (seed?.employeeNumber && seed.employeeNumber !== e.employeeNumber) {
        return { ...e, employeeNumber: seed.employeeNumber } as EmployeeRecord;
      }
      return e;
    }));
    try { localStorage.setItem(FLAG, '1'); } catch {}
  }, [employees]);

  const addEmployee: EmployeesContextType['addEmployee'] = (data) => {
    const id = crypto.randomUUID();
    const avatar = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(data.name || 'EMP')}`;
    const hireDate = data.hireDate || new Date().toISOString().slice(0,10);
    const status = data.status || 'active';
    const employeeNumber = (data as any).employeeNumber ? String((data as any).employeeNumber) : undefined;
    const rec: EmployeeRecord = { id, avatar, hireDate, status, ...(employeeNumber ? { employeeNumber } : {}), ...data } as EmployeeRecord;
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
