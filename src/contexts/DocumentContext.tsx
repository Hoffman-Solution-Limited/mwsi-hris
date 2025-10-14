import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Document, mockDocuments } from '@/data/mockData';
import { useAuth } from '@/contexts/AuthContext';

type NewDocumentInput = {
  name: string;
  type: Document['type'];
  category: string;
  size?: string;
  file?: File | null;
};

type DocumentContextType = {
  documents: Document[];
  addDocument: (input: NewDocumentInput) => void;
  getDocumentUrl: (id: string) => string | undefined;
  approveDocument: (id: string) => void;
  rejectDocument: (id: string) => void;
};

const STORAGE_KEY = 'hris-documents';

const DocumentContext = createContext<DocumentContextType | undefined>(undefined);

export const DocumentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<Document[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {}
    }
    return mockDocuments;
  });

  // Blob URLs are session-only; we don't persist them
  const [blobUrls, setBlobUrls] = useState<Record<string, string>>({});

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(documents));
  }, [documents]);

  const addDocument = (input: NewDocumentInput) => {
    if (!user) return;
    const doc: Document = {
      id: crypto.randomUUID(),
      name: input.name,
      type: input.type,
      uploadDate: new Date().toISOString().slice(0, 10),
      size: input.size || (input.file ? `${Math.ceil(input.file.size / 1024)} KB` : '—'),
      status: 'pending',
      uploadedBy: user.name,
      category: input.category
    };
    setDocuments(prev => [doc, ...prev]);

    if (input.file) {
      const url = URL.createObjectURL(input.file);
      setBlobUrls(prev => ({ ...prev, [doc.id]: url }));
    }
  };

  const getDocumentUrl = (id: string) => blobUrls[id];

  const approveDocument = (id: string) => {
    setDocuments(prev => prev.map(doc => 
      doc.id === id ? { ...doc, status: 'approved' } : doc
    ));
  };

  const rejectDocument = (id: string) => {
    setDocuments(prev => prev.map(doc => 
      doc.id === id ? { ...doc, status: 'rejected' } : doc
    ));
  };

  const value = useMemo(() => ({ 
    documents, 
    addDocument, 
    getDocumentUrl, 
    approveDocument, 
    rejectDocument 
  }), [documents, blobUrls]);

  return (
    <DocumentContext.Provider value={value}>
      {children}
    </DocumentContext.Provider>
  );
};

export const useDocuments = () => {
  const ctx = useContext(DocumentContext);
  if (!ctx) throw new Error('useDocuments must be used within DocumentProvider');
  return ctx;
};


