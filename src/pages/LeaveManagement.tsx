import React, { useEffect, useMemo, useState } from 'react';

import { Plus, Calendar, Clock, CheckCircle, XCircle, Filter, Download, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useEmployees } from '@/contexts/EmployeesContext';
import { useAuth } from '@/contexts/AuthContext';
import { useLeave } from '@/contexts/LeaveContext';
import {
  useGetAllLeavesQuery,
  useApproveLeaveMutation,
  useRejectLeaveMutation,
  useDeleteLeaveMutation,
  useUpdateLeaveMutation,
  useManagerApproveLeaveMutation,
  useManagerRejectLeaveMutation,
  useGetPendingApprovalsForManagerQuery,
  useGetPendingApprovalsForHRQuery,
  useGetAllLeaveBalanceQuery
} from '@/features/leave/leaveApi';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Switch } from '@/components/ui/switch';
import { getWorkStation } from '@/lib/utils';

export const LeaveManagement: React.FC = () => {
  const { user } = useAuth();
  const { leaveRequests: localLeaveRequests, addLeaveRequest } = useLeave();
  const isHrRole = ['hr_manager', 'hr_staff', 'admin'].includes(user?.role || '');
  const isManager = user?.role === 'manager' || user?.role === 'registry_manager';
  const isHrManager = user?.role === 'hr_manager';
  const isHrStaff = user?.role === 'hr_staff';

  // RTK Query hooks
  const { data: apiLeaves, isLoading: leavesLoading } = useGetAllLeavesQuery(undefined);
  const [managerApproveLeave] = useManagerApproveLeaveMutation();
  const [approveLeave] = useApproveLeaveMutation();
  const [managerRejectLeave] = useManagerRejectLeaveMutation();
  const [rejectLeave] = useRejectLeaveMutation();
  const [deleteLeave] = useDeleteLeaveMutation();
  const [updateLeave] = useUpdateLeaveMutation();
  const { data: allLeaveBalances } = useGetAllLeaveBalanceQuery(undefined);
  // Pending queues from server
  const { data: managerPending } = useGetPendingApprovalsForManagerQuery(String(user?.id), { skip: !isManager });
  const { data: hrPending } = useGetPendingApprovalsForHRQuery(undefined, { skip: !isHrRole });
  const { employees } = useEmployees();
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [balancesSearch, setBalancesSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [applyOpen, setApplyOpen] = useState(false);
  const [form, setForm] = useState<{ type: 'annual' | 'sick' | 'emergency' | 'maternity' | 'study'; startDate: string; endDate: string; days: number; reason: string }>({ type: 'annual', startDate: '', endDate: '', days: 1, reason: '' });
  const { toast } = useToast();

  console.log("user>>",user.role);
  console.log("employees>>>>",employees);
  
  // const isHrRole = ['hr_manager', 'hr_staff', 'admin'].includes(user?.role || '');
  // const isManager = user?.role === 'manager' || user?.role === 'registry_manager';
  // const isHrManager = user?.role === 'hr_manager';
  // const isHrStaff = user?.role === 'hr_staff';
  // console.log("isManager>>", isManager);
  // console.log("isHrManager>>", isHrManager);
  // console.log("isHrRole>>", isHrRole);
  // My queue only toggle (for managers and HR)
  const [myQueueOnly, setMyQueueOnly] = useState<boolean>(!!(isManager || isHrRole));

  // HR Manager mode: act as Team Manager (direct reports) vs HR Oversight (all)
  const [hrMode, setHrMode] = useState<'hr' | 'team'>(isHrManager ? 'hr' : 'hr');
  console.log("hrMode>>", hrMode);
  // Details dialog state
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<import('@/types/models').LeaveRequest | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({ startDate: '', endDate: '', days: 1, reason: '' });
  const [actionComment, setActionComment] = useState('');

  // Reject confirmation state
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [rejectTarget, setRejectTarget] = useState<import('@/types/models').LeaveRequest | null>(null);

//  useEffect(() => {
//   if (!user) return;

//   // Manager roles
//   if (user.role === 'manager' || user.role === 'registry_manager') {
//     setStatusFilter('pending_manager');
//     return;
//   }

//   // HR roles
//   if (isHrRole) {
//     setStatusFilter('pending_hr');
//     return;
//   }

//   // If "all", just keep all leaves
//   if (statusFilter === 'all' && apiLeaves) {
//     setStatusFilter(apiLeaves);
//   }
// }, [user, statusFilter, isHrRole, apiLeaves]);


  // Prefer API leaves when available, fallback to local context leaves
  const allLeaves = apiLeaves ?? localLeaveRequests;
  console.log("allLeaves>>", allLeaves);
  
  const baseLeaves = useMemo(() => {
    if (user?.role === 'employee') {
      return (allLeaves || []).filter(leave => leave.employeeId === user.id);
    }
    if (user?.role === 'manager' || user?.role === 'registry_manager' || (isHrManager && hrMode === 'team')) {
  const directReportIds = employees.filter(emp => (emp.managerId && String(emp.managerId) === String(user.id)) || (emp.manager && user?.name && String(emp.manager).toLowerCase() === String(user.name).toLowerCase())).map(emp => emp.id);
          console.log("directReportIds", directReportIds);
          console.log("allLeaves inside base leaves", allLeaves);
      return (allLeaves || []).filter(leave => directReportIds.includes(leave.employee_id));
    }
  
    
    return allLeaves || [];
  }, [user, allLeaves, employees, hrMode, isHrManager]);

  console.log("baseLeaves",baseLeaves);

  // Transform the API response
const groupedLeaveBalances = React.useMemo(() => {
  if (!allLeaveBalances) return [];

  const map = new Map<string, any>();

  allLeaveBalances.forEach((b: any) => {
    if (!map.has(b.employee_id)) {
      map.set(b.employee_id, {
        employee_id: b.employee_id,
        employee_name: b.employee_name,
        department: b.department,
        avatar: employees.find(emp => emp.id === b.employee_id)?.avatar,
        leaves: {} as Record<string, any>,
      });
    }

    const employeeData = map.get(b.employee_id);
    employeeData.leaves[b.leave_type_name.toLowerCase().replace(' ', '_')] = {
      allocated: b.max_days_per_year,
      used: b.used_days,
      remaining: b.remaining_days,
      pending: b.pending || 0,
    };
  });

  return Array.from(map.values());
}, [allLeaveBalances, employees]);

console.log("groupedLeaveBalances",groupedLeaveBalances);


  const myApprovedLeaves = user?.role === 'employee' 
    ? (allLeaves || []).filter(leave => leave.employee_id === user.id && (leave.status === 'hr_approved' || leave.status === 'approved' || leave.status === 'manager_approved'))
    : [];
  const usedLeaveDays = myApprovedLeaves.reduce((sum, leave) => sum + leave.days, 0);
  const leaveBalance = 25 - usedLeaveDays; 
  
  console.log("myApprovedLeaves",myApprovedLeaves);
  
  const approvedRequests = (allLeaves || []).filter(req => req.status === 'hr_approved' || req.status === 'manager_approved' || req.status === 'approved');
  const rejectedRequests = (allLeaves || []).filter(req => req.status && String(req.status).toLowerCase().includes('rejected'));

  const leaveBalances = useMemo(() => {
    if (user?.role === 'manager' || user?.role === 'registry_manager' || (isHrManager && hrMode === 'team')) {
  const directReports = employees.filter(emp => (emp.managerId && String(emp.managerId) === String(user.id)) || (emp.manager && user?.name && String(emp.manager).toLowerCase() === String(user.name).toLowerCase()));
      return directReports.map(emp => ({
        employeeId: emp.id,
        employeeName: emp.name,
        department: emp.stationName,
        station: emp.stationName,
        annual: {
          allocated: 25,
          used: Math.floor(Math.random() * 15) + 5,
          pending: (allLeaves || []).filter(req => req.employeeId === emp.id && ['pending_manager', 'pending_hr'].includes(req.status) && req.type === 'annual').reduce((sum, req) => sum + req.days, 0)
        },
        sick: {
          allocated: 10,
          used: Math.floor(Math.random() * 5),
          pending: (allLeaves || []).filter(req => req.employeeId === emp.id && ['pending_manager', 'pending_hr'].includes(req.status) && req.type === 'sick').reduce((sum, req) => sum + req.days, 0)
        },
        emergency: {
          allocated: 5,
          used: Math.floor(Math.random() * 2),
          pending: (allLeaves || []).filter(req => req.employeeId === emp.id && ['pending_manager', 'pending_hr'].includes(req.status) && req.type === 'emergency').reduce((sum, req) => sum + req.days, 0)
        }
      }));
    }
  return employees.map(emp => ({
      employeeId: emp.id,
      employeeName: emp.name,
      department: emp.stationName,
      station: emp.stationName,
      annual: {
        allocated: 25,
        used: Math.floor(Math.random() * 15) + 5,
        pending: (allLeaves || []).filter(req => req.employeeId === emp.id && ['pending_manager', 'pending_hr'].includes(req.status) && req.type === 'annual').reduce((sum, req) => sum + req.days, 0)
      },
      sick: {
        allocated: 10,
        used: Math.floor(Math.random() * 5),
        pending: (allLeaves || []).filter(req => req.employeeId === emp.id && ['pending_manager', 'pending_hr'].includes(req.status) && req.type === 'sick').reduce((sum, req) => sum + req.days, 0)
      },
      emergency: {
        allocated: 5,
        used: Math.floor(Math.random() * 2),
        pending: (allLeaves || []).filter(req => req.employeeId === emp.id && ['pending_manager', 'pending_hr'].includes(req.status) && req.type === 'emergency').reduce((sum, req) => sum + req.days, 0)
      }
    }));
  }, [user, allLeaves, employees, hrMode, isHrManager]);

  // debug: pendingManagerRequests will be logged after it's declared

  // Apply optional HR "my queue only" workstation filter
  const hrScopedLeaves = useMemo(() => {
    // HR oversight: optionally scope by workstation when myQueueOnly is on
    if (myQueueOnly && isHrRole && (!isHrManager || hrMode === 'hr')) {
      const ws = getWorkStation(user as any);
      return baseLeaves.filter(req => {
        const emp = employees.find(e => e.id === req.employeeId);
        return getWorkStation(emp as any) === ws;
      });
    }
    return baseLeaves;
  }, [myQueueOnly, isHrRole, user, baseLeaves, isHrManager, hrMode, employees]);

  const filteredRequests = hrScopedLeaves.filter(request => {
    const q = searchQuery.toLowerCase();
    const employeeName = String(request.employeeName || '').toLowerCase();
    const typeStr = String(request.type || '').toLowerCase();
    const reasonStr = String(request.reason || '').toLowerCase();
    const matchesSearch = employeeName.includes(q) || typeStr.includes(q) || reasonStr.includes(q);
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  console.log("filteredRequests>>>>>>>.",filteredRequests);

  // Pending requests scoped to the current user's responsibility
  // Managers should see only pending_manager requests for their direct reports (baseLeaves already contains direct reports for managers)
  // pending lists: prefer server-provided pending queues when available
  const pendingManagerRequests = (isManager && managerPending?.pending) ? managerPending.pending : baseLeaves.filter(req => req.status === 'pending_manager');
  const pendingHrRequests = (isHrRole && hrPending?.pending) ? hrPending.pending : (isHrRole ? hrScopedLeaves.filter(req => req.status === 'pending_hr') : []);
  console.log("pendingManagerRequests",pendingManagerRequests);
  console.log("pendingHrRequests",pendingHrRequests);
  
  const calendarEvents = (allLeaves || [])
    .filter(req => req.status === 'approved' || req.status === 'hr_approved' || req.status === 'manager_approved')
    .map(req => ({
      id: req.id,
      title: `${req.employeeName} - ${String(req.type).toUpperCase()}`,
      start: req.startDate,
      end: req.endDate,
      type: req.type
    }));

  const canActOnRequests = user && user.role !== 'employee';

  // const submitLeave = () => {
  //   if (!user) return;
  //   if (!form.startDate || !form.endDate || !form.reason) return;
  //   addLeaveRequest({
  //     employeeId: user.id,
  //     type: form.type,
  //     startDate: form.startDate,
  //     endDate: form.endDate,
  //     days: Number(form.days) || 1,
  //     reason: form.reason
  //   });
  //   setApplyOpen(false);
  //   setForm({ type: 'annual', startDate: '', endDate: '', days: 1, reason: '' });
  // };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold mb-2">
            {user?.role === 'employee' ? 'My Leave Requests' : 'Leave Management'}
          </h1>
          <p className="text-muted-foreground">
            {user?.role === 'employee' 
              ? `${leaveBalance} leave days remaining out of 25` 
              : 'Manage employee leave requests, balances, and calendar'
            }
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
          {/* Removed Apply for Leave button and dialog */}
          {/* Removed new leave request dialog and button */}
        </div>
      </div>

      {/* Overview Stats */}
      {user?.role === 'employee' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="bg-primary/10 p-3 rounded-lg">
                  <Calendar className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Leave Balance</p>
                  <p className="text-2xl font-bold">{leaveBalance}</p>
                  <Progress value={(leaveBalance / 25) * 100} className="mt-2" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="bg-warning/10 p-3 rounded-lg">
                  <Clock className="w-6 h-6 text-warning" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pending Requests</p>
                  <p className="text-2xl font-bold">
                    {baseLeaves.filter(req => ['pending_manager', 'pending_hr'].includes(req.status)).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="bg-success/10 p-3 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-success" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Used This Year</p>
                  <p className="text-2xl font-bold">{usedLeaveDays}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="bg-warning/10 p-3 rounded-lg">
                  <Clock className="w-6 h-6 text-warning" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pending Requests</p>
                  <p className="text-2xl font-bold">{pendingManagerRequests.length + pendingHrRequests.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="bg-success/10 p-3 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-success" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Approved This Month</p>
                  <p className="text-2xl font-bold">{(allLeaves || []).filter(req => req.status === 'approved' || req.status === 'hr_approved' || req.status === 'manager_approved').length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="bg-destructive/10 p-3 rounded-lg">
                  <XCircle className="w-6 h-6 text-destructive" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Rejected This Month</p>
                  <p className="text-2xl font-bold">{(allLeaves || []).filter(req => req.status && String(req.status).toLowerCase().includes('rejected')).length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="bg-primary/10 p-3 rounded-lg">
                  <Calendar className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Days Off Today</p>
                  <p className="text-2xl font-bold">3</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Employee simplified view */}
      {user?.role === 'employee' ? (
        <div className="space-y-6">
          {/* Category Balances for employee */}
          <Card>
            <CardHeader>
              <CardTitle>My Leave Balances by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {['annual','sick','emergency','maternity','study'].map((type) => {
                  const myTypeApproved = baseLeaves.filter(l => l.type === type && l.status === 'approved');
                  const myTypePending = baseLeaves.filter(l => l.type === type && ['pending_manager','pending_hr'].includes(l.status));
                  const used = myTypeApproved.reduce((s,l)=>s+l.days,0);
                  const pending = myTypePending.reduce((s,l)=>s+l.days,0);
                  const allocated = type === 'annual' ? 25 : type === 'sick' ? 10 : type === 'emergency' ? 5 : 0;
                  const remaining = allocated > 0 ? Math.max(allocated - used - pending, 0) : 0;
                  return (
                    <div key={type} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium capitalize">{type}</span>
                        {allocated > 0 && <Badge variant="outline">{allocated} days</Badge>}
                      </div>
                      {allocated > 0 ? (
                        <div className="text-sm text-muted-foreground">
                          Used: {used} • Pending: {pending} • Remaining: {remaining}
                        </div>
                      ) : (
                        <div className="text-sm text-muted-foreground">No fixed allocation</div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Pending Leave Approvals */}
          <Card>
            <CardHeader>
              <CardTitle>Pending Leave Approvals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {baseLeaves.filter(req => ['pending_manager', 'pending_hr'].includes(req.status)).length === 0 ? (
                  <p className="text-sm text-muted-foreground">No pending approvals.</p>
                ) : (
                  baseLeaves.filter(req => ['pending_manager', 'pending_hr'].includes(req.status)).map((request) => (
                    <div key={request.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium capitalize">{request.type}</h4>
                          <Badge className={`status-${request.status}`}>{request.status.replace('_',' ')}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {request.startDate} to {request.endDate} • {request.days} day{request.days>1?'s':''}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">Reason: {request.reason}</p>
                      </div>
                      <div className="text-right text-xs text-muted-foreground">
                        <p>Applied: {new Date(request.appliedDate).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* My Leave History */}
          <Card>
            <CardHeader>
              <CardTitle>My Leave History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {baseLeaves.length === 0 && (
                  <p className="text-sm text-muted-foreground">No leave requests yet.</p>
                )}
                {filteredRequests.map((request) => {
                  const employee = employees.find(emp => emp.id === request.employeeId);
                  return (
                    <div key={request.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium capitalize">{request.type}</h4>
                          <Badge className={`status-${request.status}`}>{request.status.replace('_',' ')}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {request.startDate} to {request.endDate} • {request.days} day{request.days>1?'s':''}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">Reason: {request.reason}</p>
                      </div>
                      <div className="text-right text-xs text-muted-foreground">
                        <p>Applied: {new Date(request.appliedDate).toLocaleDateString()}</p>
                        {request.approvedBy && <p>By: {request.approvedBy}</p>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
      <>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 gap-4">
          <TabsTrigger
            value="overview"
            className="bg-blue-600 text-white data-[state=active]:bg-blue-800 data-[state=active]:text-white rounded-lg py-2 text-lg font-semibold shadow w-full"
          >
            Requests Overview
          </TabsTrigger>
          <TabsTrigger
            value="balances"
            className="bg-yellow-200 text-yellow-900 data-[state=active]:bg-yellow-500 data-[state=active]:text-white rounded-lg py-2 text-lg font-semibold shadow w-full"
          >
            Employee Balances
          </TabsTrigger>
        </TabsList>

        {/* Requests Overview */}
        <TabsContent value="overview">
          <div className="space-y-6 mt-6">
            <div className="flex gap-4 items-center">
              <Input
                placeholder="Search leave requests..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
              />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending_manager">Pending Manager</SelectItem>
                  <SelectItem value="pending_hr">Pending HR</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
              {(isManager || isHrManager) && (
                <div className="flex items-center gap-2">
                  <Switch checked={myQueueOnly} onCheckedChange={setMyQueueOnly} />
                  <span className="text-sm">My queue only</span>
                </div>
              )}
              {isHrManager && (
                <div className="flex items-center gap-2">
                  <label className="text-sm">Mode:</label>
                  <Select value={hrMode} onValueChange={(v: 'hr' | 'team') => setHrMode(v)}>
                    <SelectTrigger className="w-36">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hr">HR Oversight</SelectItem>
                      <SelectItem value="team">My Team</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
              <Button variant="outline">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Leave Requests</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredRequests.map((request) => {
                    const employee = employees?.find(emp => emp.id === request.employee_id);
                    console.log("request>",request);
                    console.log("employee>",employee);
                    
                    return (
                      <div key={request.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <Avatar>
                            <AvatarImage src={employee?.avatar} />
                            <AvatarFallback>
                              {String(request.employee_name || '').split(' ').map(n => n?.[0] ?? '').join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h4 className="font-medium">{request.employee_name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {getWorkStation(employee as any)} • {employee?.position}
                            </p>
                            <p className="text-sm mt-1">
                              <span className="font-medium">
                                {request.type.replace('_', ' ').toUpperCase()}
                              </span>
                              {' • '}
                              {new Date(request.start_date).toLocaleDateString()} to {new Date(request.end_date).toLocaleDateString()}
                              {' • '}
                              {request.number_of_days} day{request.number_of_days > 1 ? 's' : ''}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Reason: {request.reason}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <Badge className={`status-${request.status}`}>
                              {request.status}
                            </Badge>
                            <p className="text-xs text-muted-foreground mt-1">{
                              request.status === 'pending_manager' ? 'Next: Manager' :
                              request.status === 'pending_hr' ? 'Next: HR' :
                              'Status: ' + request.status
                            }</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Applied: {new Date(request.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <Button size="sm" variant="outline" onClick={() => { setSelectedRequest(request); setActionComment(''); setDetailsOpen(true); }}>
                            Details
                          </Button>
                          {request.employeeId === user?.id && request.status === 'pending_manager' && (
                            <>
                              <Button size="sm" variant="ghost" onClick={() => {
                                setSelectedRequest(request);
                                setEditForm({ startDate: request.start_date, endDate: request.end_date, days: request.number_of_days, reason: request.reason });
                                setEditOpen(true);
                              }}>
                                Edit
                              </Button>
                              <Button size="sm" variant="destructive" onClick={async () => {
                                try {
                                  await deleteLeave(request.id).unwrap();
                                  toast({ title: 'Request withdrawn', description: 'Your leave request was withdrawn.' });
                                } catch (err) {
                                  toast({ title: 'Error', description: 'Failed to withdraw request.' });
                                }
                              }}>
                                Withdraw
                              </Button>
                            </>
                          )}
                          {request.status === 'pending_manager' && ((user?.role === 'manager' || user?.role === 'registry_manager') || (isHrManager && hrMode === 'team')) && (
                            <div className="flex gap-1">
                              <Button size="sm" variant="outline" className="text-success hover:text-success" onClick={async () => {
                                try {
                                  await managerApproveLeave({ leaveId: request.id, manager_id: String(user?.id) }).unwrap();
                                  toast({ title: 'Leave approved', description: `${request.employeeName}'s ${request.type} request approved.` });
                                } catch (err) {
                                  toast({ title: 'Error', description: 'Failed to approve leave.' });
                                }
                              }}>
                                <CheckCircle className="w-4 h-4" />
                              </Button>
                              <Button size="sm" variant="outline" className="text-destructive hover:text-destructive" onClick={() => {
                                setRejectTarget(request);
                                setConfirmOpen(true);
                              }}>
                                <XCircle className="w-4 h-4" />
                              </Button>
                            </div>
                          )}
                          {request.status === 'pending_hr' && (isHrStaff || (isHrManager && hrMode === 'team')) && (
                            <div className="flex gap-1">
                              <Button size="sm" variant="outline" className="text-success hover:text-success" onClick={async () => {
                                try {
                                  await approveLeave({ leaveId: request.id, approvalData: { hr_id: String(user?.id), hr_remarks: '' } }).unwrap();
                                  toast({ title: 'Leave approved', description: `${request.employeeName}'s ${request.type} request approved.` });
                                } catch (err) {
                                  toast({ title: 'Error', description: 'Failed to approve leave.' });
                                }
                              }}>
                                <CheckCircle className="w-4 h-4" />
                              </Button>
                              <Button size="sm" variant="outline" className="text-destructive hover:text-destructive" onClick={() => {
                                setRejectTarget(request);
                                setConfirmOpen(true);
                              }}>
                                <XCircle className="w-4 h-4" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Leave Calendar */}
        <TabsContent value="calendar">
          <Card>
            <CardHeader>
              <CardTitle>Leave Calendar - March 2024</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-2 mb-4">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
                    {day}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-2">
                {Array.from({ length: 31 }, (_, i) => i + 1).map(day => {
                  const dayEvents = calendarEvents.filter(event => {
                    const eventStart = new Date(event.start);
                    const eventEnd = new Date(event.end);
                    const currentDate = new Date(`2024-03-${day.toString().padStart(2, '0')}`);
                    return currentDate >= eventStart && currentDate <= eventEnd;
                  });

                  return (
                    <div key={day} className="min-h-[100px] border rounded-lg p-2">
                      <div className="text-sm font-medium mb-2">{day}</div>
                      <div className="space-y-1">
                        {dayEvents.map(event => (
                          <div
                            key={event.id}
                            className={`text-xs p-1 rounded truncate ${
                              event.type === 'annual' ? 'bg-primary/20 text-primary' :
                              event.type === 'sick' ? 'bg-warning/20 text-warning' :
                              'bg-destructive/20 text-destructive'
                            }`}
                            title={event.title}
                          >
                            {event.title.split(' - ')[0]}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="flex gap-4 mt-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-primary/20 rounded"></div>
                  <span>Annual Leave</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-warning/20 rounded"></div>
                  <span>Sick Leave</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-destructive/20 rounded"></div>
                  <span>Emergency Leave</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Employee Balances */}
        <TabsContent value="balances">
          <Card>
            <CardHeader>
              <CardTitle>Employee Leave Balances</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Input
                    placeholder="Search by employee name, ID, or workstation..."
                    value={balancesSearch}
                    onChange={(e) => setBalancesSearch(e.target.value)}
                    className="max-w-md"
                  />
                </div>
                <div className="overflow-x-auto">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Employee</th>
                        <th>Workstation</th>
                        <th>Annual Leave</th>
                        <th>Sick Leave</th>
                        <th>Emergency Leave</th>

                      </tr>
                    </thead>
                   <tbody>
                    {groupedLeaveBalances &&
                      groupedLeaveBalances
                        .filter((b) => {
                          const q = balancesSearch.toLowerCase().trim();
                          if (!q) return true;
                          return (
                            b.employee_name.toLowerCase().includes(q) ||
                            b.employee_id.toLowerCase().includes(q) ||
                            b.department.toLowerCase().includes(q)
                          );
                        })
                        .map((balance) => {
                          const employee = employees.find(emp => emp.id === balance.employee_id);

                          return (
                            <tr key={balance.employee_id}>
                              <td>
                                <div className="flex items-center gap-2">
                                  <Avatar className="w-8 h-8">
                                    <AvatarImage src={employee?.avatar} />
                                    <AvatarFallback>
                                      {String(balance.employee_name || '')
                                        .split(' ')
                                        .map(n => n?.[0] ?? '')
                                        .join('')}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span className="font-medium">
                                    {balance.employee_name}{" "}
                                    <span className="text-xs text-muted-foreground">
                                      (ID: {balance.employee_id} • Employee No: {(employee as { employeeNumber?: string })?.employeeNumber || '—'})
                                    </span>
                                  </span>
                                </div>
                              </td>

                              <td>{employee.department}</td>

                              {/* Annual Leave */}
                              <td>
                                <div className="space-y-1">
                                  <div className="flex justify-between text-sm">
                                    <span>Remaining: {balance.leaves.annual_leave?.remaining}</span>
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    Used: {balance.leaves.annual_leave?.used}/{balance.leaves.annual_leave?.allocated}
                                    {balance.leaves.annual_leave?.pending > 0 && (
                                      <span className="text-warning"> | Pending: {balance.leaves.annual_leave?.pending}</span>
                                    )}
                                  </div>
                                </div>
                              </td>

                              {/* Sick Leave */}
                              <td>
                                <div className="space-y-1">
                                  <div className="flex justify-between text-sm">
                                    <span>Remaining: {balance.leaves.sick_leave?.remaining}</span>
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    Used: {balance.leaves.sick_leave?.used}/{balance.leaves.sick_leave?.allocated}
                                    {balance.leaves.sick_leave?.pending > 0 && (
                                      <span className="text-warning"> | Pending: {balance.leaves.sick_leave?.pending}</span>
                                    )}
                                  </div>
                                </div>
                              </td>

                              {/* Emergency Leave */}
                              <td>
                                <div className="space-y-1">
                                  <div className="flex justify-between text-sm">
                                    <span>Remaining: {balance.leaves.emergency_leave?.remaining}</span>
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    Used: {balance.leaves.emergency_leave?.used}/{balance.leaves.emergency_leave?.allocated}
                                    {balance.leaves.emergency_leave?.pending > 0 && (
                                      <span className="text-warning"> | Pending: {balance.leaves.emergency_leave?.pending}</span>
                                    )}
                                  </div>
                                </div>
                              </td>

                            </tr>
                          );
                        })}
                  </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reports */}
        <TabsContent value="reports">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Leave Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { type: 'Annual Leave', requests: 12, days: 85, avgDays: 7.1 },
                    { type: 'Sick Leave', requests: 8, days: 24, avgDays: 3.0 },
                    { type: 'Emergency Leave', requests: 3, days: 9, avgDays: 3.0 },
                    { type: 'Study Leave', requests: 2, days: 10, avgDays: 5.0 },
                  ].map(stat => (
                    <div key={stat.type} className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                      <div>
                        <p className="font-medium">{stat.type}</p>
                        <p className="text-sm text-muted-foreground">
                          {stat.requests} requests • {stat.days} total days
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold">{stat.avgDays}</p>
                        <p className="text-xs text-muted-foreground">avg days</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Workstation Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {['Engineering', 'Human Resources', 'Marketing', 'Finance'].map(dept => {
                    const deptEmployees = employees.filter(emp => emp.department === dept);
                    const deptRequests = (allLeaves || []).filter(req => {
                      const emp = employees.find(e => e.id === req.employeeId);
                      return getWorkStation(emp as any) === dept;
                    });
                    const totalDays = deptRequests.reduce((sum, req) => sum + req.days, 0);
                    const avgDays = deptEmployees.length > 0 ? (totalDays / deptEmployees.length).toFixed(1) : '0';
                    
                    return (
                      <div key={dept} className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                        <div>
                          <p className="font-medium">{dept}</p>
                          <p className="text-sm text-muted-foreground">
                            {deptEmployees.length} employees • {deptRequests.length} requests
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold">{avgDays}</p>
                          <p className="text-xs text-muted-foreground">avg days per employee</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
      {/* Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Request Details</DialogTitle>
            <DialogDescription>Review the request details, history and add comments before taking action.</DialogDescription>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Employee</p>
                  <p className="font-medium">{selectedRequest.employee_name}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Type</p>
                  <p className="font-medium capitalize">{selectedRequest.type}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Dates</p>
                  <p className="font-medium">{new Date(selectedRequest.start_date).toLocaleDateString()} – {new Date(selectedRequest.end_date).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Days</p>
                  <p className="font-medium">{selectedRequest.number_of_days}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Applied</p>
                  <p className="font-medium">{new Date(selectedRequest.created_at).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Status</p>
                  <Badge className={`status-${selectedRequest.status}`}>{selectedRequest.status}</Badge>
                </div>
              </div>
              <div>
                <p className="text-muted-foreground text-sm mb-1">Reason</p>
                <p className="text-sm">{selectedRequest.reason}</p>
              </div>
              {selectedRequest?.manager_remarks && (
                <div className="text-sm">
                  <p className="text-muted-foreground mb-1">Manager Comments</p>
                  <p>{selectedRequest.manager_remarks}</p>
                </div>
              )}
              {selectedRequest?.hr_remarks && (
                <div className="text-sm">
                  <p className="text-muted-foreground mb-1">HR Comments</p>
                  <p>{selectedRequest.hr_remarks}</p>
                </div>
              )}
              <div>
                <p className="text-sm font-medium mb-1">Add Comment (optional)</p>
                <Textarea value={actionComment} onChange={(e) => setActionComment(e.target.value)} placeholder="Add a note for this action..." />
              </div>
          
              <div className="flex justify-end gap-2">
                {(selectedRequest.status === 'pending_manager' && (isManager || (isHrManager && hrMode === 'team'))) || (selectedRequest.status === 'pending_hr' && isHrRole) ? (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setRejectTarget(selectedRequest);
                        setConfirmOpen(true);
                      }}
                      className="text-destructive"
                    >
                      Reject
                    </Button>
                    <Button
                      onClick={async () => {
                        if (!selectedRequest) return;
                        try {
                          if (selectedRequest.status === 'pending_manager' && (isManager || (isHrManager && hrMode === 'team'))) {
                            await managerApproveLeave({ leaveId: selectedRequest.id, manager_id: String(user?.id) }).unwrap();
                          } else if (selectedRequest.status === 'pending_hr' && isHrRole) {
                            await approveLeave({ leaveId: selectedRequest.id, approvalData: { hr_id: String(user?.id), hr_remarks: actionComment } }).unwrap();
                          }
                          toast({ title: 'Leave approved', description: `${selectedRequest.employee_name}'s ${selectedRequest.type} request approved.` });
                          setDetailsOpen(false);
                          setActionComment('');
                        } catch (err) {
                          toast({ title: 'Error', description: 'Failed to approve leave.' });
                        }
                      }}
                    >
                      Approve
                    </Button>
                  </>
                ) : null}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Request Dialog for employees */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Leave Request</DialogTitle>
            <DialogDescription>Modify dates or reason and re-submit for approval.</DialogDescription>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Start Date</Label>
                  <Input value={editForm.startDate} onChange={(e) => setEditForm(prev => ({ ...prev, startDate: e.target.value }))} type="date" />
                </div>
                <div>
                  <Label>End Date</Label>
                  <Input value={editForm.endDate} onChange={(e) => setEditForm(prev => ({ ...prev, endDate: e.target.value }))} type="date" />
                </div>
              </div>
              <div>
                <Label>Days</Label>
                <Input type="number" value={String(editForm.days)} onChange={(e) => setEditForm(prev => ({ ...prev, days: Number(e.target.value) || 1 }))} />
              </div>
              <div>
                <Label>Reason</Label>
                <Textarea value={editForm.reason} onChange={(e) => setEditForm(prev => ({ ...prev, reason: e.target.value }))} />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => { setEditOpen(false); }}>Cancel</Button>
                <Button onClick={async () => {
                  if (!selectedRequest) return;
                  try {
                    await updateLeave({ id: selectedRequest.id, start_date: editForm.startDate, end_date: editForm.endDate, days: editForm.days, reason: editForm.reason, status: 'pending_manager' }).unwrap();
                    toast({ title: 'Request updated', description: 'Your leave request was updated and re-submitted.' });
                    setEditOpen(false);
                  } catch (err) {
                    toast({ title: 'Error', description: 'Failed to update request.' });
                  }
                }}>Save</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Reject Confirmation Dialog */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Rejection</DialogTitle>
            <DialogDescription>This action will reject the leave request. You can proceed or cancel.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2 text-sm">
            <p><span className="text-muted-foreground">Employee: </span><span className="font-medium">{rejectTarget?.employee_name}</span></p>
            <p><span className="text-muted-foreground">Type: </span><span className="font-medium capitalize">{rejectTarget?.type}</span></p>
            <p><span className="text-muted-foreground">Dates: </span><span className="font-medium">{rejectTarget?.start_date} – {rejectTarget?.end_date}</span></p>
          </div>
              <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>Cancel</Button>
            <Button
              className="bg-red-600 text-white hover:bg-red-700"
              onClick={async () => {
                if (!rejectTarget) return;
                try {
                  const isManagerAction = (rejectTarget.status === 'pending_manager' && (isManager || (isHrManager && hrMode === 'team')));
                  if (isManagerAction) {
                    await managerRejectLeave({ leaveId: rejectTarget.id, manager_id: String(user?.id) }).unwrap();
                  } else {
                    await rejectLeave({ leaveId: rejectTarget.id, rejectData: { hr_id: String(user?.id), hr_remarks: actionComment || null } }).unwrap();
                  }
                  toast({ title: 'Leave rejected', description: `${rejectTarget.employee_name}'s ${rejectTarget.type} request rejected.`, variant: 'destructive' });
                  setConfirmOpen(false);
                  setDetailsOpen(false);
                  setRejectTarget(null);
                  setActionComment('');
                } catch (err) {
                  toast({ title: 'Error', description: 'Failed to reject leave.' });
                }
              }}
            >
              Confirm Reject
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      </>
      )}
    </div>
  );
}