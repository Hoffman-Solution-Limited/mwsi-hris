import React, { useState, useMemo, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLeave } from "@/contexts/LeaveContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Calendar, Clock, TrendingUp } from "lucide-react";
import {
  useApplyLeaveMutation,
  useGetAllLeavesQuery,
  useGetAllLeaveTypesQuery,
  useGetEmployeeLeavesAndBalanceQuery,
} from "@/features/leave/leaveApi";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useToast } from "@/hooks/use-toast";
import { Controller, useForm, SubmitHandler } from "react-hook-form";
// import axios from 'axios';

export type leaveFormData = {
  type?: string;
  startDate?: string;
  endDate?: string;
  days?: number;
  reason?: string;
};

const ManagerApplyLeave: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { leaveRequests, addLeaveRequest } = useLeave();
  const schema = yup.object().shape({
    type: yup.string().required("Leave type is required"),
    startDate: yup.string().required("Start date is required"),
    endDate: yup.string().required("End date is required"),
    days: yup
      .number()
      .min(1, "At least 1 day is required")
      .required("Days are required"),
    reason: yup.string().required("Reason is required"),
  });

  const {
    register,
    handleSubmit,
    reset,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<leaveFormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      type: '',
      startDate: '',
      endDate: '',
      days: 1,
      reason: '',
    }
  });
  // Provide default values so fields are registered and validation works predictably
  // (react-hook-form uses these to type-check and wire Controller/default inputs)
  // const [form, setForm] = useState({
  //   type: "",
  //   startDate: "",
  //   endDate: "",
  //   days: 1,
  //   reason: "",
  // });
   console.log("user data>>", user);
  const [applyOpen, setApplyOpen] = useState(false);
  const [applyLeave] = useApplyLeaveMutation();
  const { data, isLoading } = useGetAllLeaveTypesQuery(undefined);
  const { data: leaves, isLoading: leavesLoading } = useGetAllLeavesQuery(undefined);
  const { data: employeeLeaves, isLoading: employeeLeavesLoading } = useGetEmployeeLeavesAndBalanceQuery(user?.id || "");
  console.log("employeeLeaves",employeeLeaves);
  const balances = employeeLeaves?.balances || [];
  // const [balances, setBalances] = useState<any[]>([]);

  console.log("leave data>>", data);
 
  // Only manager's own leave requests (from backend if available)
  const myLeaves = useMemo(() => {
    if (leaves && user?.id) {
      return leaves.filter((l: any) => l.employee_id === user.id);
    }
    return [];
  }, [leaves, user]);
  // Use dynamic leave balance from backend if available
  const annualBalance = balances.find(
    (b) => b.leave_type_name?.toLowerCase() === "annual leave"
  );
  console.log("annualBalance",annualBalance);
  
  const leaveBalance = annualBalance ? annualBalance.days_remaining : 0;
  const usedLeaveDays = annualBalance ? annualBalance.days_used : 0;
  console.log("leaveBalance",leaveBalance);
  console.log("usedLeaveDays",usedLeaveDays);


  // Debug: log errors on every render
  console.log("Form errors:", errors);

  // Watch start/end date changes and compute days automatically
  const watchStart = watch('startDate');
  const watchEnd = watch('endDate');

  useEffect(() => {
    if (!watchStart || !watchEnd) return;
    const s = new Date(watchStart);
    const e = new Date(watchEnd);
    if (isNaN(s.getTime()) || isNaN(e.getTime())) return;
    const diffMs = e.getTime() - s.getTime();
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
    // If end is same day or before, default to 1 day
    const days = diffDays > 0 ? diffDays : 1;
    setValue('days', days, { shouldValidate: true, shouldDirty: true });
  }, [watchStart, watchEnd, setValue]);

  // console.log("user>", user);

  const handleSubmitLeave: SubmitHandler<leaveFormData> = async (formData) => {
    console.log("Reached here", formData);

    if (!user) {
      console.warn('No user in context, cannot submit');
      return;
    }
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

      console.log('Submitting leave payload', payload);
      const response = await applyLeave(payload);
      console.log('applyLeave response', response);
      // RTK Query returns either { data } or { error }
      if ((response as any).error) {
        const err = (response as any).error;
        toast({
          title: 'Error',
          description: err?.data?.message || 'Failed to apply leave',
          variant: 'destructive',
        });
        return;
      }

      toast({ title: 'Leave Application Submitted', description: 'Your leave application has been submitted successfully.' });
      reset();
      setApplyOpen(false);
    } catch (error: any) {
      console.error('Submit error', error);
      toast({
        title: 'Error',
        description: error?.message || 'An error occurred while submitting leave application',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6 w-full h-full px-6 py-8">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold mb-2">My Leave Requests</h1>
          <p className="text-muted-foreground">
            {leaveBalance} leave days remaining out of 25
          </p>
        </div>
        <Dialog open={applyOpen} onOpenChange={setApplyOpen}>
          <DialogTrigger asChild>
            <Button>
              <Calendar className="w-4 h-4 mr-2" />
              Apply for Leave
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form
              onSubmit={handleSubmit(
                handleSubmitLeave
              )}
            >
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
                        value={field.value}
                        onValueChange={(v) => field.onChange(v)}
                      >
                        <SelectTrigger className="w-full mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {isLoading && (
                            <SelectItem value="loading">Loading...</SelectItem>
                          )}
                          {data &&
                            data.map((leaveType: any) => (
                              <SelectItem
                                key={leaveType.id}
                                value={leaveType.id}
                              >
                                {leaveType.name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.type && (
                    <p className="text-red-500 text-sm">
                      {errors.type.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium">Start Date</label>
                  <Input
                    type="date"
                    className="mt-1"
                    {...register("startDate")}
                  />
                  {errors.startDate && (
                    <p className="text-red-500 text-sm">
                      {errors.startDate.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium">End Date</label>
                  <Input
                    type="date"
                    className="mt-1"
                    {...register("endDate")}
                  />
                  {errors.endDate && (
                    <p className="text-red-500 text-sm">
                      {errors.endDate.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium">Total Days</label>
                  <Input
                    type="number"
                    min={1}
                    className="mt-1"
                    {...register("days")}
                    readOnly
                    aria-readonly="true"
                  />
                  {errors.days && (
                    <p className="text-red-500 text-sm">
                      {errors.days.message}
                    </p>
                  )}
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-medium">Reason</label>
                  <Textarea className="mt-1" rows={3} {...register("reason")} />
                  {errors.reason && (
                    <p className="text-red-500 text-sm">
                      {errors.reason.message}
                    </p>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Submit</Button>
              </DialogFooter>
            </form>
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
                <p className="text-sm font-medium text-muted-foreground">
                  Leave Balance
                </p>
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
                <p className="text-sm font-medium text-muted-foreground">
                  Pending Requests
                </p>
                <p className="text-2xl font-bold">
                  {
                    myLeaves.filter((req) =>
                      ["pending_manager", "pending_hr"].includes(req.status)
                    ).length
                  }
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
                <p className="text-sm font-medium text-muted-foreground">
                  Used This Year
                </p>
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
            {balances.map((bal) => (
              <div key={bal.leave_type_id} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium capitalize">
                    {bal.leave_type_name}
                  </span>
                  {bal.max_days_per_year > 0 && (
                    <Badge variant="outline">
                      {bal.max_days_per_year} days
                    </Badge>
                  )}
                </div>
                {bal.max_days_per_year > 0 ? (
                  <div className="text-sm text-muted-foreground">
                    Used: {bal.days_used} • Remaining: {bal.days_remaining}
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">
                    No fixed allocation
                  </div>
                )}
              </div>
            ))}
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
            {myLeaves.filter((req) =>
              ["pending_manager", "pending_hr"].includes(req.status)
            ).length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No pending approvals.
              </p>
            ) : (
              myLeaves
                .filter((req) =>
                  ["pending_manager", "pending_hr"].includes(req.status)
                )
                .map((request) => (
                  <div
                    key={request.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium capitalize">
                          {request.type}
                        </h4>
                        <Badge className={`status-${request.status}`}>
                          {request.status.replace("_", " ")}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {new Date(request.start_date).toLocaleDateString()} to {new Date(request.end_date).toLocaleDateString()} •{" "}
                        {request.days} day{request.days > 1 ? "s" : ""}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Reason: {request.reason}
                      </p>
                    </div>
                    <div className="text-right text-xs text-muted-foreground">
                      <p>
                        Applied:{" "}
                        {new Date(request.applied_date).toLocaleDateString()}
                      </p>
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
            {myLeaves && myLeaves.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No leave requests yet.
              </p>
            )}
            {myLeaves &&
              myLeaves.map((request) => (
                <div
                  key={request.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium capitalize">{request.type}</h4>
                      <Badge className={`status-${request.status}`}>
                        {request.status.replace("_", " ")}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {new Date(request.start_date).toLocaleDateString()} to {new Date(request.end_date).toLocaleDateString()} • {request.days}{" "}
                      day{request.days > 1 ? "s" : ""}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Reason: {request.reason}
                    </p>
                  </div>
                  <div className="text-right text-xs text-muted-foreground">
                    <p>
                      Applied:{" "}
                      {new Date(request.applied_date).toLocaleDateString()}
                    </p>
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
