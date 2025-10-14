import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Employee } from '@/types/models';
import api from '@/lib/api';
import { toast } from '@/hooks/use-toast';

export type EmployeeRecord = Employee;

type EmployeesContextType = {
  employees: EmployeeRecord[];
  loading: boolean;
  addEmployee: (data: Omit<EmployeeRecord, 'id' | 'avatar' | 'status' | 'hireDate'> & Partial<Pick<EmployeeRecord, 'status' | 'hireDate'>>) => Promise<EmployeeRecord | void>;
  updateEmployee: (id: string, updates: Partial<EmployeeRecord>) => Promise<void>;
  updateEmployeeStatus?: (id: string, status: EmployeeRecord['status']) => Promise<void>;
  removeEmployee: (id: string) => Promise<void>;
  refresh: () => Promise<void>;
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
      if (raw) return JSON.parse(raw) as EmployeeRecord[];
    } catch {}
    return [];
  });
  const [loading, setLoading] = useState(true);

  const refresh = React.useCallback(async () => {
    try {
      setLoading(true);
      const rows = await api.get('/api/employees');
      if (Array.isArray(rows)) setEmployees(rows as EmployeeRecord[]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const rows = await api.get('/api/employees');
        if (!mounted) return;
        if (Array.isArray(rows)) {
          setEmployees(rows as EmployeeRecord[]);
        }
      } catch (err) {
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // Removed legacy backfill from staffNumber; employeeNumber must be managed by HR

  // No mock-based backfills here; rely on backend or explicit HR edits for missing employeeNumbers

  const addEmployee: EmployeesContextType['addEmployee'] = async (data) => {
    try {
      const payload = { ...data } as any;
      const created = await api.post('/api/employees', payload);
      // Pull fresh from server to avoid drift and ensure DB-generated fields are present
      await refresh();
      return created as EmployeeRecord;
    } catch (err) {
      // Log and notify when API fails, then fallback to local when API fails
      try { console.error('addEmployee api error', err); } catch {}
      try { toast({ title: 'Employee save failed', description: String(err) }); } catch {}
      const id = crypto.randomUUID();
      const avatar = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent((data as any).name || 'EMP')}`;
      const hireDate = (data as any).hireDate || new Date().toISOString().slice(0,10);
      const status = (data as any).status || 'active';
      const employeeNumber = (data as any).employeeNumber ? String((data as any).employeeNumber) : undefined;
      const rec: EmployeeRecord = { id, avatar, hireDate, status, ...(employeeNumber ? { employeeNumber } : {}), ...data } as EmployeeRecord;
      setEmployees(prev => [rec, ...prev]);
    }
  };

  const updateEmployee: EmployeesContextType['updateEmployee'] = async (id, updates) => {
    try {
      const updated = await api.put(`/api/employees/${id}`, updates);
      setEmployees(prev => prev.map(e => (e.id === id ? { ...e, ...(updated as EmployeeRecord) } as EmployeeRecord : e)));
    } catch (err) {
      setEmployees(prev => prev.map(e => (e.id === id ? { ...e, ...updates } as EmployeeRecord : e)));
    }
  };

  const updateEmployeeStatus: EmployeesContextType['updateEmployeeStatus'] = async (id, status) => {
    try {
      const updated = await api.put(`/api/employees/${id}`, { status });
      setEmployees(prev => prev.map(e => (e.id === id ? { ...e, ...(updated as EmployeeRecord) } as EmployeeRecord : e)));
    } catch (err) {
      // optimistic fallback
      setEmployees(prev => prev.map(e => (e.id === id ? { ...e, status } as EmployeeRecord : e)));
    }
  };

  const removeEmployee: EmployeesContextType['removeEmployee'] = async (id) => {
    try {
      await api.del(`/api/employees/${id}`);
      setEmployees(prev => prev.filter(e => e.id !== id));
    } catch (err) {
      // fallback: remove locally
      setEmployees(prev => prev.filter(e => e.id !== id));
    }
  };

  const value = useMemo(() => ({ employees, loading, addEmployee, updateEmployee, updateEmployeeStatus, removeEmployee, refresh }), [employees, loading, addEmployee, updateEmployee, updateEmployeeStatus, removeEmployee, refresh]);

  // attach helper to rename stations across employees
  const renameStationAcrossEmployees = (oldName: string, newName:string) => {
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
