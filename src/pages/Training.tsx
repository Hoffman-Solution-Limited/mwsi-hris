import React, { useMemo, useState } from 'react';
import { Plus, Search, Filter, GraduationCap, Clock, CheckCircle, Calendar, Upload, Users } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { mockTrainingRecords, mockEmployees } from '@/data/mockData';
import { useAuth } from '@/contexts/AuthContext';
import { mapRole } from '@/lib/roles';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { useTraining } from '@/contexts/TrainingContext';

export const Training: React.FC = () => {
  const { user } = useAuth();
  const { trainings, startTraining, completeTraining } = useTraining();
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [completeOpen, setCompleteOpen] = useState(false);
  const [selectedTrainingId, setSelectedTrainingId] = useState<string | null>(null);
  const [certificateFile, setCertificateFile] = useState<File | null>(null);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<any>(null);
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);

  const filteredRecords = useMemo(() => {
    if (!user) return [] as typeof mockTrainingRecords;
    const source = trainings.length ? trainings : mockTrainingRecords;
    const canonical = mapRole(user.role);
    if (canonical === 'employee' || canonical === 'manager') {
      return source.filter(tr => tr.employeeId === user.id);
    }
    // HR sees all records but doesn't get assigned trainings themselves
    if (canonical === 'hr') {
      return source.filter(tr => tr.employeeId !== user.id);
    }
    return source;
  }, [user, trainings]);

  const completedTrainings = filteredRecords.filter(tr => tr.status === 'completed');
  const inProgressTrainings = filteredRecords.filter(tr => tr.status === 'in_progress');
  const notStartedTrainings = filteredRecords.filter(tr => tr.status === 'not_started');

  // Function to handle employee assignment
  const handleAssignTraining = () => {
    if (!selectedProgram || selectedEmployees.length === 0) return;
    
    selectedEmployees.forEach(employeeId => {
      // In a real app, this would call an API to create training records
      console.log(`Assigned training ${selectedProgram.title} to employee ${employeeId}`);
    });
    
    // Reset state
    setAssignDialogOpen(false);
    setSelectedProgram(null);
    setSelectedEmployees([]);
  };

  const handleSelectAllEmployees = (checked: boolean) => {
    if (checked) {
      const allEmployeeIds = mockEmployees
        .filter(emp => !['hr_manager', 'hr_staff'].includes(emp.position.toLowerCase()))
        .map(emp => emp.id);
      setSelectedEmployees(allEmployeeIds);
    } else {
      setSelectedEmployees([]);
    }
  };

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
          <h1 className="text-3xl font-bold mb-2">Training & CPD</h1>
          <p className="text-muted-foreground">
            {(user?.role === 'employee' || user?.role === 'manager') ? 'Your assigned trainings and completions' : 'Manage training programs and compliance'}
          </p>
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
        <TabsList className="grid w-full grid-cols-2">
          {mapRole(user?.role) === 'hr' ? (
            <>
              <TabsTrigger
                value="overview"
                className="bg-blue-600 text-white data-[state=active]:bg-blue-800 data-[state=active]:text-white rounded-lg py-2 text-lg font-semibold shadow"
              >
                Overview
              </TabsTrigger>
              <TabsTrigger
                value="assignments"
                className="bg-gray-200 text-gray-800 data-[state=active]:bg-green-500 data-[state=active]:text-white rounded-lg py-2 text-lg font-semibold shadow"
              >
                Training Assignments
              </TabsTrigger>
            </>
          ) : (
            <>
              <TabsTrigger
                value="overview"
                className="bg-blue-600 text-white data-[state=active]:bg-blue-800 data-[state=active]:text-white rounded-lg py-2 text-lg font-semibold shadow"
              >
                Overview
              </TabsTrigger>
              <TabsTrigger
                value="records"
                className="bg-gray-200 text-gray-800 data-[state=active]:bg-green-500 data-[state=active]:text-white rounded-lg py-2 text-lg font-semibold shadow"
              >
                {(user?.role === 'employee' || user?.role === 'manager') ? 'My Trainings' : 'Employee Trainings'}
              </TabsTrigger>
            </>
          )}
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
                  {filteredRecords.slice(0, 5).map((training) => {
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
          </div>
        </TabsContent>

        {/* HR: Training Assignments Tab */}
        {['hr_manager', 'hr_staff'].includes(user?.role || '') && (
          <TabsContent value="assignments">
            <Card>
              <CardHeader>
                <CardTitle>Training Assignments</CardTitle>
                <CardDescription>Assign training programs to employees and track completion status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Training Programs with Employee Status */}
                  {trainingPrograms.map((program) => {
                    const enrolledEmployees = filteredRecords.filter(tr => tr.title === program.title);
                    const completedCount = enrolledEmployees.filter(tr => tr.status === 'completed').length;
                    const inProgressCount = enrolledEmployees.filter(tr => tr.status === 'in_progress').length;
                    const notStartedCount = enrolledEmployees.filter(tr => tr.status === 'not_started').length;
                    
                    return (
                      <div key={program.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h4 className="font-medium text-lg">{program.title}</h4>
                            <p className="text-sm text-muted-foreground mb-2">{program.description}</p>
                            <div className="flex gap-2">
                              <Badge variant={program.type === 'mandatory' ? 'destructive' : 'secondary'}>
                                {program.type}
                              </Badge>
                              <Badge variant="outline">{program.duration}</Badge>
                              <Badge variant="outline">{program.provider}</Badge>
                            </div>
                          </div>
                          <Button 
                            size="sm"
                            onClick={() => {
                              setSelectedProgram(program);
                              setAssignDialogOpen(true);
                            }}
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Assign to Employees
                          </Button>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4">
                          <Card>
                            <CardContent className="p-4">
                              <div className="flex items-center gap-3">
                                <div className="bg-success/10 p-2 rounded">
                                  <CheckCircle className="w-5 h-5 text-success" />
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-muted-foreground">Completed</p>
                                  <p className="text-xl font-bold">{completedCount}</p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                          
                          <Card>
                            <CardContent className="p-4">
                              <div className="flex items-center gap-3">
                                <div className="bg-warning/10 p-2 rounded">
                                  <Clock className="w-5 h-5 text-warning" />
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-muted-foreground">In Progress</p>
                                  <p className="text-xl font-bold">{inProgressCount}</p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                          
                          <Card>
                            <CardContent className="p-4">
                              <div className="flex items-center gap-3">
                                <div className="bg-muted/50 p-2 rounded">
                                  <GraduationCap className="w-5 h-5 text-muted-foreground" />
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-muted-foreground">Not Started</p>
                                  <p className="text-xl font-bold">{notStartedCount}</p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
        <TabsContent value="records">
          <Card>
            <CardHeader>
              <CardTitle>{(user?.role === 'employee' || user?.role === 'manager') ? 'My Training Records' : 'Individual Training Records'}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredRecords.map((training) => {
                  const employee = mockEmployees.find(emp => emp.id === training.employeeId);
                  return (
                    <div key={training.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="bg-primary/10 p-2 rounded">
                          <GraduationCap className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-medium">{training.title}</h4>
                          {['hr_manager', 'hr_staff'].includes(user?.role || '') && (
                            <p className="text-sm text-muted-foreground">
                              {employee?.name} • {employee?.department}
                            </p>
                          )}
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
                        {(user?.role === 'employee' || user?.role === 'manager') && training.status !== 'completed' && (
                          <div className="flex justify-end gap-2 mt-2">
                            {training.status === 'not_started' && (
                              <Button size="sm" variant="outline" onClick={() => startTraining(training.id)}>Start Training</Button>
                            )}
                            {(training.status === 'in_progress' || training.status === 'not_started') && (
                              <Dialog open={completeOpen && selectedTrainingId === training.id} onOpenChange={(o) => { setCompleteOpen(o); if (!o) { setSelectedTrainingId(null); setCertificateFile(null); } }}>
                                <DialogTrigger asChild>
                                  <Button size="sm" onClick={() => { setCompleteOpen(true); setSelectedTrainingId(training.id); }}>
                                    <Upload className="w-4 h-4 mr-2" />
                                    Complete & Upload Certificate
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Upload Completion Certificate</DialogTitle>
                                    <DialogDescription>Attach your certificate to mark training as complete.</DialogDescription>
                                  </DialogHeader>
                                  <div className="space-y-2">
                                    <Input type="file" onChange={(e)=> setCertificateFile(e.target.files && e.target.files[0] ? e.target.files[0] : null)} />
                                  </div>
                                  <DialogFooter>
                                    <Button onClick={() => { completeTraining(training.id, certificateFile); setCompleteOpen(false); setSelectedTrainingId(null); setCertificateFile(null); }}>Submit</Button>
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Remove Compliance tab for simplified employee view */}
      </Tabs>

      {/* Assignment Dialog */}
      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Assign Training Program</DialogTitle>
            <DialogDescription>
              Assign "{selectedProgram?.title}" to employees
            </DialogDescription>
          </DialogHeader>
          
          {selectedProgram && (
            <div className="space-y-4">
              <div className="bg-muted/30 p-4 rounded-lg">
                <h4 className="font-medium">{selectedProgram.title}</h4>
                <p className="text-sm text-muted-foreground">{selectedProgram.description}</p>
                <div className="flex gap-2 mt-2">
                  <Badge variant={selectedProgram.type === 'mandatory' ? 'destructive' : 'secondary'}>
                    {selectedProgram.type}
                  </Badge>
                  <Badge variant="outline">{selectedProgram.duration}</Badge>
                  <Badge variant="outline">{selectedProgram.provider}</Badge>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium">Select Employees</h4>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={selectedEmployees.length === mockEmployees.filter(emp => !['hr_manager', 'hr_staff'].includes(emp.position.toLowerCase())).length}
                      onCheckedChange={handleSelectAllEmployees}
                    />
                    <label className="text-sm font-medium">Select All</label>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-60 overflow-y-auto">
                  {mockEmployees
                    .filter(emp => !['hr_manager', 'hr_staff'].includes(emp.position.toLowerCase()))
                    .map((employee) => (
                    <div key={employee.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                      <Checkbox
                        checked={selectedEmployees.includes(employee.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedEmployees(prev => [...prev, employee.id]);
                          } else {
                            setSelectedEmployees(prev => prev.filter(id => id !== employee.id));
                          }
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{employee.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{employee.position} • {employee.department}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-600">
                    {selectedEmployees.length} employee{selectedEmployees.length !== 1 ? 's' : ''} selected
                  </span>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAssignTraining}
              disabled={selectedEmployees.length === 0}
            >
              Assign Training to {selectedEmployees.length} Employee{selectedEmployees.length !== 1 ? 's' : ''}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};