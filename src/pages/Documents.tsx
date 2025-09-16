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
  const [name, setName] = useState('');
  const [type, setType] = useState<'contract' | 'certificate' | 'policy' | 'form' | 'report'>('form');
  const [category, setCategory] = useState('General');
  const [file, setFile] = useState<File | null>(null);

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
        {(user && (user.role === 'employee' || user.role === 'manager')) && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Upload className="w-4 h-4 mr-2" />
                Upload Document
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
        {filteredDocuments.map((document) => (
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
                      {document.uploadDate} • {document.size}
                    </p>
                  </div>
                </div>
                    <div className="flex items-center gap-2">
                      <Badge className={`status-${document.status}`}>
                        {document.status}
                      </Badge>
                      {/* Only HR/Admin can approve/reject. Managers cannot. */}
                      <Button variant="outline" size="sm" onClick={() => {
                        const url = getDocumentUrl(document.id);
                        if (url) window.open(url, '_blank');
                      }} disabled={!getDocumentUrl(document.id)}>
                        <Eye className="w-4 h-4 mr-2" />
                        View
                      </Button>
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
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};