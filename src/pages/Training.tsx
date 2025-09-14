import React, { useState } from 'react';
import { Plus, Search, Filter, GraduationCap, Clock, CheckCircle, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { mockTrainingRecords, mockEmployees } from '@/data/mockData';

export const Training: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');

  const completedTrainings = mockTrainingRecords.filter(tr => tr.status === 'completed');
  const inProgressTrainings = mockTrainingRecords.filter(tr => tr.status === 'in_progress');
  const notStartedTrainings = mockTrainingRecords.filter(tr => tr.status === 'not_started');

  // Mock training programs
  const trainingPrograms = [
    {
      id: '1',
      title: 'Cybersecurity Awareness Training',
      type: 'mandatory',
      duration: '2 hours',
      provider: 'CyberSafe Institute',
      enrolled: 15,
      completed: 12,
      expiryMonths: 12,
      description: 'Essential cybersecurity practices and awareness training for all employees.'
    },
    {
      id: '2',
      title: 'Leadership Development Program',
      type: 'development',
      duration: '40 hours',
      provider: 'Management Excellence Academy',
      enrolled: 8,
      completed: 3,
      description: 'Comprehensive leadership skills development for managers and senior staff.'
    },
    {
      id: '3',
      title: 'React Advanced Patterns',
      type: 'development',
      duration: '16 hours',
      provider: 'Tech Learning Hub',
      enrolled: 5,
      completed: 4,
      description: 'Advanced React.js patterns and best practices for developers.'
    },
    {
      id: '4',
      title: 'Data Protection & GDPR Compliance',
      type: 'compliance',
      duration: '3 hours',
      provider: 'Legal Compliance Corp',
      enrolled: 20,
      completed: 18,
      expiryMonths: 24,
      description: 'Understanding data protection regulations and compliance requirements.'
    }
  ];

  // Mock compliance dashboard
  const complianceData = [
    {
      requirement: 'Cybersecurity Training',
      totalEmployees: mockEmployees.length,
      compliant: 12,
      expiringSoon: 2,
      overdue: 1
    },
    {
      requirement: 'Data Protection Training',
      totalEmployees: mockEmployees.length,
      compliant: 18,
      expiringSoon: 0,
      overdue: 0
    },
    {
      requirement: 'Health & Safety Training',
      totalEmployees: mockEmployees.length,
      compliant: 15,
      expiringSoon: 3,
      overdue: 2
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold mb-2">Training & CPD Management</h1>
          <p className="text-muted-foreground">
            Manage employee training programs and continuing professional development
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            Add Training Program
          </Button>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Enroll Employee
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="bg-success/10 p-3 rounded-lg">
                <CheckCircle className="w-6 h-6 text-success" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold">{completedTrainings.length}</p>
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
                <p className="text-sm font-medium text-muted-foreground">In Progress</p>
                <p className="text-2xl font-bold">{inProgressTrainings.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="bg-primary/10 p-3 rounded-lg">
                <GraduationCap className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Available Programs</p>
                <p className="text-2xl font-bold">{trainingPrograms.length}</p>
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
                <p className="text-sm font-medium text-muted-foreground">Expiring Soon</p>
                <p className="text-2xl font-bold">5</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="programs">Training Programs</TabsTrigger>
          <TabsTrigger value="records">Employee Records</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
        </TabsList>

        {/* Overview */}
        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Training Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockTrainingRecords.slice(0, 5).map((training) => {
                    const employee = mockEmployees.find(emp => emp.id === training.employeeId);
                    return (
                      <div key={training.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="bg-primary/10 p-2 rounded">
                            <GraduationCap className="w-4 h-4 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">{training.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {employee?.name} • {training.provider}
                            </p>
                          </div>
                        </div>
                        <Badge className={`status-${training.status === 'completed' ? 'approved' : training.status === 'in_progress' ? 'pending' : 'draft'}`}>
                          {training.status.replace('_', ' ')}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Training Progress by Department</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {['Engineering', 'Human Resources', 'Marketing', 'Finance'].map(dept => {
                    const deptEmployees = mockEmployees.filter(emp => emp.department === dept);
                    const completionRate = Math.floor(Math.random() * 40) + 60;
                    return (
                      <div key={dept}>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="font-medium">{dept}</span>
                          <span>{completionRate}%</span>
                        </div>
                        <Progress value={completionRate} className="h-2" />
                        <p className="text-xs text-muted-foreground mt-1">
                          {deptEmployees.length} employees
                        </p>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Training Programs */}
        <TabsContent value="programs">
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search training programs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="outline">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
            </div>

            <div className="grid gap-4">
              {trainingPrograms.map((program) => (
                <Card key={program.id}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-xl font-semibold">{program.title}</h3>
                          <Badge variant={
                            program.type === 'mandatory' ? 'destructive' : 
                            program.type === 'compliance' ? 'default' : 'secondary'
                          }>
                            {program.type}
                          </Badge>
                        </div>
                        <p className="text-muted-foreground mb-4">{program.description}</p>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                          <div>
                            <p className="font-medium text-muted-foreground">Duration</p>
                            <p>{program.duration}</p>
                          </div>
                          <div>
                            <p className="font-medium text-muted-foreground">Provider</p>
                            <p>{program.provider}</p>
                          </div>
                          <div>
                            <p className="font-medium text-muted-foreground">Enrolled</p>
                            <p className="font-bold text-primary">{program.enrolled}</p>
                          </div>
                          <div>
                            <p className="font-medium text-muted-foreground">Completed</p>
                            <p className="font-bold text-success">{program.completed}</p>
                          </div>
                        </div>

                        <div className="mb-4">
                          <div className="flex justify-between text-sm mb-2">
                            <span>Completion Rate</span>
                            <span>{Math.round((program.completed / program.enrolled) * 100)}%</span>
                          </div>
                          <Progress value={(program.completed / program.enrolled) * 100} />
                        </div>

                        {program.expiryMonths && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="w-4 h-4" />
                            <span>Certification valid for {program.expiryMonths} months</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex flex-col gap-2">
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                        <Button variant="outline" size="sm">
                          Enroll Users
                        </Button>
                        <Button variant="outline" size="sm">
                          Edit Program
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Employee Records */}
        <TabsContent value="records">
          <Card>
            <CardHeader>
              <CardTitle>Individual Training Records</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockTrainingRecords.map((training) => {
                  const employee = mockEmployees.find(emp => emp.id === training.employeeId);
                  return (
                    <div key={training.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="bg-primary/10 p-2 rounded">
                          <GraduationCap className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-medium">{training.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            {employee?.name} • {employee?.department}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Provider: {training.provider}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={`status-${training.status === 'completed' ? 'approved' : training.status === 'in_progress' ? 'pending' : 'draft'}`}>
                          {training.status.replace('_', ' ')}
                        </Badge>
                        {training.completionDate && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Completed: {new Date(training.completionDate).toLocaleDateString()}
                          </p>
                        )}
                        {training.expiryDate && (
                          <p className="text-xs text-muted-foreground">
                            Expires: {new Date(training.expiryDate).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Compliance */}
        <TabsContent value="compliance">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Compliance Dashboard</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {complianceData.map((item, index) => (
                    <div key={index}>
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-medium">{item.requirement}</h4>
                        <span className="text-sm font-medium">
                          {item.compliant}/{item.totalEmployees} compliant
                        </span>
                      </div>
                      <Progress value={(item.compliant / item.totalEmployees) * 100} className="mb-2" />
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>{Math.round((item.compliant / item.totalEmployees) * 100)}% compliance rate</span>
                        <div className="flex gap-4">
                          {item.expiringSoon > 0 && (
                            <span className="text-warning">{item.expiringSoon} expiring soon</span>
                          )}
                          {item.overdue > 0 && (
                            <span className="text-destructive">{item.overdue} overdue</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Upcoming Expiries</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {mockTrainingRecords
                      .filter(tr => tr.expiryDate)
                      .slice(0, 5)
                      .map((training) => {
                        const employee = mockEmployees.find(emp => emp.id === training.employeeId);
                        return (
                          <div key={training.id} className="flex justify-between items-center p-3 bg-warning/10 rounded-lg">
                            <div>
                              <p className="font-medium text-sm">{training.title}</p>
                              <p className="text-xs text-muted-foreground">{employee?.name}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium text-warning">
                                {training.expiryDate && new Date(training.expiryDate).toLocaleDateString()}
                              </p>
                              <p className="text-xs text-muted-foreground">30 days</p>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Overdue Trainings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-destructive/10 rounded-lg">
                      <div>
                        <p className="font-medium text-sm">Cybersecurity Awareness Training</p>
                        <p className="text-xs text-muted-foreground">John Smith</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-destructive">Overdue</p>
                        <p className="text-xs text-muted-foreground">15 days</p>
                      </div>
                    </div>
                    <div className="text-center py-8 text-muted-foreground">
                      <CheckCircle className="w-12 h-12 mx-auto mb-2" />
                      <p>All other trainings are up to date</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};