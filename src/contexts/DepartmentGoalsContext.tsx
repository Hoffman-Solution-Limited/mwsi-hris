import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { DepartmentGoal } from '@/types/models';
import api from '@/lib/api';

export type DepartmentGoalRecord = DepartmentGoal;

type DepartmentGoalsContextType = {
  goals: DepartmentGoalRecord[];
  getDepartments: () => string[];
  getGoalsByDepartment: (department: string) => DepartmentGoalRecord[];
  addGoal: (goal: Omit<DepartmentGoalRecord, 'id' | 'createdAt'>) => Promise<DepartmentGoalRecord>;
  updateGoal: (id: string, updates: Partial<DepartmentGoalRecord>) => Promise<DepartmentGoalRecord>;
  removeGoal: (id: string) => Promise<void>;
};

const STORAGE_KEY = 'hris-department-goals';

const DepartmentGoalsContext = createContext<DepartmentGoalsContextType | undefined>(undefined);

export const DepartmentGoalsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [goals, setGoals] = useState<DepartmentGoalRecord[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw) as DepartmentGoalRecord[];
    } catch {}
    return [];
  });

  // Try to load department goals from backend on mount
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const rows = await api.get('/api/department-goals');
        if (!mounted) return;
        if (Array.isArray(rows) && rows.length > 0) {
          // normalize DB snake_case fields to camelCase where needed
          const normalized = (rows as any[]).map(r => ({
            id: r.id,
            department: r.department,
            title: r.title,
            description: r.description,
            weight: r.weight ?? 0,
            active: r.active !== undefined ? Boolean(r.active) : true,
            createdBy: r.created_by ?? r.createdBy ?? 'System',
            ownerEmployeeId: r.owner_employee_id ?? r.ownerEmployeeId ?? null,
            targetDate: r.target_date ?? r.targetDate ?? null,
            progress: r.progress ?? 0,
            status: r.status ?? 'active',
            createdAt: r.created_at ?? r.createdAt ?? new Date().toISOString(),
            updatedAt: r.updated_at ?? r.updatedAt ?? new Date().toISOString(),
          })) as DepartmentGoalRecord[];
          setGoals(normalized);
        }
      } catch (err) {
        // fallback to local
      }
    })();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(goals)); } catch {}
  }, [goals]);

  const getDepartments = () => [...new Set(goals.map(g => g.department))];

  const getGoalsByDepartment = (department: string) => goals.filter(g => g.department === department && g.active);

  const addGoal: DepartmentGoalsContextType['addGoal'] = (goal) => {
    return (async () => {
      try {
        const created = await api.post('/api/department-goals', goal);
        const rec = {
          id: created.id,
          department: created.department,
          title: created.title,
          description: created.description,
          weight: created.weight ?? 0,
          active: created.active !== undefined ? Boolean(created.active) : true,
          createdBy: created.created_by ?? created.createdBy ?? 'System',
          ownerEmployeeId: created.owner_employee_id ?? created.ownerEmployeeId ?? null,
          targetDate: created.target_date ?? created.targetDate ?? null,
          progress: created.progress ?? 0,
          status: created.status ?? 'active',
          createdAt: created.created_at ?? created.createdAt ?? new Date().toISOString(),
          updatedAt: created.updated_at ?? created.updatedAt ?? new Date().toISOString(),
        } as DepartmentGoalRecord;
        setGoals(prev => [rec, ...prev]);
        return rec;
      } catch (err) {
        // fallback to local
        const rec: DepartmentGoalRecord = {
          ...goal,
          id: crypto.randomUUID(),
          weight: (goal as any).weight ?? 0,
          active: (goal as any).active ?? true,
          createdBy: (goal as any).createdBy ?? 'System',
          createdAt: new Date().toISOString(),
        } as DepartmentGoalRecord;
        setGoals(prev => [rec, ...prev]);
        return rec;
      }
    })();
  };

  const updateGoal: DepartmentGoalsContextType['updateGoal'] = (id, updates) => {
    return (async () => {
      try {
        const payload: any = {};
        if ((updates as any).department !== undefined) payload.department = (updates as any).department;
        if ((updates as any).title !== undefined) payload.title = (updates as any).title;
        if ((updates as any).description !== undefined) payload.description = (updates as any).description;
        if ((updates as any).ownerEmployeeId !== undefined) payload.owner_employee_id = (updates as any).ownerEmployeeId;
        if ((updates as any).targetDate !== undefined) payload.target_date = (updates as any).targetDate;
        if ((updates as any).progress !== undefined) payload.progress = (updates as any).progress;
        if ((updates as any).status !== undefined) payload.status = (updates as any).status;
        if ((updates as any).weight !== undefined) payload.weight = (updates as any).weight;
        if ((updates as any).active !== undefined) payload.active = (updates as any).active;

        if (Object.keys(payload).length > 0) {
          const updated = await api.put(`/api/department-goals/${id}`, payload);
          const norm = {
            id: updated.id,
            department: updated.department,
            title: updated.title,
            description: updated.description,
            weight: updated.weight ?? 0,
            active: updated.active !== undefined ? Boolean(updated.active) : true,
            createdBy: updated.created_by ?? updated.createdBy ?? 'System',
            ownerEmployeeId: updated.owner_employee_id ?? updated.ownerEmployeeId ?? null,
            targetDate: updated.target_date ?? updated.targetDate ?? null,
            progress: updated.progress ?? 0,
            status: updated.status ?? 'active',
            createdAt: updated.created_at ?? updated.createdAt ?? new Date().toISOString(),
            updatedAt: updated.updated_at ?? updated.updatedAt ?? new Date().toISOString(),
          } as DepartmentGoalRecord;
          setGoals(prev => prev.map(g => (g.id === id ? norm : g)));
          return norm;
        }
        // nothing to send, just update locally
        setGoals(prev => prev.map(g => (g.id === id ? { ...g, ...updates } : g)));
        return (goals.find(g => g.id === id) as DepartmentGoalRecord) || ({} as DepartmentGoalRecord);
      } catch (err) {
        // fallback to local
        setGoals(prev => prev.map(g => (g.id === id ? { ...g, ...updates } : g)));
        return (goals.find(g => g.id === id) as DepartmentGoalRecord) || ({} as DepartmentGoalRecord);
      }
    })();
  };

  const removeGoal: DepartmentGoalsContextType['removeGoal'] = (id) => {
    return (async () => {
      try {
        await api.del(`/api/department-goals/${id}`);
        setGoals(prev => prev.filter(g => g.id !== id));
        return;
      } catch (err) {
        // fallback to local
        setGoals(prev => prev.filter(g => g.id !== id));
        return;
      }
    })();
  };

  const value = useMemo(() => ({ goals, getDepartments, getGoalsByDepartment, addGoal, updateGoal, removeGoal }), [goals]);

  return (
    <DepartmentGoalsContext.Provider value={value}>
      {children}
    </DepartmentGoalsContext.Provider>
  );
};

export const useDepartmentGoals = () => {
  const ctx = useContext(DepartmentGoalsContext);
  if (!ctx) throw new Error('useDepartmentGoals must be used within DepartmentGoalsProvider');
  return ctx;
};
