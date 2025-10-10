import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Employee, mockEmployees } from '@/data/mockData'; // Import Employee type and mockEmployees
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

// Combine mockEmployees with role and password info to create a single source of truth
const seedUsers: AppUser[] = mockEmployees.map(emp => {
  let role: UserRole = 'employee';
  if (emp.email === 'admin@mwsi.com') role = 'admin';
  else if (emp.email === 'sarah.johnson@mwsi.com') role = 'hr_manager';
  else if (emp.email === 'david.manager@mwsi.com') role = 'manager';
  else if (emp.email === 'emily.chen@mwsi.com') role = 'registry_manager';
  
  return {
    ...emp,
    role,
    password: 'demo123'
  };
});

// Add any users that don't exist in mockEmployees
if (!seedUsers.find(u => u.email === 'admin.test@mwsi.com')) {
    seedUsers.push({
        id: 'admin-test',
        email: 'admin.test@mwsi.com',
        name: 'Test Admin',
        role: 'admin',
        status: 'active',
        password: 'demo123',
        position: 'Admin',
        department: 'IT',
        hireDate: new Date().toISOString(),
    });
}

if (!seedUsers.find(u => u.email === 'testing@mwsi.com')) {
    seedUsers.push({
        id: 'testing-user',
        email: 'testing@mwsi.com',
        name: 'Testing User',
        role: 'testing' as UserRole,
        status: 'active',
        password: 'demo123',
        position: 'Tester',
        department: 'QA',
        hireDate: new Date().toISOString(),
    });
}


export const UsersProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<AppUser[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const storedUsers = JSON.parse(raw) as AppUser[];
        // Merge stored users with seed users to ensure all are present
        const userMap = new Map(storedUsers.map(u => [u.email, u]));
        seedUsers.forEach(su => {
          if (!userMap.has(su.email)) {
            userMap.set(su.email, su);
          }
        });
        return Array.from(userMap.values());
      }
    } catch {}
    return seedUsers;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
    } catch {}
  }, [users]);

  const addUser = (u: Omit<AppUser, 'id' | 'status'> & { status?: AppUser['status'] }) => {
    const newUser: AppUser = {
      id: crypto.randomUUID(),
      status: 'active',
      ...u,
    };
    setUsers(prev => [...prev, newUser]);
  };

  const changePassword = (id: string, newPassword: string | null) => {
    setUsers(prev => prev.map(u => (u.id === id ? { ...u, password: newPassword } : u)));
  };

  const updateUser = (id: string, updates: Partial<AppUser>) => {
    setUsers(prev => prev.map(u => (u.id === id ? { ...u, ...updates } : u)));
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
