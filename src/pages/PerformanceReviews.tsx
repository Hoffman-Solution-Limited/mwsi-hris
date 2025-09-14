import React, { useState } from 'react';
import { Plus, Search, Filter, TrendingUp, Star, Calendar, Eye, Clock, CheckCircle, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { mockPerformanceReviews, mockEmployees } from '@/data/mockData';
import { useAuth } from '@/contexts/AuthContext';

export const PerformanceReviews: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Filter reviews based on user role
  const baseReviews = user?.role === 'employee' 
    ? mockPerformanceReviews.filter(review => review.employeeId === user.id)
    : user?.role === 'manager'
    ? mockPerformanceReviews.filter(review => {
        const employee = mockEmployees.find(emp => emp.id === review.employeeId);
        return employee?.manager === user.name;
      })
    : mockPerformanceReviews;
    
  // Calculate manager-specific metrics
  const reviewsToConduct = user?.role === 'manager' 
    ? mockPerformanceReviews.filter(review => {
        const employee = mockEmployees.find(emp => emp.id === review.employeeId);
        return employee?.manager === user.name && review.status === 'draft';
      })
    : [];
    
  const myTeamSize = user?.role === 'manager' 
    ? mockEmployees.filter(emp => emp.manager === user.name).length
    : 0;

  const completedReviews = mockPerformanceReviews.filter(review => review.status === 'completed');
  const inReviewReviews = mockPerformanceReviews.filter(review => review.status === 'in_review');
  const draftReviews = mockPerformanceReviews.filter(review => review.status === 'draft');

  // Generate additional review data for demonstration
  const allReviews = [
    ...mockPerformanceReviews,
    // Add some additional mock reviews
    {
      id: '3',
      employeeId: '1',
      employeeName: 'John Smith',
      reviewPeriod: 'Q1 2024',
      status: 'draft' as const,
      score: undefined,
      goals: ['Improve system architecture', 'Lead security initiatives', 'Mentor team members'],
      feedback: 'Strong technical leadership and system design skills.',
      nextReviewDate: '2024-06-30'
    },
    {
      id: '4',
      employeeId: '5',
      employeeName: 'Robert Wilson',
      reviewPeriod: 'Q1 2024',
      status: 'completed' as const,
      score: 4.2,
      goals: ['Streamline financial processes', 'Implement new reporting tools', 'Budget optimization'],
      feedback: 'Excellent financial management and process improvement initiatives.',
      nextReviewDate: '2024-06-30'
    }
  ];

  const filteredReviews = allReviews.filter(review => {
    const matchesSearch = review.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         review.reviewPeriod.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || review.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Performance metrics
  const performanceMetrics = {
    avgScore: completedReviews.reduce((sum, review) => sum + (review.score || 0), 0) / completedReviews.length,
    completionRate: (completedReviews.length / allReviews.length) * 100,
    overdue: 2, // Mock data
    upcoming: 3 // Mock data
  };

  // Department performance data
  const departmentPerformance = ['Engineering', 'Human Resources', 'Marketing', 'Finance'].map(dept => {
    const deptEmployees = mockEmployees.filter(emp => emp.department === dept);
    const deptReviews = completedReviews.filter(review => {
      const employee = mockEmployees.find(emp => emp.name === review.employeeName);
      return employee?.department === dept;
    });
    const avgScore = deptReviews.length > 0 
      ? deptReviews.reduce((sum, review) => sum + (review.score || 0), 0) / deptReviews.length 
      : 0;

    return {
      department: dept,
      employeeCount: deptEmployees.length,
      avgScore: avgScore,
      reviewsCompleted: deptReviews.length
    };
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold mb-2">
            {user?.role === 'employee' ? 'My Performance Reviews' : 'Performance Reviews'}
          </h1>
          <p className="text-muted-foreground">
            {user?.role === 'employee' 
              ? 'View your performance history and feedback'
              : user?.role === 'manager'
              ? `Manage reviews for your team of ${myTeamSize} employees`
              : 'Manage employee performance evaluations and development plans'
            }
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Calendar className="w-4 h-4 mr-2" />
            Schedule Reviews
          </Button>
          {user?.role !== 'employee' && (
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Review
            </Button>
          )}
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="bg-success/10 p-3 rounded-lg">
                <TrendingUp className="w-6 h-6 text-success" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Average Score</p>
                <p className="text-2xl font-bold">
                  {performanceMetrics.avgScore.toFixed(1)}/5.0
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="bg-primary/10 p-3 rounded-lg">
                <Star className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completion Rate</p>
                <p className="text-2xl font-bold">
                  {Math.round(performanceMetrics.completionRate)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="bg-warning/10 p-3 rounded-lg">
                <Calendar className="w-6 h-6 text-warning" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Due This Week</p>
                <p className="text-2xl font-bold">{performanceMetrics.upcoming}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="bg-destructive/10 p-3 rounded-lg">
                <Calendar className="w-6 h-6 text-destructive" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Overdue</p>
                <p className="text-2xl font-bold">{performanceMetrics.overdue}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Review Overview</TabsTrigger>
          <TabsTrigger value="analytics">Performance Analytics</TabsTrigger>
          <TabsTrigger value="goals">Goals & Development</TabsTrigger>
          <TabsTrigger value="templates">Review Templates</TabsTrigger>
        </TabsList>

        {/* Review Overview */}
        <TabsContent value="overview">
          <div className="space-y-4">
            <div className="flex gap-4">
              <Input
                placeholder="Search reviews by employee or period..."
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
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="in_review">In Review</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Performance Reviews</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredReviews.map((review) => {
                    const employee = mockEmployees.find(emp => emp.name === review.employeeName);
                    return (
                      <div key={review.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <Avatar>
                            <AvatarImage src={employee?.avatar} />
                            <AvatarFallback>
                              {review.employeeName.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium">{review.employeeName}</h4>
                              <Badge className={`status-${review.status === 'completed' ? 'approved' : review.status === 'in_review' ? 'pending' : 'draft'}`}>
                                {review.status.replace('_', ' ')}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-1">
                              {employee?.department} • {employee?.position}
                            </p>
                            <p className="text-sm">
                              <span className="font-medium">Review Period:</span> {review.reviewPeriod}
                            </p>
                            {review.score && (
                              <div className="flex items-center gap-2 mt-2">
                                <Star className="w-4 h-4 text-warning fill-current" />
                                <span className="text-sm font-medium">{review.score}/5.0</span>
                                <Progress value={(review.score / 5) * 100} className="w-24 h-2" />
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="text-right text-xs text-muted-foreground">
                            <p>Next Review:</p>
                            <p>{new Date(review.nextReviewDate).toLocaleDateString()}</p>
                          </div>
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4 mr-2" />
                            View
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Performance Analytics */}
        <TabsContent value="analytics">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Department Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {departmentPerformance.map(dept => (
                    <div key={dept.department} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">{dept.department}</p>
                          <p className="text-sm text-muted-foreground">
                            {dept.reviewsCompleted}/{dept.employeeCount} reviews completed
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold">{dept.avgScore.toFixed(1)}/5.0</p>
                          <div className="flex items-center gap-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3 h-3 ${i < Math.round(dept.avgScore) 
                                  ? 'text-warning fill-current' 
                                  : 'text-muted-foreground'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                      <Progress value={(dept.avgScore / 5) * 100} />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="p-4 bg-success/10 rounded-lg">
                      <p className="text-2xl font-bold text-success">85%</p>
                      <p className="text-sm text-muted-foreground">Met Objectives</p>
                    </div>
                    <div className="p-4 bg-primary/10 rounded-lg">
                      <p className="text-2xl font-bold text-primary">92%</p>
                      <p className="text-sm text-muted-foreground">On-Time Reviews</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Exceeds Expectations</span>
                        <span>25%</span>
                      </div>
                      <Progress value={25} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Meets Expectations</span>
                        <span>60%</span>
                      </div>
                      <Progress value={60} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Below Expectations</span>
                        <span>15%</span>
                      </div>
                      <Progress value={15} className="h-2" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Top Performers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {completedReviews
                    .sort((a, b) => (b.score || 0) - (a.score || 0))
                    .slice(0, 3)
                    .map(review => {
                      const employee = mockEmployees.find(emp => emp.name === review.employeeName);
                      return (
                        <div key={review.id} className="p-4 border rounded-lg text-center">
                          <Avatar className="w-16 h-16 mx-auto mb-3">
                            <AvatarImage src={employee?.avatar} />
                            <AvatarFallback>
                              {review.employeeName.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <h4 className="font-medium mb-1">{review.employeeName}</h4>
                          <p className="text-sm text-muted-foreground mb-2">{employee?.department}</p>
                          <div className="flex items-center justify-center gap-1 mb-2">
                            <Star className="w-4 h-4 text-warning fill-current" />
                            <span className="font-bold">{review.score}/5.0</span>
                          </div>
                          <p className="text-xs text-muted-foreground">{review.reviewPeriod}</p>
                        </div>
                      );
                    })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Goals & Development */}
        <TabsContent value="goals">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Development Goals</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {allReviews.flatMap(review => 
                    review.goals.map((goal, index) => ({
                      id: `${review.id}-${index}`,
                      employeeName: review.employeeName,
                      goal,
                      department: mockEmployees.find(emp => emp.name === review.employeeName)?.department,
                      progress: Math.floor(Math.random() * 100)
                    }))
                  ).slice(0, 8).map(item => (
                    <div key={item.id} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-medium text-sm">{item.goal}</p>
                          <p className="text-xs text-muted-foreground">
                            {item.employeeName} • {item.department}
                          </p>
                        </div>
                        <Badge variant="outline">{item.progress}%</Badge>
                      </div>
                      <Progress value={item.progress} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Development Areas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { area: 'Leadership Skills', employees: 8, priority: 'high' },
                    { area: 'Technical Expertise', employees: 12, priority: 'medium' },
                    { area: 'Communication', employees: 5, priority: 'medium' },
                    { area: 'Project Management', employees: 7, priority: 'high' },
                    { area: 'Customer Service', employees: 3, priority: 'low' },
                  ].map(area => (
                    <div key={area.area} className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                      <div>
                        <p className="font-medium">{area.area}</p>
                        <p className="text-sm text-muted-foreground">
                          {area.employees} employees need development
                        </p>
                      </div>
                      <Badge variant={
                        area.priority === 'high' ? 'destructive' :
                        area.priority === 'medium' ? 'default' : 'secondary'
                      }>
                        {area.priority} priority
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Review Templates */}
        <TabsContent value="templates">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Review Templates</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      name: 'Annual Performance Review',
                      description: 'Comprehensive yearly evaluation template',
                      sections: ['Goals & Objectives', 'Core Competencies', 'Development Areas', 'Achievements'],
                      usage: 15
                    },
                    {
                      name: 'Quarterly Check-in',
                      description: 'Shorter quarterly progress review',
                      sections: ['Goal Progress', 'Challenges', 'Support Needed', 'Next Steps'],
                      usage: 28
                    },
                    {
                      name: 'Probation Review',
                      description: 'Template for new employee evaluations',
                      sections: ['Integration', 'Skill Assessment', 'Performance', 'Recommendations'],
                      usage: 5
                    },
                    {
                      name: '360-Degree Feedback',
                      description: 'Multi-source feedback collection',
                      sections: ['Self Assessment', 'Peer Feedback', 'Manager Review', 'Development Plan'],
                      usage: 8
                    }
                  ].map(template => (
                    <div key={template.name} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-medium">{template.name}</h4>
                          <p className="text-sm text-muted-foreground mb-2">{template.description}</p>
                        </div>
                        <Badge variant="outline">{template.usage} uses</Badge>
                      </div>
                      <div className="mb-3">
                        <p className="text-xs font-medium text-muted-foreground mb-1">Sections:</p>
                        <div className="flex flex-wrap gap-1">
                          {template.sections.map(section => (
                            <Badge key={section} variant="secondary" className="text-xs">
                              {section}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">Preview</Button>
                        <Button variant="outline" size="sm">Use Template</Button>
                        <Button variant="outline" size="sm">Edit</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Create New Template</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Template Name</label>
                    <Input placeholder="Enter template name..." className="mt-1" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Description</label>
                    <Input placeholder="Brief description..." className="mt-1" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Review Type</label>
                    <Select>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select review type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="annual">Annual Review</SelectItem>
                        <SelectItem value="quarterly">Quarterly Review</SelectItem>
                        <SelectItem value="probation">Probation Review</SelectItem>
                        <SelectItem value="project">Project Review</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="pt-4">
                    <Button className="w-full">Create Template</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};