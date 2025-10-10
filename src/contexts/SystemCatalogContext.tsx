import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { mockEmployees } from '@/data/mockData';

export type Item = { value: string; active: boolean };
export type StationItem = { name: string; active: boolean };

export type SystemCatalogContextType = {
  designations: Item[];
  skillLevels: Item[];
  stations: StationItem[];
  jobGroups: Item[];
  engagementTypes: Item[];
  ethnicities: Item[];
  addDesignation: (name: string) => void;
  editDesignation: (oldName: string, newName: string) => void;
  deactivateDesignation: (name: string) => void;
  reactivateDesignation: (name: string) => void;
  removeDesignation: (name: string) => void;
  addSkillLevel: (name: string) => void;
  editSkillLevel: (oldName: string, newName: string) => void;
  deactivateSkillLevel: (name: string) => void;
  reactivateSkillLevel: (name: string) => void;
  removeSkillLevel: (name: string) => void;
  addStation: (name: string) => void;
  editStation: (oldName: string, newName: string) => void;
  deactivateStation: (name: string) => void;
  reactivateStation: (name: string) => void;
  removeStation: (name: string) => void;
  addJobGroup: (name: string) => void;
  editJobGroup: (oldName: string, newName: string) => void;
  deactivateJobGroup: (name: string) => void;
  reactivateJobGroup: (name: string) => void;
  removeJobGroup: (name: string) => void;
  addEngagementType: (name: string) => void;
  editEngagementType: (oldName: string, newName: string) => void;
  deactivateEngagementType: (name: string) => void;
  reactivateEngagementType: (name: string) => void;
  removeEngagementType: (name: string) => void;
  addEthnicity: (name: string) => void;
  editEthnicity: (oldName: string, newName: string) => void;
  deactivateEthnicity: (name: string) => void;
  reactivateEthnicity: (name: string) => void;
  removeEthnicity: (name: string) => void;
};

const SystemCatalogContext = createContext<SystemCatalogContextType | undefined>(undefined);

export const SystemCatalogProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const STORAGE_KEY = 'hris-system-catalog';
  type PersistShape = {
    designations: string[] | Item[];
    skillLevels: string[] | Item[];
    stations: string[] | StationItem[];
    jobGroups: string[] | Item[];
    engagementTypes: string[] | Item[];
    ethnicities: string[] | Item[];
  };
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
    return Array.from(set).map(s => ({ value: s, active: true }));
  }, []);

  const seededSkillLevels = useMemo(() => {
    const set = new Set<string>();
    mockEmployees.forEach(emp => { if (emp.skillLevel) set.add(emp.skillLevel); });
    // Also include distinct skills.level entries as potential levels (optional)
    mockEmployees.forEach(emp => (emp.skills || []).forEach(s => { if (s.level) set.add(s.level); }));
    return Array.from(set).map(s => ({ value: s, active: true }));
  }, []);

  const seededStations = useMemo(() => {
    const set = new Set<string>();
    mockEmployees.forEach(emp => { if (emp.stationName) set.add(emp.stationName); });
    return Array.from(set).map(s => ({ name: s, active: true } as StationItem));
  }, []);
  const seededJobGroups = useMemo(() => {
    // Default job groups A-L
    return 'ABCDEFGHIJKL'.split('').map(s => ({ value: s, active: true }));
  }, []);
  const seededEngagementTypes = useMemo(() => {
    return ['Permanent', 'Extended Service', 'Local Contract', 'Intern', 'Temporary'].map(s => ({ value: s, active: true }));
  }, []);
  const seededEthnicities = useMemo(() => {
    // Minimal seed list; HR can expand
    return ['Kikuyu', 'Luo', 'Luhya', 'Kalenjin', 'Kamba', 'Somali', 'Meru', 'Mijikenda', 'Maasai', 'Embu', 'Kisii', 'Other'].map(s => ({ value: s, active: true }));
  }, []);

  const stored = readStored();
  // Helper to normalize possibly-string[] persisted lists into Item[] shape
  const normalizeList = (raw: any, seeded: Item[]) : Item[] => {
    if (!raw) return seeded;
    if (Array.isArray(raw) && raw.length && typeof raw[0] === 'string') {
      return (raw as string[]).map(v => ({ value: v, active: true }));
    }
    return raw as Item[];
  };

  const [designations, setDesignations] = useState<Item[]>(normalizeList(stored?.designations ?? seededDesignations, seededDesignations));
  const [skillLevels, setSkillLevels] = useState<Item[]>(normalizeList(stored?.skillLevels ?? seededSkillLevels, seededSkillLevels));
  // Stored stations may be string[] from older version; normalize to StationItem[]
  const initialStations: StationItem[] = (() => {
    const raw = stored?.stations ?? seededStations;
    if (!raw) return [];
    if (Array.isArray(raw) && raw.length && typeof raw[0] === 'string') {
      return (raw as string[]).map(s => ({ name: s, active: true }));
    }
    return (raw as StationItem[]);
  })();
  const [stations, setStations] = useState<StationItem[]>(initialStations);
  const [jobGroups, setJobGroups] = useState<Item[]>(normalizeList(stored?.jobGroups ?? seededJobGroups, seededJobGroups));
  const [engagementTypes, setEngagementTypes] = useState<Item[]>(normalizeList(stored?.engagementTypes ?? seededEngagementTypes, seededEngagementTypes));
  const [ethnicities, setEthnicities] = useState<Item[]>(normalizeList(stored?.ethnicities ?? seededEthnicities, seededEthnicities));

  useEffect(() => {
    // Persist as simpler shapes where possible (store Item[] for attributes and StationItem[] for stations)
    try { writeStored({ designations: designations, skillLevels: skillLevels, stations, jobGroups: jobGroups, engagementTypes: engagementTypes, ethnicities: ethnicities }); } catch {}
  }, [designations, skillLevels, stations, jobGroups, engagementTypes, ethnicities]);

  const addDesignation = (name: string) => {
    const n = name.trim();
    if (!n) return;
    setDesignations(prev => (prev.some(x => x.value === n) ? prev : [...prev, { value: n, active: true }]));
  };

  const editDesignation = (oldName: string, newName: string) => {
    const o = oldName.trim();
    const n = newName.trim();
    if (!o || !n) return;
    setDesignations(prev => prev.map(x => (x.value === o ? { ...x, value: n } : x)));
  };

  const deactivateDesignation = (name: string) => {
    const n = name.trim();
    if (!n) return;
    setDesignations(prev => prev.map(x => (x.value === n ? { ...x, active: false } : x)));
  };

  const reactivateDesignation = (name: string) => {
    const n = name.trim();
    if (!n) return;
    setDesignations(prev => prev.map(x => (x.value === n ? { ...x, active: true } : x)));
  };

  const removeDesignation = (name: string) => {
    const n = name.trim();
    if (!n) return;
    setDesignations(prev => prev.filter(x => x.value !== n));
  };

  const addSkillLevel = (name: string) => {
    const n = name.trim();
    if (!n) return;
    setSkillLevels(prev => (prev.some(x => x.value === n) ? prev : [...prev, { value: n, active: true }]));
  };

  const editSkillLevel = (oldName: string, newName: string) => {
    const o = oldName.trim();
    const n = newName.trim();
    if (!o || !n) return;
    setSkillLevels(prev => prev.map(x => (x.value === o ? { ...x, value: n } : x)));
  };

  const deactivateSkillLevel = (name: string) => {
    const n = name.trim();
    if (!n) return;
    setSkillLevels(prev => prev.map(x => (x.value === n ? { ...x, active: false } : x)));
  };

  const reactivateSkillLevel = (name: string) => {
    const n = name.trim();
    if (!n) return;
    setSkillLevels(prev => prev.map(x => (x.value === n ? { ...x, active: true } : x)));
  };

  const removeSkillLevel = (name: string) => {
    const n = name.trim();
    if (!n) return;
    setSkillLevels(prev => prev.filter(x => x.value !== n));
  };

  const addStation = (name: string) => {
    const n = name.trim();
    if (!n) return;
    setStations(prev => (prev.some(s => s.name === n) ? prev : [...prev, { name: n, active: true }]));
  };

  const editStation = (oldName: string, newName: string) => {
    const o = oldName.trim();
    const n = newName.trim();
    if (!o || !n) return;
    setStations(prev => prev.map(s => (s.name === o ? { ...s, name: n } : s)));
  };

  const deactivateStation = (name: string) => {
    const n = name.trim();
    if (!n) return;
    setStations(prev => prev.map(s => (s.name === n ? { ...s, active: false } : s)));
  };

  const reactivateStation = (name: string) => {
    const n = name.trim();
    if (!n) return;
    setStations(prev => prev.map(s => (s.name === n ? { ...s, active: true } : s)));
  };

  const removeStation = (name: string) => {
    const n = name.trim();
    if (!n) return;
    setStations(prev => prev.filter(s => s.name !== n));
  };
  const addJobGroup = (name: string) => {
    const n = name.trim().toUpperCase();
    if (!n) return;
    setJobGroups(prev => (prev.some(x => x.value === n) ? prev : [...prev, { value: n, active: true }]));
  };
  const editJobGroup = (oldName: string, newName: string) => {
    const o = oldName.trim().toUpperCase();
    const n = newName.trim().toUpperCase();
    if (!o || !n) return;
    setJobGroups(prev => prev.map(x => (x.value === o ? { ...x, value: n } : x)));
  };
  const deactivateJobGroup = (name: string) => { const n = name.trim().toUpperCase(); if (!n) return; setJobGroups(prev => prev.map(x => (x.value === n ? { ...x, active: false } : x))); };
  const reactivateJobGroup = (name: string) => { const n = name.trim().toUpperCase(); if (!n) return; setJobGroups(prev => prev.map(x => (x.value === n ? { ...x, active: true } : x))); };
  const removeJobGroup = (name: string) => { const n = name.trim().toUpperCase(); if (!n) return; setJobGroups(prev => prev.filter(x => x.value !== n)); };

  const addEngagementType = (name: string) => {
    const n = name.trim();
    if (!n) return;
    setEngagementTypes(prev => (prev.some(x => x.value === n) ? prev : [...prev, { value: n, active: true }]));
  };
  const editEngagementType = (oldName: string, newName: string) => { const o = oldName.trim(); const n = newName.trim(); if (!o || !n) return; setEngagementTypes(prev => prev.map(x => (x.value === o ? { ...x, value: n } : x))); };
  const deactivateEngagementType = (name: string) => { const n = name.trim(); if (!n) return; setEngagementTypes(prev => prev.map(x => (x.value === n ? { ...x, active: false } : x))); };
  const reactivateEngagementType = (name: string) => { const n = name.trim(); if (!n) return; setEngagementTypes(prev => prev.map(x => (x.value === n ? { ...x, active: true } : x))); };
  const removeEngagementType = (name: string) => { const n = name.trim(); if (!n) return; setEngagementTypes(prev => prev.filter(x => x.value !== n)); };

  const addEthnicity = (name: string) => {
    const n = name.trim();
    if (!n) return;
    setEthnicities(prev => (prev.some(x => x.value === n) ? prev : [...prev, { value: n, active: true }]));
  };
  const editEthnicity = (oldName: string, newName: string) => { const o = oldName.trim(); const n = newName.trim(); if (!o || !n) return; setEthnicities(prev => prev.map(x => (x.value === o ? { ...x, value: n } : x))); };
  const deactivateEthnicity = (name: string) => { const n = name.trim(); if (!n) return; setEthnicities(prev => prev.map(x => (x.value === n ? { ...x, active: false } : x))); };
  const reactivateEthnicity = (name: string) => { const n = name.trim(); if (!n) return; setEthnicities(prev => prev.map(x => (x.value === n ? { ...x, active: true } : x))); };
  const removeEthnicity = (name: string) => { const n = name.trim(); if (!n) return; setEthnicities(prev => prev.filter(x => x.value !== n)); };

  const value: SystemCatalogContextType = {
    designations,
    skillLevels,
    stations,
    jobGroups,
    engagementTypes,
    ethnicities,
    addDesignation,
    editDesignation,
    deactivateDesignation,
    reactivateDesignation,
    removeDesignation,
    addSkillLevel,
    editSkillLevel,
    deactivateSkillLevel,
    reactivateSkillLevel,
    removeSkillLevel,
    addStation,
    editStation,
    deactivateStation,
    reactivateStation,
    removeStation,
    addJobGroup,
    editJobGroup,
    deactivateJobGroup,
    reactivateJobGroup,
    removeJobGroup,
    addEngagementType,
    editEngagementType,
    deactivateEngagementType,
    reactivateEngagementType,
    removeEngagementType,
    addEthnicity,
    editEthnicity,
    deactivateEthnicity,
    reactivateEthnicity,
    removeEthnicity,
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
