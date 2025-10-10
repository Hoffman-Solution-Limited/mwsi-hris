import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { mockDepartmentGoals, DepartmentGoal } from '@/data/mockData';

export type DepartmentGoalRecord = DepartmentGoal;

type DepartmentGoalsContextType = {
  goals: DepartmentGoalRecord[];
  getDepartments: () => string[];
  getGoalsByDepartment: (department: string) => DepartmentGoalRecord[];
  addGoal: (goal: Omit<DepartmentGoalRecord, 'id' | 'createdAt'>) => void;
  updateGoal: (id: string, updates: Partial<DepartmentGoalRecord>) => void;
  removeGoal: (id: string) => void;
};

const STORAGE_KEY = 'hris-department-goals';

const DepartmentGoalsContext = createContext<DepartmentGoalsContextType | undefined>(undefined);

export const DepartmentGoalsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [goals, setGoals] = useState<DepartmentGoalRecord[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch {}
    return mockDepartmentGoals;
  });

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(goals)); } catch {}
  }, [goals]);

  const getDepartments = () => [...new Set(goals.map(g => g.department))];

  const getGoalsByDepartment = (department: string) => goals.filter(g => g.department === department && g.active);

  const addGoal: DepartmentGoalsContextType['addGoal'] = (goal) => {
    const rec: DepartmentGoalRecord = {
      ...goal,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    } as DepartmentGoalRecord;
    setGoals(prev => [rec, ...prev]);
  };

  const updateGoal: DepartmentGoalsContextType['updateGoal'] = (id, updates) => {
    setGoals(prev => prev.map(g => (g.id === id ? { ...g, ...updates } : g)));
  };

  const removeGoal: DepartmentGoalsContextType['removeGoal'] = (id) => {
    setGoals(prev => prev.filter(g => g.id !== id));
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
