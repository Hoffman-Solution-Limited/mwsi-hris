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
import { useApplyLeaveMutation, useGetAllLeavesQuery, useGetAllLeaveTypesQuery } from '@/features/leave/leaveApi';
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import { useToast } from '@/hooks/use-toast';
import { Controller, useForm } from "react-hook-form"

export type FormValues = {
  type: number;    
  startDate: string;  
  endDate: string; 
  days: number;
  reason: string;
}

const ManagerApplyLeave: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { leaveRequests, addLeaveRequest } = useLeave();
  const [form, setForm] = useState({ type: 'annual', startDate: '', endDate: '', days: 1, reason: '' });
  const [applyOpen, setApplyOpen] = useState(false);
  const [applyLeave] = useApplyLeaveMutation();
  const { data, isLoading } = useGetAllLeaveTypesQuery();
  const { data:leaves, isLoading: leavesLoading } = useGetAllLeavesQuery();

  console.log("leave data>>",data);
  // Only manager's own leave requests
  const myLeaves = useMemo(() => leaveRequests.filter(l => l.employeeId === user?.id), [leaveRequests, user]);
  const myApprovedLeaves = myLeaves.filter(l => l.status === 'approved');
  const usedLeaveDays = myApprovedLeaves.reduce((sum, leave) => sum + leave.days, 0);
  const leaveBalance = 25 - usedLeaveDays;

   const schema = yup.object().shape({
    type: yup.number().required("Leave type is required"),
    startDate: yup.string().required("Start date is required"),
    endDate: yup.string().required("End date is required"),
    days: yup.number().min(1, "At least 1 day is required").required("Days are required"),
    reason: yup.string().required("Reason is required"),
  })

const { register, handleSubmit, reset, control, formState: { errors, isSubmitting } } = useForm<FormValues>({
  resolver: yupResolver(schema)
});

    // console.log("user>", user);

  const handleSubmitLeave = async(formData: FormValues) => {
    console.log("Reached here");
    
    if (!user) return;
    try {
      const payload = {
        employee_id: user.id,
        employee_name: user.name,
        leave_type_id: formData.type,
        start_date: formData.startDate,
        end_date: formData.endDate,
        days: formData.days,
        reason: formData.reason,
      };

      console.log("payload", payload);
      
      const response = await applyLeave(payload);

      if (response?.error) {
        toast({
          title: "Error",
          description: response.error.data?.message || "Invalid information",
          variant: "destructive",
        });
        reset();
      } else {
        toast({
          title: "Leave Application Submitted",
          description: "Your leave application has been submitted successfully.",
        });
        reset();
        setApplyOpen(false);
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "An error occurred while submitting leave application",
        variant: "destructive",
      });
    }
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
          <form onSubmit={handleSubmit(
    handleSubmitLeave, // call your actual submit function
    (validationErrors) => {
      console.error("Validation errors:", validationErrors);
    }
  )}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Apply for Leave</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="text-sm font-medium">Leave Type</label>
                {/* <Select {...register("type")} value={form.type} onValueChange={v => setForm(s => ({ ...s, type: v }))}>
                  <SelectTrigger className="w-full mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {isLoading && <SelectItem value="loading">Loading...</SelectItem>}
                    {data && data.map(leaveType => (
                      <SelectItem key={leaveType.id} value={leaveType.id}>
                        {leaveType.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select> */}
                <Controller
  name="type"
  control={control}
  render={({ field }) => (
    <Select
      value={String(field.value)} 
      onValueChange={v => field.onChange(Number(v))}
    >
      <SelectTrigger className="w-full mt-1">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {isLoading && <SelectItem value="0">Loading...</SelectItem>}
        {data && data.map(leaveType => (
          <SelectItem key={leaveType.id} value={String(leaveType.id)}>
            {leaveType.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )}
/>
                {errors.type && <p className="text-red-500 text-sm">{errors.type.message}</p>}
              </div>
              <div>
                <label className="text-sm font-medium" >Start Date</label>
                <Input type="date" className="mt-1" {...register("startDate")} />
                 {errors.startDate && <p className="text-red-500 text-sm">{errors.startDate.message}</p>}
              </div>
              <div>
                <label className="text-sm font-medium">End Date</label>
                <Input type="date" className="mt-1" {...register("endDate")} />
                 {errors.endDate && <p className="text-red-500 text-sm">{errors.endDate.message}</p>}
              </div>
              <div>
                <label className="text-sm font-medium">Total Days</label>
                <Input type="number" min={1} className="mt-1" {...register("days")} />
                 {errors.days && <p className="text-red-500 text-sm">{errors.days.message}</p>}
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-medium">Reason</label>
                <Textarea className="mt-1" rows={3} {...register("reason")} />
                 {errors.reason && <p className="text-red-500 text-sm">{errors.reason.message}</p>}
              </div>
            </div>
            <DialogFooter>
              <Button type='submit' >Submit</Button>
            </DialogFooter>
          </DialogContent>
          </form>
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
            {leaves && leaves.length === 0 && (
              <p className="text-sm text-muted-foreground">No leave requests yet.</p>
            )}
            {leaves &&leaves.map((request) => (
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
