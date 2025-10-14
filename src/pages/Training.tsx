import React, { useMemo, useState, useEffect } from 'react';
import { Plus, Search, Filter, GraduationCap, Clock, CheckCircle, Calendar, Upload, Users } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// Training page uses contexts (useTraining, useEmployees) — no mockData dependency
import { useEmployees } from '@/contexts/EmployeesContext';
import { useAuth } from '@/contexts/AuthContext';
import { mapRole } from '@/lib/roles';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { useTraining } from '@/contexts/TrainingContext';

export const Training: React.FC = () => {
  const { user } = useAuth();
  const { trainings, startTraining, completeTraining, createTraining, editTraining, closeTraining, archiveTraining } = useTraining();
  const [isAssigning, setIsAssigning] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [completeOpen, setCompleteOpen] = useState(false);
  const [selectedTrainingId, setSelectedTrainingId] = useState<string | null>(null);
  const [certificateFile, setCertificateFile] = useState<File | null>(null);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [closeConfirmOpen, setCloseConfirmOpen] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<any>(null);
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  // Edit form state
  const [editTitle, setEditTitle] = useState('');
  const [editProvider, setEditProvider] = useState('');
  const [editExpiryDate, setEditExpiryDate] = useState<string | undefined>(undefined);
  const [editType, setEditType] = useState<'mandatory' | 'development' | 'compliance'>('development');

  // Source of truth for training records (context)
  const source = useMemo(() => trainings, [trainings]);

  // Records shown in the main records table (for employees/managers show only their records,
  // for HR and others show all records)
  const filteredRecords = useMemo(() => {
    if (!user) return [] as typeof trainings;
    const canonical = mapRole(user.role);
    if (canonical === 'employee' || canonical === 'manager') {
      return source.filter(tr => tr.employeeId === user.id);
    }
    // HR and admins see all records by default
    return source;
  }, [user, source]);

  // Trainings that belong to the currently logged-in user (used for 'My Trainings')
  const myTrainings = useMemo(() => {
    if (!user) return [] as typeof trainings;
    return source.filter(tr => tr.employeeId === user.id);
  }, [user, source]);

  const completedTrainings = filteredRecords.filter(tr => tr.status === 'completed');
  const inProgressTrainings = filteredRecords.filter(tr => tr.status === 'in_progress');
  const notStartedTrainings = filteredRecords.filter(tr => tr.status === 'not_started');
  const closedTrainings = filteredRecords.filter(tr => tr.status === 'closed');
  const archivedTrainings = trainings.filter(tr => tr.archived);

  // Function to handle employee assignment and persist training records
  const handleAssignTraining = async () => {
    if (!selectedProgram || selectedEmployees.length === 0) return;
    setIsAssigning(true);
    try {
      for (const employeeId of selectedEmployees) {
        // TrainingContext#createTraining will try the API and fall back to local storage.
        await createTraining({
          employeeId,
          title: selectedProgram.title,
          type: selectedProgram.type,
          provider: selectedProgram.provider,
          status: 'not_started'
        });
      }
    } catch (err) {
      console.error('Error assigning trainings', err);
    } finally {
      setIsAssigning(false);
      setAssignDialogOpen(false);
      setSelectedProgram(null);
      setSelectedEmployees([]);
    }
  };

  // Admin actions: edit and close
  useEffect(() => {
    if (editDialogOpen && selectedTrainingId) {
      const tr = trainings.find(t => t.id === selectedTrainingId);
      if (tr) {
        setEditTitle(tr.title || '');
        setEditProvider(tr.provider || '');
        setEditExpiryDate(tr.expiryDate);
        setEditType(tr.type || 'development');
      }
    }
  }, [editDialogOpen, selectedTrainingId, trainings]);

  const handleSaveEdit = () => {
    if (!selectedTrainingId) return;
    editTraining(selectedTrainingId, { title: editTitle, provider: editProvider, expiryDate: editExpiryDate, type: editType });
    setEditDialogOpen(false);
    setSelectedTrainingId(null);
  };

  const handleConfirmClose = () => {
    if (!selectedTrainingId) return;
    closeTraining(selectedTrainingId);
    setCloseConfirmOpen(false);
    setSelectedTrainingId(null);
  };

  const { employees } = useEmployees();
  const handleSelectAllEmployees = (checked: boolean) => {
    if (checked) {
      const allEmployeeIds = (employees || [])
        .filter(emp => !/hr_(manager|staff)/i.test(String(emp.position || '').toLowerCase()))
        .map(emp => emp.id);
      setSelectedEmployees(allEmployeeIds);
    } else {
      setSelectedEmployees([]);
    }
  };

  // Derive available training programs from backend training records.
  // Collapse records by title and use the first matching record as a template for program metadata.
  const trainingPrograms = useMemo(() => {
    const map = new Map<string, any>();
    trainings.forEach(tr => {
      const key = tr.title || 'Untitled';
      if (!map.has(key)) {
        map.set(key, {
          id: key,
          title: key,
          type: tr.type || 'development',
          duration: (tr as any).duration || '',
          provider: tr.provider || '',
          enrolled: 0,
          completed: 0,
          expiryMonths: (tr as any).expiryMonths,
          description: (tr as any).description || ''
        });
      }
      const prog = map.get(key);
      prog.enrolled = (prog.enrolled || 0) + 1;
      if (tr.status === 'completed') prog.completed = (prog.completed || 0) + 1;
    });
    return Array.from(map.values());
  }, [trainings]);

  // Mock compliance dashboard
  const complianceData = [
    {
      requirement: 'Cybersecurity Training',
      totalEmployees: (employees || []).length,
      compliant: 12,
      expiringSoon: 2,
      overdue: 1
    },
    {
      requirement: 'Data Protection Training',
      totalEmployees: (employees || []).length,
      compliant: 18,
      expiringSoon: 0,
      overdue: 0
    },
    {
      requirement: 'Health & Safety Training',
      totalEmployees: (employees || []).length,
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
        <TabsList className="grid w-full grid-cols-4">
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
                                        <TabsTrigger
                      value="my-trainings"
                      className="bg-gray-200 text-gray-800 data-[state=active]:bg-green-500 data-[state=active]:text-white rounded-lg py-2 text-lg font-semibold shadow"
                    >
                      My Trainings
                    </TabsTrigger>
                    <TabsTrigger
                      value="history"
                      className="bg-gray-200 text-gray-800 data-[state=active]:bg-slate-700 data-[state=active]:text-white rounded-lg py-2 text-lg font-semibold shadow"
                    >
                      History
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
                    const employee = (employees || []).find(emp => emp.id === training.employeeId);
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
                        {['hr_manager', 'hr_staff'].includes(user?.role || '') && (
                          <div className="ml-3 flex items-center gap-2">
                            <Button size="sm" variant="ghost" onClick={() => { setSelectedTrainingId(training.id); setEditDialogOpen(true); }}>
                              Edit
                            </Button>
                            {training.status !== 'closed' && (
                              <Button size="sm" variant="outline" onClick={() => { setSelectedTrainingId(training.id); setCloseConfirmOpen(true); }}>
                                Close
                              </Button>
                            )}
                            {training.status === 'closed' && (
                              <Button size="sm" variant="destructive" onClick={() => archiveTraining(training.id)}>
                                Archive
                              </Button>
                            )}
                          </div>
                        )}
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
        {['hr_manager', 'hr_staff'].includes(user?.role || '') && (
          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Training History</CardTitle>
                <CardDescription>Archived trainings and past records</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {archivedTrainings.length === 0 && <p className="text-sm text-muted-foreground">No archived trainings</p>}
                  {archivedTrainings.map(tr => (
                    <div key={tr.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{tr.title}</p>
                        <p className="text-xs text-muted-foreground">Provider: {tr.provider} • Status: {tr.status}</p>
                      </div>
                      <div className="text-right">
                        {tr.completionDate && <p className="text-xs">Completed: {new Date(tr.completionDate).toLocaleDateString()}</p>}
                        <div className="mt-2 flex gap-2 justify-end">
                          <Button size="sm" variant="ghost" onClick={() => { setSelectedTrainingId(tr.id); setEditDialogOpen(true); }}>Edit</Button>
                          <Button size="sm" onClick={() => editTraining(tr.id, { archived: false })}>Restore</Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
  {/* Employee/Manager Records tab (reused by non-HR users) */}
  <TabsContent value="records">
          <Card>
            <CardHeader>
              <CardTitle>{(user?.role === 'employee' || user?.role === 'manager') ? 'My Training Records' : 'Individual Training Records'}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredRecords.map((training) => {
                                  const employee = (employees || []).find(emp => emp.id === training.employeeId);
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
                        {['hr_manager', 'hr_staff'].includes(user?.role || '') && (
                          <div className="mt-2 flex gap-2 justify-end">
                            <Button size="sm" variant="ghost" onClick={() => { setSelectedTrainingId(training.id); setEditDialogOpen(true); }}>Edit</Button>
                            {training.status !== 'closed' && <Button size="sm" variant="outline" onClick={() => { setSelectedTrainingId(training.id); setCloseConfirmOpen(true); }}>Close</Button>}
                            {training.status === 'closed' && <Button size="sm" variant="destructive" onClick={() => archiveTraining(training.id)}>Archive</Button>}
                          </div>
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

        {/* HR: My Trainings tab - shows trainings assigned to the logged-in HR user so they can complete them using the same flow */}
        <TabsContent value="my-trainings">
          <Card>
            <CardHeader>
              <CardTitle>My Training Records</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {myTrainings.map((training) => {
                                  const employee = (employees || []).find(emp => emp.id === training.employeeId);
                                  return (
                    <div key={training.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="bg-primary/10 p-2 rounded">
                          <GraduationCap className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-medium">{training.title}</h4>
                          <p className="text-xs text-muted-foreground">Provider: {training.provider}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={`status-${training.status === 'completed' ? 'approved' : training.status === 'in_progress' ? 'pending' : 'draft'}`}>
                          {training.status.replace('_', ' ')}
                        </Badge>
                        {training.completionDate && (
                          <p className="text-xs text-muted-foreground mt-1">Completed: {new Date(training.completionDate).toLocaleDateString()}</p>
                        )}
                        {training.expiryDate && (
                          <p className="text-xs text-muted-foreground">Expires: {new Date(training.expiryDate).toLocaleDateString()}</p>
                        )}
                        {(user?.role === 'employee' || user?.role === 'manager' || ['hr_manager', 'hr_staff'].includes(user?.role || '')) && training.status !== 'completed' && (
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
                                          checked={selectedEmployees.length === (employees || []).filter(emp => !/hr_(manager|staff)/i.test(String(emp.position || '').toLowerCase())).length}
                                          onCheckedChange={handleSelectAllEmployees}
                                        />
                                        <label className="text-sm font-medium">Select All</label>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-60 overflow-y-auto">
                  {(employees || [])
                                      .filter(emp => !/hr_(manager|staff)/i.test(String(emp.position || '').toLowerCase()))
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
              disabled={selectedEmployees.length === 0 || isAssigning}
            >
              {isAssigning ? 'Assigning...' : `Assign Training to ${selectedEmployees.length} Employee${selectedEmployees.length !== 1 ? 's' : ''}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Training Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={(o) => { setEditDialogOpen(o); if (!o) { setSelectedTrainingId(null); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Training</DialogTitle>
            <DialogDescription>Modify training title, provider, type or expiry date.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <label className="text-sm font-medium">Title</label>
            <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} placeholder="Title" />
            <label className="text-sm font-medium">Provider</label>
            <Input value={editProvider} onChange={(e) => setEditProvider(e.target.value)} placeholder="Provider" />
            <label className="text-sm font-medium">Type & Expiry Date</label>
            <div className="flex gap-2">
              <select value={editType} onChange={(e) => setEditType(e.target.value as any)} className="p-2 border rounded">
                <option value="mandatory">mandatory</option>
                <option value="development">development</option>
                <option value="compliance">compliance</option>
              </select>
              <Input type="date" value={editExpiryDate || ''} onChange={(e) => setEditExpiryDate(e.target.value || undefined)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setEditDialogOpen(false); setSelectedTrainingId(null); }}>Cancel</Button>
            <Button onClick={handleSaveEdit}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Close Confirmation Dialog */}
      <Dialog open={closeConfirmOpen} onOpenChange={(o) => { setCloseConfirmOpen(o); if (!o) setSelectedTrainingId(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Close Training</DialogTitle>
            <DialogDescription>Closing a training will prevent further completions. You can archive it afterwards.</DialogDescription>
          </DialogHeader>
          <div className="py-4">Are you sure you want to close this training?</div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCloseConfirmOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleConfirmClose}>Close Training</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};