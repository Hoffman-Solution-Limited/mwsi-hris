import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Document, mockDocuments } from '@/data/mockData';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/contexts/NotificationsContext';

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
  assignDocumentToEmployee: (docId: string, params: { employeeId: string; name: string; email?: string; department?: string; reason?: string; }) => void;
  returnDocumentToRegistry: (docId: string, params: { remarks?: string }) => void;
};

const STORAGE_KEY = 'hris-documents';

const DocumentContext = createContext<DocumentContextType | undefined>(undefined);

export const DocumentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { addNotification } = useNotifications();
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

    // Notify uploader about successful upload
    try {
      addNotification({
        userId: user.id,
        title: 'Document uploaded',
        message: `"${doc.name}" has been uploaded and is pending review.`,
        link: '/profile?tab=notifications',
      });
    } catch {}
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

  const assignDocumentToEmployee: DocumentContextType['assignDocumentToEmployee'] = (docId, { employeeId, name, email, department, reason }) => {
    if (!user) return;
    setDocuments(prev => prev.map(doc => {
      if (doc.id !== docId) return doc;
      const updated: Document = {
        ...doc,
        assignedToEmployeeId: employeeId,
        assignedToName: name,
        assignedToEmail: email,
        assignedToDepartment: department,
        assignedDate: new Date().toISOString(),
        movementLog: [
          ...(doc.movementLog || []),
          {
            action: 'assigned',
            by: user.name,
            to: `${name}${department ? ' (' + department + ')' : ''}`,
            date: new Date().toISOString(),
            reason,
          },
        ],
      };

      // Notify assigned employee
      try {
        addNotification({
          userId: employeeId,
          title: 'Document assigned to you',
          message: `"${doc.name}" has been assigned to you by ${user.name}.`,
          link: '/profile?tab=notifications',
        });
      } catch {}
      return updated;
    }));
  };

  const returnDocumentToRegistry: DocumentContextType['returnDocumentToRegistry'] = (docId, { remarks }) => {
    if (!user) return;
    setDocuments(prev => prev.map(doc => {
      if (doc.id !== docId) return doc;
      const previousAssigneeId = doc.assignedToEmployeeId;
      const previousAssigneeName = doc.assignedToName;
      const updated: Document = {
        ...doc,
        assignedToEmployeeId: undefined,
        assignedToName: undefined,
        assignedToEmail: undefined,
        assignedToDepartment: undefined,
        assignedDate: undefined,
        movementLog: [
          ...(doc.movementLog || []),
          {
            action: 'returned',
            by: user.name,
            date: new Date().toISOString(),
            remarks,
          },
        ],
      };
      // Notify previous assignee that document was returned
      try {
        if (previousAssigneeId) {
          addNotification({
            userId: previousAssigneeId,
            title: 'Document returned to registry',
            message: `"${doc.name}" has been returned to the registry by ${user.name}.`,
            link: '/profile?tab=notifications',
          });
        }
      } catch {}
      return updated;
    }));
  };

  const value = useMemo(() => ({ 
    documents, 
    addDocument, 
    getDocumentUrl, 
    approveDocument, 
    rejectDocument,
    assignDocumentToEmployee,
    returnDocumentToRegistry,
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


