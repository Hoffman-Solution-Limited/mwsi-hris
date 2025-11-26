import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import api from '@/lib/api';
import { DisciplinaryCaseMock } from '@/types/models';

type DisciplinaryContextType = {
  cases: DisciplinaryCaseMock[];
  addCase: (c: Omit<DisciplinaryCaseMock, 'id' | 'updates'>) => Promise<DisciplinaryCaseMock | undefined>;
  updateCase: (id: string | number, updates: Partial<DisciplinaryCaseMock>) => Promise<DisciplinaryCaseMock | undefined>;
  removeCase: (id: string | number) => Promise<boolean>;
};

const DisciplinaryContext = createContext<DisciplinaryContextType | undefined>(undefined);

export const DisciplinaryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cases, setCases] = useState<DisciplinaryCaseMock[]>(() => {
    try { const raw = localStorage.getItem('hris-disciplinary-cases'); if (raw) return JSON.parse(raw) as DisciplinaryCaseMock[]; } catch {}
    return [];
  });

  useEffect(() => { try { localStorage.setItem('hris-disciplinary-cases', JSON.stringify(cases)); } catch {} }, [cases]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const rows = await api.get('/api/disciplinary');
        if (!mounted) return;
        if (Array.isArray(rows)) setCases(rows as DisciplinaryCaseMock[]);
      } catch (err) {
        // keep local
      }
    })();
    return () => { mounted = false; };
  }, []);

  const addCase = async (c: Omit<DisciplinaryCaseMock, 'id' | 'updates'>) => {
    try {
      const created = await api.post('/api/disciplinary', { ...c, updates: [] });
      setCases(prev => [created as DisciplinaryCaseMock, ...prev]);
      return created as DisciplinaryCaseMock;
    } catch (err) {
      const rec: DisciplinaryCaseMock = { id: crypto.randomUUID(), ...c, updates: [] } as any;
      setCases(prev => [rec, ...prev]);
      return rec;
    }
  };

  const updateCase = async (id: string | number, updates: Partial<DisciplinaryCaseMock>) => {
    try {
      const updated = await api.put(`/api/disciplinary/${id}`, updates);
      setCases(prev => prev.map(x => (String(x.id) === String(id) ? (updated as DisciplinaryCaseMock) : x)));
      return updated as DisciplinaryCaseMock;
    } catch (err) {
      setCases(prev => prev.map(x => (String(x.id) === String(id) ? { ...x, ...updates } as DisciplinaryCaseMock : x)));
      return undefined;
    }
  };

  const removeCase = async (id: string | number) => {
    try {
      await api.del(`/api/disciplinary/${id}`);
      setCases(prev => prev.filter(x => String(x.id) !== String(id)));
      return true;
    } catch (err) {
      setCases(prev => prev.filter(x => String(x.id) !== String(id)));
      return true;
    }
  };

  const value = useMemo(() => ({ cases, addCase, updateCase, removeCase }), [cases]);
  return <DisciplinaryContext.Provider value={value}>{children}</DisciplinaryContext.Provider>;
};

export const useDisciplinary = () => {
  const ctx = useContext(DisciplinaryContext);
  if (!ctx) throw new Error('useDisciplinary must be used within DisciplinaryProvider');
  return ctx;
};
