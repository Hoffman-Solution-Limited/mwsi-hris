import React, { useState } from 'react';
import { Plus, Calendar, Clock, CheckCircle, XCircle, Filter, Download } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { mockLeaveRequests, mockEmployees } from '@/data/mockData';

export const LeaveManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const pendingRequests = mockLeaveRequests.filter(req => req.status === 'pending');
  const approvedRequests = mockLeaveRequests.filter(req => req.status === 'approved');
  const rejectedRequests = mockLeaveRequests.filter(req => req.status === 'rejected');

  // Calculate leave balances (mock data)
  const leaveBalances = mockEmployees.map(emp => ({
    employeeId: emp.id,
    employeeName: emp.name,
    department: emp.department,
    annual: {
      allocated: 25,
      used: Math.floor(Math.random() * 15) + 5,
      pending: mockLeaveRequests.filter(req => req.employeeId === emp.id && req.status === 'pending' && req.type === 'annual').reduce((sum, req) => sum + req.days, 0)
    },
    sick: {
      allocated: 10,
      used: Math.floor(Math.random() * 5),
      pending: mockLeaveRequests.filter(req => req.employeeId === emp.id && req.status === 'pending' && req.type === 'sick').reduce((sum, req) => sum + req.days, 0)
    },
    emergency: {
      allocated: 5,
      used: Math.floor(Math.random() * 2),
      pending: mockLeaveRequests.filter(req => req.employeeId === emp.id && req.status === 'pending' && req.type === 'emergency').reduce((sum, req) => sum + req.days, 0)
    }
  }));

  // Filter leave requests
  const filteredRequests = mockLeaveRequests.filter(request => {
    const matchesSearch = request.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         request.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         request.reason.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calendar data (mock)
  const calendarEvents = mockLeaveRequests
    .filter(req => req.status === 'approved')
    .map(req => ({
      id: req.id,
      title: `${req.employeeName} - ${req.type.toUpperCase()}`,
      start: req.startDate,
      end: req.endDate,
      type: req.type
    }));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold mb-2">Leave Management</h1>
          <p className="text-muted-foreground">
            Manage employee leave requests, balances, and calendar
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Leave Request
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="bg-warning/10 p-3 rounded-lg">
                <Clock className="w-6 h-6 text-warning" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Requests</p>
                <p className="text-2xl font-bold">{pendingRequests.length}</p>
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
                <p className="text-2xl font-bold">{approvedRequests.length}</p>
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
                <p className="text-2xl font-bold">{rejectedRequests.length}</p>
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

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Requests Overview</TabsTrigger>
          <TabsTrigger value="calendar">Leave Calendar</TabsTrigger>
          <TabsTrigger value="balances">Employee Balances</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        {/* Requests Overview */}
        <TabsContent value="overview">
          <div className="space-y-4">
            <div className="flex gap-4">
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
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
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
                    const employee = mockEmployees.find(emp => emp.id === request.employeeId);
                    return (
                      <div key={request.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <Avatar>
                            <AvatarImage src={employee?.avatar} />
                            <AvatarFallback>
                              {request.employeeName.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h4 className="font-medium">{request.employeeName}</h4>
                            <p className="text-sm text-muted-foreground">
                              {employee?.department} • {employee?.position}
                            </p>
                            <p className="text-sm mt-1">
                              <span className="font-medium">
                                {request.type.replace('_', ' ').toUpperCase()}
                              </span>
                              {' • '}
                              {request.startDate} to {request.endDate}
                              {' • '}
                              {request.days} day{request.days > 1 ? 's' : ''}
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
                            <p className="text-xs text-muted-foreground mt-1">
                              Applied: {new Date(request.appliedDate).toLocaleDateString()}
                            </p>
                          </div>
                          {request.status === 'pending' && (
                            <div className="flex gap-1">
                              <Button size="sm" variant="outline" className="text-success hover:text-success">
                                <CheckCircle className="w-4 h-4" />
                              </Button>
                              <Button size="sm" variant="outline" className="text-destructive hover:text-destructive">
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
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Employee</th>
                      <th>Department</th>
                      <th>Annual Leave</th>
                      <th>Sick Leave</th>
                      <th>Emergency Leave</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaveBalances.map((balance) => {
                      const employee = mockEmployees.find(emp => emp.id === balance.employeeId);
                      return (
                        <tr key={balance.employeeId}>
                          <td>
                            <div className="flex items-center gap-2">
                              <Avatar className="w-8 h-8">
                                <AvatarImage src={employee?.avatar} />
                                <AvatarFallback>
                                  {balance.employeeName.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                              <span className="font-medium">{balance.employeeName}</span>
                            </div>
                          </td>
                          <td>{balance.department}</td>
                          <td>
                            <div className="space-y-1">
                              <div className="flex justify-between text-sm">
                                <span>Remaining: {balance.annual.allocated - balance.annual.used - balance.annual.pending}</span>
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Used: {balance.annual.used}/{balance.annual.allocated}
                                {balance.annual.pending > 0 && (
                                  <span className="text-warning"> | Pending: {balance.annual.pending}</span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td>
                            <div className="space-y-1">
                              <div className="flex justify-between text-sm">
                                <span>Remaining: {balance.sick.allocated - balance.sick.used - balance.sick.pending}</span>
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Used: {balance.sick.used}/{balance.sick.allocated}
                                {balance.sick.pending > 0 && (
                                  <span className="text-warning"> | Pending: {balance.sick.pending}</span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td>
                            <div className="space-y-1">
                              <div className="flex justify-between text-sm">
                                <span>Remaining: {balance.emergency.allocated - balance.emergency.used - balance.emergency.pending}</span>
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Used: {balance.emergency.used}/{balance.emergency.allocated}
                                {balance.emergency.pending > 0 && (
                                  <span className="text-warning"> | Pending: {balance.emergency.pending}</span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td>
                            <Button variant="outline" size="sm">
                              View Details
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
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
                <CardTitle>Department Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {['Engineering', 'Human Resources', 'Marketing', 'Finance'].map(dept => {
                    const deptEmployees = mockEmployees.filter(emp => emp.department === dept);
                    const deptRequests = mockLeaveRequests.filter(req => {
                      const emp = mockEmployees.find(e => e.id === req.employeeId);
                      return emp?.department === dept;
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
    </div>
  );
};