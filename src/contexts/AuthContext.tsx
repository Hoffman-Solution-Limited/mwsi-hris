import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type UserRole = 'admin' | 'hr_manager' | 'hr_staff' | 'employee' | 'manager' | 'registry_manager';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  department?: string;
  position?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users for demo
const mockUsers: Record<string, User> = {
  'admin@mwsi.com': {
    id: '1',
    name: 'John Smith',
    email: 'admin@mwsi.com',
    role: 'admin',
    avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=JS',
    department: 'IT',
    position: 'System Administrator'
  },
  'hr@mwsi.com': {
    id: '2',
    name: 'Sarah Johnson',
    email: 'hr@mwsi.com',
    role: 'hr_manager',
    avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=SJ',
    department: 'Human Resources',
    position: 'HR Manager'
  },
  'employee@mwsi.com': {
    id: '3',
    name: 'Michael Davis',
    email: 'employee@mwsi.com',
    role: 'employee',
    avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=MD',
    department: 'Engineering',
    position: 'Software Developer'
  },
  'manager@mwsi.com': {
    id: '6',
    name: 'David Manager',
    email: 'manager@mwsi.com',
    role: 'manager',
    avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=DM',
    department: 'Engineering',
    position: 'Engineering Manager'
  },
  'registry@mwsi.com': {
    id: '12',
    name: 'Rita Registry',
    email: 'registry@mwsi.com',
    role: 'registry_manager',
    avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=RR',
    department: 'Registry',
    position: 'Registry Manager'
  }
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored user session
    const storedUser = localStorage.getItem('hris-user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    const found = mockUsers[email];
    if (found && password === 'demo123') {
      setUser(found);
      localStorage.setItem('hris-user', JSON.stringify(found));
    } else {
      setIsLoading(false);
      throw new Error('Invalid credentials');
    }

    setIsLoading(false);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('hris-user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};