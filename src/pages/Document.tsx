import { useSystemCatalog } from '@/contexts/SystemCatalogContext';
import { getWorkStation } from '@/lib/utils';
import React, { useMemo, useState } from 'react';
import { useFileTracking } from '@/contexts/FileTrackingContext';
import { useEmployees } from '@/contexts/EmployeesContext';
import { useAuth } from '@/contexts/AuthContext';
import { mapRole } from '@/lib/roles';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const DocumentTrackingPage: React.FC = () => {
  const { user } = useAuth();
  const { files, getFileByEmployeeId, moveFile, requestFile, listAllRequests, rejectRequest, approveRequest } = useFileTracking();
  const { employees } = useEmployees();
  const { stations, stationNames, departmentNames } = useSystemCatalog();
  const [employeeFilter, setEmployeeFilter] = useState('');
  const [moveModal, setMoveModal] = useState<{ open: boolean; employeeId?: string; toLocation: string; assigneeId: string; assigneeName: string; remarks: string }>({ open: false, toLocation: '', assigneeId: '', assigneeName: '', remarks: '' });
  const [assigneeQuery, setAssigneeQuery] = useState('');
  const [requestModal, setRequestModal] = useState<{ open: boolean; employeeId?: string; remarks: string }>({ open: false, remarks: '' });
  const [approveModal, setApproveModal] = useState<{ open: boolean; requestId?: string; employeeId?: string; toLocation: string; comment?: string }>({ open: false, toLocation: '' });
  

  const filteredEmployees = useMemo(() => {
    const q = employeeFilter.trim().toLowerCase();
    if (!q) return employees;
    return employees.filter(e =>
      e.id.toLowerCase().includes(q) ||
      e.name.toLowerCase().includes(q) ||
      ((e as any).employeeNumber || '').toString().toLowerCase().includes(q)
    );
  }, [employeeFilter, employees]);

  const openMove = (employeeId: string) => {
    setMoveModal({ open: true, employeeId, toLocation: '', assigneeId: '', assigneeName: '', remarks: '' });
  };

  const submitMove = () => {
    if (!moveModal.employeeId) return;
    if (!moveModal.toLocation) { alert('Enter destination location'); return; }
    moveFile(moveModal.employeeId, {
      toLocation: moveModal.toLocation,
      toAssigneeUserId: moveModal.assigneeId || undefined,
      toAssigneeName: moveModal.assigneeName || undefined,
      remarks: moveModal.remarks || undefined,
    });
    setMoveModal({ open: false, employeeId: undefined, toLocation: '', assigneeId: '', assigneeName: '', remarks: '' });
  };

  const submitRequest = () => {
    if (!requestModal.employeeId) return;
    requestFile(requestModal.employeeId, requestModal.remarks || undefined);
    setRequestModal({ open: false, employeeId: undefined, remarks: '' });
  };

  

  const managerStations = useMemo(() => {
    const set = new Set<string>();
    employees.forEach(e => {
      const isManager = /manager/i.test(e.position || '');
      const s = e.stationName;
      if (isManager && s) set.add(s);
    });
    return Array.from(set);
  }, [employees]);
  // Prefer managerStations, else use station names (departments), else fallback
  const LOCATIONS = managerStations.length > 0 ? managerStations : (stationNames.length > 0 ? stationNames : ['Registry Office']);

  const assigneeOptions = useMemo(() => {
    const base = employees.filter(e => /manager/i.test(e.position || '') || /hr/i.test(e.department || '') || /hr/i.test(e.position || ''));
    const q = assigneeQuery.trim().toLowerCase();
    if (!q) return base;
    return base.filter(e => (e.name || '').toLowerCase().includes(q) || (e.email || '').toLowerCase().includes(q) || (e.id || '').toLowerCase().includes(q));
  }, [employees, assigneeQuery]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Employee File Tracking</h1>
          <p className="text-muted-foreground">Track physical employee files, their current location and movement history.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Find Employee to see file location</CardTitle>
            </CardHeader>
            <CardContent>
              <Input placeholder="Search by Employee ID, Name, or Employee No" value={employeeFilter} onChange={e => setEmployeeFilter(e.target.value)} />
              <div className="mt-4 space-y-2 max-h-[400px] overflow-auto">
                {filteredEmployees.map(emp => (
                  <div key={emp.id} className="p-2 border rounded hover:bg-muted cursor-pointer" onClick={() => setEmployeeFilter(emp.id)}>
                    <div className="font-medium">{emp.name}</div>
                    <div className="text-xs text-muted-foreground">ID: {emp.id} • Employee No: {emp.employeeNumber || '\u2014'} • {getWorkStation(emp)}</div>
                  </div>
                ))}
                {filteredEmployees.length === 0 && (
                  <div className="text-sm text-muted-foreground">No matching employees</div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2">
          {employeeFilter ? (
            (() => {
              const file = getFileByEmployeeId(employeeFilter);
                return (
                <Tabs defaultValue="file">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="file">Employee File</TabsTrigger>
                  </TabsList>
                  <TabsContent value="file">
                    <Card>
                      <CardHeader>
                      <CardTitle>
                            Employee File:{' '}
                            {(() => {
                              const emp = employees.find(e => e.id === employeeFilter);
                              return (emp as any)?.employeeNumber || employeeFilter;
                            })()}
                          </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {!file ? (
                          <div className="text-sm text-muted-foreground">No file found.</div>
                        ) : (
                          <div className="space-y-3">
                            <div className="p-3 border rounded flex items-center justify-between">
                              <div>
                                <div className="font-medium">Current Location: {file.currentLocation}</div>
                                <div className="text-xs text-muted-foreground">{file.assignedUserName ? `Holder: ${file.assignedUserName}` : 'Unassigned (Registry)'}</div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline">Employee File</Badge>
                                {user && mapRole(user.role) === 'admin' && (
                                  <Button size="sm" variant="outline" onClick={() => openMove(file.employeeId)}>Move</Button>
                                )}
                                {user && (mapRole(user.role) === 'hr' || mapRole(user.role) === 'manager') && (
                                  <Button size="sm" variant="outline" onClick={() => setRequestModal({ open: true, employeeId: file.employeeId, remarks: '' })}>Request File</Button>
                                )}
                              </div>
                            </div>
                            <div className="p-3 border rounded">
                              <div className="text-sm font-medium mb-1">Default Documents</div>
                              <ul className="list-disc list-inside text-sm text-muted-foreground">
                                {file.defaultDocuments.map((d) => {
                                  const emp = employees.find(e => e.id === file.employeeId);
                                  const empNo = (emp as any)?.employeeNumber || file.employeeId;
                                  return (
                                    <li key={d}>{`${empNo}_${d}`}</li>
                                  );
                                })}
                              </ul>
                            </div>
                            <div className="p-3 border rounded">
                              <div className="text-sm font-medium mb-1">Movement History</div>
                              <ul className="text-xs text-muted-foreground space-y-1">
                                {file.movementHistory.slice().reverse().map((m, idx) => (
                                  <li key={idx}>
                                    {m.timestamp.slice(0,19).replace('T',' ')}: {m.byUserName} moved from {m.fromLocation} to {m.toLocation}
                                    {m.toAssigneeName ? ` • New Holder: ${m.toAssigneeName}` : ''}
                                    {m.remarks ? ` • Remarks: ${m.remarks}` : ''}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                  <TabsContent value="requests">
                    <Card>
                      <CardHeader>
                        <CardTitle>{mapRole(user?.role) === 'admin' ? 'Pending Requests (Admin)' : 'All Requests'}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {(user?.role === 'admin' ? listAllRequests().filter(r => r.status === 'pending') : listAllRequests()).map(r => (
                            <div key={r.id} className="text-sm p-2 border rounded flex items-center justify-between">
                              <div>
                                <div className="font-medium">Employee File: {r.employeeId}</div>
                                <div className="text-xs text-muted-foreground">Requested by {r.requestedByName} • {r.createdAt.slice(0,19).replace('T',' ')}</div>
                                {(() => {
                                  const emp = employees.find(e => e.id === r.employeeId);
                                  const empNo = (emp as any)?.employeeNumber || r.employeeId;
                                  const file = getFileByEmployeeId(r.employeeId);
                                  const docs = (file?.defaultDocuments || []).map(d => `${empNo}_${d}`);
                                  return (
                                    <div className="text-xs text-muted-foreground mt-1">Documents: {docs.length ? docs.join(', ') : `${empNo}_Employee_File`}</div>
                                  );
                                })()}
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge className={`status-${r.status}`}>{r.status}</Badge>
                                {mapRole(user?.role) === 'admin' && r.status === 'pending' && (
                                  <>
                                    <Button size="sm" variant="outline" onClick={() => setApproveModal({ open: true, requestId: r.id, employeeId: r.employeeId, toLocation: LOCATIONS[0] || 'Registry Office' })}>Approve</Button>
                                    <Button size="sm" variant="outline" onClick={() => rejectRequest(r.id, 'Not available')}>Reject</Button>
                                  </>
                                )}
                              </div>
                            </div>
                          ))}
                          {(user?.role === 'admin' ? listAllRequests().filter(r => r.status === 'pending') : listAllRequests()).length === 0 && (
                            <div className="text-sm text-muted-foreground">No requests.</div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              );
            })()
          ) : (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                Select or search an employee to view files.
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Move Dialog */}
      <Dialog open={moveModal.open} onOpenChange={(o) => setMoveModal(prev => ({ ...prev, open: o }))}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Move File</DialogTitle>
            <DialogDescription>Update the file location and optional assignee.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">

            <div>
              <label className="text-sm font-medium">Assign To (Employee)</label>
              <div className="mt-1">
                <Select value={moveModal.assigneeId} onValueChange={(v) => {
                  if (v === 'none') return setMoveModal(prev => ({ ...prev, assigneeId: '', assigneeName: '', toLocation: 'Registry Office' }));
                  const emp = employees.find(e => e.id === v);
                  const dest = emp?.stationName || moveModal.toLocation || '';
                  setMoveModal(prev => ({ ...prev, assigneeId: v, assigneeName: emp?.name || '', toLocation: dest }));
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select assignee (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem key={'none'} value={'none'}>— Unassigned —</SelectItem>
                    <div className="px-2 py-1">
                      <Input placeholder="Search assignee..." value={assigneeQuery} onChange={(e) => setAssigneeQuery(e.target.value)} />
                    </div>
                    {assigneeOptions.map(emp => (
                      <SelectItem key={emp.id} value={emp.id}>{emp.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Destination Location</label>
              <Input className="mt-1" value={moveModal.toLocation || ''} readOnly />
              <p className="text-xs text-muted-foreground mt-1">Auto-filled from selected assignee's station.</p>
            </div>
            <div>
              <label className="text-sm font-medium">Remarks (optional)</label>
              <Textarea className="mt-1" rows={3} value={moveModal.remarks} onChange={e => setMoveModal(prev => ({ ...prev, remarks: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMoveModal({ open: false, employeeId: undefined, toLocation: '', assigneeId: '', assigneeName: '', remarks: '' })}>Cancel</Button>
            <Button onClick={submitMove}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Request Dialog */}
      <Dialog open={requestModal.open} onOpenChange={(o) => setRequestModal(prev => ({ ...prev, open: o }))}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Employee File</DialogTitle>
            <DialogDescription>Submit a request to move the entire file.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium">Remarks (optional)</label>
              <Textarea className="mt-1" rows={3} value={requestModal.remarks} onChange={e => setRequestModal(prev => ({ ...prev, remarks: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRequestModal({ open: false, employeeId: undefined, remarks: '' })}>Cancel</Button>
            <Button onClick={submitRequest}>Submit Request</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Approve Dialog (Admin) */}
      <Dialog open={approveModal.open} onOpenChange={(o) => setApproveModal(prev => ({ ...prev, open: o }))}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve File Movement</DialogTitle>
            <DialogDescription>Confirm destination and documents to move.</DialogDescription>
          </DialogHeader>
          {approveModal.employeeId && (
            <div className="space-y-4">
              {(() => {
                const emp = employees.find(e => e.id === approveModal.employeeId);
                const empNo = (emp as any)?.employeeNumber || approveModal.employeeId;
                const file = getFileByEmployeeId(approveModal.employeeId);
                const docs = (file?.defaultDocuments || []).map(d => `${empNo}_${d}`);
                return (
                  <div className="text-sm">
                    <div className="font-medium mb-1">Employee: {emp?.name || approveModal.employeeId}</div>
                    <div className="text-muted-foreground">Documents:</div>
                    <ul className="list-disc list-inside text-muted-foreground">
                      {docs.length > 0 ? docs.map(d => (<li key={d}>{d}</li>)) : (<li>{empNo}_Employee_File</li>)}
                    </ul>
                  </div>
                );
              })()}
              <div>
                <label className="text-sm font-medium">Destination Location</label>
                <Select value={approveModal.toLocation} onValueChange={(v) => setApproveModal(prev => ({ ...prev, toLocation: v }))}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    {LOCATIONS.map(loc => (
                      <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Comment (optional)</label>
                <Textarea className="mt-1" rows={3} value={approveModal.comment || ''} onChange={e => setApproveModal(prev => ({ ...prev, comment: e.target.value }))} />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setApproveModal({ open: false, requestId: undefined, employeeId: undefined, toLocation: '', comment: '' })}>Cancel</Button>
            <Button
              onClick={() => {
                if (!approveModal.requestId || !approveModal.toLocation) return;
                approveRequest(approveModal.requestId, { toLocation: approveModal.toLocation, comment: approveModal.comment });
                setApproveModal({ open: false, requestId: undefined, employeeId: undefined, toLocation: '', comment: '' });
              }}
            >
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
};

export default DocumentTrackingPage;
