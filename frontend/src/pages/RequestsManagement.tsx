import React, { useMemo, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useEmployees } from '@/contexts/EmployeesContext';
import { useSystemCatalog } from '@/contexts/SystemCatalogContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import {
  useApproveFileRequestMutation,
  useGetAllFileRequestsQuery,
  useRejectFileRequestMutation
} from '@/features/fileRequest/fileRequestApi';

const RequestsManagementPage: React.FC = () => {
  const { user } = useAuth();
  const { employees } = useEmployees();
  const { stationNames } = useSystemCatalog();

  const { data: allRequests = [], refetch } = useGetAllFileRequestsQuery();
  const [approveFileRequest, { isLoading: approving }] = useApproveFileRequestMutation();
  const [rejectFileRequest, { isLoading: rejecting }] = useRejectFileRequestMutation();

  const [search, setSearch] = useState('');
  const [approveModal, setApproveModal] = useState<{ open: boolean; request?: any; remarks: string }>({
    open: false,
    remarks: ''
  });
  const [rejectModal, setRejectModal] = useState<{ open: boolean; requestId?: string; remarks: string }>({
    open: false,
    remarks: ''
  });

  if (!user || (user.role !== 'registry_manager' && user.role !== 'registry_staff')) {
    return <div className="text-sm text-muted-foreground p-6">You do not have permission to access this page.</div>;
  }

  const pending = useMemo(
    () => allRequests.filter((r) => r.status?.toLowerCase() === 'pending'),
    [allRequests]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return pending;
    return pending.filter((r) => {
      const emp = employees.find((e) => e.id === r.employee_id);
      const empNo = (emp as any)?.employeeNumber || '';
      const remarks = (r.remarks || '').toString();
      const requester = (r.requested_by_name || '').toLowerCase();
      const docs = (r.documents || []).map((d: any) => d.name.toLowerCase()).join(' ');
      return (
        (r.employee_id || '').toLowerCase().includes(q) ||
        empNo.toLowerCase().includes(q) ||
        requester.includes(q) ||
        remarks.toLowerCase().includes(q) ||
        docs.includes(q)
      );
    });
  }, [pending, search, employees]);

  const submitApprove = async () => {
    if (!approveModal.request?.id) return;
    try {
      await approveFileRequest({
        requestId: approveModal.request.id,
        to_location: approveModal.request.requested_by_department,
        remarks: approveModal.remarks || undefined
      }).unwrap();
      setApproveModal({ open: false, request: undefined, remarks: '' });
      refetch();
    } catch (err) {
      console.error('Error approving file request:', err);
    }
  };

  const submitReject = async () => {
    if (!rejectModal.requestId) return;
    try {
      await rejectFileRequest({
        requestId: rejectModal.requestId,
        remarks: rejectModal.remarks || undefined
      }).unwrap();
      setRejectModal({ open: false, requestId: undefined, remarks: '' });
      refetch();
    } catch (err) {
      console.error('Error rejecting file request:', err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">File Requests Management</h1>
          <p className="text-muted-foreground">
            Pending employee file requests. Approve and route files to destinations.
          </p>
        </div>
        <div className="w-64">
          <Input
            placeholder="Search by Employee ID or Requester"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
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
              {filtered.map((r) => {
                const emp = employees.find((e) => e.id === r.employee_id);
                const empNo = (emp as any)?.employeeNumber || r.employee_id;
                return (
                  <div key={r.id} className="p-3 border rounded flex items-center justify-between">
                    <div>
                      <div className="font-medium">Employee File: {empNo}</div>
                      <div className="text-xs text-muted-foreground">
                        Requested by {r.requested_by_name} • {r.created_at?.slice(0, 19).replace('T', ' ')}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        <span className="font-medium">Docs:</span>{' '}
                        {r.documents?.map((d: any) => d.name).join(', ') || '—'}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        <span className="font-medium">Remarks:</span> {r.remarks || '—'}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={`status-${r.status}`}>{r.status}</Badge>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          setApproveModal({
                            open: true,
                            request: r,
                            remarks: ''
                          })
                        }
                      >
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          setRejectModal({ open: true, requestId: r.id, remarks: '' })
                        }
                      >
                        Reject
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ✅ Approve Dialog */}
      <Dialog open={approveModal.open} onOpenChange={(o) => setApproveModal((prev) => ({ ...prev, open: o }))}>
        <DialogContent className="max-w-lg rounded-2xl">
          <DialogHeader>
            <DialogTitle>Approve File Request</DialogTitle>
            <DialogDescription>Select destination location for this file.</DialogDescription>
          </DialogHeader>

          {approveModal.request && (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 border rounded-md bg-muted/30">
                  <p className="text-xs text-muted-foreground">Requester</p>
                  <p className="font-medium">{approveModal.request.requested_by_name}</p>
                </div>
                <div className="p-3 border rounded-md bg-muted/30">
                  <p className="text-xs text-muted-foreground">Current Location</p>
                  <p className="font-medium">{approveModal.request.current_location || 'Registry Office'}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 border rounded-md bg-muted/30">
                  <p className="text-xs text-muted-foreground">Owner (Employee)</p>
                  <p className="font-medium">{approveModal.request.employee_name}</p>
                </div>
                <div className="p-3 border rounded-md bg-muted/30">
                  <p className="text-xs text-muted-foreground">Current Holder</p>
                  <p className="font-medium">{approveModal.request.assigned_user_name || 'Unassigned (Registry)'}</p>
                </div>
              </div>

              <div className="p-3 border rounded-md bg-muted/30">
                <p className="text-xs text-muted-foreground mb-1">Reason for Request</p>
                <p className="text-sm text-muted-foreground">{approveModal.request.remarks || '—'}</p>
              </div>

              <div className="p-3 border rounded-md">
                <p className="text-xs text-muted-foreground mb-2">Documents To Move</p>
                {approveModal.request.documents?.length > 0 ? (
                  <div className="max-h-20 overflow-y-auto border rounded-md p-2 bg-muted/10">
                    <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                      {approveModal.request.documents.map((doc: any, idx: number) => (
                        <li key={idx}>{doc.name}</li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No documents listed.</p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium">Registry Remarks (optional)</label>
                <Textarea
                  className="mt-1"
                  rows={3}
                  value={approveModal.remarks}
                  onChange={(e) => setApproveModal((prev) => ({ ...prev, remarks: e.target.value }))}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setApproveModal({ open: false, request: undefined, remarks: '' })}
            >
              Cancel
            </Button>
            <Button onClick={submitApprove} disabled={approving}>
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ✅ Reject Dialog */}
      <Dialog open={rejectModal.open} onOpenChange={(o) => setRejectModal((prev) => ({ ...prev, open: o }))}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject File Request</DialogTitle>
            <DialogDescription>Provide an optional reason for rejection.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium">Remarks (optional)</label>
              <Input
                value={rejectModal.remarks}
                onChange={(e) => setRejectModal((prev) => ({ ...prev, remarks: e.target.value }))}
                placeholder="e.g., File not available today"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRejectModal({ open: false, requestId: undefined, remarks: '' })}
            >
              Cancel
            </Button>
            <Button onClick={submitReject} disabled={rejecting}>
              Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RequestsManagementPage;
