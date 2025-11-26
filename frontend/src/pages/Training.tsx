import React, { useMemo, useState, useEffect } from 'react';
import { Plus, Search, Filter, GraduationCap, Clock, CheckCircle, Calendar, Upload, Users, Eye, Pencil, Lock, BarChart } from 'lucide-react';
import TrainingProgress from '@/pages/TrainingProgress';
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
import { useTraining } from '@/contexts/TrainingContext';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

export const Training: React.FC = () => {
  const { user } = useAuth();
  const { trainings, startTraining, completeTraining, createTraining, editTraining, closeTraining, archiveTraining, deleteTraining } = useTraining();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [completeOpen, setCompleteOpen] = useState(false);
  const [selectedTrainingId, setSelectedTrainingId] = useState<string | null>(null);
  const [certificateFile, setCertificateFile] = useState<File | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [closeConfirmOpen, setCloseConfirmOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [viewProgram, setViewProgram] = useState<any | null>(null);
  const [closeAllDialogOpen, setCloseAllDialogOpen] = useState(false);
  const [programToCloseAll, setProgramToCloseAll] = useState<any | null>(null);
  // Edit form state
  const [editTitle, setEditTitle] = useState('');
  const [editProvider, setEditProvider] = useState('');
  const [editExpiryDate, setEditExpiryDate] = useState<string | undefined>(undefined);
  const [editType, setEditType] = useState<'mandatory' | 'development' | 'compliance'>('development');
  const [editDescription, setEditDescription] = useState('');
  const [editDuration, setEditDuration] = useState<number | ''>('');
  const [editMaxParticipants, setEditMaxParticipants] = useState<number | ''>('');
  const [editPrerequisites, setEditPrerequisites] = useState('');
  const [editCategory, setEditCategory] = useState<'mandatory' | 'skill_development' | 'compliance' | 'leadership' | ''>('');

  // Source of truth for training records (context)
  const source = useMemo(() => trainings, [trainings]);

  // Records shown in the main records table (for employees/managers show only their records,
  // for HR and others show all records)
  const filteredRecords = useMemo(() => {
    if (!user) return [] as typeof trainings;
    const canonical = mapRole(user.role);
    if (canonical === 'hr') return source; // HR can audit all (including closed/archived for history)
    if (canonical === 'employee' || canonical === 'manager' || canonical === 'registry') {
      // Employees/managers/registry should NOT see closed or archived assignments on their dashboard
      return source.filter(tr => tr.employeeId === user.id && !tr.archived && tr.status !== 'closed');
    }
    // Admin/unknown: no records view
    return [] as typeof trainings;
  }, [user, source]);

  // Trainings that belong to the currently logged-in user (used for 'My Trainings')
  const myTrainings = useMemo(() => {
    if (!user) return [] as typeof trainings;
    // Hide closed/archived records from the employee's own list
    return source.filter(tr => tr.employeeId === user.id && !tr.archived && tr.status !== 'closed');
  }, [user, source]);

  const completedTrainings = filteredRecords.filter(tr => tr.status === 'completed');
  const inProgressTrainings = filteredRecords.filter(tr => tr.status === 'in_progress');
  const notStartedTrainings = filteredRecords.filter(tr => tr.status === 'not_started');
  const closedTrainings = filteredRecords.filter(tr => tr.status === 'closed');
  const archivedTrainings = trainings.filter(tr => tr.archived);
  const archivedProgramTitles = useMemo(() => {
    const s = new Set<string>();
    archivedTrainings.forEach(tr => s.add(tr.title || 'Untitled'));
    return Array.from(s.values()).sort((a,b) => a.localeCompare(b));
  }, [archivedTrainings]);

  const [historyViewOpen, setHistoryViewOpen] = useState(false);
  const [historyView, setHistoryView] = useState<null | { title: string; items: Array<{ id: string; employeeName: string; department?: string; status: string; completionDate?: string }>; completed: number; total: number }>(null);

  const openHistoryView = (title: string) => {
    const related = archivedTrainings.filter(t => (t.title || 'Untitled') === title);
    const items = related.map(r => {
      const emp = (employees || []).find(e => e.id === r.employeeId);
      return {
        id: r.id,
        employeeName: emp?.name || `Employee ${r.employeeId}`,
        department: emp?.stationName,
        status: r.status,
        completionDate: r.completionDate,
      };
    }).sort((a,b) => a.employeeName.localeCompare(b.employeeName));
    setHistoryView({
      title,
      items,
      completed: related.filter(r => r.status === 'completed').length,
      total: related.length,
    });
    setHistoryViewOpen(true);
  };

  // Date helpers and compliance-like metrics
  const now = useMemo(() => new Date(), []);
  const isWithinDays = (dateStr?: string, days?: number) => {
    if (!dateStr || !days) return false;
    const dt = new Date(dateStr);
    if (isNaN(dt.getTime())) return false;
    const diff = dt.getTime() - now.getTime();
    return diff >= 0 && diff <= days * 24 * 60 * 60 * 1000;
  };
  const scopeForExpiry = useMemo(() => (mapRole(user?.role) === 'hr' ? source : filteredRecords), [user, source, filteredRecords]);
  const expiringSoonRecords = scopeForExpiry.filter(tr => !!tr.expiryDate && isWithinDays(tr.expiryDate, 30));
  const overdueRecords = scopeForExpiry.filter(tr => !!tr.expiryDate && new Date(tr.expiryDate).getTime() < now.getTime() && tr.status !== 'completed');

  const typeBreakdown = useMemo(() => {
    return scopeForExpiry.reduce(
      (acc, tr) => {
        const key = tr.type || 'development';
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );
  }, [scopeForExpiry]);

  // Assignment moved to dedicated page (/training/assign/:title)

  // Admin actions: edit and close
  useEffect(() => {
    if (editDialogOpen && selectedTrainingId) {
      const tr = trainings.find(t => t.id === selectedTrainingId);
      if (tr) {
        setEditTitle(tr.title || '');
        setEditProvider(tr.provider || '');
        setEditExpiryDate(tr.expiryDate);
        setEditType(tr.type || 'development');
        setEditDescription(tr.description || '');
        setEditDuration(tr.duration ?? '');
        // support both legacy and normalized naming
        setEditMaxParticipants((tr as any).maxParticipants ?? (tr as any).max_participants ?? '');
        setEditPrerequisites(tr.prerequisites || '');
        setEditCategory((tr.category as any) || '');
      }
    }
  }, [editDialogOpen, selectedTrainingId, trainings]);

  const handleSaveEdit = () => {
    if (!selectedTrainingId) return;
    const payload: any = { title: editTitle, provider: editProvider, expiryDate: editExpiryDate, type: editType };
    // Admin can edit all fields; HR is not allowed to change advanced metadata per requirement
    const canEditAll = canonical === 'admin';
    if (canEditAll) {
      payload.description = editDescription || undefined;
      payload.duration = editDuration === '' ? undefined : Number(editDuration);
      payload.maxParticipants = editMaxParticipants === '' ? undefined : Number(editMaxParticipants);
      payload.prerequisites = editPrerequisites || undefined;
      payload.category = editCategory || undefined;
    }
    editTraining(selectedTrainingId, payload);
    setEditDialogOpen(false);
    setSelectedTrainingId(null);
    toast({ title: 'Training updated', description: 'Changes saved.' });
  };

  const handleConfirmClose = () => {
    if (!selectedTrainingId) return;
    // Close means hide from assignees while preserving progress: mark as archived
    archiveTraining(selectedTrainingId);
    setCloseConfirmOpen(false);
    setSelectedTrainingId(null);
    setActiveTab('history');
    toast({ title: 'Training closed', description: 'Hidden from assignees. You can reopen from History.' });
  };

  const { employees } = useEmployees();

  // Derive available training programs from backend training records.
  // Collapse records by title and use the first matching record as a template for program metadata.
  const trainingPrograms = useMemo(() => {
    // Consider any title that has at least one non-archived record as OPEN program
    const active = trainings.filter(tr => !tr.archived);
    const map = new Map<string, any>();
    active.forEach(tr => {
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

  const openViewProgram = (program: any) => {
    // Aggregate details from records with same title
    const related = trainings.filter(tr => tr.title === program.title);
    const earliestExpiry = related
      .map(tr => tr.expiryDate)
      .filter(Boolean)
      .map(d => new Date(d as string))
      .sort((a,b) => a.getTime() - b.getTime())[0];
    const sample = related.find(tr => tr.description || tr.prerequisites || tr.category || (tr as any).duration);
    setViewProgram({
      title: program.title,
      provider: program.provider,
      type: program.type,
      category: sample?.category,
      description: program.description || sample?.description,
      duration: program.duration || (sample as any)?.duration,
      maxParticipants: (sample as any)?.maxParticipants ?? (sample as any)?.max_participants,
      prerequisites: sample?.prerequisites,
      expiryDate: earliestExpiry ? earliestExpiry.toISOString() : undefined,
      enrolled: related.length,
      completed: related.filter(r => r.status === 'completed').length
    });
    setViewDialogOpen(true);
  };

  // Derive a simple per-program progress (HR-only usage in overview)
  const programProgress = useMemo(() => {
    const map = new Map<string, { title: string; enrolled: number; completed: number }>();
    scopeForExpiry.forEach(tr => {
      const key = tr.title || 'Untitled';
      if (!map.has(key)) map.set(key, { title: key, enrolled: 0, completed: 0 });
      const item = map.get(key)!;
      item.enrolled += 1;
      if (tr.status === 'completed') item.completed += 1;
    });
    return Array.from(map.values()).sort((a,b) => b.enrolled - a.enrolled).slice(0,5);
  }, [scopeForExpiry]);

  const canonical = mapRole(user?.role);

  // Admin quick-create form state (set timelines at creation)
  const [createOpen, setCreateOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newProvider, setNewProvider] = useState('');
  const [newType, setNewType] = useState<'mandatory' | 'development' | 'compliance'>('development');
  const [newExpiryDate, setNewExpiryDate] = useState<string | undefined>(undefined);
  const [newDescription, setNewDescription] = useState('');
  const [newDuration, setNewDuration] = useState<number | ''>('');
  const [newMaxParticipants, setNewMaxParticipants] = useState<number | ''>('');
  const [newPrerequisites, setNewPrerequisites] = useState('');
  const [newCategory, setNewCategory] = useState<'mandatory' | 'skill_development' | 'compliance' | 'leadership' | ''>('');

  const handleCreateProgram = async () => {
    try {
      // Admin creates a seed program by creating a record for themselves (or a neutral holder)
      const seedEmployeeId = user?.id || '0';
      await createTraining({
        employeeId: seedEmployeeId,
        title: newTitle,
        type: newType,
        provider: newProvider,
        expiryDate: newExpiryDate,
        description: newDescription || undefined,
        duration: newDuration === '' ? undefined : Number(newDuration),
        // backend uses max_participants; TrainingContext normalizes when editing; for create we send camel and context maps snake when present
        max_participants: undefined as any,
        prerequisites: newPrerequisites || undefined,
        category: newCategory || undefined,
        status: 'not_started'
      } as any);
      setCreateOpen(false);
      setNewTitle(''); setNewProvider(''); setNewType('development'); setNewExpiryDate(undefined);
      setNewDescription(''); setNewDuration(''); setNewMaxParticipants(''); setNewPrerequisites(''); setNewCategory('');
      toast({ title: 'Program created', description: 'Timelines captured at creation.' });
    } catch (e) {
      toast({ title: 'Create failed', description: 'Could not create program.', variant: 'destructive' });
    }
  };

  // navigation via useNavigate
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold mb-2">Training & CPD</h1>
          <p className="text-muted-foreground">
            {['employee','manager','registry'].includes(canonical) ? 'Your assigned trainings and completions' : 'Manage training programs and compliance'}
          </p>
        </div>
        {canonical === 'admin' && (
          <Button size="sm" onClick={() => setCreateOpen(true)}>
            <Plus className="w-4 h-4 mr-2" /> New Program
          </Button>
        )}
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
                <p className="text-sm font-medium text-muted-foreground">Expiring Soon (30d)</p>
                <p className="text-2xl font-bold">{expiringSoonRecords.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs (restored chip style, with Progress Dashboard as a tab) */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
  <TabsList className={`grid w-full ${canonical === 'hr' ? 'grid-cols-4' : (canonical === 'admin' ? 'grid-cols-1' : 'grid-cols-2')}`}>
          {/* Progress Dashboard tab */}
          <TabsTrigger
            value="dashboard"
            className="bg-blue-600 text-white data-[state=active]:bg-blue-800 data-[state=active]:text-white rounded-lg py-2 text-lg font-semibold shadow flex items-center gap-2"
          >
            <BarChart className="w-4 h-4" /> Progress Dashboard
          </TabsTrigger>
          {/* HR extras: assignments, my trainings, history */}
          {canonical === 'hr' && (
            <>
              <TabsTrigger
                value="assignments"
                className="bg-gray-200 text-gray-800 data-[state=active]:bg-green-500 data-[state=active]:text-white rounded-lg py-2 text-lg font-semibold shadow flex items-center gap-2"
              >
                <Users className="w-4 h-4" /> Training Assignments
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
          )}
          {/* Non-admin, non-HR: can see their own 'My Trainings' */}
          {canonical !== 'hr' && canonical !== 'admin' && (
            <TabsTrigger
              value="my-trainings"
              className="bg-gray-200 text-gray-800 data-[state=active]:bg-green-500 data-[state=active]:text-white rounded-lg py-2 text-lg font-semibold shadow"
            >
              My Trainings
            </TabsTrigger>
          )}
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard">
          {canonical === 'hr' ? (
            <div className="mt-4"><TrainingProgress /></div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Your Pending Trainings</CardTitle>
                  <CardDescription>Quick actions for your assignments</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {filteredRecords
                    .filter(tr => tr.status !== 'completed' && !tr.archived && tr.status !== 'closed')
                    .slice(0,5)
                    .map(training => (
                    <div key={training.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium text-sm">{training.title}</p>
                        <p className="text-xs text-muted-foreground">{training.provider}{training.expiryDate ? ` • Expires ${new Date(training.expiryDate).toLocaleDateString()}` : ''}</p>
                      </div>
                      <div className="flex gap-2">
                        {training.status === 'not_started' && (
                          <Button size="sm" variant="outline" onClick={() => startTraining(training.id)}>Start</Button>
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
                    </div>
                  ))}
                  {filteredRecords.filter(tr => tr.status !== 'completed' && !tr.archived && tr.status !== 'closed').length === 0 && (
                    <p className="text-sm text-muted-foreground">You're all caught up.</p>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* HR: Training Assignments Tab */}
        {canonical === 'hr' && (
          <TabsContent value="assignments">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Training Assignments</CardTitle>
                    <CardDescription>Assign training programs to employees and track completion status</CardDescription>
                  </div>
                  {/* Progress Dashboard button removed */}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {trainingPrograms.map((program) => {
                    const enrolledEmployees = trainings.filter(tr => tr.title === program.title && !tr.archived);
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
                          <div className="flex flex-wrap gap-2">
                            <Button size="sm" variant="outline" onClick={() => openViewProgram(program)}>
                              <Eye className="w-4 h-4 mr-1" /> View
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => {
                              const first = trainings.find(t => t.title === program.title);
                              if (first) { setSelectedTrainingId(first.id); setEditDialogOpen(true); }
                            }}>
                              <Pencil className="w-4 h-4 mr-1" /> Edit
                            </Button>
                            <Button size="sm" onClick={() => navigate(`/training/assign/${encodeURIComponent(program.title)}`)}>
                              <Plus className="w-4 h-4 mr-1" /> Assign
                            </Button>
                            <Button size="sm" variant="secondary" onClick={() => { setProgramToCloseAll(program); setCloseAllDialogOpen(true); }}>
                              <Lock className="w-4 h-4 mr-1" /> Close All
                            </Button>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                          <Card>
                            <CardContent className="p-4">
                              <div className="flex items-center gap-3">
                                <div className="bg-success/10 p-2 rounded"><CheckCircle className="w-5 h-5 text-success" /></div>
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
                                <div className="bg-warning/10 p-2 rounded"><Clock className="w-5 h-5 text-warning" /></div>
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
                                <div className="bg-muted/50 p-2 rounded"><GraduationCap className="w-5 h-5 text-muted-foreground" /></div>
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
        {canonical === 'hr' && (
          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Training History</CardTitle>
                <CardDescription>Closed trainings by program (you can reopen)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {archivedProgramTitles.length === 0 && (
                    <p className="text-sm text-muted-foreground">No archived trainings</p>
                  )}
                  {archivedProgramTitles.map(title => {
                    const related = archivedTrainings.filter(t => (t.title || 'Untitled') === title);
                    const completed = related.filter(r => r.status === 'completed').length;
                    return (
                      <div key={title} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{title}</p>
                          <p className="text-xs text-muted-foreground">Archived assignments: {related.length} • Completed: {completed}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => navigate(`/training/program/${encodeURIComponent(title)}`)}>View</Button>
                          <Button size="sm" onClick={async () => {
                            const related = trainings.filter(t => (t.title || 'Untitled') === title && t.archived);
                            await Promise.all(related.map(r => editTraining(r.id, { archived: false, ...(r.status === 'closed' ? { status: 'not_started' as any } : {}) })));
                            toast({ title: 'Reopened', description: `Reopened ${related.length} assignment(s) for ${title}.` });
                            setActiveTab('assignments');
                          }}>Reopen</Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
  {/* Legacy Records tab is replaced by My Trainings for non-HR */}
  {/* Keeping content block for compatibility if needed (no trigger shown) */}
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
                              {employee?.name} • {employee?.stationName}
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
                        {(['employee','manager','registry'].includes(canonical)) && training.status !== 'completed' && (
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

  {/* My Trainings tab - shown for HR and all non-admin users */}
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
                        {(['employee','manager','registry','hr'].includes(canonical)) && training.status !== 'completed' && (
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

        {/* Remove Compliance tab for simplified view */}
      </Tabs>

      {/* Assignment Dialog removed: use dedicated /training/assign/:title page */}

      {/* Edit Training Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={(o) => { setEditDialogOpen(o); if (!o) { setSelectedTrainingId(null); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Training</DialogTitle>
            <DialogDescription>
              {canonical === 'admin'
                ? 'Admins can modify all program fields including timelines, description, duration, max participants and prerequisites.'
                : 'HR can adjust basic details if needed; primary actions are assignment and closing.'}
            </DialogDescription>
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
            {canonical === 'admin' && (
              <>
                <label className="text-sm font-medium">Description</label>
                <Input value={editDescription} onChange={(e) => setEditDescription(e.target.value)} placeholder="Short description" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <div>
                    <label className="text-sm font-medium">Duration (hours)</label>
                    <Input type="number" value={editDuration} onChange={(e) => setEditDuration(e.target.value === '' ? '' : Number(e.target.value))} placeholder="e.g. 4" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Max Participants</label>
                    <Input type="number" value={editMaxParticipants} onChange={(e) => setEditMaxParticipants(e.target.value === '' ? '' : Number(e.target.value))} placeholder="e.g. 25" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Category</label>
                    <select value={editCategory} onChange={(e) => setEditCategory(e.target.value as any)} className="p-2 border rounded w-full">
                      <option value="">--</option>
                      <option value="mandatory">mandatory</option>
                      <option value="skill_development">skill_development</option>
                      <option value="compliance">compliance</option>
                      <option value="leadership">leadership</option>
                    </select>
                  </div>
                </div>
                <label className="text-sm font-medium">Prerequisites</label>
                <Input value={editPrerequisites} onChange={(e) => setEditPrerequisites(e.target.value)} placeholder="List prerequisites" />
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setEditDialogOpen(false); setSelectedTrainingId(null); }}>Cancel</Button>
            <Button onClick={handleSaveEdit}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Admin Create Program Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Training Program</DialogTitle>
            <DialogDescription>Admins set timelines at creation; HR will only assign and close.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <label className="text-sm font-medium">Title</label>
            <Input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Title" />
            <label className="text-sm font-medium">Provider</label>
            <Input value={newProvider} onChange={(e) => setNewProvider(e.target.value)} placeholder="Provider" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div>
                <label className="text-sm font-medium">Type</label>
                <select value={newType} onChange={(e) => setNewType(e.target.value as any)} className="p-2 border rounded w-full">
                  <option value="mandatory">mandatory</option>
                  <option value="development">development</option>
                  <option value="compliance">compliance</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Expiry Date</label>
                <Input type="date" value={newExpiryDate || ''} onChange={(e) => setNewExpiryDate(e.target.value || undefined)} />
              </div>
            </div>
            <label className="text-sm font-medium">Description</label>
            <Input value={newDescription} onChange={(e) => setNewDescription(e.target.value)} placeholder="Short description" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <div>
                <label className="text-sm font-medium">Duration (hours)</label>
                <Input type="number" value={newDuration} onChange={(e) => setNewDuration(e.target.value === '' ? '' : Number(e.target.value))} />
              </div>
              <div>
                <label className="text-sm font-medium">Max Participants</label>
                <Input type="number" value={newMaxParticipants} onChange={(e) => setNewMaxParticipants(e.target.value === '' ? '' : Number(e.target.value))} />
              </div>
              <div>
                <label className="text-sm font-medium">Category</label>
                <select value={newCategory} onChange={(e) => setNewCategory(e.target.value as any)} className="p-2 border rounded w-full">
                  <option value="">--</option>
                  <option value="mandatory">mandatory</option>
                  <option value="skill_development">skill_development</option>
                  <option value="compliance">compliance</option>
                  <option value="leadership">leadership</option>
                </select>
              </div>
            </div>
            <label className="text-sm font-medium">Prerequisites</label>
            <Input value={newPrerequisites} onChange={(e) => setNewPrerequisites(e.target.value)} placeholder="List prerequisites" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateProgram} disabled={!newTitle}>Create Program</Button>
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

      {/* HR View Program Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Program Details</DialogTitle>
            <DialogDescription>Summary of the selected program</DialogDescription>
          </DialogHeader>
          {viewProgram && (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div><span className="font-medium">Title:</span> {viewProgram.title}</div>
                <div><span className="font-medium">Provider:</span> {viewProgram.provider || 'N/A'}</div>
                <div><span className="font-medium">Type:</span> {viewProgram.type || 'N/A'}</div>
                <div><span className="font-medium">Category:</span> {(viewProgram.category || '').toString().replace('_',' ') || 'N/A'}</div>
                <div><span className="font-medium">Duration:</span> {viewProgram.duration ? `${viewProgram.duration} hours` : 'N/A'}</div>
                <div><span className="font-medium">Max Participants:</span> {viewProgram.maxParticipants ?? 'N/A'}</div>
                <div><span className="font-medium">Enrolled:</span> {viewProgram.enrolled}</div>
                <div><span className="font-medium">Completed:</span> {viewProgram.completed}</div>
                <div><span className="font-medium">Earliest Expiry:</span> {viewProgram.expiryDate ? new Date(viewProgram.expiryDate).toLocaleDateString() : 'N/A'}</div>
              </div>
              {viewProgram.prerequisites && (
                <div>
                  <span className="font-medium">Prerequisites:</span>
                  <p className="text-muted-foreground">{viewProgram.prerequisites}</p>
                </div>
              )}
              {viewProgram.description && (
                <div>
                  <span className="font-medium">Description:</span>
                  <p className="text-muted-foreground">{viewProgram.description}</p>
                </div>
              )}
          </div>
          )}
        </DialogContent>
      </Dialog>

      {/* HR Close All Confirmation */}
      <Dialog open={closeAllDialogOpen} onOpenChange={setCloseAllDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Close All Assignments</DialogTitle>
            <DialogDescription>
              {programToCloseAll ? `This will hide all assignments for "${programToCloseAll.title}" from assignees. You can reopen later.` : ''}
            </DialogDescription>
          </DialogHeader>
          <div className="py-2 text-sm">
            {programToCloseAll && (() => {
              const count = trainings.filter(t => t.title === programToCloseAll.title && !t.archived).length;
              return <span>{count} assignment{count !== 1 ? 's' : ''} will be closed (hidden).</span>;
            })()}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCloseAllDialogOpen(false)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (!programToCloseAll) return;
                // Find all assignments for the selected program title
                const allForProgram = trainings.filter(t => t.title === programToCloseAll.title);
                // Archive (hide) those not already archived; keep their status so progress is preserved
                const toArchive = allForProgram.filter(t => !t.archived);
                toArchive.forEach(r => archiveTraining(r.id));
                const archivedCount = toArchive.length;
                // Switch to History so the user immediately sees archived items
                setActiveTab('history');
                toast({
                  title: 'Program closed',
                  description: `Archived (hidden) ${archivedCount} assignment(s) for ${programToCloseAll.title}.`
                });
                setCloseAllDialogOpen(false);
                setProgramToCloseAll(null);
              }}
            >
              Confirm Close All
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* History View Modal: Per-program archived assignments */}
      <Dialog open={historyViewOpen} onOpenChange={setHistoryViewOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Archived Assignments: {historyView?.title}</DialogTitle>
            <DialogDescription>
              {historyView ? `${historyView.completed}/${historyView.total} completed` : ''}
            </DialogDescription>
          </DialogHeader>
          {historyView && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-semibold mb-2">Completed</p>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {historyView.items.filter(i => i.status === 'completed').map(i => (
                    <div key={i.id} className="p-2 border rounded">
                      <p className="text-sm font-medium">{i.employeeName}</p>
                      {i.department && <p className="text-xs text-muted-foreground">{i.department}</p>}
                      {i.completionDate && <p className="text-xs text-muted-foreground">Completed: {new Date(i.completionDate).toLocaleDateString()}</p>}
                    </div>
                  ))}
                  {historyView.items.filter(i => i.status === 'completed').length === 0 && (
                    <p className="text-xs text-muted-foreground">No completions</p>
                  )}
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold mb-2">Not Completed</p>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {historyView.items.filter(i => i.status !== 'completed').map(i => (
                    <div key={i.id} className="p-2 border rounded">
                      <p className="text-sm font-medium">{i.employeeName}</p>
                      {i.department && <p className="text-xs text-muted-foreground">{i.department}</p>}
                      <p className="text-xs text-muted-foreground">Status: {i.status.replace('_',' ')}</p>
                    </div>
                  ))}
                  {historyView.items.filter(i => i.status !== 'completed').length === 0 && (
                    <p className="text-xs text-muted-foreground">Everyone completed</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};