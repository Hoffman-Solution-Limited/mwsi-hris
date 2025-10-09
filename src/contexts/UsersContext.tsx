import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

export type AppUser = {
  id: string;
  name?: string; // optional because Admin may be a pure role-without-profile
  email: string;
  role: 'Admin' | 'HR' | 'Employee' | 'Manager';
  status: 'Active' | 'Inactive';
  // Optional password field used only for local/demo storage. In real app this should be handled by backend/auth service.
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

const seedUsers: AppUser[] = [
  { id: '1', name: 'Alice Kimani', email: 'alice@company.com', role: 'HR', status: 'Active' },
  { id: '2', name: 'Brian Otieno', email: 'brian@company.com', role: 'Employee', status: 'Inactive' },
  // Manager seed user to match mock employees
  { id: '10', name: 'David Manager', email: 'david.manager@mwsi.com', role: 'Manager', status: 'Active' },
  // Admin created without a full profile (no name required). Password kept null in seed.
  { id: '3', email: 'superadmin@company.com', name: undefined, role: 'Admin', status: 'Active', password: null },
  // Test pure admin for local testing (no profile fields). Password set to 'demo123' so it works with the demo AuthProvider.
  { id: 'admin-test', email: 'admin.test@mwsi.com', name: undefined, role: 'Admin', status: 'Active', password: 'demo123' },
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

  const addUser = (u: Omit<AppUser, 'id' | 'status'> & { status?: AppUser['status'] }) => {
    const id = crypto.randomUUID();
    // Allow Admin accounts to be created without a name/profile.
    const newUser: AppUser = { status: 'Active', password: null, ...u, id } as AppUser;
    setUsers(prev => [newUser, ...prev]);
  };

  const changePassword = (id: string, newPassword: string | null) => {
    setUsers(prev => prev.map(u => (u.id === id ? { ...u, password: newPassword } : u)));
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

  const value = useMemo(() => ({ users, addUser, updateUser, toggleStatus, findByEmail, changePassword }), [users]);

  return <UsersContext.Provider value={value}>{children}</UsersContext.Provider>;
};

export const useUsers = () => {
  const ctx = useContext(UsersContext);
  if (!ctx) throw new Error('useUsers must be used within UsersProvider');
  return ctx;
};
