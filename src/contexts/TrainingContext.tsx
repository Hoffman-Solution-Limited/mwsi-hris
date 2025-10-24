import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { TrainingRecord } from '@/types/models';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

type TrainingContextType = {
  trainings: TrainingRecord[];
  createTraining: (payload: Partial<TrainingRecord>) => Promise<TrainingRecord | null>;
  createTrainingsBatch: (items: Partial<TrainingRecord>[]) => Promise<TrainingRecord[]>;
  startTraining: (id: string) => void;
  completeTraining: (id: string, file?: File | null) => void;
  editTraining: (id: string, changes: Partial<TrainingRecord>) => Promise<TrainingRecord | null>;
  closeTraining: (id: string) => void;
  archiveTraining: (id: string) => void;
  deleteTraining: (id: string) => Promise<boolean>;
  getCertificateUrl: (id: string) => string | undefined;
};

const TrainingContext = createContext<TrainingContextType | undefined>(undefined);

export const TrainingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [trainings, setTrainings] = useState<TrainingRecord[]>([]);

  const [certUrls, setCertUrls] = useState<Record<string, string>>({});

  // Removed localStorage persistence to ensure DB is source of truth

  // helper: backend row -> frontend model
  const normalizeRow = (row: any): TrainingRecord => {
    const rawStatus = row.status;
    const allowed = ['not_started','in_progress','completed','closed'];
    const status = allowed.includes(rawStatus) ? rawStatus : 'not_started';
    const archived = (row.archived ?? false) || status === 'closed';
    return {
      id: row.id,
      employeeId: row.employeeId ?? row.employee_id,
      title: row.title,
      type: row.type,
      status,
      description: row.description,
      duration: row.duration,
      max_participants: row.max_participants ?? row.maxParticipants,
      prerequisites: row.prerequisites,
      category: row.category,
      completionDate: row.completionDate ?? row.completion_date,
      expiryDate: row.expiryDate ?? row.expiry_date,
      provider: row.provider,
      archived,
    };
  };

  // load trainings from backend on mount
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const rows = await api.get('/api/trainings');
        if (!mounted) return;
        if (Array.isArray(rows) && rows.length > 0) setTrainings((rows as any[]).map(normalizeRow));
      } catch (err) {
        // no local fallback: keep current state and surface error in console for visibility
        console.error('Failed to load trainings from API', err);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const startTraining = (id: string) => {
    (async () => {
      try {
        const updated = await api.put(`/api/trainings/${id}`, { status: 'in_progress' });
        setTrainings(prev => prev.map(tr => tr.id === id ? normalizeRow(updated) : tr));
      } catch (err) {
        setTrainings(prev => prev.map(tr => tr.id === id ? { ...tr, status: 'in_progress' } as TrainingRecord : tr));
      }
    })();
  };

  const createTraining = async (payload: Partial<TrainingRecord>) => {
    try {
      const body: any = { ...payload };
      if (body.expiryDate) { body.expiry_date = body.expiryDate; delete body.expiryDate; }
      if (body.completionDate) { body.completion_date = body.completionDate; delete body.completionDate; }
      // normalize optional metadata to DB columns
      if (Object.prototype.hasOwnProperty.call(body, 'maxParticipants')) {
        body.max_participants = body.maxParticipants;
        delete body.maxParticipants;
      }
      // keep description, duration, prerequisites, category, archived as-is (backend accepts these as provided)
      const created = await api.post('/api/trainings', body);
      const norm = normalizeRow(created);
      setTrainings(prev => [norm, ...prev]);
      return norm;
    } catch (err) {
      console.error('Failed to create training via API', err);
      return null;
    }
  };

  const createTrainingsBatch = async (items: Partial<TrainingRecord>[]) => {
    try {
      const body = {
        items: items.map((p) => {
          const o: any = { ...p };
          if (o.expiryDate) { o.expiryDate = o.expiryDate; }
          if (o.completionDate) { o.completionDate = o.completionDate; }
          if (o.maxParticipants !== undefined) { o.max_participants = o.maxParticipants; delete o.maxParticipants; }
          return o;
        })
      };
      const resp = await api.post('/api/trainings/batch', body);
      const created: any[] = Array.isArray(resp?.created) ? resp.created : [];
      const norm = created.map(normalizeRow);
      if (norm.length > 0) setTrainings(prev => [...norm, ...prev]);
      return norm;
    } catch (err) {
      console.error('Failed to batch create trainings via API', err);
      return [];
    }
  };

  const completeTraining = (id: string, file?: File | null) => {
    const completionDate = new Date().toISOString().slice(0,10);
    (async () => {
      try {
        const updated = await api.put(`/api/trainings/${id}`, { status: 'completed', completion_date: completionDate });
        setTrainings(prev => prev.map(tr => tr.id === id ? normalizeRow(updated) : tr));
      } catch (err) {
        console.error('Failed to complete training via API', err);
      }
    })();
    if (file) {
      const url = URL.createObjectURL(file);
      setCertUrls(prev => ({ ...prev, [id]: url }));
    }
  };

  const editTraining = async (id: string, changes: Partial<TrainingRecord>) => {
    try {
      // Map camelCase fields used in UI to snake_case columns expected by backend UPDATE
      const payload: any = { ...changes };
      if (Object.prototype.hasOwnProperty.call(payload, 'expiryDate')) {
        payload.expiry_date = payload.expiryDate;
        delete payload.expiryDate;
      }
      if (Object.prototype.hasOwnProperty.call(payload, 'completionDate')) {
        payload.completion_date = payload.completionDate;
        delete payload.completionDate;
      }
      // normalize maxParticipants to DB column name if provided in UI
      if (Object.prototype.hasOwnProperty.call(payload, 'maxParticipants')) {
        payload.max_participants = payload.maxParticipants;
        delete payload.maxParticipants;
      }
      const updated = await api.put(`/api/trainings/${id}`, payload);
      const norm = normalizeRow(updated);
      setTrainings(prev => prev.map(tr => tr.id === id ? norm : tr));
      return norm;
    } catch (err) {
      console.error('Failed to edit training via API', err);
      return null;
    }
  };

  const closeTraining = (id: string) => {
    (async () => {
      try {
        const updated = await api.put(`/api/trainings/${id}`, { status: 'closed' });
        setTrainings(prev => prev.map(tr => tr.id === id ? normalizeRow(updated) : tr));
      } catch (err) {
        console.error('Failed to close training via API', err);
      }
    })();
  };

  const archiveTraining = (id: string) => {
    (async () => {
      try {
        const updated = await api.put(`/api/trainings/${id}`, { archived: true });
        setTrainings(prev => prev.map(tr => tr.id === id ? normalizeRow(updated) : tr));
      } catch (err) {
        console.error('Failed to archive training via API', err);
      }
    })();
  };

  const deleteTraining = async (id: string) => {
    try {
      await api.del(`/api/trainings/${id}`);
      setTrainings(prev => prev.filter(tr => tr.id !== id));
      return true;
    } catch (err) {
      return false;
    }
  };

  const getCertificateUrl = (id: string) => certUrls[id];

  const value = useMemo(() => ({ trainings, createTraining, createTrainingsBatch, startTraining, completeTraining, editTraining, closeTraining, archiveTraining, deleteTraining, getCertificateUrl }), [trainings, certUrls]);

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


