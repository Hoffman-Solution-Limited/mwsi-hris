import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useUsers } from './UsersContext'; // Import useUsers hook

// Allow dynamic role ids managed by RolesContext. Keep the name for compatibility.
export type UserRole = string;

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  department?: string;
  position?: string;
  employeeId?: string; // Link to employees table when available
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser?: (updates: Partial<User>) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { findByEmail: findUserByEmail, users } = useUsers(); // Use the hook from UsersContext

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

    const found = users.find(u => u.email === email); // Use findByEmail from UsersContext
    if (found && password === 'demo123') { // Note: This still uses a hardcoded password for demo purposes
      const userToLogin: User = {
        id: found.id,
        name: found.name || '',
        email: found.email,
        role: found.role.toLowerCase() as UserRole, // Normalize role
        employeeId: (found as any).employeeId,
      };
      setUser(userToLogin);
      localStorage.setItem('hris-user', JSON.stringify(userToLogin));
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

  const updateUser = (updates: Partial<User>) => {
    setUser(prev => {
      const next = prev ? { ...prev, ...updates } : null;
      try { if (next) localStorage.setItem('hris-user', JSON.stringify(next)); } catch {}
      return next;
    });
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser, isLoading }}>
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