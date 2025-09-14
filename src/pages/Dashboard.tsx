import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Users, 
  UserPlus, 
  Calendar, 
  FileText, 
  TrendingUp, 
  Clock,
  CheckCircle,
  AlertCircle,
  BarChart3
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import {
  mockEmployees,
  mockLeaveRequests,
  mockDocuments,
  mockPositions,
  mockTrainingRecords,
  mockPerformanceReviews
} from '@/data/mockData';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();

  // Calculate statistics
  const totalEmployees = mockEmployees.length;
  const activeEmployees = mockEmployees.filter(emp => emp.status === 'active').length;
  const pendingLeaves = mockLeaveRequests.filter(req => req.status === 'pending').length;
  const pendingDocuments = mockDocuments.filter(doc => doc.status === 'pending').length;
  const openPositions = mockPositions.filter(pos => pos.status === 'open').length;
  const completedTrainings = mockTrainingRecords.filter(tr => tr.status === 'completed').length;
  const pendingReviews = mockPerformanceReviews.filter(pr => pr.status === 'in_review').length;

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
    {
      title: 'Pending Documents',
      value: pendingDocuments,
      icon: <FileText className="w-6 h-6 text-destructive" />,
      change: 'Require attention',
      trend: 'down'
    }
  ];

  const recentActivities = [
    {
      id: 1,
      action: 'Leave request submitted',
      user: 'Michael Davis',
      time: '2 hours ago',
      status: 'pending'
    },
    {
      id: 2,
      action: 'Training certificate uploaded',
      user: 'Emily Chen',
      time: '4 hours ago',
      status: 'completed'
    },
    {
      id: 3,
      action: 'Performance review completed',
      user: 'Sarah Johnson',
      time: '1 day ago',
      status: 'completed'
    },
    {
      id: 4,
      action: 'New position posted',
      user: 'HR Department',
      time: '2 days ago',
      status: 'active'
    }
  ];

  const upcomingTasks = [
    { task: 'Review Q1 performance evaluations', due: 'Today', priority: 'high' },
    { task: 'Approve pending leave requests', due: 'Tomorrow', priority: 'medium' },
    { task: 'Update employee handbook', due: 'This week', priority: 'low' },
    { task: 'Conduct new hire orientation', due: 'Friday', priority: 'high' }
  ];

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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Recent Activities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{activity.action}</p>
                    <p className="text-xs text-muted-foreground">by {activity.user}</p>
                  </div>
                  <div className="text-right">
                    <Badge
                      variant={
                        activity.status === 'completed' ? 'default' :
                        activity.status === 'pending' ? 'secondary' : 'outline'
                      }
                      className="mb-1"
                    >
                      {activity.status}
                    </Badge>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4">
              View All Activities
            </Button>
          </CardContent>
        </Card>

        {/* Upcoming Tasks */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              Upcoming Tasks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingTasks.map((task, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{task.task}</p>
                    <p className="text-xs text-muted-foreground">Due: {task.due}</p>
                  </div>
                  <Badge
                    variant={
                      task.priority === 'high' ? 'destructive' :
                      task.priority === 'medium' ? 'default' : 'secondary'
                    }
                  >
                    {task.priority}
                  </Badge>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4">
              View All Tasks
            </Button>
          </CardContent>
        </Card>
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
                  <span>{completedTrainings}/{mockTrainingRecords.length}</span>
                </div>
                <Progress value={(completedTrainings / mockTrainingRecords.length) * 100} />
              </div>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-success">{completedTrainings}</p>
                  <p className="text-xs text-muted-foreground">Completed</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-warning">
                    {mockTrainingRecords.filter(tr => tr.status === 'in_progress').length}
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
                const count = mockEmployees.filter(emp => emp.department === dept).length;
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
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                <p className="font-medium text-sm text-destructive">Urgent</p>
                <p className="text-xs">{pendingDocuments} documents need approval</p>
              </div>
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
    </div>
  );
};