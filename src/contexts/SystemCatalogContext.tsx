import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { mockEmployees } from '@/data/mockData';

export type SystemCatalogContextType = {
  designations: string[];
  skillLevels: string[];
  stations: string[];
  addDesignation: (name: string) => void;
  addSkillLevel: (name: string) => void;
  addStation: (name: string) => void;
};

const SystemCatalogContext = createContext<SystemCatalogContextType | undefined>(undefined);

export const SystemCatalogProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const STORAGE_KEY = 'hris-system-catalog';
  type PersistShape = { designations: string[]; skillLevels: string[]; stations: string[] };
  const readStored = (): PersistShape | null => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      return JSON.parse(raw) as PersistShape;
    } catch { return null; }
  };
  const writeStored = (data: PersistShape) => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch {}
  };

  // Seed from existing data to make the system feel populated
  const seededDesignations = useMemo(() => {
    const set = new Set<string>();
    mockEmployees.forEach(emp => { if (emp.position) set.add(emp.position); });
    return Array.from(set);
  }, []);

  const seededSkillLevels = useMemo(() => {
    const set = new Set<string>();
    mockEmployees.forEach(emp => { if (emp.skillLevel) set.add(emp.skillLevel); });
    // Also include distinct skills.level entries as potential levels (optional)
    mockEmployees.forEach(emp => (emp.skills || []).forEach(s => { if (s.level) set.add(s.level); }));
    return Array.from(set);
  }, []);

  const seededStations = useMemo(() => {
    const set = new Set<string>();
    mockEmployees.forEach(emp => { if (emp.stationName) set.add(emp.stationName); });
    return Array.from(set);
  }, []);

  const stored = readStored();
  const [designations, setDesignations] = useState<string[]>(stored?.designations ?? seededDesignations);
  const [skillLevels, setSkillLevels] = useState<string[]>(stored?.skillLevels ?? seededSkillLevels);
  const [stations, setStations] = useState<string[]>(stored?.stations ?? seededStations);

  useEffect(() => {
    writeStored({ designations, skillLevels, stations });
  }, [designations, skillLevels, stations]);

  const addDesignation = (name: string) => {
    const n = name.trim();
    if (!n) return;
    setDesignations(prev => (prev.includes(n) ? prev : [...prev, n]));
  };

  const addSkillLevel = (name: string) => {
    const n = name.trim();
    if (!n) return;
    setSkillLevels(prev => (prev.includes(n) ? prev : [...prev, n]));
  };

  const addStation = (name: string) => {
    const n = name.trim();
    if (!n) return;
    setStations(prev => (prev.includes(n) ? prev : [...prev, n]));
  };

  const value: SystemCatalogContextType = {
    designations,
    skillLevels,
    stations,
    addDesignation,
    addSkillLevel,
    addStation,
  };

  return (
    <SystemCatalogContext.Provider value={value}>
      {children}
    </SystemCatalogContext.Provider>
  );
};

export const useSystemCatalog = () => {
  const ctx = useContext(SystemCatalogContext);
  if (!ctx) throw new Error('useSystemCatalog must be used within SystemCatalogProvider');
  return ctx;
};
