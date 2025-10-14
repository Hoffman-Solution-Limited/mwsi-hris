import React, { useState, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLeave } from '@/contexts/LeaveContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar, Clock, TrendingUp } from 'lucide-react';

const ManagerApplyLeave: React.FC = () => {
  const { user } = useAuth();
  const { leaveRequests, addLeaveRequest } = useLeave();
  const [form, setForm] = useState({ type: 'annual', startDate: '', endDate: '', days: 1, reason: '' });
  const [applyOpen, setApplyOpen] = useState(false);

  // Only manager's own leave requests
  const myLeaves = useMemo(() => leaveRequests.filter(l => l.employeeId === user?.id), [leaveRequests, user]);
  const myApprovedLeaves = myLeaves.filter(l => l.status === 'approved');
  const usedLeaveDays = myApprovedLeaves.reduce((sum, leave) => sum + leave.days, 0);
  const leaveBalance = 25 - usedLeaveDays;

  const submitLeave = () => {
    if (!user) return;
    if (!form.startDate || !form.endDate || !form.reason) return;
    addLeaveRequest({
      employeeId: user.id,
      type: form.type as any,
      startDate: form.startDate,
      endDate: form.endDate,
      days: Number(form.days) || 1,
      reason: form.reason
    });
    setApplyOpen(false);
    setForm({ type: 'annual', startDate: '', endDate: '', days: 1, reason: '' });
  };

  return (
    <div className="space-y-6 w-full h-full px-6 py-8">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold mb-2">My Leave Requests</h1>
          <p className="text-muted-foreground">{leaveBalance} leave days remaining out of 25</p>
        </div>
        <Dialog open={applyOpen} onOpenChange={setApplyOpen}>
          <DialogTrigger asChild>
            <Button>
              <Calendar className="w-4 h-4 mr-2" />
              Apply for Leave
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Apply for Leave</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="text-sm font-medium">Leave Type</label>
                <Select value={form.type} onValueChange={v => setForm(s => ({ ...s, type: v }))}>
                  <SelectTrigger className="w-full mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="annual">Annual</SelectItem>
                    <SelectItem value="sick">Sick</SelectItem>
                    <SelectItem value="emergency">Emergency</SelectItem>
                    <SelectItem value="maternity">Maternity</SelectItem>
                    <SelectItem value="study">Study</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Start Date</label>
                <Input type="date" className="mt-1" value={form.startDate} onChange={e => setForm(s => ({ ...s, startDate: e.target.value }))} />
              </div>
              <div>
                <label className="text-sm font-medium">End Date</label>
                <Input type="date" className="mt-1" value={form.endDate} onChange={e => setForm(s => ({ ...s, endDate: e.target.value }))} />
              </div>
              <div>
                <label className="text-sm font-medium">Total Days</label>
                <Input type="number" min={1} className="mt-1" value={form.days} onChange={e => setForm(s => ({ ...s, days: Number(e.target.value) }))} />
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-medium">Reason</label>
                <Textarea className="mt-1" rows={3} value={form.reason} onChange={e => setForm(s => ({ ...s, reason: e.target.value }))} />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={submitLeave} disabled={!form.startDate || !form.endDate || !form.reason}>Submit</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Overview Stats */}
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
                <p className="text-2xl font-bold">{myLeaves.filter(req => ['pending_manager', 'pending_hr'].includes(req.status)).length}</p>
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

      {/* Category Balances for manager */}
      <Card>
        <CardHeader>
          <CardTitle>My Leave Balances by Category</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {['annual','sick','emergency','maternity','study'].map((type) => {
              const myTypeApproved = myLeaves.filter(l => l.type === type && l.status === 'approved');
              const myTypePending = myLeaves.filter(l => l.type === type && ['pending_manager','pending_hr'].includes(l.status));
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
            {myLeaves.filter(req => ['pending_manager', 'pending_hr'].includes(req.status)).length === 0 ? (
              <p className="text-sm text-muted-foreground">No pending approvals.</p>
            ) : (
              myLeaves.filter(req => ['pending_manager', 'pending_hr'].includes(req.status)).map((request) => (
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
            {myLeaves.length === 0 && (
              <p className="text-sm text-muted-foreground">No leave requests yet.</p>
            )}
            {myLeaves.map((request) => (
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
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ManagerApplyLeave;
