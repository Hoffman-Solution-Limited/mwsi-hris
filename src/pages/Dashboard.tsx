import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Users, 
  UserPlus, 
  Calendar, 
  FileText, 
  TrendingUp, 
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  BarChart3,
  User,
  Edit
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { mapRole } from '@/lib/roles';
import { getWorkStation } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useLeave } from '@/contexts/LeaveContext';
import { useToast } from '@/hooks/use-toast';
import { usePerformance } from '@/contexts/PerformanceContext';
import { useEmployees } from '@/contexts/EmployeesContext';
import { useTraining } from '@/contexts/TrainingContext';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { leaveRequests, approveManagerRequest, rejectManagerRequest } = useLeave();
  const { reviews } = usePerformance();
  const navigate = useNavigate();
  const [leaveModalOpen, setLeaveModalOpen] = useState(false);
  const { toast } = useToast();

  // Calculate metrics based on user role
  const canonical = mapRole(user?.role);
  const isEmployee = canonical === 'employee';
  const isManager = canonical === 'manager' || (user?.role === 'registry_manager');
  const isHr = canonical === 'hr';
  const isAdmin = canonical === 'admin';

  if (isAdmin) {
    // Admin-specific metrics
    const { employees } = useEmployees();
    const totalUsers = employees.length;
    const activeUsers = employees.filter(emp => emp.status === 'active').length;
    const inactiveUsers = employees.filter(emp => emp.status !== 'active').length;
  // Use workstation (stationName) when available, fall back to department
  const departments = [...new Set(employees.map(emp => getWorkStation(emp)))];

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">System-wide user overview</p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader><CardTitle>Total Users</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold">{totalUsers}</div></CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Active Users</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold">{activeUsers}</div></CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Inactive Users</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold">{inactiveUsers}</div></CardContent>
          </Card>
        </div>

        {/* Department Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>User Distribution by Department</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {departments.map((dept) => {
                const count = employees.filter(emp => getWorkStation(emp) === dept).length;
                return (
                  <div key={dept} className="p-3 border rounded-lg flex justify-between">
                    <span>{dept}</span>
                    <span className="font-bold">{count}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              className="w-full justify-start bg-blue-600 text-white hover:bg-blue-700"
              onClick={() => navigate('/admin/users')}
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Add New User
            </Button>
            <Button
              className="w-full justify-start bg-red-600 text-white hover:bg-red-700"
              onClick={() => navigate('/admin/users')}
            >
              <XCircle className="w-4 h-4 mr-2" />
              Deactivate User
            </Button>
            <Button
              className="w-full justify-start bg-purple-600 text-white hover:bg-purple-700"
              onClick={() => navigate('/admin/roles')}
            >
              <Edit className="w-4 h-4 mr-2" />
              Manage Roles
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (isEmployee) {
    // Employee-specific metrics
    const myLeaves = leaveRequests.filter(req => req.employeeId === user.id);
  const { trainings } = useTraining();
  const myTrainings = trainings.filter(tr => tr.employeeId === user.id);
  const myReviews = reviews.filter(rev => rev.employeeId === user.id);
    const pendingLeaves = myLeaves.filter(req => req.status === 'pending_manager' || req.status === 'pending_hr').length;
    const approvedLeaves = myLeaves.filter(req => req.status === 'approved').length;
    const completedTrainings = myTrainings.filter(tr => tr.status === 'completed').length;
    const pendingTrainings = myTrainings.filter(tr => tr.status !== 'completed').length;
    const latestReview = myReviews.sort((a, b) => new Date(b.nextReviewDate || '').getTime() - new Date(a.nextReviewDate || '').getTime())[0];
    
    // Calculate leave balance (assuming 25 days annual leave)
    const usedLeaveDays = myLeaves.filter(req => req.status === 'approved').reduce((sum, req) => sum + req.days, 0);
    const leaveBalance = 25 - usedLeaveDays;

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Welcome back, {user.name}</h1>
            <p className="text-muted-foreground">Here's your personal dashboard overview</p>
          </div>
        </div>

        {/* Employee Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Leave Balance</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{leaveBalance}</div>
              <p className="text-xs text-muted-foreground">days remaining</p>
              <Progress value={(leaveBalance / 25) * 100} className="mt-2" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Leaves</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingLeaves}</div>
              <p className="text-xs text-muted-foreground">awaiting approval</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Training Progress</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedTrainings}/{myTrainings.length}</div>
              <p className="text-xs text-muted-foreground">completed courses</p>
              <Progress value={(completedTrainings / (myTrainings.length || 1)) * 100} className="mt-2" />
            </CardContent>
          </Card>

        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                className="w-full justify-start bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 focus:ring-2 focus:ring-blue-400 focus:outline-none"
                variant="default"
                onClick={() => navigate('/manager-apply-leave')}
              >
                <Calendar className="w-4 h-4 mr-2" />
                Apply for Leave
              </Button>
              <Button
                className="w-full justify-start bg-green-600 text-white hover:bg-green-700 active:bg-green-800 focus:ring-2 focus:ring-green-400 focus:outline-none"
                variant="default"
                onClick={() => navigate('/profile')}
              >
                <User className="w-4 h-4 mr-2" />
                View My Profile
              </Button>
              <Button
                className="w-full justify-start bg-purple-600 text-white hover:bg-purple-700 active:bg-purple-800 focus:ring-2 focus:ring-purple-400 focus:outline-none"
                variant="default"
                onClick={() => navigate('/performance')}
              >
                <FileText className="w-4 h-4 mr-2" />
                Performance Review
              </Button>
            </CardContent>
          </Card>
          {/* Leave Modal */}
          <Dialog open={leaveModalOpen} onOpenChange={setLeaveModalOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Apply for Leave</DialogTitle>
              </DialogHeader>
              {/* You can add your leave application form here */}
              <div className="py-4">Leave application form goes here.</div>
              <DialogFooter>
                <Button onClick={() => setLeaveModalOpen(false)}>Close</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Card>
            <CardHeader>
              <CardTitle>Latest Performance Review</CardTitle>
            </CardHeader>
            <CardContent>
              {latestReview ? (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{latestReview.reviewPeriod}</span>
                    <Badge className={`status-${latestReview.status}`}>
                      {latestReview.status}
                    </Badge>
                  </div>
                  {latestReview.score && (
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Overall Score</span>
                        <span>{latestReview.score}/5.0</span>
                      </div>
                      <Progress value={(latestReview.score / 5) * 100} />
                    </div>
                  )}
                  <p className="text-sm text-muted-foreground">{(latestReview as any).feedback ?? 'No feedback provided'}</p>
                </div>
              ) : (
                <p className="text-muted-foreground">No performance reviews yet</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (isManager) {
    // Manager-specific metrics
  const { employees } = useEmployees();
  const myTeam = employees.filter(emp => (emp.managerId && String(emp.managerId) === String(user.id)) || (emp.manager && user?.name && String(emp.manager).toLowerCase() === String(user.name).toLowerCase()));
    const teamLeaves = leaveRequests.filter(req => {
      const employee = employees.find(emp => emp.id === req.employeeId);
      return (employee?.managerId && String(employee.managerId) === String(user.id)) || (employee?.manager && user?.name && String(employee.manager).toLowerCase() === String(user.name).toLowerCase());
    });
    const { reviews } = usePerformance();
    const teamReviews = reviews.filter(review => {
      const employee = employees.find(emp => emp.id === review.employeeId);
      return (employee?.managerId && String(employee.managerId) === String(user.id)) || (employee?.manager && user?.name && String(employee.manager).toLowerCase() === String(user.name).toLowerCase());
    });
    const pendingTeamLeaves = teamLeaves.filter(req => req.status === 'pending_manager' || req.status === 'pending_hr');
    const pendingTeamReviews = teamReviews.filter(review => review.status === 'targets_set');

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Manager Dashboard</h1>
            <p className="text-muted-foreground">Manage your team of {myTeam.length} employees</p>
          </div>
        </div>

        {/* Manager Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Team Size</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{myTeam.length}</div>
              <p className="text-xs text-muted-foreground">employees</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Leave Requests</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingTeamLeaves.length}</div>
              <p className="text-xs text-muted-foreground">awaiting approval</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Performance Reviews</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingTeamReviews.length}</div>
              <p className="text-xs text-muted-foreground">awaiting review</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Team Performance</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {teamReviews.filter(r => r.overallScore).length > 0 
                  ? (teamReviews.reduce((sum, r) => sum + (r.overallScore || 0), 0) / teamReviews.filter(r => r.overallScore).length).toFixed(1)
                  : '0.0'
                }
              </div>
              <p className="text-xs text-muted-foreground">average score</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Team Leave Requests</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {pendingTeamLeaves.slice(0, 3).map((leave) => (
                <div key={leave.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">{leave.employeeName}</p>
                    <p className="text-xs text-muted-foreground">
                      {leave.type} • {leave.startDate} to {leave.endDate}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-success hover:text-success"
                      onClick={() => {
                        approveManagerRequest(leave.id);
                        toast({ title: 'Leave forwarded to HR', description: `${leave.employeeName}'s ${leave.type} request moved to HR review.` });
                      }}
                    >
                      <CheckCircle className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-destructive hover:text-destructive"
                      onClick={() => {
                        rejectManagerRequest(leave.id);
                        toast({ title: 'Leave rejected', description: `${leave.employeeName}'s ${leave.type} request has been rejected.`, variant: 'destructive' as any });
                      }}
                    >
                      <XCircle className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
              {pendingTeamLeaves.length === 0 && (
                <p className="text-muted-foreground text-sm">No pending leave requests</p>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Performance Reviews</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {pendingTeamReviews.slice(0, 3).map((review) => (
                <div key={review.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">{review.employeeName}</p>
                    <p className="text-xs text-muted-foreground">{review.reviewPeriod}</p>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => navigate('/performance')}>
                    <Edit className="w-4 h-4 mr-2" />
                    Review
                  </Button>
                </div>
              ))}
              {pendingTeamReviews.length === 0 && (
                <p className="text-muted-foreground text-sm">No pending reviews</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Team Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Team Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {myTeam.map((employee) => {
                const empLeaves = teamLeaves.filter(l => l.employeeId === employee.id);
                const empReviews = teamReviews.filter(r => r.employeeId === employee.id);
                const latestReview = empReviews.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
                
                return (
                  <div key={employee.id} className="p-4 border rounded-lg">
                    <div className="flex items-center gap-3 mb-3">
                      <Avatar>
                        <AvatarImage src={employee.avatar} />
                        <AvatarFallback>
                          {employee.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-medium">{employee.name}</h4>
                        <p className="text-sm text-muted-foreground">{employee.position}</p>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Leave Requests:</span>
                              <span>{empLeaves.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Performance Score:</span>
                              <span>{latestReview?.overallScore ? latestReview.overallScore.toFixed(1) : 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Status:</span>
                        <Badge variant={employee.status === 'active' ? 'default' : 'secondary'}>
                          {employee.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // HR/Admin view - existing dashboard
  const { employees } = useEmployees();
  const totalEmployees = employees.length;
  const activeEmployees = employees.filter(emp => emp.status === 'active').length;
  const pendingLeaves = leaveRequests.filter(req => req.status === 'pending_manager' || req.status === 'pending_hr').length;
  // openPositions: positions API not available yet; default to 0
  const openPositions = 0;
  const { trainings } = useTraining();
  const completedTrainings = trainings.filter(tr => tr.status === 'completed').length;
  const pendingReviews = reviews.filter(pr => pr.status === 'hr_review').length;

  const quickStats = [
    {
      title: 'Total Employees',
      value: totalEmployees,
      icon: <Users className="w-6 h-6 text-primary" />,
      change: '+2 this month',
      trend: 'up'
    },
    {
      title: 'Pending Leave Requests',
      value: pendingLeaves,
      icon: <Calendar className="w-6 h-6 text-warning" />,
      change: '3 awaiting approval',
      trend: 'neutral'
    },
    {
      title: 'Open Positions',
      value: openPositions,
      icon: <UserPlus className="w-6 h-6 text-success" />,
      change: '24 applications received',
      trend: 'up'
    },
  ];

  // Helper to export employees as CSV
  const exportEmployees = () => {
    try {
      const headers = ['ID', 'Name', 'Email', 'Department', 'Position', 'Status', 'Manager'];
      const rows = employees.map(emp => [
        emp.id,
        '"' + (emp.name || '') + '"',
        emp.email || '',
        emp.department || '',
        emp.position || '',
        emp.status || '',
        emp.manager || ''
      ]);

      const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', 'employees.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast({ title: 'Export started', description: 'employees.csv is downloading' });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Export failed', err);
      toast({ title: 'Export failed', description: 'Unable to export employees', variant: 'destructive' as any });
    }
  };

  // HR Insights helpers
  const parseDate = (d?: string) => d ? new Date(d) : null;
  const daysBetween = (a: Date, b: Date) => Math.ceil((+b - +a) / (1000 * 60 * 60 * 24));

  const recentHires = employees
    .filter(e => {
      const hd = parseDate(e.hireDate);
      if (!hd) return false;
      return daysBetween(hd, new Date()) <= 90; // hired within last 90 days
    })
    .sort((a, b) => (parseDate(b.hireDate)?.getTime() ?? 0) - (parseDate(a.hireDate)?.getTime() ?? 0))
    .slice(0, 5);

  const upcomingBirthdays = employees
    .map(e => ({ ...e, dob: parseDate(e.dateOfBirth) }))
    .filter(e => e.dob)
    .map(e => {
      const now = new Date();
      const thisYearBirthday = new Date((e.dob as Date).getTime());
      thisYearBirthday.setFullYear(now.getFullYear());
      let diff = daysBetween(now, thisYearBirthday);
      // if already passed, check next year
      if (diff < 0) {
        thisYearBirthday.setFullYear(now.getFullYear() + 1);
        diff = daysBetween(now, thisYearBirthday);
      }
      return { ...e, daysUntilBirthday: diff, birthdayDate: thisYearBirthday };
    })
    .filter(e => e.daysUntilBirthday >= 0 && e.daysUntilBirthday <= 30)
    .sort((a, b) => a.daysUntilBirthday - b.daysUntilBirthday)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          Welcome back, {user?.name}
        </h1>
        <p className="text-muted-foreground">
          Here's what's happening in your HR system today
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {quickStats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold mt-1">{stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {stat.change}
                  </p>
                </div>
                <div className="bg-muted/50 p-3 rounded-lg">
                  {stat.icon}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>



      {/* Department Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Training Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Completed Trainings</span>
                  <span>{completedTrainings}/{trainings.length}</span>
                  </div>
                  <Progress value={(completedTrainings / (trainings.length || 1)) * 100} />
              </div>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-success">{completedTrainings}</p>
                  <p className="text-xs text-muted-foreground">Completed</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-warning">
                    {trainings.filter(tr => tr.status === 'in_progress').length}
                  </p>
                  <p className="text-xs text-muted-foreground">In Progress</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Department Stats
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {['Engineering', 'Human Resources', 'Marketing', 'Finance'].map(dept => {
                const count = employees.filter(emp => emp.department === dept).length;
                return (
                  <div key={dept} className="flex justify-between items-center">
                    <span className="text-sm font-medium">{dept}</span>
                    <Badge variant="outline">{count} employees</Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Alerts & Reminders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="p-3 bg-warning/10 border border-warning/20 rounded-lg">
                <p className="font-medium text-sm text-warning">Reminder</p>
                <p className="text-xs">{pendingReviews} performance reviews due</p>
              </div>
              <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg">
                <p className="font-medium text-sm text-primary">Info</p>
                <p className="text-xs">Training compliance report ready</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* HR Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>HR Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              className="w-full justify-start bg-blue-600 text-white hover:bg-blue-700"
              onClick={() => navigate('/hr/leave-requests')}
            >
              <Calendar className="w-4 h-4 mr-2" />
              Approve Leaves
            </Button>

            <Button
              className="w-full justify-start bg-green-600 text-white hover:bg-green-700"
              onClick={() => navigate('/recruitment')}
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Manage Recruitment
            </Button>

            <Button
              className="w-full justify-start bg-indigo-600 text-white hover:bg-indigo-700"
              onClick={() => navigate('/recruitment/post-job')}
            >
              <FileText className="w-4 h-4 mr-2" />
              Post Job
            </Button>

            <Button
              className="w-full justify-start bg-neutral-600 text-white hover:bg-neutral-700"
              onClick={() => exportEmployees()}
            >
              <Users className="w-4 h-4 mr-2" />
              Export Employees (CSV)
            </Button>

            <Button
              className="w-full justify-start bg-amber-600 text-white hover:bg-amber-700"
              onClick={() => navigate('/reports')}
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Generate Reports
            </Button>

            <Button
              className="w-full justify-start bg-purple-600 text-white hover:bg-purple-700"
              onClick={() => navigate('/training')}
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Manage Trainings
            </Button>
          </CardContent>
        </Card>
        {/* HR Insights: placed beside quick actions to fill empty space */}
        <Card>
          <CardHeader>
            <CardTitle>HR Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium">Recent Hires (last 90 days)</p>
                {recentHires.length > 0 ? (
                  <div className="mt-2 space-y-2">
                    {recentHires.map(h => (
                      <div key={h.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={h.avatar} />
                            <AvatarFallback>{h.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium text-sm">{h.name}</div>
                            <div className="text-xs text-muted-foreground">{h.position}</div>
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground">{h.hireDate}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">No recent hires</p>
                )}
              </div>

              <div>
                <p className="text-sm font-medium">Upcoming Birthdays (30 days)</p>
                {upcomingBirthdays.length > 0 ? (
                  <div className="mt-2 space-y-2">
                    {upcomingBirthdays.map(b => (
                      <div key={b.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={b.avatar} />
                            <AvatarFallback>{b.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium text-sm">{b.name}</div>
                            <div className="text-xs text-muted-foreground">{b.position}</div>
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground">in {b.daysUntilBirthday} days</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">No birthdays coming up</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};