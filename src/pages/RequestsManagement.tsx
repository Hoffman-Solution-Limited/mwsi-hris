import React, { useMemo, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useFileTracking } from '@/contexts/FileTrackingContext';
import { useEmployees } from '@/contexts/EmployeesContext';
import { useSystemCatalog } from '@/contexts/SystemCatalogContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const RequestsManagementPage: React.FC = () => {
  const { user } = useAuth();
  const { listAllRequests, approveRequest, rejectRequest, getFileByEmployeeId } = useFileTracking();
  const { employees } = useEmployees();
  const { stations } = useSystemCatalog();

  const [search, setSearch] = useState('');
  const [approveModal, setApproveModal] = useState<{ open: boolean; requestId?: string; toLocation: string; comment: string }>({ open: false, toLocation: '', comment: '' });
  const [rejectModal, setRejectModal] = useState<{ open: boolean; requestId?: string; reason: string }>({ open: false, reason: '' });

  if (!user || user.role !== 'admin') {
    return (
      <div className="text-sm text-muted-foreground p-6">Admin access only.</div>
    );
  }

  const pending = useMemo(() => listAllRequests().filter(r => r.status === 'pending'), [listAllRequests]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return pending;
    return pending.filter(r => r.employeeId.toLowerCase().includes(q) || r.requestedByName.toLowerCase().includes(q));
  }, [pending, search]);

  const submitApprove = () => {
    if (!approveModal.requestId || !approveModal.toLocation) return;
    approveRequest(approveModal.requestId, { toLocation: approveModal.toLocation, comment: approveModal.comment || undefined });
    setApproveModal({ open: false, requestId: undefined, toLocation: '', comment: '' });
  };

  const submitReject = () => {
    if (!rejectModal.requestId) return;
    rejectRequest(rejectModal.requestId, rejectModal.reason || undefined);
    setRejectModal({ open: false, requestId: undefined, reason: '' });
  };

  const managerStations = React.useMemo(() => {
    const set = new Set<string>();
    employees.forEach(e => {
      const isManager = /manager/i.test(e.position || '');
      const s = (e as any).stationName as string | undefined;
      if (isManager && s) set.add(s);
    });
    return Array.from(set);
  }, [employees]);
  const LOCATIONS = managerStations.length > 0 ? managerStations : (stations.length > 0 ? stations : ['Registry Office']);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Requests Management</h1>
          <p className="text-muted-foreground">Pending employee file requests. Approve and route files to destinations.</p>
        </div>
        <div className="w-64">
          <Input placeholder="Search by Employee ID or Requester" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pending Requests ({filtered.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filtered.length === 0 ? (
            <div className="text-sm text-muted-foreground">No pending requests.</div>
          ) : (
            <div className="space-y-2">
              {filtered.map(r => (
                <div key={r.id} className="p-3 border rounded flex items-center justify-between">
                  <div>
                    <div className="font-medium">Employee File: {r.employeeId}</div>
                    <div className="text-xs text-muted-foreground">Requested by {r.requestedByName} • {r.createdAt.slice(0,19).replace('T',' ')}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={`status-${r.status}`}>{r.status}</Badge>
                    <Button size="sm" variant="outline" onClick={() => {
                      const requester = employees.find(e => e.id === r.requestedByUserId) || employees.find(e => e.name === r.requestedByName);
                      const suggested = requester?.stationName || 'Registry Office';
                      setApproveModal({ open: true, requestId: r.id, toLocation: suggested, comment: '' });
                    }}>Approve</Button>
                    <Button size="sm" variant="outline" onClick={() => setRejectModal({ open: true, requestId: r.id, reason: '' })}>Reject</Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Approve Dialog */}
      <Dialog open={approveModal.open} onOpenChange={(o) => setApproveModal(prev => ({ ...prev, open: o }))}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve File Request</DialogTitle>
            <DialogDescription>Select destination location for this file.</DialogDescription>
          </DialogHeader>
          {(() => {
            const req = listAllRequests().find(r => r.id === approveModal.requestId);
            const file = req ? getFileByEmployeeId(req.employeeId) : undefined;
            const owner = req ? employees.find(e => e.id === req.employeeId) : undefined;
            return (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3 border rounded bg-muted/30">
                    <div className="text-xs text-muted-foreground">Requester</div>
                    <div className="text-sm font-medium">{req?.requestedByName || '—'}</div>
                  </div>
                  <div className="p-3 border rounded bg-muted/30">
                    <div className="text-xs text-muted-foreground">Current Location</div>
                    <div className="text-sm font-medium">{file?.currentLocation || '—'}</div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3 border rounded bg-muted/30">
                    <div className="text-xs text-muted-foreground">Owner (Employee)</div>
                    <div className="text-sm font-medium">{owner?.name || '—'}</div>
                  </div>
                  <div className="p-3 border rounded bg-muted/30">
                    <div className="text-xs text-muted-foreground">Current Holder</div>
                    <div className="text-sm font-medium">{file?.assignedUserName ? file.assignedUserName : 'Unassigned (Registry)'}</div>
                  </div>
                </div>
                <div className="p-3 border rounded">
                  <div className="text-xs text-muted-foreground">Reason for Request</div>
                  <div className="text-sm">{req?.remarks || '—'}</div>
                </div>
          
                <div className="p-3 border rounded">
                  <div className="text-xs text-muted-foreground">Documents To Move</div>
                  {file ? (
                    <ul className="list-disc list-inside text-sm text-muted-foreground">
                      {file.defaultDocuments.map((d) => (
                        <li key={d}>{`${file.employeeId}_${d}`}</li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-sm text-muted-foreground">—</div>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium">Destination Location</label>
                  <Input className="mt-1" value={approveModal.toLocation || ''} readOnly />
                </div>
                <div>
                  <label className="text-sm font-medium">Admin Comment (optional)</label>
                  <Textarea className="mt-1" rows={3} value={approveModal.comment} onChange={e => setApproveModal(prev => ({ ...prev, comment: e.target.value }))} />
                </div>
              </div>
            );
          })()}
          <DialogFooter>
            <Button variant="outline" onClick={() => setApproveModal({ open: false, requestId: undefined, toLocation: '', comment: '' })}>Cancel</Button>
            <Button onClick={submitApprove}>Approve</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={rejectModal.open} onOpenChange={(o) => setRejectModal(prev => ({ ...prev, open: o }))}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject File Request</DialogTitle>
            <DialogDescription>Provide an optional reason for rejection.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium">Reason (optional)</label>
              <Input value={rejectModal.reason} onChange={e => setRejectModal(prev => ({ ...prev, reason: e.target.value }))} placeholder="e.g., File not available today" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectModal({ open: false, requestId: undefined, reason: '' })}>Cancel</Button>
            <Button onClick={submitReject}>Reject</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RequestsManagementPage;
