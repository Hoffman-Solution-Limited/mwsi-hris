import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { mockEmployees, Employee } from '@/data/mockData';
import api from '@/lib/api';

export type EmployeeRecord = Employee;

type EmployeesContextType = {
  employees: EmployeeRecord[];
  addEmployee: (data: Omit<EmployeeRecord, 'id' | 'avatar' | 'status' | 'hireDate'> & Partial<Pick<EmployeeRecord, 'status' | 'hireDate'>>) => void;
  updateEmployee: (id: string, updates: Partial<EmployeeRecord>) => void;
  removeEmployee: (id: string) => void;
  renameStationAcrossEmployees?: (oldName: string, newName: string) => void;
  renameDesignationAcrossEmployees?: (oldName: string, newName: string) => void;
  renameSkillLevelAcrossEmployees?: (oldName: string, newName: string) => void;
  renameJobGroupAcrossEmployees?: (oldName: string, newName: string) => void;
  renameEngagementTypeAcrossEmployees?: (oldName: string, newName: string) => void;
  renameEthnicityAcrossEmployees?: (oldName: string, newName: string) => void;
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

  // Load employees from backend on mount, fallback to localStorage/mockData
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const rows = await api.get('/api/employees');
        if (!mounted) return;
        if (Array.isArray(rows) && rows.length > 0) {
          setEmployees(rows as EmployeeRecord[]);
        }
      } catch (err) {
        // keep local mock data if backend not reachable
        // console.debug('employees load failed, using local', String(err));
      }
    })();
    return () => { mounted = false; };
  }, []);

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
    (async () => {
      try {
        const payload = { ...data } as any;
        const created = await api.post('/api/employees', payload);
        setEmployees(prev => [created as EmployeeRecord, ...prev]);
      } catch (err) {
        // fallback to local when API fails
        const id = crypto.randomUUID();
        const avatar = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent((data as any).name || 'EMP')}`;
        const hireDate = (data as any).hireDate || new Date().toISOString().slice(0,10);
        const status = (data as any).status || 'active';
        const employeeNumber = (data as any).employeeNumber ? String((data as any).employeeNumber) : undefined;
        const rec: EmployeeRecord = { id, avatar, hireDate, status, ...(employeeNumber ? { employeeNumber } : {}), ...data } as EmployeeRecord;
        setEmployees(prev => [rec, ...prev]);
      }
    })();
  };

  const updateEmployee: EmployeesContextType['updateEmployee'] = (id, updates) => {
    (async () => {
      try {
        const updated = await api.put(`/api/employees/${id}`, updates);
        setEmployees(prev => prev.map(e => (e.id === id ? { ...e, ...(updated as EmployeeRecord) } as EmployeeRecord : e)));
      } catch (err) {
        setEmployees(prev => prev.map(e => (e.id === id ? { ...e, ...updates } as EmployeeRecord : e)));
      }
    })();
  };

  const removeEmployee: EmployeesContextType['removeEmployee'] = (id) => {
    (async () => {
      try {
        await api.del(`/api/employees/${id}`);
        setEmployees(prev => prev.filter(e => e.id !== id));
      } catch (err) {
        // fallback: remove locally
        setEmployees(prev => prev.filter(e => e.id !== id));
      }
    })();
  };

  const value = useMemo(() => ({ employees, addEmployee, updateEmployee, removeEmployee }), [employees]);

  // attach helper to rename stations across employees
  const renameStationAcrossEmployees = (oldName: string, newName: string) => {
    const o = oldName?.trim();
    const n = newName?.trim();
    if (!o || !n) return;
    setEmployees(prev => prev.map(e => (e.stationName === o ? { ...e, stationName: n } : e)));
  };

  const renameDesignationAcrossEmployees = (oldName: string, newName: string) => {
    const o = oldName?.trim();
    const n = newName?.trim();
    if (!o || !n) return;
    setEmployees(prev => prev.map(e => (e.position === o ? { ...e, position: n } : e)));
  };

  const renameSkillLevelAcrossEmployees = (oldName: string, newName: string) => {
    const o = oldName?.trim();
    const n = newName?.trim();
    if (!o || !n) return;
    setEmployees(prev => prev.map(e => (e.skillLevel === o ? { ...e, skillLevel: n } : e)));
  };

  const renameJobGroupAcrossEmployees = (oldName: string, newName: string) => {
    const o = oldName?.trim();
    const n = newName?.trim();
    if (!o || !n) return;
    setEmployees(prev => prev.map(e => (e.jobGroup === o ? { ...e, jobGroup: n } : e)));
  };

  const renameEngagementTypeAcrossEmployees = (oldName: string, newName: string) => {
    const o = oldName?.trim();
    const n = newName?.trim();
    if (!o || !n) return;
    setEmployees(prev => prev.map(e => ((e.engagementType || e.employmentType) === o ? { ...e, engagementType: n } : e)));
  };

  const renameEthnicityAcrossEmployees = (oldName: string, newName: string) => {
    const o = oldName?.trim();
    const n = newName?.trim();
    if (!o || !n) return;
    setEmployees(prev => prev.map(e => (e.ethnicity === o ? { ...e, ethnicity: n } : e)));
  };

  const fullValue = useMemo(() => ({ ...value, renameStationAcrossEmployees, renameDesignationAcrossEmployees, renameSkillLevelAcrossEmployees, renameJobGroupAcrossEmployees, renameEngagementTypeAcrossEmployees, renameEthnicityAcrossEmployees }), [value]);

  return <EmployeesContext.Provider value={fullValue}>{children}</EmployeesContext.Provider>;
};

export const useEmployees = () => {
  const ctx = useContext(EmployeesContext);
  if (!ctx) throw new Error('useEmployees must be used within EmployeesProvider');
  return ctx;
};
