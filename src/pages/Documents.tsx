import React, { useMemo, useState } from 'react';

import { Search, Filter, FileText, Download, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useDocuments } from '@/contexts/DocumentContext';
import { useEmployees } from '@/contexts/EmployeesContext';

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

export const Documents: React.FC = () => {
  const { user } = useAuth();
  const { documents, getDocumentUrl, assignDocumentToEmployee, returnDocumentToRegistry } = useDocuments();
  const { employees } = useEmployees();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [assignEmployeeId, setAssignEmployeeId] = useState('');
  const [assignReason, setAssignReason] = useState('');
  const [returnModal, setReturnModal] = useState<{ open: boolean; docId?: string; remarks: string }>({ open: false, docId: undefined, remarks: '' });

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

  const assignedToMe = useMemo(() => {
    if (!user) return [] as typeof documents;
    return documents.filter(d => d.assignedToEmployeeId === user.id);
  }, [documents, user]);

  const selectedEmployee = useMemo(() => employees.find(e => e.id === assignEmployeeId.trim()), [assignEmployeeId, employees]);

  // Grouping for HR/Admin: Assigned vs Registry
  const assignedDocs = useMemo(() => filteredDocuments.filter(d => d.assignedToEmployeeId), [filteredDocuments]);
  const registryDocs = useMemo(() => filteredDocuments.filter(d => !d.assignedToEmployeeId), [filteredDocuments]);

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
        {/* Upload capability removed */}
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

      {/* Assigned To Me (visible to employees when there are assignments) */}
      {user?.role === 'employee' && assignedToMe.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Documents Temporarily Assigned To Me</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {assignedToMe.map((document) => (
                <div key={document.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">{document.name}</div>
                    <div className="text-xs text-muted-foreground">Assigned on: {document.assignedDate?.slice(0, 10)} • From: Registry</div>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => setReturnModal({ open: true, docId: document.id, remarks: '' })}>Return to Registry</Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {([('admin' as const), ('hr_manager' as const)].includes(user?.role as any)) ? (
        <Tabs defaultValue="registry">
          <TabsList  className="grid w-full grid-cols-2 gap-2">
            <TabsTrigger value="assigned"
                          className="bg-blue-600 text-white data-[state=active]:bg-blue-800 data-[state=active]:text-white rounded-lg py-2 text-lg font-semibold shadow">Assigned to Employees ({assignedDocs.length})</TabsTrigger>
            <TabsTrigger value="registry"
                          className="bg-yellow-600 text-white data-[state=active]:bg-yellow-800 data-[state=active]:text-white rounded-lg py-2 text-lg font-semibold shadow">Registry ({registryDocs.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="assigned">
            <Card>
              <CardHeader>
                <CardTitle>Assigned to Employees</CardTitle>
              </CardHeader>
              <CardContent>
                {assignedDocs.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No documents are currently assigned to employees.</p>
                ) : (
                  <div className="grid gap-4">
                    {assignedDocs.map((document) => (
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
                                  Current Location: {document.assignedToName ? `${document.assignedToName} (${document.assignedToDepartment || '—'})` : 'Registry'}
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
                              {[('admin' as const), ('hr_manager' as const)].includes(user?.role as any) && (
                                <Button variant="outline" size="sm" onClick={() => { setSelectedDocument(document as any); setAssignEmployeeId(''); setAssignReason(''); setAssignModalOpen(true); }}>
                                  Move / Assign
                                </Button>
                              )}
                            </div>
                          </div>
                          {/* Movement Log */}
                          <div className="mt-2">
                            <p className="text-xs font-semibold mb-1">Movement Log:</p>
                            <ul className="text-xs text-muted-foreground">
                              {(document.movementLog || []).map((m, idx) => (
                                <li key={idx}>
                                  {m.date.slice(0, 19).replace('T', ' ')}: {m.action} {m.to ? `to ${m.to}` : ''} by {m.by}
                                  {m.reason ? ` (Reason: ${m.reason})` : ''}
                                  {m.remarks ? ` (Remarks: ${m.remarks})` : ''}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="registry">
            <Card>
              <CardHeader>
                <CardTitle>Registry</CardTitle>
                <p className="text-sm text-muted-foreground">All unassigned documents, including those uploaded by employees. They remain manageable here and are also visible in the employee profile.</p>
              </CardHeader>
              <CardContent>
                {registryDocs.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No documents in registry.</p>
                ) : (
                  <div className="grid gap-4">
                    {registryDocs.map((document) => (
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
                                  Current Location: {document.assignedToName ? `${document.assignedToName} (${document.assignedToDepartment || '—'})` : 'Registry'}
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
                              {[('admin' as const), ('hr_manager' as const)].includes(user?.role as any) && (
                                <Button variant="outline" size="sm" onClick={() => { setSelectedDocument(document as any); setAssignEmployeeId(''); setAssignReason(''); setAssignModalOpen(true); }}>
                                  Move / Assign
                                </Button>
                              )}
                              {!document.assignedToEmployeeId && (
                                <a
                                  href={getDocumentUrl(document.id) || '#'}
                                  download={document.name}
                                  onClick={(e) => { if (!getDocumentUrl(document.id)) e.preventDefault(); }}
                                >
                                  <Button variant="outline" size="sm" disabled={!getDocumentUrl(document.id)}>
                                    <Download className="w-4 h-4" />
                                  </Button>
                                </a>
                              )}
                            </div>
                          </div>
                          {/* Movement Log */}
                          <div className="mt-2">
                            <p className="text-xs font-semibold mb-1">Movement Log:</p>
                            <ul className="text-xs text-muted-foreground">
                              {(document.movementLog || []).map((m, idx) => (
                                <li key={idx}>
                                  {m.date.slice(0, 19).replace('T', ' ')}: {m.action} {m.to ? `to ${m.to}` : ''} by {m.by}
                                  {m.reason ? ` (Reason: ${m.reason})` : ''}
                                  {m.remarks ? ` (Remarks: ${m.remarks})` : ''}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      ) : (
        <>
          <h2 className="text-xl font-semibold">My document</h2>
          {filteredDocuments.length === 0 ? (
            <Card className="mt-2">
              <CardContent className="p-4 text-sm text-muted-foreground">
                No documents available.
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredDocuments.map((document) => {
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
                              Current Location: {document.assignedToName ? `${document.assignedToName} (${document.assignedToDepartment || '—'})` : 'Registry'}
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
                          {[('admin' as const), ('hr_manager' as const)].includes(user?.role as any) && (
                            <Button variant="outline" size="sm" onClick={() => { setSelectedDocument(document as any); setAssignEmployeeId(''); setAssignReason(''); setAssignModalOpen(true); }}>
                              Move / Assign
                            </Button>
                          )}
                          {!document.assignedToEmployeeId && (
                            <a
                              href={getDocumentUrl(document.id) || '#'}
                              download={document.name}
                              onClick={(e) => { if (!getDocumentUrl(document.id)) e.preventDefault(); }}
                            >
                              <Button variant="outline" size="sm" disabled={!getDocumentUrl(document.id)}>
                                <Download className="w-4 h-4" />
                              </Button>
                            </a>
                          )}
                        </div>
                      </div>
                      {/* Movement Log */}
                      <div className="mt-2">
                        <p className="text-xs font-semibold mb-1">Movement Log:</p>
                        <ul className="text-xs text-muted-foreground">
                          {(document.movementLog || []).map((m, idx) => (
                            <li key={idx}>
                              {m.date.slice(0, 19).replace('T', ' ')}: {m.action} {m.to ? `to ${m.to}` : ''} by {m.by}
                              {m.reason ? ` (Reason: ${m.reason})` : ''}
                              {m.remarks ? ` (Remarks: ${m.remarks})` : ''}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </>
      )}
      {/* Move/Assign Modal */}
      {selectedDocument && (
        <Dialog open={assignModalOpen} onOpenChange={setAssignModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Move / Assign Document</DialogTitle>
              <DialogDescription>Assign this document to an office or staff member, and record the movement.</DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium">Employee ID</label>
                <Input className="mt-1" placeholder="Enter Employee ID" value={assignEmployeeId} onChange={e => setAssignEmployeeId(e.target.value)} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="text-sm font-medium">Name</label>
                  <Input className="mt-1" value={selectedEmployee?.name || ''} readOnly />
                </div>
                <div>
                  <label className="text-sm font-medium">Department</label>
                  <Input className="mt-1" value={selectedEmployee?.department || ''} readOnly />
                </div>
                <div>
                  <label className="text-sm font-medium">Email</label>
                  <Input className="mt-1" value={selectedEmployee?.email || ''} readOnly />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Reason (optional)</label>
                <Input className="mt-1" placeholder="Reason for assignment" value={assignReason} onChange={e => setAssignReason(e.target.value)} />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => {
                if (!selectedDocument) return;
                const emp = selectedEmployee;
                if (!emp) { alert('Enter a valid Employee ID'); return; }
                assignDocumentToEmployee((selectedDocument as any).id, { employeeId: emp.id, name: emp.name, email: emp.email, department: emp.department, reason: assignReason });
                toast({ title: 'Document moved', description: `${(selectedDocument as any).name} assigned to ${emp.name}.` });
                setAssignModalOpen(false);
                setAssignEmployeeId('');
                setAssignReason('');
              }}>Assign to Employee</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Return Document Modal */}
      <Dialog open={returnModal.open} onOpenChange={(o) => setReturnModal(prev => ({ ...prev, open: o }))}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Return Document</DialogTitle>
            <DialogDescription>Add optional remarks and return the document to the main registry.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <label className="text-sm font-medium">Remarks (optional)</label>
            <Textarea className="mt-1" rows={3} placeholder="Enter remarks..." value={returnModal.remarks} onChange={e => setReturnModal(prev => ({ ...prev, remarks: e.target.value }))} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReturnModal({ open: false, docId: undefined, remarks: '' })}>Cancel</Button>
            <Button onClick={() => {
              if (!returnModal.docId) return;
              returnDocumentToRegistry(returnModal.docId, { remarks: returnModal.remarks });
              toast({ title: 'Document returned', description: 'The document has been returned to the registry.' });
              setReturnModal({ open: false, docId: undefined, remarks: '' });
            }}>Return</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};