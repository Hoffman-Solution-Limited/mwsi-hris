import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { UserRole } from './AuthContext';

// Define permission keys. You can expand this list as needed.
export type PermissionKey =
  | 'employee.view'
  | 'employee.edit'
  | 'employee.create'
  | 'employee.delete'
  | 'page.employee-files'
  | 'page.admin.requests'
  | 'page.registry.requests'
  | 'page.admin.users'
  | 'page.admin.roles'
  | 'page.admin.settings'
  | 'page.admin.data'
  | 'page.admin.performance-templates'
  | 'page.admin.department-goals'
  | 'page.admin.training-management'
  | 'page.admin.system-logs'
  // HR module specific
  | 'hr.oversight'           // View company-wide HR queues, reports, and approvals
  | 'hr.team.manage'         // Perform team manager actions (for HR Manager's direct reports)
  | 'hr.assign_reviews';     // Create/assign performance reviews

export const ALL_PERMISSIONS: PermissionKey[] = [
  'employee.view',
  'employee.edit',
  'employee.create',
  'employee.delete',
  'page.employee-files',
  'page.admin.requests',
  'page.registry.requests',
  'page.admin.users',
  'page.admin.roles',
  'page.admin.settings',
  'page.admin.data',
  'page.admin.performance-templates',
  'page.admin.department-goals',
  'page.admin.training-management',
  'page.admin.system-logs',
  // HR module specific
  'hr.oversight',
  'hr.team.manage',
  'hr.assign_reviews',
];

export type RolePermissions = Record<UserRole, PermissionKey[]>;

const STORAGE_KEY = 'hris-permissions-v1';

// Default permissions per role (admin implicitly has all perms)
export const DEFAULT_ROLE_PERMISSIONS: RolePermissions = {
  admin: [
    'employee.view',
    'employee.edit',
    'employee.create',
    'employee.delete',
    'page.employee-files',
    'page.admin.requests',
    'page.admin.users',
    'page.admin.roles',
    'page.admin.settings',
    'page.admin.data',
    'page.admin.performance-templates',
    'page.admin.department-goals',
    'page.admin.training-management',
    'page.admin.system-logs',
  ],
  hr_manager: [
    'employee.view',
    'employee.edit',
    'employee.create',
    'page.employee-files',
    // HR module
    'hr.oversight',
    'hr.team.manage',
    'hr.assign_reviews',
  ],
  hr_staff: [
    'employee.view',
    'employee.edit',
    'page.employee-files',
    // HR module
    'hr.oversight',
    'hr.assign_reviews',
  ],
  manager: [
    'employee.view',
    'page.employee-files',
  ],
  employee: [
    'employee.view',
  ],
  registry_manager: [
    'employee.view',
    'page.employee-files',
    'page.registry.requests',
  ],
  registry_staff: [
    'employee.view',
    'page.employee-files',
    'page.registry.requests',
  ],
  testing: [],
};

interface PermissionsContextType {
  rolePermissions: RolePermissions;
  setRolePermissions: (role: UserRole, permissions: PermissionKey[]) => void;
  resetDefaults: () => void;
  can: (role: UserRole | undefined, permission: PermissionKey) => boolean;
}

const PermissionsContext = createContext<PermissionsContextType | undefined>(undefined);

export const PermissionsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [rolePermissions, setRolePermissionsState] = useState<RolePermissions>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw) as RolePermissions;
    } catch {}
    return DEFAULT_ROLE_PERMISSIONS;
  });

  useEffect(() => {
    // Ensure registry roles always keep access to registry pages (migration/safety net)
    const ensureRegistryAccess = (rp: RolePermissions): RolePermissions => {
      const ensure = (role: keyof RolePermissions) => {
        const list = new Set(rp[role] || []);
        list.add('page.registry.requests');
        list.add('page.employee-files');
        rp[role] = Array.from(list) as any;
      };
      ensure('registry_manager');
      ensure('registry_staff');
      return rp;
    };
    const sanitized = ensureRegistryAccess({ ...rolePermissions });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitized));
  }, [rolePermissions]);

  const setRolePermissions = (role: UserRole, permissions: PermissionKey[]) => {
    setRolePermissionsState(prev => ({ ...prev, [role]: permissions }));
  };

  const resetDefaults = () => setRolePermissionsState(DEFAULT_ROLE_PERMISSIONS);

  const can = (role: UserRole | undefined, permission: PermissionKey) => {
    if (!role) return false;
    if (role === 'admin') return true; // admin full access
    const list = rolePermissions[role] || [];
    return list.includes(permission);
  };

  const value = useMemo(() => ({ rolePermissions, setRolePermissions, resetDefaults, can }), [rolePermissions]);

  return (
    <PermissionsContext.Provider value={value}>
      {children}
    </PermissionsContext.Provider>
  );
};

export const usePermissions = () => {
  const ctx = useContext(PermissionsContext);
  if (!ctx) throw new Error('usePermissions must be used within a PermissionsProvider');
  return ctx;
};
