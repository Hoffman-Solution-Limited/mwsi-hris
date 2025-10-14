import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

export type AppUser = {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'HR' | 'Employee';
  status: 'Active' | 'Inactive';
};

type UsersContextType = {
  users: AppUser[];
  addUser: (u: Omit<AppUser, 'id' | 'status'> & { status?: AppUser['status'] }) => void;
  updateUser: (id: string, updates: Partial<AppUser>) => void;
  toggleStatus: (id: string) => void;
  findByEmail: (email: string) => AppUser | undefined;
};

const STORAGE_KEY = 'hris-users';

const UsersContext = createContext<UsersContextType | undefined>(undefined);

const seedUsers: AppUser[] = [
  { id: '1', name: 'Alice Kimani', email: 'alice@company.com', role: 'HR', status: 'Active' },
  { id: '2', name: 'Brian Otieno', email: 'brian@company.com', role: 'Employee', status: 'Inactive' },
  { id: '3', name: 'Carol Maina', email: 'carol@company.com', role: 'Admin', status: 'Active' },
];

export const UsersProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<AppUser[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch {}
    return seedUsers;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
    } catch {}
  }, [users]);

  const addUser: UsersContextType['addUser'] = (u) => {
    const id = crypto.randomUUID();
    const newUser: AppUser = { status: 'Active', ...u, id };
    setUsers(prev => [newUser, ...prev]);
  };

  const updateUser: UsersContextType['updateUser'] = (id, updates) => {
    setUsers(prev => prev.map(u => (u.id === id ? { ...u, ...updates } : u)));
  };

  const toggleStatus: UsersContextType['toggleStatus'] = (id) => {
    setUsers(prev => prev.map(u => (u.id === id ? { ...u, status: u.status === 'Active' ? 'Inactive' : 'Active' } : u)));
  };

  const findByEmail: UsersContextType['findByEmail'] = (email) => {
    const e = email.trim().toLowerCase();
    return users.find(u => u.email.toLowerCase() === e);
  };

  const value = useMemo(() => ({ users, addUser, updateUser, toggleStatus, findByEmail }), [users]);

  return <UsersContext.Provider value={value}>{children}</UsersContext.Provider>;
};

export const useUsers = () => {
  const ctx = useContext(UsersContext);
  if (!ctx) throw new Error('useUsers must be used within UsersProvider');
  return ctx;
};
