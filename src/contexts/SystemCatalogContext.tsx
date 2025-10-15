import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
// Note: removed dependency on mockData. Catalog seeds start empty and rely on backend or admin to populate.
import api from '@/lib/api';

export type Item = { value: string; active: boolean };
export type StationItem = { name: string; active: boolean };

export type SystemCatalogContextType = {
  designations: Item[];
  skillLevels: Item[];
  stations: StationItem[];
  stationNames: string[]; // convenience array of station names (aka departments)
  departmentNames: string[]; // alias for stationNames for clarity
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

  // Start with empty seeds; backend fetch will populate these on mount when available.
  const seededDesignations = useMemo(() => [], [] as any);
  const seededSkillLevels = useMemo(() => [], [] as any);
  const seededStations = useMemo(() => [], [] as any);
  const seededJobGroups = useMemo(() => [], [] as any);
  const seededEngagementTypes = useMemo(() => [], [] as any);
  const seededEthnicities = useMemo(() => [], [] as any);

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

  // Attempt to derive catalog values from backend employees on mount
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
          const [skillLevelsResult, designationResult, stationsResult, jobGroupsResult, engagementTypesResult, ethnicitiesResult, employeeRows] = await Promise.all([
            api.get('/api/skills/levels'),
            api.get('/api/designations'),
            api.get('/api/stations'),
            api.get('/api/job-groups'),
            api.get('/api/engagement-types'),
            api.get('/api/ethnicities'),
            api.get('/api/employees')
          ]);

          if (!mounted) return;

          if (Array.isArray(skillLevelsResult)) setSkillLevels(skillLevelsResult as Item[]);
          if (Array.isArray(designationResult)) setDesignations(designationResult as Item[]);
          if (Array.isArray(stationsResult)) setStations((stationsResult as any[]).map((r: any) => ({ name: r.name, active: true })));
          if (Array.isArray(jobGroupsResult)) setJobGroups(jobGroupsResult as Item[]);
          if (Array.isArray(engagementTypesResult)) setEngagementTypes(engagementTypesResult as Item[]);
          if (Array.isArray(ethnicitiesResult)) setEthnicities(ethnicitiesResult as Item[]);

          const rows = employeeRows;

        if (Array.isArray(rows) && rows.length > 0) {
          const designSet = new Set<string>(designations.map(d => d.value));
          const skillSet = new Set<string>(skillLevels.map(s => s.value));
          const stationSet = new Set<string>(stations.map(s => s.name));
          const jobGroupSet = new Set<string>(jobGroups.map(j => j.value));
          const engagementSet = new Set<string>(engagementTypes.map(e => e.value));
          const ethnicitySet = new Set<string>(ethnicities.map(e => e.value));

          for (const e of rows as any[]) {
            if (e.position) designSet.add(e.position);
            if (e.skill_level) skillSet.add(e.skill_level);
            if (e.station_name) stationSet.add(e.station_name);
            if (e.job_group) jobGroupSet.add(String(e.job_group));
            if (e.engagement_type) engagementSet.add(e.engagement_type);
            if (e.ethnicity) ethnicitySet.add(e.ethnicity);
          }

          // setDesignations(Array.from(designSet).map(v => ({ value: v, active: true })));
          // setSkillLevels(Array.from(skillSet).map(v => ({ value: v, active: true })));
          if (!Array.isArray(stationsResult) || (stationsResult as any[]).length === 0) {
            setStations(Array.from(stationSet).map(n => ({ name: n, active: true })));
          }
          if (!Array.isArray(jobGroupsResult) || (jobGroupsResult as any[]).length === 0) {
            setJobGroups(Array.from(jobGroupSet).map(v => ({ value: v, active: true })));
          }
          if (!Array.isArray(engagementTypesResult) || (engagementTypesResult as any[]).length === 0) {
            setEngagementTypes(Array.from(engagementSet).map(v => ({ value: v, active: true })));
          }
          if (!Array.isArray(ethnicitiesResult) || (ethnicitiesResult as any[]).length === 0) {
            setEthnicities(Array.from(ethnicitySet).map(v => ({ value: v, active: true })));
          }
        }
      } catch (err) {
        // keep local seeds if backend unavailable
      }
    })();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    // Persist as simpler shapes where possible (store Item[] for attributes and StationItem[] for stations)
    try { writeStored({ designations: designations, skillLevels: skillLevels, stations, jobGroups: jobGroups, engagementTypes: engagementTypes, ethnicities: ethnicities }); } catch {}
  }, [designations, skillLevels, stations, jobGroups, engagementTypes, ethnicities]);

  const addDesignation = async (name: string) => {
    const n = name.trim();
    if (!n) return;
    const newItem = await api.post('/api/designations', { name: n });
    setDesignations(prev => (prev.some(x => x.value === newItem.value) ? prev : [...prev, newItem]));
  };

  const editDesignation = async (oldName: string, newName: string) => {
    const o = oldName.trim();
    const n = newName.trim();
    if (!o || !n) return;
    const updated = await api.put(`/api/designations/${encodeURIComponent(o)}`, { name: n });
    setDesignations(prev => prev.map(x => (x.value === o ? updated : x)));
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

  const removeDesignation = async (name: string) => {
    const n = name.trim();
    if (!n) return;
    await api.del(`/api/designations/${encodeURIComponent(n)}`);
    setDesignations(prev => prev.filter(x => x.value !== n));
  };

  const addSkillLevel = async (name: string) => {
    const n = name.trim();
    if (!n) return;
    const newItem = await api.post('/api/skills/levels', { name: n });
    setSkillLevels(prev => [...prev, newItem]);
  };

  const editSkillLevel = async (oldName: string, newName: string) => {
    const o = oldName.trim();
    const n = newName.trim();
    if (!o || !n) return;
    const updatedItem = await api.put(`/api/skills/levels/${encodeURIComponent(o)}`, { name: n });
    setSkillLevels(prev => prev.map(x => (x.value === o ? updatedItem : x)));
  };

  const removeSkillLevel = async (name: string) => {
    const n = name.trim();
    if (!n) return;
    await api.del(`/api/skills/levels/${encodeURIComponent(n)}`);
    setSkillLevels(prev => prev.filter(x => x.value !== n));
  };

  const addStation = async (name: string) => {
    const n = name.trim();
    if (!n) return;
    const created = await api.post('/api/stations', { name: n });
    setStations(prev => (prev.some(s => s.name === created.name) ? prev : [...prev, { name: created.name, active: true }]));
  };

  const editStation = async (oldName: string, newName: string) => {
    const o = oldName.trim();
    const n = newName.trim();
    if (!o || !n) return;
    const updated = await api.put(`/api/stations/${encodeURIComponent(o)}`, { name: n });
    setStations(prev => prev.map(s => (s.name === o ? { ...s, name: updated.name } : s)));
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

  const removeStation = async (name: string) => {
    const n = name.trim();
    if (!n) return;
    await api.del(`/api/stations/${encodeURIComponent(n)}`);
    setStations(prev => prev.filter(s => s.name !== n));
  };
  const addJobGroup = async (name: string) => {
    const n = name.trim().toUpperCase();
    if (!n) return;
    const created = await api.post('/api/job-groups', { name: n });
    setJobGroups(prev => (prev.some(x => x.value === created.value) ? prev : [...prev, created]));
  };
  const editJobGroup = async (oldName: string, newName: string) => {
    const o = oldName.trim().toUpperCase();
    const n = newName.trim().toUpperCase();
    if (!o || !n) return;
    const updated = await api.put(`/api/job-groups/${encodeURIComponent(o)}`, { name: n });
    setJobGroups(prev => prev.map(x => (x.value === o ? updated : x)));
  };
  const deactivateJobGroup = (name: string) => { const n = name.trim().toUpperCase(); if (!n) return; setJobGroups(prev => prev.map(x => (x.value === n ? { ...x, active: false } : x))); };
  const reactivateJobGroup = (name: string) => { const n = name.trim().toUpperCase(); if (!n) return; setJobGroups(prev => prev.map(x => (x.value === n ? { ...x, active: true } : x))); };
  const removeJobGroup = async (name: string) => { const n = name.trim().toUpperCase(); if (!n) return; await api.del(`/api/job-groups/${encodeURIComponent(n)}`); setJobGroups(prev => prev.filter(x => x.value !== n)); };

  const addEngagementType = async (name: string) => {
    const n = name.trim();
    if (!n) return;
    const created = await api.post('/api/engagement-types', { name: n });
    setEngagementTypes(prev => (prev.some(x => x.value === created.value) ? prev : [...prev, created]));
  };
  const editEngagementType = async (oldName: string, newName: string) => { const o = oldName.trim(); const n = newName.trim(); if (!o || !n) return; const updated = await api.put(`/api/engagement-types/${encodeURIComponent(o)}`, { name: n }); setEngagementTypes(prev => prev.map(x => (x.value === o ? updated : x))); };
  const deactivateEngagementType = (name: string) => { const n = name.trim(); if (!n) return; setEngagementTypes(prev => prev.map(x => (x.value === n ? { ...x, active: false } : x))); };
  const reactivateEngagementType = (name: string) => { const n = name.trim(); if (!n) return; setEngagementTypes(prev => prev.map(x => (x.value === n ? { ...x, active: true } : x))); };
  const removeEngagementType = async (name: string) => { const n = name.trim(); if (!n) return; await api.del(`/api/engagement-types/${encodeURIComponent(n)}`); setEngagementTypes(prev => prev.filter(x => x.value !== n)); };

  const addEthnicity = async (name: string) => {
    const n = name.trim();
    if (!n) return;
    const created = await api.post('/api/ethnicities', { name: n });
    setEthnicities(prev => (prev.some(x => x.value === created.value) ? prev : [...prev, created]));
  };
  const editEthnicity = async (oldName: string, newName: string) => { const o = oldName.trim(); const n = newName.trim(); if (!o || !n) return; const updated = await api.put(`/api/ethnicities/${encodeURIComponent(o)}`, { name: n }); setEthnicities(prev => prev.map(x => (x.value === o ? updated : x))); };
  const deactivateEthnicity = (name: string) => { const n = name.trim(); if (!n) return; setEthnicities(prev => prev.map(x => (x.value === n ? { ...x, active: false } : x))); };
  const reactivateEthnicity = (name: string) => { const n = name.trim(); if (!n) return; setEthnicities(prev => prev.map(x => (x.value === n ? { ...x, active: true } : x))); };
  const removeEthnicity = async (name: string) => { const n = name.trim(); if (!n) return; await api.del(`/api/ethnicities/${encodeURIComponent(n)}`); setEthnicities(prev => prev.filter(x => x.value !== n)); };

  const value: SystemCatalogContextType = {
    designations,
    skillLevels,
    stations,
    stationNames: stations.map(s => s.name),
    departmentNames: stations.map(s => s.name),
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
