import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { TrainingRecord, mockTrainingRecords } from '@/data/mockData';
import { useAuth } from '@/contexts/AuthContext';

type TrainingContextType = {
  trainings: TrainingRecord[];
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
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {}
    }
    return mockTrainingRecords;
  });

  const [certUrls, setCertUrls] = useState<Record<string, string>>({});

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trainings));
  }, [trainings]);

  const startTraining = (id: string) => {
    setTrainings(prev => prev.map(tr => tr.id === id ? { ...tr, status: 'in_progress' } as TrainingRecord : tr));
  };

  const completeTraining = (id: string, file?: File | null) => {
    setTrainings(prev => prev.map(tr => tr.id === id ? { ...tr, status: 'completed', completionDate: new Date().toISOString().slice(0,10) } as TrainingRecord : tr));
    if (file) {
      const url = URL.createObjectURL(file);
      setCertUrls(prev => ({ ...prev, [id]: url }));
    }
  };

  const editTraining = (id: string, changes: Partial<TrainingRecord>) => {
    setTrainings(prev => prev.map(tr => tr.id === id ? { ...tr, ...changes } : tr));
  };

  const closeTraining = (id: string) => {
    setTrainings(prev => prev.map(tr => tr.id === id ? { ...tr, status: 'closed' } : tr));
  };

  const archiveTraining = (id: string) => {
    setTrainings(prev => prev.map(tr => tr.id === id ? { ...tr, archived: true } : tr));
  };

  const getCertificateUrl = (id: string) => certUrls[id];

  const value = useMemo(() => ({ trainings, startTraining, completeTraining, editTraining, closeTraining, archiveTraining, getCertificateUrl }), [trainings, certUrls]);

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


