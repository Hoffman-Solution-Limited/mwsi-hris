import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Employee } from '@/types/models';
import api from '@/lib/api';
import { UserRole } from './AuthContext';

// AppUser now extends Employee and uses a consistent UserRole type
export type AppUser = Employee & {
  role: UserRole;
  password?: string | null;
};

type UsersContextType = {
  users: AppUser[];
  addUser: (u: Omit<AppUser, 'id' | 'status'> & { status?: AppUser['status'] }) => void;
  updateUser: (id: string, updates: Partial<AppUser>) => void;
  toggleStatus: (id: string) => void;
  findByEmail: (email: string) => AppUser | undefined;
  changePassword: (id: string, newPassword: string | null) => void;
};

const STORAGE_KEY = 'hris-users';

const UsersContext = createContext<UsersContextType | undefined>(undefined);

// Minimal built-in seed users (used only if localStorage and API are empty)
const seedUsers: AppUser[] = [
  {
    id: 'admin-test',
    email: 'admin.test@mwsi.com',
    name: 'Test Admin',
    role: 'admin',
    status: 'active',
    password: 'demo123',
    position: 'Admin',
    department: 'IT',
    hireDate: new Date().toISOString(),
  },
];


export const UsersProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<AppUser[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw) as AppUser[];
    } catch {}
    return seedUsers;
  });

  // Load users from backend on mount; keep local fallback
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const rows = await api.get('/api/users');
        if (!mounted) return;
        if (Array.isArray(rows) && rows.length > 0) {
          // Map backend rows into AppUser shape conservatively
          const mapped = (rows as any[]).map(r => ({
            id: r.id,
            email: r.email,
            name: r.name,
            role: r.role || 'employee',
            status: r.status || 'active',
          })) as AppUser[];
          setUsers(mapped);
        }
      } catch (err) {
        // ignore, fallback to local seedUsers/localStorage
      }
    })();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
    } catch {}
  }, [users]);

  const addUser = (u: Omit<AppUser, 'id' | 'status'> & { status?: AppUser['status'] }) => {
    (async () => {
      try {
        const payload = { ...u } as any;
        const created = await api.post('/api/users', payload);
        setUsers(prev => [...prev, { ...(created as AppUser), status: created.status || 'active' }]);
      } catch (err) {
        const newUser: AppUser = {
          id: crypto.randomUUID(),
          status: 'active',
          ...u,
        };
        setUsers(prev => [...prev, newUser]);
      }
    })();
  };

  const changePassword = (id: string, newPassword: string | null) => {
    (async () => {
      try {
        // backend currently does not expose password change; we update locally for now
        await api.put(`/api/users/${id}`, { password: newPassword });
        setUsers(prev => prev.map(u => (u.id === id ? { ...u, password: newPassword } : u)));
      } catch (err) {
        setUsers(prev => prev.map(u => (u.id === id ? { ...u, password: newPassword } : u)));
      }
    })();
  };

  const updateUser = (id: string, updates: Partial<AppUser>) => {
    (async () => {
      try {
        const updated = await api.put(`/api/users/${id}`, updates);
        setUsers(prev => prev.map(u => (u.id === id ? { ...u, ...(updated as any) } : u)));
      } catch (err) {
        setUsers(prev => prev.map(u => (u.id === id ? { ...u, ...updates } : u)));
      }
    })();
  };

  const toggleStatus = (id: string) => {
    setUsers(prev =>
      prev.map(u =>
        u.id === id ? { ...u, status: u.status === 'active' ? 'inactive' : 'active' } : u
      )
    );
  };

  const findByEmail = (email: string) => {
    return users.find(u => u.email.toLowerCase() === email.toLowerCase());
  };

  const value = useMemo(
    () => ({ users, addUser, updateUser, toggleStatus, findByEmail, changePassword }),
    [users]
  );

  return <UsersContext.Provider value={value}>{children}</UsersContext.Provider>;
};

export const useUsers = () => {
  const ctx = useContext(UsersContext);
  if (!ctx) throw new Error('useUsers must be used within UsersProvider');
  return ctx;
};
