import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

export type AppNotification = {
  id: string;
  userId: string; // recipient user id
  title: string;
  message: string;
  createdAt: string; // ISO
  read?: boolean;
  link?: string;
  type?: 'info' | 'success' | 'warning' | 'error';
};

interface NotificationsContextType {
  notifications: AppNotification[];
  getUserNotifications: (userId: string) => AppNotification[];
  getUnreadCount: (userId: string) => number;
  addNotification: (n: Omit<AppNotification, 'id' | 'createdAt' | 'read'> & { createdAt?: string; read?: boolean }) => void;
  markRead: (id: string) => void;
  markAllRead: (userId: string) => void;
  clearAllForUser: (userId: string) => void;
}

const STORAGE_KEY = 'hris-notifications';

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

export const NotificationsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
  }, [notifications]);

  const addNotification: NotificationsContextType['addNotification'] = (n) => {
    const notif: AppNotification = {
      id: crypto.randomUUID(),
      createdAt: n.createdAt || new Date().toISOString(),
      read: n.read ?? false,
      ...n,
    };
    setNotifications(prev => [notif, ...prev]);
  };

  const markRead: NotificationsContextType['markRead'] = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllRead: NotificationsContextType['markAllRead'] = (userId) => {
    setNotifications(prev => prev.map(n => n.userId === userId ? { ...n, read: true } : n));
  };

  const clearAllForUser: NotificationsContextType['clearAllForUser'] = (userId) => {
    setNotifications(prev => prev.filter(n => n.userId !== userId));
  };

  const getUserNotifications = (userId: string) => notifications.filter(n => n.userId === userId).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const getUnreadCount = (userId: string) => notifications.filter(n => n.userId === userId && !n.read).length;

  const value = useMemo(() => ({
    notifications,
    getUserNotifications,
    getUnreadCount,
    addNotification,
    markRead,
    markAllRead,
    clearAllForUser,
  }), [notifications]);

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
};

export const useNotifications = () => {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationsProvider');
  return ctx;
};
