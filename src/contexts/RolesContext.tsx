import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { DEFAULT_ROLE_PERMISSIONS, RolePermissions } from './PermissionsContext';

export type RoleItem = {
  id: string; // internal value e.g. 'admin', 'hr_manager'
  name: string; // display label e.g. 'Admin'
  locked?: boolean; // cannot be removed or renamed
};

const STORAGE_KEY = 'hris-roles-v1';

export const DEFAULT_ROLES: RoleItem[] = [
  { id: 'admin', name: 'Admin', locked: true },
  { id: 'hr_manager', name: 'HR', locked: false },
  { id: 'hr_staff', name: 'HR Staff', locked: false },
  { id: 'manager', name: 'Manager', locked: false },
  { id: 'employee', name: 'Employee', locked: false },
  { id: 'registry_manager', name: 'Registry', locked: false },
  { id: 'testing', name: 'Testing', locked: false },
];

type RolesContextType = {
  roles: RoleItem[];
  addRole: (name: string, id?: string) => RoleItem;
  updateRole: (id: string, name: string) => void;
  deleteRole: (id: string) => void;
  resetDefaults: () => void;
  findRole: (id?: string | null) => RoleItem | undefined;
};

const RolesContext = createContext<RolesContextType | undefined>(undefined);

function slugifyName(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 40);
}

export const RolesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [roles, setRoles] = useState<RoleItem[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw) as RoleItem[];
    } catch {}
    return DEFAULT_ROLES;
  });

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(roles)); } catch {}
  }, [roles]);

  const addRole = (name: string, id?: string) => {
    const newId = id ? id : slugifyName(name) || `role_${Date.now()}`;
    if (roles.find(r => r.id === newId)) {
      // if exists, append suffix
      const unique = `${newId}_${Date.now()}`;
      const role = { id: unique, name };
      setRoles(prev => [...prev, role]);
      return role;
    }
    const role = { id: newId, name };
    setRoles(prev => [...prev, role]);
    return role;
  };

  const updateRole = (id: string, name: string) => {
    setRoles(prev => prev.map(r => (r.id === id ? { ...r, name } : r)));
  };

  const deleteRole = (id: string) => {
    setRoles(prev => prev.filter(r => r.id !== id));
  };

  const resetDefaults = () => {
    setRoles(DEFAULT_ROLES);
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
  };

  const findRole = (id?: string | null) => roles.find(r => r.id === id);

  const value = useMemo(() => ({ roles, addRole, updateRole, deleteRole, resetDefaults, findRole }), [roles]);

  return <RolesContext.Provider value={value}>{children}</RolesContext.Provider>;
};

export const useRoles = () => {
  const ctx = useContext(RolesContext);
  if (!ctx) throw new Error('useRoles must be used within RolesProvider');
  return ctx;
};
