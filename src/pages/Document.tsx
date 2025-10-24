// import { useSystemCatalog } from '@/contexts/SystemCatalogContext';
// import { getWorkStation } from '@/lib/utils';
// import React, { useMemo, useState } from 'react';
// import { useForm } from "react-hook-form";
// import { yupResolver } from "@hookform/resolvers/yup";
// import * as yup from "yup";
// import { useFileTracking } from '@/contexts/FileTrackingContext';
// import {
//   useGetFileByEmployeeQuery,
//   useGetFileMovementsQuery,
//   useRequestFileMutation,
//   useGetAllFileRequestsQuery,
//   useApproveFileRequestMutation,
//   useRejectFileRequestMutation,
// } from '@/features/employeeFile/employeeFileApi';
// import { useEmployees } from '@/contexts/EmployeesContext';
// import { useAuth } from '@/contexts/AuthContext';
// import { mapRole } from '@/lib/roles';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Badge } from '@/components/ui/badge';
// import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// import { Textarea } from '@/components/ui/textarea';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import { toast } from 'sonner';
// const requestSchema = yup.object({
//   remarks: yup.string().required("Remarks are required"),
// });

// const approveSchema = yup.object({
//   toLocation: yup.string().required("New location is required"),
//   comment: yup.string().required("Remarks are required"),
// });

// const DocumentTrackingPage: React.FC = () => {
//   const { user } = useAuth();
//   const [employeeFilter, setEmployeeFilter] = useState('');
//   const { files, getFileByEmployeeId, moveFile } = useFileTracking();
//   const [requestFile, { isLoading: requesting }] = useRequestFileMutation();
//   const [approveFileRequest] = useApproveFileRequestMutation();
//   const [rejectFileRequest] = useRejectFileRequestMutation();
//   const { data: allRequests = [] } = useGetAllFileRequestsQuery();


//   // Data fetch hooks (call at top level; skip when no employeeFilter)
//   const { data: employeeFile } = useGetFileByEmployeeQuery(String(employeeFilter || ''), { skip: !employeeFilter });
//   const { data: apiMovements = [] } = useGetFileMovementsQuery(String(employeeFilter || ''), { skip: !employeeFilter });
//   const { employees } = useEmployees();
//   const { stations, stationNames, departmentNames } = useSystemCatalog();
//   const [moveModal, setMoveModal] = useState<{ open: boolean; employeeId?: string; toLocation: string; assigneeId: string; assigneeName: string; remarks: string }>({ open: false, toLocation: '', assigneeId: '', assigneeName: '', remarks: '' });
//   const [assigneeQuery, setAssigneeQuery] = useState('');
//   const [requestModal, setRequestModal] = useState<{ open: boolean; employeeId?: string; remarks: string }>({ open: false, remarks: '' });
//   const [approveModal, setApproveModal] = useState<{ open: boolean; requestId?: string; employeeId?: string; toLocation: string; comment?: string }>({ open: false, toLocation: '' });
  
//     const {
//     register: registerRequest,
//     handleSubmit: handleSubmitRequest,
//     reset: resetRequest,
//     formState: { errors: errorsRequest },
//   } = useForm({ resolver: yupResolver(requestSchema) });

//   const {
//     register: registerApprove,
//     handleSubmit: handleSubmitApprove,
//     reset: resetApprove,
//     formState: { errors: errorsApprove },
//   } = useForm({ resolver: yupResolver(approveSchema) });

//   const filteredEmployees = useMemo(() => {
//     const q = employeeFilter.trim().toLowerCase();
//     if (!q) return employees;
//     return employees.filter(e =>
//       e.id.toLowerCase().includes(q) ||
//       e.name.toLowerCase().includes(q) ||
//       ((e as any).employeeNumber || '').toString().toLowerCase().includes(q)
//     );
//   }, [employeeFilter, employees]);

//   const openMove = (employeeId: string) => {
//     setMoveModal({ open: true, employeeId, toLocation: '', assigneeId: '', assigneeName: '', remarks: '' });
//   };

//   const submitMove = () => {
//     if (!moveModal.employeeId) return;
//     if (!moveModal.toLocation) { alert('Enter destination location'); return; }
//     // Local move for admin until we have a dedicated server endpoint for arbitrary moves
//     moveFile(moveModal.employeeId, {
//       toLocation: moveModal.toLocation,
//       toAssigneeUserId: moveModal.assigneeId || undefined,
//       toAssigneeName: moveModal.assigneeName || undefined,
//       remarks: moveModal.remarks || undefined,
//     });
//     setMoveModal({ open: false, employeeId: undefined, toLocation: '', assigneeId: '', assigneeName: '', remarks: '' });
//   };

//   // const submitRequest = async () => {
//   //   if (!requestModal.employeeId) return;
//   //   try {
//   //     await requestFile({ employee_id: requestModal.employeeId, file_id: .employeeId, document_type: 'Employee_File', requested_by_user_id: user?.id || '', requested_by_name: user?.name || '', requested_by_department: user?.department || '', remarks: requestModal.remarks || '' }).unwrap();
//   //     setRequestModal({ open: false, employeeId: undefined, remarks: '' });
//   //   } catch (err) {
//   //     // keep local behavior if API fails
//   //     setRequestModal({ open: false, employeeId: undefined, remarks: '' });
//   //   }
//   // };

//     const submitRequest = async (data: any) => {
//       console.log("requestModal>>>>>>>>>>>",requestModal);
      
//           if (!requestModal.employeeId) return;
//     try {
//       await requestFile({
//         employee_id: requestModal.employeeId,
//         file_id: requestModal.employeeId,
//         document_type: "Employee_File",
//         requested_by_user_id: user?.id || '',
//         requested_by_name: user?.name || '',
//         requested_by_department: user?.department || '',
//         remarks: data.remarks,
//       }).unwrap();
//       setRequestModal({ open: false, employeeId: undefined, remarks: '' });

//       toast.success("File request submitted");
//       // resetRequest();
//       // refetchRequests();
//     } catch (err: any) {
//       toast.error("Failed to request file");
//       setRequestModal({ open: false, employeeId: undefined, remarks: '' });
//     }
//   };
  

//   const managerStations = useMemo(() => {
//     const set = new Set<string>();
//     employees.forEach(e => {
//       const isManager = /manager/i.test(e.position || '');
//       const s = e.stationName;
//       if (isManager && s) set.add(s);
//     });
//     return Array.from(set);
//   }, [employees]);
//   // Prefer managerStations, else use station names (departments), else fallback
//   const LOCATIONS = managerStations.length > 0 ? managerStations : (stationNames.length > 0 ? stationNames : ['Registry Office']);

//   const assigneeOptions = useMemo(() => {
//     const base = employees.filter(e => /manager/i.test(e.position || '') || /hr/i.test(e.department || '') || /hr/i.test(e.position || ''));
//     const q = assigneeQuery.trim().toLowerCase();
//     if (!q) return base;
//     return base.filter(e => (e.name || '').toLowerCase().includes(q) || (e.email || '').toLowerCase().includes(q) || (e.id || '').toLowerCase().includes(q));
//   }, [employees, assigneeQuery]);

//   return (
//     <div className="space-y-6">
//       <div className="flex items-center justify-between">
//         <div>
//           <h1 className="text-3xl font-bold">Employee File Tracking</h1>
//           <p className="text-muted-foreground">Track physical employee files, their current location and movement history.</p>
//         </div>
//       </div>

//       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//         <div className="md:col-span-1">
//           <Card>
//             <CardHeader>
//               <CardTitle>Find Employee to see file location</CardTitle>
//             </CardHeader>
//             <CardContent>
//               <Input placeholder="Search by Employee ID, Name, or Employee No" value={employeeFilter} onChange={e => setEmployeeFilter(e.target.value)} />
//               <div className="mt-4 space-y-2 max-h-[400px] overflow-auto">
//                 {filteredEmployees.map(emp => (
//                   <div key={emp.id} className="p-2 border rounded hover:bg-muted cursor-pointer" onClick={() => setEmployeeFilter(emp.id)}>
//                     <div className="font-medium">{emp.name}</div>
//                     <div className="text-xs text-muted-foreground">ID: {emp.id} • Employee No: {emp.employeeNumber || '\u2014'} • {getWorkStation(emp)}</div>
//                   </div>
//                 ))}
//                 {filteredEmployees.length === 0 && (
//                   <div className="text-sm text-muted-foreground">No matching employees</div>
//                 )}
//               </div>
//             </CardContent>
//           </Card>
//         </div>

//         <div className="md:col-span-2">
//       {employeeFilter ? (
//     (() => {
//           const file = employeeFile ?? getFileByEmployeeId(employeeFilter);
//           const movements = (apiMovements && apiMovements.length > 0) ? apiMovements : (file?.movementHistory || []);
//         return (
//                 <Tabs defaultValue="file">
//                   <TabsList className="grid w-full grid-cols-2">
//                     <TabsTrigger value="file">Employee File</TabsTrigger>
//                   </TabsList>
//                   <TabsContent value="file">
//                     <Card>
//                       <CardHeader>
//                       <CardTitle>
//                             Employee File:{' '}
//                             {(() => {
//                               const emp = employees.find(e => e.id === employeeFilter);
//                               return (emp as any)?.employeeNumber || employeeFilter;
//                             })()}
//                           </CardTitle>
//                       </CardHeader>
//                       <CardContent>
//                         {!file ? (
//                           <div className="text-sm text-muted-foreground">No file found.</div>
//                         ) : (
//                           <div className="space-y-3">
//                             <div className="p-3 border rounded flex items-center justify-between">
//                               <div>
//                                 <div className="font-medium">Current Location: {file.currentLocation}</div>
//                                 <div className="text-xs text-muted-foreground">{file.assignedUserName ? `Holder: ${file.assignedUserName}` : 'Unassigned (Registry)'}</div>
//                               </div>
//                               <div className="flex items-center gap-2">
//                                 <Badge variant="outline">Employee File</Badge>
//                                 {user && mapRole(user.role) === 'admin' && (
//                                   <Button size="sm" variant="outline" onClick={() => openMove(file.employee_id)}>Move</Button>
//                                 )}
//                                 {user && (mapRole(user.role) === 'hr' || mapRole(user.role) === 'manager' || (user.role || '').toLowerCase() === 'registry_manager') && (
//                                   <Button size="sm" variant="outline" onClick={() => setRequestModal({ open: true, employeeId: file.employee_id, remarks: '' })}>Request File</Button>
//                                 )}
//                               </div>
//                             </div>
//                             <div className="p-3 border rounded">
//                               <div className="text-sm font-medium mb-1">Default Documents</div>
//                               <ul className="list-disc list-inside text-sm text-muted-foreground">
//                                 {(file.default_documents || []).map((d) => {
//                                   const emp = employees.find(e => e.id === file.employee_id);
//                                   const empNo = (emp as any)?.employeeNumber || file.employee_id;
//                                   return (
//                                     <li key={d}>{`${empNo}_${d}`}</li>
//                                   );
//                                 })}
//                               </ul>
//                             </div>
//                             <div className="p-3 border rounded">
//                               <div className="text-sm font-medium mb-1">Movement History</div>
//                               <ul className="text-xs text-muted-foreground space-y-1">
//                                 {(movements || []).slice().reverse().map((m, idx) => (
//                                   <li key={idx}>
//                                     {new Date(m.timestamp || '').toLocaleString()}: {m.by_user_name} moved from {m.from_location} to {m.to_location}
//                                     {m.to_assignee_name ? ` • New Holder: ${m.to_assignee_name}` : ''}
//                                     {m.remarks ? ` • Remarks: ${m.remarks}` : ''}
//                                   </li>
//                                 ))}
//                               </ul>
//                             </div>
//                           </div>
//                         )}
//                       </CardContent>
//                     </Card>
//                   </TabsContent>
//                   <TabsContent value="requests">
//                     <Card>
//                       <CardHeader>
//                         <CardTitle>{mapRole(user?.role) === 'admin' ? 'Pending Requests (Admin)' : 'All Requests'}</CardTitle>
//                       </CardHeader>
//                       <CardContent>
//                         <div className="space-y-2">
//                           {(user?.role === 'admin' ? allRequests.filter(r => r.status === 'pending') : allRequests).map(r => (
//                             <div key={r.id} className="text-sm p-2 border rounded flex items-center justify-between">
//                               <div>
//                                 <div className="font-medium">Employee File: {r.employeeId}</div>
//                                 <div className="text-xs text-muted-foreground">Requested by {r.requestedByName} • {r.createdAt.slice(0,19).replace('T',' ')}</div>
//                                 {(() => {
//                                   const emp = employees.find(e => e.id === r.employeeId);
//                                   const empNo = (emp as any)?.employeeNumber || r.employeeId;
//                                   const file = getFileByEmployeeId(r.employeeId);
//                                   const docs = (file?.defaultDocuments || []).map(d => `${empNo}_${d}`);
//                                   return (
//                                     <div className="text-xs text-muted-foreground mt-1">Documents: {docs.length ? docs.join(', ') : `${empNo}_Employee_File`}</div>
//                                   );
//                                 })()}
//                               </div>
//                               <div className="flex items-center gap-2">
//                                 <Badge className={`status-${r.status}`}>{r.status}</Badge>
//                                 {mapRole(user?.role) === 'admin' && r.status === 'pending' && (
//                                   <>
//                                     <Button size="sm" variant="outline" onClick={() => setApproveModal({ open: true, requestId: r.id, employeeId: r.employee_id, toLocation: LOCATIONS[0] || 'Registry Office' })}>Approve</Button>
//                                     <Button size="sm" variant="outline" onClick={() => rejectFileRequest({ requestId: r.id, remarks: 'Not available' })}>Reject</Button>
//                                   </>
//                                 )}
//                               </div>
//                             </div>
//                           ))}
//                           {(user?.role === 'admin' ? allRequests.filter(r => r.status === 'pending') : allRequests).length === 0 && (
//                             <div className="text-sm text-muted-foreground">No requests.</div>
//                           )}
//                         </div>
//                       </CardContent>
//                     </Card>
//                   </TabsContent>
//                 </Tabs>
//               );
//             })()
//           ) : (
//             <Card>
//               <CardContent className="p-8 text-center text-muted-foreground">
//                 Select or search an employee to view files.
//               </CardContent>
//             </Card>
//           )}
//         </div>
//       </div>

//       {/* Move Dialog */}
//       <Dialog open={moveModal.open} onOpenChange={(o) => setMoveModal(prev => ({ ...prev, open: o }))}>
//         <DialogContent>
//           <DialogHeader>
//             <DialogTitle>Move File</DialogTitle>
//             <DialogDescription>Update the file location and optional assignee.</DialogDescription>
//           </DialogHeader>
//           <div className="space-y-3">

//             <div>
//               <label className="text-sm font-medium">Assign To (Employee)</label>
//               <div className="mt-1">
//                 <Select value={moveModal.assigneeId} onValueChange={(v) => {
//                   if (v === 'none') return setMoveModal(prev => ({ ...prev, assigneeId: '', assigneeName: '', toLocation: 'Registry Office' }));
//                   const emp = employees.find(e => e.id === v);
//                   const dest = emp?.stationName || moveModal.toLocation || '';
//                   setMoveModal(prev => ({ ...prev, assigneeId: v, assigneeName: emp?.name || '', toLocation: dest }));
//                 }}>
//                   <SelectTrigger>
//                     <SelectValue placeholder="Select assignee (optional)" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem key={'none'} value={'none'}>— Unassigned —</SelectItem>
//                     <div className="px-2 py-1">
//                       <Input placeholder="Search assignee..." value={assigneeQuery} onChange={(e) => setAssigneeQuery(e.target.value)} />
//                     </div>
//                     {assigneeOptions.map(emp => (
//                       <SelectItem key={emp.id} value={emp.id}>{emp.name}</SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>
//               </div>
//             </div>
//             <div>
//               <label className="text-sm font-medium">Destination Location</label>
//               <Input className="mt-1" value={moveModal.toLocation || ''} readOnly />
//               <p className="text-xs text-muted-foreground mt-1">Auto-filled from selected assignee's station.</p>
//             </div>
//             <div>
//               <label className="text-sm font-medium">Remarks (optional)</label>
//               <Textarea className="mt-1" rows={3} value={moveModal.remarks} onChange={e => setMoveModal(prev => ({ ...prev, remarks: e.target.value }))} />
//             </div>
//           </div>
//           <DialogFooter>
//             <Button variant="outline" onClick={() => setMoveModal({ open: false, employeeId: undefined, toLocation: '', assigneeId: '', assigneeName: '', remarks: '' })}>Cancel</Button>
//             <Button onClick={submitMove}>Save</Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>

//       {/* Request Dialog */}
//        <form onSubmit={handleSubmitRequest(submitRequest)} className="space-y-4">
//       <Dialog open={requestModal.open} onOpenChange={(o) => setRequestModal(prev => ({ ...prev, open: o }))}>
//         <DialogContent>
//           <DialogHeader>
//             <DialogTitle>Request Employee File</DialogTitle>
//             <DialogDescription>Submit a request to move the entire file.</DialogDescription>
//           </DialogHeader>
//           <div className="space-y-3">
//             <div>
//               <label className="text-sm font-medium">Remarks (optional)</label>
//               <Textarea className="mt-1" rows={3} {...registerRequest("remarks")}/>
//                {errorsRequest.remarks && <p className="text-red-500 text-sm">{errorsRequest.remarks.message}</p>}
//             </div>
//           </div>
//           <DialogFooter>
//             <Button variant="outline" onClick={() => setRequestModal({ open: false, employeeId: undefined, remarks: '' })}>Cancel</Button>
//             <Button type="submit" disabled={requesting} className="w-full">
//                      {requesting ? "Submitting..." : "Submit Request"}
//             </Button>
//             {/* <Button onClick={submitRequest}>Submit Request</Button> */}
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>
//       </form>
//       {/* Approve Dialog (Admin) */}
//       <Dialog open={approveModal.open} onOpenChange={(o) => setApproveModal(prev => ({ ...prev, open: o }))}>
//         <DialogContent>
//           <DialogHeader>
//             <DialogTitle>Approve File Movement</DialogTitle>
//             <DialogDescription>Confirm destination and documents to move.</DialogDescription>
//           </DialogHeader>
//           {approveModal.employeeId && (
//             <div className="space-y-4">
//               {(() => {
//                 const emp = employees.find(e => e.id === approveModal.employeeId);
//                 const empNo = (emp as any)?.employeeNumber || approveModal.employeeId;
//                 const file = getFileByEmployeeId(approveModal.employeeId);
//                 const docs = (file?.defaultDocuments || []).map(d => `${empNo}_${d}`);
//                 return (
//                   <div className="text-sm">
//                     <div className="font-medium mb-1">Employee: {emp?.name || approveModal.employeeId}</div>
//                     <div className="text-muted-foreground">Documents:</div>
//                     <ul className="list-disc list-inside text-muted-foreground">
//                       {docs.length > 0 ? docs.map(d => (<li key={d}>{d}</li>)) : (<li>{empNo}_Employee_File</li>)}
//                     </ul>
//                   </div>
//                 );
//               })()}
//               <div>
//                 <label className="text-sm font-medium">Destination Location</label>
//                 <Select value={approveModal.toLocation} onValueChange={(v) => setApproveModal(prev => ({ ...prev, toLocation: v }))}>
//                   <SelectTrigger className="mt-1">
//                     <SelectValue placeholder="Select location" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     {LOCATIONS.map(loc => (
//                       <SelectItem key={loc} value={loc}>{loc}</SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>
//               </div>
//               <div>
//                 <label className="text-sm font-medium">Comment (optional)</label>
//                 <Textarea className="mt-1" rows={3} value={approveModal.comment || ''} onChange={e => setApproveModal(prev => ({ ...prev, comment: e.target.value }))} />
//               </div>
//             </div>
//           )}
//           <DialogFooter>
//             <Button variant="outline" onClick={() => setApproveModal({ open: false, requestId: undefined, employeeId: undefined, toLocation: '', comment: '' })}>Cancel</Button>
//             <Button
//               onClick={() => {
//                 if (!approveModal.requestId || !approveModal.toLocation) return;
//                 approveFileRequest(approveModal.requestId, { toLocation: approveModal.toLocation, comment: approveModal.comment });
//                 setApproveModal({ open: false, requestId: undefined, employeeId: undefined, toLocation: '', comment: '' });
//               }}
//             >
//               Approve
//             </Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>

//     </div>
//   );
// };

// export default DocumentTrackingPage;

import React, { useMemo, useState } from 'react';
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { toast } from "sonner";

import { useSystemCatalog } from '@/contexts/SystemCatalogContext';
import { useFileTracking } from '@/contexts/FileTrackingContext';
import { useEmployees } from '@/contexts/EmployeesContext';
import { useAuth } from '@/contexts/AuthContext';
import { mapRole } from '@/lib/roles';
import { getWorkStation } from '@/lib/utils';

import {
  useGetFileByEmployeeQuery,
  useGetFileMovementsQuery,
  useRequestFileMutation,
  useGetAllFileRequestsQuery,
  useApproveFileRequestMutation,
  useRejectFileRequestMutation,
} from '@/features/employeeFile/employeeFileApi';

import {
  Card, CardContent, CardHeader, CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';

// ✅ Validation Schemas
const requestSchema = yup.object({
  remarks: yup.string().required("Remarks are required"),
});

const approveSchema = yup.object({
  toLocation: yup.string().required("Destination location is required"),
  comment: yup.string().required("Comment is required"),
});

const DocumentTrackingPage: React.FC = () => {
  const { user } = useAuth();
  const { employees } = useEmployees();
  const { stations, stationNames } = useSystemCatalog();
  const { getFileByEmployeeId, moveFile } = useFileTracking();

  const [employeeFilter, setEmployeeFilter] = useState('');
  const [assigneeQuery, setAssigneeQuery] = useState('');

   // Modals
  const [requestModal, setRequestModal] = useState<{ open: boolean; employeeId?: string }>({ open: false });
  const [approveModal, setApproveModal] = useState<{ open: boolean; requestId?: string; employeeId?: string }>({ open: false });
  const [moveModal, setMoveModal] = useState<{ open: boolean; employeeId?: string }>({ open: false });


  // API hooks
  const { data: allRequests = [] } = useGetAllFileRequestsQuery();
  const [requestFile, { isLoading: requesting }] = useRequestFileMutation();
  const [approveFileRequest, { isLoading: approving }] = useApproveFileRequestMutation();
  const [rejectFileRequest] = useRejectFileRequestMutation();
  
  const { data: employeeFile } = useGetFileByEmployeeQuery(employeeFilter, { skip: !employeeFilter });
  const { data: apiMovements = [] } = useGetFileMovementsQuery(employeeFilter, { skip: !employeeFilter });
  console.log("allRequests",allRequests);
  
 
  // ✅ Request form
  const {
    register: registerRequest,
    handleSubmit: handleSubmitRequest,
    reset: resetRequest,
    formState: { errors: errorsRequest },
  } = useForm({ resolver: yupResolver(requestSchema) });

  // ✅ Approve form
  const {
    register: registerApprove,
    handleSubmit: handleSubmitApprove,
    reset: resetApprove,
    formState: { errors: errorsApprove },
  } = useForm({ resolver: yupResolver(approveSchema) });

  const filteredEmployees = useMemo(() => {
    const q = employeeFilter.trim().toLowerCase();
    if (!q) return employees;
    return employees.filter(e =>
      e.id.toLowerCase().includes(q) ||
      e.name.toLowerCase().includes(q) ||
      ((e as any).employeeNumber || '').toLowerCase().includes(q)
    );
  }, [employeeFilter, employees]);

  const LOCATIONS = useMemo(() => {
    const managerStations = employees
      .filter(e => /manager/i.test(e.position || ''))
      .map(e => e.stationName)
      .filter(Boolean);
    return managerStations.length > 0 ? managerStations : stationNames.length > 0 ? stationNames : ['Registry Office'];
  }, [employees, stationNames]);

  console.log("employeeFile>>>>",employeeFile);
  

  // ✅ Submit Request
  const onSubmitRequest = async (data: any) => {
    console.log("requestModal",requestModal);
    
    if (!requestModal.employeeId) return;
    try {
      await requestFile({
        employee_id: requestModal.employeeId,
        file_id: employeeFile.id,
        document_type: "Employee_File",
        requested_by_user_id: user?.id || '',
        requested_by_name: user?.name || '',
        requested_by_department: user?.department || '',
        remarks: data.remarks,
      }).unwrap();
      toast.success("File request submitted");
      setRequestModal({ open: false });
      resetRequest();
    } catch (err) {
      toast.error("Failed to request file");
    }
  };

  // ✅ Submit Approve
  const onSubmitApprove = async (data: any) => {
    if (!approveModal.requestId) return;
    try {
      await approveFileRequest({
        requestId: approveModal.requestId,
        toLocation: data.toLocation,
        comment: data.comment,
      }).unwrap();
      toast.success("File request approved");
      setApproveModal({ open: false });
      resetApprove();
    } catch (err) {
      toast.error("Failed to approve request");
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Employee File Tracking</h1>
          <p className="text-muted-foreground">Track physical employee files and movement history.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* EMPLOYEE LIST */}
        <div className="md:col-span-1">
          <Card>
            <CardHeader><CardTitle>Find Employee</CardTitle></CardHeader>
            <CardContent>
              <Input placeholder="Search by Employee ID, Name, or Employee No"
                value={employeeFilter} onChange={e => setEmployeeFilter(e.target.value)} />
              <div className="mt-4 space-y-2 max-h-[400px] overflow-auto">
                {filteredEmployees.map(emp => (
                  <div key={emp.id}
                    className="p-2 border rounded hover:bg-muted cursor-pointer"
                    onClick={() => setEmployeeFilter(emp.id)}>
                    <div className="font-medium">{emp.name}</div>
                    <div className="text-xs text-muted-foreground">
                      ID: {emp.id} • Employee No: {emp.employeeNumber}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* FILE DETAILS */}
        <div className="md:col-span-2">
          {employeeFilter ? (
            (() => {
              const file = employeeFile ?? getFileByEmployeeId(employeeFilter);
              const movements = apiMovements.length > 0 ? apiMovements : file?.movementHistory || [];
              const emp = employees.find(e => e.id === employeeFilter);

              return (
                <Tabs defaultValue="file">
                  <TabsList className="grid grid-cols-2 w-full">
                    <TabsTrigger value="file">Employee File</TabsTrigger>
                    <TabsTrigger value="requests">Requests</TabsTrigger>
                  </TabsList>

                  {/* FILE TAB */}
                  <TabsContent value="file">
                    <Card>
                      <CardHeader>
                        <CardTitle>Employee File: {emp?.employeeNumber || employeeFilter}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {file ? (
                          <div className="space-y-4">
                            <div className="p-3 border rounded flex justify-between">
                              <div>
                                <div className="font-medium">Current Location: {file.currentLocation}</div>
                                <div className="text-xs text-muted-foreground">{file.assignedUserName || 'Registry'}</div>
                              </div>
                              <div className="flex items-center gap-2">
                                {user && (mapRole(user.role) === 'hr' || mapRole(user.role) === 'manager') && (
                                  <Button size="sm" variant="outline"
                                    onClick={() => setRequestModal({ open: true, employeeId: file.employee_id })}>
                                    Request File
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="text-sm text-muted-foreground">No file found.</div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* REQUEST TAB */}
                  <TabsContent value="requests">
                    <Card>
                      <CardHeader><CardTitle>File Requests</CardTitle></CardHeader>
                      <CardContent>
                        {allRequests.length === 0
                          ? <p className="text-sm text-muted-foreground">No requests.</p>
                          : allRequests.map(r => (
                            <div key={r.id} className="p-2 border rounded mb-2">
                              <div className="font-medium">Requested by {r.requestedByName}</div>
                              <div className="text-xs text-muted-foreground">{r.remarks}</div>
                              <div className="flex justify-end mt-2 gap-2">
                                {user?.role === 'admin' && (
                                  <>
                                    <Button size="sm" onClick={() => setApproveModal({ open: true, requestId: r.id, employeeId: r.employee_id })}>Approve</Button>
                                    <Button size="sm" variant="outline" onClick={() => rejectFileRequest({ requestId: r.id, remarks: "Rejected" })}>Reject</Button>
                                  </>
                                )}
                              </div>
                            </div>
                          ))}
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              );
            })()
          ) : (
            <Card><CardContent className="text-center p-8 text-muted-foreground">Select an employee to view details.</CardContent></Card>
          )}
        </div>
      </div>

      {/* ✅ Request File Dialog */}
      <Dialog open={requestModal.open} onOpenChange={(o) => setRequestModal({ open: o })}>
        <DialogContent>
          <form onSubmit={handleSubmitRequest(onSubmitRequest)}>
            <DialogHeader>
              <DialogTitle>Request Employee File</DialogTitle>
              <DialogDescription>Submit a request to retrieve the file.</DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <Textarea rows={3} placeholder="Remarks" {...registerRequest("remarks")} />
              {errorsRequest.remarks && <p className="text-red-500 text-sm">{errorsRequest.remarks.message}</p>}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setRequestModal({ open: false })}>Cancel</Button>
              <Button type="submit" disabled={requesting}>{requesting ? "Submitting..." : "Submit Request"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ✅ Approve Request Dialog */}
      <Dialog open={approveModal.open} onOpenChange={(o) => setApproveModal({ open: o })}>
        <DialogContent>
          <form onSubmit={handleSubmitApprove(onSubmitApprove)}>
            <DialogHeader>
              <DialogTitle>Approve File Request</DialogTitle>
              <DialogDescription>Confirm destination and remarks.</DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <Select {...registerApprove("toLocation")}>
                <SelectTrigger><SelectValue placeholder="Select location" /></SelectTrigger>
                <SelectContent>
                  {LOCATIONS.map(loc => <SelectItem key={loc} value={loc}>{loc}</SelectItem>)}
                </SelectContent>
              </Select>
              {errorsApprove.toLocation && <p className="text-red-500 text-sm">{errorsApprove.toLocation.message}</p>}
              <Textarea rows={3} placeholder="Comment" {...registerApprove("comment")} />
              {errorsApprove.comment && <p className="text-red-500 text-sm">{errorsApprove.comment.message}</p>}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setApproveModal({ open: false })}>Cancel</Button>
              <Button type="submit" disabled={approving}>{approving ? "Approving..." : "Approve"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DocumentTrackingPage;
