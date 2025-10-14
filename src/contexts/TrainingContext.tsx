import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { TrainingRecord } from '@/types/models';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

type TrainingContextType = {
  trainings: TrainingRecord[];
  createTraining: (payload: Partial<TrainingRecord>) => Promise<TrainingRecord | null>;
  startTraining: (id: string) => void;
  completeTraining: (id: string, file?: File | null) => void;
  editTraining: (id: string, changes: Partial<TrainingRecord>) => void;
  closeTraining: (id: string) => void;
  archiveTraining: (id: string) => void;
  getCertificateUrl: (id: string) => string | undefined;
};

const STORAGE_KEY = 'hris-trainings';

const TrainingContext = createContext<TrainingContextType | undefined>(undefined);

export const TrainingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [trainings, setTrainings] = useState<TrainingRecord[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) return JSON.parse(stored) as TrainingRecord[];
    } catch {}
    return [];
  });

  const [certUrls, setCertUrls] = useState<Record<string, string>>({});

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trainings));
  }, [trainings]);

  // load trainings from backend on mount
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const rows = await api.get('/api/trainings');
        if (!mounted) return;
        if (Array.isArray(rows) && rows.length > 0) setTrainings(rows as TrainingRecord[]);
      } catch (err) {
        // fallback to local
      }
    })();
    return () => { mounted = false; };
  }, []);

  const startTraining = (id: string) => {
    (async () => {
      try {
        const updated = await api.put(`/api/trainings/${id}`, { status: 'in_progress' });
        setTrainings(prev => prev.map(tr => tr.id === id ? (updated as TrainingRecord) : tr));
      } catch (err) {
        setTrainings(prev => prev.map(tr => tr.id === id ? { ...tr, status: 'in_progress' } as TrainingRecord : tr));
      }
    })();
  };

  const createTraining = async (payload: Partial<TrainingRecord>) => {
    try {
      const created = await api.post('/api/trainings', payload);
      setTrainings(prev => [created as TrainingRecord, ...prev]);
      return created as TrainingRecord;
    } catch (err) {
      // fallback: create a local entry
      const local: TrainingRecord = {
        id: crypto.randomUUID(),
        employeeId: (payload.employeeId as string) || '0',
        title: payload.title || 'Untitled',
        type: (payload.type as any) || 'development',
        status: (payload.status as any) || 'not_started',
        completionDate: payload.completionDate,
        expiryDate: payload.expiryDate,
        provider: payload.provider,
        archived: payload.archived || false
      };
      setTrainings(prev => [local, ...prev]);
      return local;
    }
  };

  const completeTraining = (id: string, file?: File | null) => {
    const completionDate = new Date().toISOString().slice(0,10);
    (async () => {
      try {
        const updated = await api.put(`/api/trainings/${id}`, { status: 'completed', completion_date: completionDate });
        setTrainings(prev => prev.map(tr => tr.id === id ? (updated as TrainingRecord) : tr));
      } catch (err) {
        setTrainings(prev => prev.map(tr => tr.id === id ? { ...tr, status: 'completed', completionDate } as TrainingRecord : tr));
      }
    })();
    if (file) {
      const url = URL.createObjectURL(file);
      setCertUrls(prev => ({ ...prev, [id]: url }));
    }
  };

  const editTraining = (id: string, changes: Partial<TrainingRecord>) => {
    (async () => {
      try {
        const updated = await api.put(`/api/trainings/${id}`, changes);
        setTrainings(prev => prev.map(tr => tr.id === id ? (updated as TrainingRecord) : tr));
      } catch (err) {
        setTrainings(prev => prev.map(tr => tr.id === id ? { ...tr, ...changes } : tr));
      }
    })();
  };

  const closeTraining = (id: string) => {
    (async () => {
      try {
        const updated = await api.put(`/api/trainings/${id}`, { status: 'closed' });
        setTrainings(prev => prev.map(tr => tr.id === id ? (updated as TrainingRecord) : tr));
      } catch (err) {
        setTrainings(prev => prev.map(tr => tr.id === id ? { ...tr, status: 'closed' } : tr));
      }
    })();
  };

  const archiveTraining = (id: string) => {
    (async () => {
      try {
        const updated = await api.put(`/api/trainings/${id}`, { archived: true });
        setTrainings(prev => prev.map(tr => tr.id === id ? (updated as TrainingRecord) : tr));
      } catch (err) {
        setTrainings(prev => prev.map(tr => tr.id === id ? { ...tr, archived: true } : tr));
      }
    })();
  };

  const getCertificateUrl = (id: string) => certUrls[id];

  const value = useMemo(() => ({ trainings, createTraining, startTraining, completeTraining, editTraining, closeTraining, archiveTraining, getCertificateUrl }), [trainings, certUrls]);

  return (
    <TrainingContext.Provider value={value}>
      {children}
    </TrainingContext.Provider>
  );
};

export const useTraining = () => {
  const ctx = useContext(TrainingContext);
  if (!ctx) throw new Error('useTraining must be used within TrainingProvider');
  return ctx;
};


