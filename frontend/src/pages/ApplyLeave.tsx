import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLeave } from '@/contexts/LeaveContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useApplyLeaveMutation, useGetAllLeaveTypesQuery } from '@/features/leave/leaveApi';

const ApplyLeave: React.FC = () => {
  const { user } = useAuth();
  const { addLeaveRequest } = useLeave();
  const [form, setForm] = useState({ type: 'annual', startDate: '', endDate: '', days: 1, reason: '' });
  const [success, setSuccess] = useState(false);
  const [applyLeave] = useApplyLeaveMutation();
  const { data } = useGetAllLeaveTypesQuery();
  console.log("leave data>>",data);
  
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
    setSuccess(true);
    setForm({ type: 'annual', startDate: '', endDate: '', days: 1, reason: '' });
  };

  return (
    <div className="max-w-xl mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Apply for Leave</CardTitle>
        </CardHeader>
        <CardContent>
          {success && (
            <div className="mb-4 text-green-600 font-semibold">Leave request submitted successfully!</div>
          )}
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
          <div className="mt-6 flex justify-end">
            <Button onClick={submitLeave} disabled={!form.startDate || !form.endDate || !form.reason}>Submit</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ApplyLeave;
