import React, { useMemo, useState } from 'react';
import { Upload, Search, Filter, FileText, Download, Eye, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useDocuments } from '@/contexts/DocumentContext';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

export const Documents: React.FC = () => {
  const { user } = useAuth();
  const { documents, addDocument, getDocumentUrl, approveDocument, rejectDocument } = useDocuments();
  const [searchQuery, setSearchQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState<'contract' | 'certificate' | 'policy' | 'form' | 'report'>('form');
  const [category, setCategory] = useState('General');
  const [file, setFile] = useState<File | null>(null);
  const [bulkFiles, setBulkFiles] = useState<FileList | null>(null);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [assignTo, setAssignTo] = useState('');
  const [movementLog, setMovementLog] = useState<{ docId: string; action: string; to: string; date: string; reason?: string; }[]>([]);
  const [moveReason, setMoveReason] = useState('');

  // Filter documents based on user role
  const baseDocuments = useMemo(() => {
    if (!user) return [];
    // Employees and managers only see their own documents
    if (user.role === 'employee' || user.role === 'manager') {
      return documents.filter(doc => doc.uploadedBy === user.name);
    }
    // HR/Admin see all
    return documents;
  }, [documents, user]);
    
  const filteredDocuments = baseDocuments.filter(doc =>
    doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold mb-2">
            {user?.role === 'employee' ? 'My Documents' : 'Document Registry'}
          </h1>
          <p className="text-muted-foreground">
            {user?.role === 'employee' 
              ? 'View and manage your personal documents' 
              : 'Centralized document management and file storage'
            }
          </p>
        </div>
        {(user && (user.role === 'employee' || user.role === 'manager'|| user.role === 'hr_manager')) && (
          <div className="flex gap-2">
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Single Document
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Upload Document</DialogTitle>
                  <DialogDescription>Provide details for your document.</DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium">Document Name</label>
                    <Input className="mt-1" placeholder="e.g. National ID Scan.pdf" value={name} onChange={(e) => setName(e.target.value)} />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Document Type</label>
                    <Select value={type} onValueChange={(v) => setType(v as any)}>
                      <SelectTrigger className="w-full mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="contract">Contract</SelectItem>
                        <SelectItem value="certificate">Certificate</SelectItem>
                        <SelectItem value="policy">Policy</SelectItem>
                        <SelectItem value="form">Form</SelectItem>
                        <SelectItem value="report">Report</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium">Select File</label>
                    <Input className="mt-1" type="file" onChange={(e) => setFile(e.target.files && e.target.files[0] ? e.target.files[0] : null)} />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Category</label>
                    <Input className="mt-1" placeholder="e.g. HR Records" value={category} onChange={(e) => setCategory(e.target.value)} />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium">Notes (optional)</label>
                    <Textarea className="mt-1" rows={3} placeholder="Add any notes..." />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={() => {
                    if (!name) return;
                    addDocument({ name, type, category, file });
                    setName('');
                    setType('form');
                    setCategory('General');
                    setFile(null);
                    setOpen(false);
                  }}>Submit</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            {[("admin" as const), ("hr_manager" as const)].includes(user?.role as any) && (
            <Dialog open={bulkOpen} onOpenChange={setBulkOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Upload className="w-4 h-4 mr-2" />
                  Bulk Upload
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Bulk Upload Documents</DialogTitle>
                  <DialogDescription>Select multiple files to upload at once.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <Input type="file" multiple onChange={e => setBulkFiles(e.target.files)} />
                </div>
                <DialogFooter>
                  <Button onClick={() => {
                    if (!bulkFiles || bulkFiles.length === 0) return;
                    // For demo, just call addDocument for each file
                    Array.from(bulkFiles).forEach(file => {
                      addDocument({ name: file.name, type: 'form', category: 'Bulk', file });
                    });
                    setBulkFiles(null);
                    setBulkOpen(false);
                  }}>Upload All</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            )}
          </div>
                
        )}
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline">
          <Filter className="w-4 h-4 mr-2" />
          Filter
        </Button>
      </div>

      <div className="grid gap-4">
        {filteredDocuments.map((document) => {
          const lastMove = movementLog.filter(m => m.docId === document.id).slice(-1)[0];
          return (
            <Card key={document.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="bg-primary/10 p-2 rounded">
                      <FileText className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium">{document.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {document.category} • Uploaded by {document.uploadedBy}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Created at: {document.createdAt || document.uploadDate} • Uploaded by: {document.uploadedBy} • Size: {document.size}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Current Location: {lastMove ? lastMove.to : 'Registry'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={`status-${document.status}`}>{document.status}</Badge>
                    <Button variant="outline" size="sm" onClick={() => {
                      const url = getDocumentUrl(document.id);
                      if (url) window.open(url, '_blank');
                    }} disabled={!getDocumentUrl(document.id)}>
                      <Eye className="w-4 h-4 mr-2" />
                      View
                    </Button>
                    {[("admin" as const), ("hr_manager" as const)].includes(user?.role as any) && (
                    <Button variant="outline" size="sm" onClick={() => { setSelectedDocument(document); setAssignModalOpen(true); }}>
                      Move / Assign
                    </Button> )}
                    <a
                      href={getDocumentUrl(document.id) || '#'}
                      download={document.name}
                      onClick={(e) => { if (!getDocumentUrl(document.id)) e.preventDefault(); }}
                    >
                      <Button variant="outline" size="sm" disabled={!getDocumentUrl(document.id)}>
                        <Download className="w-4 h-4" />
                      </Button>
                    </a>
                  </div>
                </div>
                {/* Movement Log */}
                <div className="mt-2">
                  <p className="text-xs font-semibold mb-1">Movement Log:</p>
                  <ul className="text-xs text-muted-foreground">
                    {movementLog.filter(m => m.docId === document.id).map((m, idx) => (
                      <li key={idx}>
                        {m.date.slice(0,19).replace('T',' ')}: {m.action} to {m.to}
                        {m.reason ? ` (Reason: ${m.reason})` : ''}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      {/* Move/Assign Modal */}
      {selectedDocument && (
        <Dialog open={assignModalOpen} onOpenChange={setAssignModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Move / Assign Document</DialogTitle>
              <DialogDescription>Assign this document to an office or staff member, and record the movement.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Input placeholder="Enter office or staff name..." value={assignTo} onChange={e => setAssignTo(e.target.value)} />
              <Input placeholder="Reason for moving..." value={moveReason} onChange={e => setMoveReason(e.target.value)} />
            </div>
            <DialogFooter>
              <Button onClick={() => {
                if (!selectedDocument || !assignTo) return;
                setMovementLog(prev => [
                  ...prev,
                  { docId: selectedDocument.id, action: 'Moved', to: assignTo, date: new Date().toISOString(), reason: moveReason }
                ]);
                setAssignModalOpen(false);
                setAssignTo('');
                setMoveReason('');
              }}>Move/Assign</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};