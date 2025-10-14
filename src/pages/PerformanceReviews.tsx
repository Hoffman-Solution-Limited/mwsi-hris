import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, TrendingUp, Star, Calendar, Eye, Clock, CheckCircle, Users, Target, Edit } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { mockEmployees } from '@/data/mockData';
import { TemplateCriteriaList } from '@/components/performance/TemplateCriteriaList';
import { useAuth } from '@/contexts/AuthContext';
import { usePerformance, PerformanceTemplate, PerformanceReview } from '@/contexts/PerformanceContext';
import { useEmployees } from '@/contexts/EmployeesContext';

export const PerformanceReviews: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { templates, reviews, createTemplate, createReview, setEmployeeTargets, submitManagerReview, submitHrReview, updateReview, submitEmployeeAcknowledgment } = usePerformance();
  const { employees } = useEmployees();
  const [activeTab, setActiveTab] = useState('active');

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState<PerformanceReview | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editComments, setEditComments] = useState('');
  const [editScore, setEditScore] = useState<number | ''>('');
  const [managerScoresDraft, setManagerScoresDraft] = useState<{ criteriaId: string; score: number; comments: string }[]>([]);
  const [hrScoresDraft, setHrScoresDraft] = useState<{ criteriaId: string; score: number; comments: string }[]>([]);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [ackComments, setAckComments] = useState<Record<string, string>>({});
  const [activeEmployeeFilter, setActiveEmployeeFilter] = useState<'all' | 'new' | 'active'>('all');

  // Set default tab based on role
  useEffect(() => {
    if (user?.role === 'hr_manager' || user?.role === 'hr_staff') {
      setActiveTab('assign');
    } else {
      setActiveTab('active');
    }
  }, [user?.role]);

  // Manager-specific review filters
  const myAppraisals = useMemo(() => {
    if (!user) return [];
    // For managers this is the list of reviews they authored for themselves; for other roles we still
    // provide a view of reviews that have employeeId === user.id so HR can view their own appraisals.
    return reviews.filter(review => review.employeeId === user.id);
  }, [reviews, user]);

  const teamAppraisals = useMemo(() => {
    if (!user || user.role !== 'manager') return [];
    return reviews.filter(review => {
      const employee = mockEmployees.find(emp => emp.id === review.employeeId);
      return employee?.manager === user.name;
    });
  }, [reviews, user]);

  // Use reviews for filtering instead of baseReviews
  const filteredReviews = reviews.filter(review => {
    const matchesSearch = review.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         review.reviewPeriod.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || review.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Performance metrics
  const completedReviews = reviews.filter(review => review.status === 'completed');
  const inProgressReviews = reviews.filter(review => ['targets_set', 'manager_review', 'employee_ack', 'hr_review'].includes(review.status));
  const draftReviews = reviews.filter(review => review.status === 'draft');

  const performanceMetrics = {
    avgScore: completedReviews.length > 0 
      ? completedReviews.reduce((sum, review) => sum + (review.overallScore || 0), 0) / completedReviews.length 
      : 0,
    completionRate: reviews.length > 0 ? (completedReviews.length / reviews.length) * 100 : 0,
    pendingManager: reviews.filter(r => r.status === 'manager_review').length,
    pendingEmployee: reviews.filter(r => r.status === 'employee_ack').length,
    pendingHr: reviews.filter(r => r.status === 'hr_review').length
  };

  // Helper: days until deadline (positive = days remaining, 0 = today, negative = overdue by abs(days))
  const getDaysUntil = (date?: string) => {
    if (!date) return undefined as number | undefined;
    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
    const target = new Date(date).getTime();
    return Math.ceil((target - startOfToday) / (1000 * 60 * 60 * 24));
  };

  // HR Assign: helper to select all employees
  const handleSelectAllEmployees = (checked: boolean, pool: { id: string }[]) => {
    if (checked) {
      setSelectedEmployees(pool.map(emp => emp.id));
    } else {
      setSelectedEmployees([]);
    }
  };

  // Template creation form
  const [templateForm, setTemplateForm] = useState({
    name: '',
    type: 'quarterly' as 'quarterly' | 'half-yearly' | 'yearly',
    description: '',
    criteria: [{ id: '1', name: '', weight: 20, description: '' }]
  });

  const createNewTemplate = () => {
    if (!user || !templateForm.name) return;
    
    createTemplate({
      name: templateForm.name,
      type: templateForm.type,
      description: templateForm.description,
      criteria: templateForm.criteria.filter(c => c.name.trim()),
      createdBy: user.name
    });
    
    setTemplateForm({
      name: '',
      type: 'quarterly',
      description: '',
      criteria: [{ id: '1', name: '', weight: 20, description: '' }]
    });
    setTemplateDialogOpen(false);
  };

  // Review creation form
  const [reviewForm, setReviewForm] = useState({
    employeeId: '',
    templateId: '',
    reviewPeriod: ''
  });
  // HR Assign: multi-employee selection and deadline
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [deadlineDate, setDeadlineDate] = useState('');
  // HR Assign: department selection to auto-select employees
  const departments = useMemo(() => Array.from(new Set(employees.map(e => e.department))), [employees]);
  const [assignDepartment, setAssignDepartment] = useState<string>('all');
  const employeesByDept = useMemo(() => assignDepartment === 'all' ? employees : employees.filter(e => e.department === assignDepartment), [employees, assignDepartment]);
  // Filter templates by department for assignment; allow global (no department) templates when a department is chosen
  const filteredTemplates = useMemo(() => {
    if (assignDepartment === 'all') return templates;
    return templates.filter(t => !t.department || t.department === assignDepartment);
  }, [templates, assignDepartment]);
  const selectedTemplate = useMemo(() => templates.find(t => t.id === reviewForm.templateId), [templates, reviewForm.templateId]);
  const templateDeptMismatch = useMemo(() => {
    if (assignDepartment === 'all' || !selectedTemplate) return false;
    return !!(selectedTemplate.department && selectedTemplate.department !== assignDepartment);
  }, [assignDepartment, selectedTemplate]);
  useEffect(() => {
    // when department changes, auto-select all employees in that department
    if (assignDepartment === 'all') {
      setSelectedEmployees([]);
    } else {
      setSelectedEmployees(employees.filter(e => e.department === assignDepartment).map(e => e.id));
    }
  }, [assignDepartment, employees]);

  const createNewReview = () => {
    if (!user) return;
    const template = templates.find(t => t.id === reviewForm.templateId);
    if (!template || !reviewForm.templateId) return;

    // If using the HR Assign tab, selectedEmployees will be populated. Otherwise fall back to single employeeId.
    const employeeIds = selectedEmployees.length > 0 ? selectedEmployees : (reviewForm.employeeId ? [reviewForm.employeeId] : []);
    if (employeeIds.length === 0) return;

    employeeIds.forEach(empId => {
      const employee = employees.find(emp => emp.id === empId) || mockEmployees.find(emp => emp.id === empId);
      if (!employee) return;
      createReview({
        employeeId: empId,
        employeeName: employee.name,
        employeeNumber: (employee as any).employeeNumber,
        templateId: reviewForm.templateId,
        reviewPeriod: reviewForm.reviewPeriod,
        status: 'draft',
        employeeTargets: [],
        managerScores: [],
        managerComments: '',
        hrComments: '',
        deadlineDate: deadlineDate || undefined,
        nextReviewDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
        createdBy: user.name
      });
    });

    // Reset relevant state
    setReviewForm({ employeeId: '', templateId: '', reviewPeriod: '' });
    setSelectedEmployees([]);
    setDeadlineDate('');
    setReviewDialogOpen(false);
  };

  // Target setting
  const [targets, setTargets] = useState<{ criteriaId: string; target: string; description: string }[]>([]);
  const [selfScores, setSelfScores] = useState<{ criteriaId: string; score: number; comments: string }[]>([]);
  const [selfOverallComments, setSelfOverallComments] = useState<string>('');

  const handleSetTargets = () => {
    if (!selectedReview) return;
    setEmployeeTargets(selectedReview.id, targets);
    setTargets([]);
  };

  // Save draft of targets without changing to manager review
  const handleSaveTargetsDraft = () => {
    if (!selectedReview) return;
    updateReview(selectedReview.id, {
      employeeTargets: targets,
      employeeScores: selfScores,
      employeeSelfComments: selfOverallComments,
      status: 'draft'
    });
  };

  // Submit targets to manager for review
  const handleSubmitTargetsToManager = () => {
    if (!selectedReview) return;
    updateReview(selectedReview.id, {
      employeeTargets: targets,
      employeeScores: selfScores,
      employeeSelfComments: selfOverallComments,
      status: 'manager_review'
    });
  };

  const openTargetDialog = (review: PerformanceReview) => {
    setSelectedReview(review);
    const template = templates.find(t => t.id === review.templateId);
    if (template) {
      setTargets(template.criteria.map(criteria => ({
        criteriaId: criteria.id,
        target: '',
        description: ''
      })));
      // initialize self scores from existing or blank
      const existing = review.employeeScores || [];
      setSelfScores(template.criteria.map(c => {
        const m = existing.find(s => s.criteriaId === c.id);
        return { criteriaId: c.id, score: m?.score ?? 0, comments: m?.comments ?? '' };
      }));
    }
    setSelfOverallComments(review.employeeSelfComments || '');
  };
   // ✅ Unified state for editing/saving/submitting employee review
  //const [selectedReview, setSelectedReview] = useState<PerformanceReview | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [goals, setGoals] = useState('');

  const handleOpenModal = (review: PerformanceReview) => {
    setSelectedReview(review);
    setGoals(review?.employeeTargets?.map(t => t.target).join('\n') || '');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedReview(null);
    setGoals('');
    setIsModalOpen(false);
  };

 const handleSaveDraft = () => {
  if (!selectedReview) return;
  updateReview(selectedReview.id, {
    status: 'draft',
    employeeTargets: goals.split('\n').filter(Boolean).map((t) => ({
      target: t,
      description: '',   // ✅ add defaults to satisfy type
      criteriaId: ''     // ✅ add if required
    })),
  });
  handleCloseModal();
};

const handleSubmitToManager = () => {
  if (!selectedReview) return;
  updateReview(selectedReview.id, {
    status: 'manager_review',
    employeeTargets: goals.split('\n').filter(Boolean).map((t) => ({
      target: t,
      description: '',
      criteriaId: ''
    })),
  });
  handleCloseModal();
};



  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold mb-2">
            {user?.role === 'employee' ? 'My Performance Reviews' : 'Performance Reviews'}
          </h1>
          <p className="text-muted-foreground">
            {user?.role === 'employee' 
              ? 'View your performance history and set targets'
              : user?.role === 'manager'
              ? `Manage reviews for your team`
              : 'Manage employee performance evaluations and templates'
            }
          </p>
        </div>
        <div className="flex gap-2">
          {user?.role !== 'employee' &&
          user?.role !== 'manager' && user?.role !== 'hr_manager' && (
            <>
              <Dialog open={templateDialogOpen} onOpenChange={setTemplateDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Plus className="w-4 h-4 mr-2" />
                    New Template
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Create Performance Template</DialogTitle>
                    <DialogDescription>Create a new performance review template.</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Template Name</label>
                      <Input 
                        value={templateForm.name} 
                        onChange={(e) => setTemplateForm(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="e.g. Q1 2024 Review"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">Review Type</label>
                        <Select value={templateForm.type} onValueChange={(v: any) => setTemplateForm(prev => ({ ...prev, type: v }))}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="quarterly">Quarterly</SelectItem>
                            <SelectItem value="half-yearly">Half-Yearly</SelectItem>
                            <SelectItem value="yearly">Yearly</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Description</label>
                        <Input 
                          value={templateForm.description} 
                          onChange={(e) => setTemplateForm(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="Brief description"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Evaluation Criteria</label>
                      <div className="space-y-2 mt-2">
                        {templateForm.criteria.map((criteria, index) => (
                          <div key={criteria.id} className="grid grid-cols-12 gap-2 items-center">
                            <Input 
                              placeholder="Criteria name"
                              value={criteria.name}
                              onChange={(e) => {
                                const newCriteria = [...templateForm.criteria];
                                newCriteria[index].name = e.target.value;
                                setTemplateForm(prev => ({ ...prev, criteria: newCriteria }));
                              }}
                              className="col-span-4"
                            />
                            <Input 
                              type="number"
                              placeholder="Weight %"
                              value={criteria.weight}
                              onChange={(e) => {
                                const newCriteria = [...templateForm.criteria];
                                newCriteria[index].weight = parseInt(e.target.value) || 0;
                                setTemplateForm(prev => ({ ...prev, criteria: newCriteria }));
                              }}
                              className="col-span-2"
                            />
                            <Input 
                              placeholder="Description"
                              value={criteria.description}
                              onChange={(e) => {
                                const newCriteria = [...templateForm.criteria];
                                newCriteria[index].description = e.target.value;
                                setTemplateForm(prev => ({ ...prev, criteria: newCriteria }));
                              }}
                              className="col-span-5"
                            />
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                const newCriteria = templateForm.criteria.filter((_, i) => i !== index);
                                setTemplateForm(prev => ({ ...prev, criteria: newCriteria }));
                              }}
                            >
                              Remove
                            </Button>
                          </div>
                        ))}
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            const newCriteria = [...templateForm.criteria, {
                              id: Date.now().toString(),
                              name: '',
                              weight: 20,
                              description: ''
                            }];
                            setTemplateForm(prev => ({ ...prev, criteria: newCriteria }));
                          }}
                        >
                          Add Criteria
                        </Button>
                      </div>
                    </div>
                  </div>
                       <DialogFooter>
                    <Button onClick={createNewTemplate}>Create Template</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

      {/* View Details now handled as a separate route */}
              
              <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
              {["admin"].includes(user?.role) && (
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    New Review
                  </Button>
                </DialogTrigger>
              )}  
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create Performance Review</DialogTitle>
                    <DialogDescription>Start a new performance review for an employee.</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Employee</label>
                      <Select value={reviewForm.employeeId} onValueChange={(v) => setReviewForm(prev => ({ ...prev, employeeId: v }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select employee" />
                        </SelectTrigger>
                        <SelectContent>
                          {mockEmployees.map(emp => (
                            <SelectItem key={emp.id} value={emp.id}>{emp.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Template</label>
                      <Select value={reviewForm.templateId} onValueChange={(v) => setReviewForm(prev => ({ ...prev, templateId: v }))}>
                        <SelectTrigger>
                          <SelectValue placeholder={assignDepartment !== 'all' ? `Templates for ${assignDepartment} (or global)` : 'Select template'} />
                        </SelectTrigger>
                        <SelectContent>
                          {filteredTemplates.map(template => (
                            <SelectItem key={template.id} value={template.id}>
                              {template.name}
                              {template.department && (
                                <span className="ml-2 text-xs text-muted-foreground">• {template.department}</span>
                              )}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {templateDeptMismatch && (
                        <div className="text-xs text-destructive mt-1">
                          Selected template is scoped to "{selectedTemplate?.department}" which does not match selected department "{assignDepartment}".
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="text-sm font-medium">Review Period</label>
                      <Input 
                        value={reviewForm.reviewPeriod} 
                        onChange={(e) => setReviewForm(prev => ({ ...prev, reviewPeriod: e.target.value }))}
                        placeholder="e.g. Q1 2024"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={createNewReview}>Create Review</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </>
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
                <Clock className="w-6 h-6 text-warning" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Manager</p>
                <p className="text-2xl font-bold">{performanceMetrics.pendingManager}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="bg-destructive/10 p-3 rounded-lg">
                <CheckCircle className="w-6 h-6 text-destructive" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending HR</p>
                <p className="text-2xl font-bold">{performanceMetrics.pendingHr}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        {user?.role === 'manager' ? (
          <TabsList className="grid w-full grid-cols-4 gap-2">
            <TabsTrigger
              value="active"
              className="bg-blue-600 text-white data-[state=active]:bg-blue-800 data-[state=active]:text-white rounded-lg py-2 text-lg font-semibold shadow"
            >
              My Performance
            </TabsTrigger>
            <TabsTrigger
              value="history"
              className="bg-gray-200 text-gray-800 data-[state=active]:bg-yellow-500 data-[state=active]:text-white rounded-lg py-2 text-lg font-semibold shadow"
            >
              History
            </TabsTrigger>
            <TabsTrigger
              value="review-submissions"
              className="bg-green-600 text-white data-[state=active]:bg-green-800 data-[state=active]:text-white rounded-lg py-2 text-lg font-semibold shadow"
            >
              Review Submissions
            </TabsTrigger>
          </TabsList>
        ) : user?.role === 'hr_manager' || user?.role === 'hr_staff' ? (
          <TabsList className="grid w-full grid-cols-4 gap-2">

            <TabsTrigger
              value="assign"
              className="bg-blue-600 text-white data-[state=active]:bg-blue-800 data-[state=active]:text-white rounded-lg py-2 text-lg font-semibold shadow"
            >
              Assign Reviews
            </TabsTrigger>

            <TabsTrigger
              value="pending"
              className="bg-yellow-600 text-white data-[state=active]:bg-yellow-800 data-[state=active]:text-white rounded-lg py-2 text-lg font-semibold shadow"
            >
              Pending Reviews
            </TabsTrigger>
            <TabsTrigger
              value="my-appraisals"
              className="bg-green-600 text-white data-[state=active]:bg-green-800 data-[state=active]:text-white rounded-lg py-2 text-lg font-semibold shadow"
            >
              My Performance Appraisal
            </TabsTrigger>
          </TabsList>
        ) : (
          <TabsList className="grid w-full grid-cols-2 gap-2">
            <TabsTrigger
              value="active"
              className="bg-blue-600 text-white data-[state=active]:bg-blue-800 data-[state=active]:text-white rounded-lg py-2 text-lg font-semibold shadow"
            >
              My Performance
            </TabsTrigger>
            <TabsTrigger
              value="history"
              className="bg-gray-200 text-gray-800 data-[state=active]:bg-yellow-500 data-[state=active]:text-white rounded-lg py-2 text-lg font-semibold shadow"
            >
              History
            </TabsTrigger>
          </TabsList>
        )}

        {/* HR: Assign Reviews Tab */}
        {(user?.role === 'hr_manager' || user?.role === 'hr_staff') && (
          <TabsContent value="assign">
            <Card>
              <CardHeader>
                <CardTitle>Assign Performance Reviews</CardTitle>
                <CardDescription>Create and assign performance reviews to employees using templates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium">Template</label>
                      <Select value={reviewForm.templateId} onValueChange={(v) => setReviewForm(prev => ({ ...prev, templateId: v }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select template" />
                        </SelectTrigger>
                        <SelectContent>
                          {templates.map(template => (
                            <SelectItem key={template.id} value={template.id}>{template.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Review Period</label>
                      <Input 
                        value={reviewForm.reviewPeriod} 
                        onChange={(e) => setReviewForm(prev => ({ ...prev, reviewPeriod: e.target.value }))}
                        placeholder="e.g. Q1 2024"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Deadline Date</label>
                      <Input 
                        type="date"
                        value={deadlineDate}
                        onChange={(e) => setDeadlineDate(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium">Department</label>
                      <Select value={assignDepartment} onValueChange={setAssignDepartment}>
                        <SelectTrigger>
                          <SelectValue placeholder="All Departments" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Departments</SelectItem>
                          {departments.map((dept) => (
                            <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium">Select Employees</h4>
                      <div className="flex items-center gap-6">
                        <Checkbox
                          checked={employeesByDept.length > 0 && selectedEmployees.length === employeesByDept.length}
                          onCheckedChange={(checked) => handleSelectAllEmployees(!!checked, employeesByDept)}
                        />
                        <span className="text-sm">Select All</span>
                          <div>                       <Button onClick={createNewReview} disabled={!reviewForm.templateId || selectedEmployees.length === 0}>
                    <Plus className="w-4 h-4 mr-2" />
                    Assign to {selectedEmployees.length || 0} Employee{selectedEmployees.length === 1 ? '' : 's'}
                  </Button></div>
                        
                      </div>

                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-64 overflow-y-auto">
                      {employeesByDept.map((emp) => (
                        <div key={emp.id} className="flex items-center gap-3 p-3 border rounded-lg">
                          <Checkbox
                            checked={selectedEmployees.includes(emp.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedEmployees(prev => [...prev, emp.id]);
                              } else {
                                setSelectedEmployees(prev => prev.filter(id => id !== emp.id));
                              }
                            }}
                          />
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate">{emp.name}</p>
                            <p className="text-xs text-muted-foreground truncate">{emp.position} • {emp.department}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* HR: Pending Reviews Tab */}
        {(user?.role === 'hr_manager' || user?.role === 'hr_staff') && (
          <TabsContent value="pending">
            <Card>
              <CardHeader>
                <CardTitle>Pending HR Reviews</CardTitle>
                <CardDescription>Review and approve completed manager reviews</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {reviews
                    .filter(r => r.status === 'hr_review')
                    .sort((a, b) => {
                      const da = getDaysUntil(a.deadlineDate);
                      const db = getDaysUntil(b.deadlineDate);
                      if (da === undefined && db === undefined) return 0;
                      if (da === undefined) return 1;
                      if (db === undefined) return -1;
                      return da - db;
                    })
                    .map((review) => {
                    const employee = mockEmployees.find(emp => emp.id.toString() === review.employeeId);
                    const template = templates.find(t => t.id === review.templateId);
                    const days = getDaysUntil(review.deadlineDate);
                    const dueBadgeClass = days === undefined
                      ? 'bg-muted text-muted-foreground'
                      : days < 0
                        ? 'bg-destructive text-destructive-foreground'
                        : days <= 7
                          ? 'bg-yellow-500 text-white'
                          : 'bg-secondary text-secondary-foreground';
                    return (
                      <div key={review.id} className="p-4 border rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium">{review.employeeName}</h4>
                            <p className="text-sm text-muted-foreground">{review.reviewPeriod} • {template?.name}</p>
                            <p className="text-sm text-muted-foreground">Department: {employee?.department}</p>
                            <p className="text-sm text-muted-foreground">Employee No: {(employee as any)?.employeeNumber || '-'}</p>
                            {review.deadlineDate && (
                              <p className="text-sm text-muted-foreground">Deadline: {new Date(review.deadlineDate).toLocaleDateString()}</p>
                            )}
                            <div className="mt-2">
                              <Badge variant="outline" className="bg-yellow-50">Pending HR Review</Badge>
                              <Badge variant="outline" className={`ml-2 ${dueBadgeClass}`}>
                                {days === undefined
                                  ? 'No deadline'
                                  : days < 0
                                  ? `Overdue by ${Math.abs(days)} day${Math.abs(days) === 1 ? '' : 's'}`
                                  : days === 0
                                  ? 'Due today'
                                  : `Due in ${days} day${days === 1 ? '' : 's'}`}
                              </Badge>
                            </div>
                            {review.managerComments && (
                              <div className="mt-2">
                                <p className="text-sm font-medium">Manager Comments:</p>
                                <p className="text-sm text-muted-foreground">{review.managerComments}</p>
                              </div>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">Manager Score: {review.overallScore?.toFixed(1)}/5.0</p>
<div className="text-right">
  <p className="text-sm font-medium">Manager Score: {review.overallScore?.toFixed(1)}/5.0</p>
  <Button
    variant="outline"
    size="sm"
    className="mt-2"
    onClick={() => navigate(`/performance/reviews/${review.id}/hr`)}
  >
    <Eye className="w-4 h-4 mr-2" />
    Review & Approve
  </Button>
</div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {reviews.filter(r => r.status === 'hr_review').length === 0 && (
                    <div className="text-center py-8">
                      <CheckCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No pending HR reviews</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
        {/* HR: My Performance Appraisal tab */}
        {(user?.role === 'hr_manager' || user?.role === 'hr_staff') && (
          <TabsContent value="my-appraisals">
            <div className="space-y-4">
              {myAppraisals.filter(r => r.status !== 'completed').length === 0 ? (
                <Card>
                  <CardContent className="p-6 text-center text-muted-foreground">
                    No active appraisals for your account.
                  </CardContent>
                </Card>
              ) : (
                myAppraisals.filter(r => r.status !== 'completed').map((review) => {
                  const template = templates.find(t => t.id === review.templateId);
                  return (
                    <Card key={review.id}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle>{review.reviewPeriod} {template ? `- ${template.name}` : ''}</CardTitle>
                          <div className="text-sm text-muted-foreground">Status: {review.status}</div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {review.status === 'new' || review.status === 'draft' ? (
                            <div className="space-y-2">
                              <p className="text-muted-foreground">Start or edit your appraisal targets and submit to your manager.</p>
                              <div className="flex gap-2">
                                <Button className="bg-blue-600 text-white" onClick={() => navigate(`/performance/reviews/${review.id}/self`)}>Set Targets</Button>
                                <Button variant="outline" onClick={() => navigate(`/performance/reviews/${review.id}`)}>View Details</Button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <div>
                                <span className="font-semibold">Employee Targets:</span>
                                <div className="mt-2 space-y-2">
                                  {(review.employeeTargets || []).map((t, idx) => (
                                    <div key={idx} className="bg-muted/30 p-2 rounded">
                                      <div className="text-sm">{t.target}</div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                              {review.status === 'employee_ack' && (
                                <div className="space-y-3 border rounded p-3 bg-blue-50">
                                  <p className="text-sm">Your manager has completed your performance review. Please review and respond.</p>
                                  <Button className="bg-blue-600 text-white" onClick={() => navigate(`/performance/reviews/${review.id}/acknowledge`)}>Review & Respond</Button>
                                </div>
                              )}
                              <div>
                                <Button variant="outline" onClick={() => navigate(`/performance/reviews/${review.id}`)}>View Full Details</Button>
                              </div>
                            </>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </TabsContent>
        )}
        {/* Manager: Review Submissions Tab */}
        {user?.role === 'manager' && (
          <TabsContent value="review-submissions">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">Employee Appraisal Submissions</h2>
                <div className="text-sm text-muted-foreground">
                  Review and provide feedback on employee-submitted appraisals
                </div>
              </div>
              
              {teamAppraisals.filter(r => r.status === 'manager_review').length === 0 ? (
                <Card>
                  <CardContent className="p-6 text-center text-muted-foreground">
                    <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No employee submissions pending review</p>
                  </CardContent>
                </Card>
              ) : (
                teamAppraisals.filter(r => r.status === 'manager_review').map((review) => {
                  const template = templates.find(t => t.id === review.templateId);
                  const employee = mockEmployees.find(emp => emp.id === review.employeeId);
                  return (
                    <Card key={review.id} className="border-l-4 border-l-yellow-500">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="flex items-center gap-2">
                              <Avatar className="w-8 h-8">
                                <AvatarImage src={employee?.avatar} />
                                <AvatarFallback>{employee?.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                              </Avatar>
                              {review.employeeName}
                            </CardTitle>
                            <CardDescription>
                              {review.reviewPeriod} • {template?.name} • {employee?.department}
                            </CardDescription>
                          </div>
                          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                            Pending Review
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {/* Employee Targets mapped to criteria */}
                          {review.employeeTargets && review.employeeTargets.length > 0 && (
                            <div>
                              <h4 className="font-semibold text-sm mb-2">Employee Targets</h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {review.employeeTargets.map((t, idx) => {
                                  const c = template?.criteria.find(c => c.id === t.criteriaId);
                                  return (
                                    <div key={idx} className="bg-blue-50 p-3 rounded-lg">
                                      <div className="text-sm font-medium">{c?.name || t.criteriaId}</div>
                                      <div className="text-sm">{t.target}</div>
                                      {t.description && <div className="text-xs text-muted-foreground mt-1">{t.description}</div>}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                          {review.employeeScores && review.employeeScores.length > 0 && (
                            <div>
                              <h4 className="font-semibold text-sm mt-4 mb-2">Employee Self-Appraisal</h4>
                              <div className="space-y-2">
                                {review.employeeScores.map((s, idx) => {
                                  const c = template?.criteria.find(c => c.id === s.criteriaId);
                                  return (
                                    <div key={idx} className="p-3 border rounded">
                                      <div className="flex justify-between text-sm">
                                        <span>{c?.name || 'Criteria'}</span>
                                        <span>{s.score}/5</span>
                                      </div>
                                      {s.comments && <p className="text-xs text-muted-foreground mt-1">{s.comments}</p>}
                                    </div>
                                  );
                                })}
                                {review.employeeSelfComments && (
                                  <div className="p-3 bg-muted/30 rounded">
                                    <p className="text-sm font-medium">Employee Overall Comments</p>
                                    <p className="text-sm">{review.employeeSelfComments}</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                          
                          <div className="flex gap-2">
                            <Dialog>
                              <DialogTrigger asChild>
                              <Button
  className="bg-blue-600 text-white hover:bg-blue-700"
  onClick={() => navigate(`/performance/reviews/${review.id}/manager`)}
>
  Review & Approve
</Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-3xl md:max-w-4xl">
                                <DialogHeader>
                                  <DialogTitle>Manager Review - {review.employeeName}</DialogTitle>
                                  <DialogDescription>
                                    Provide your feedback and score for this employee's performance
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <p className="font-medium">Employee: {review.employeeName}</p>
                                      <p className="text-sm text-muted-foreground">Period: {review.reviewPeriod}</p>
                                      <p className="text-sm text-muted-foreground">Department: {employee?.department}</p>
                                    </div>
                                    <div>
                                      <p className="font-medium">Template: {template?.name}</p>
                                      <p className="text-sm text-muted-foreground">Type: {template?.type}</p>
                                    </div>
                                  </div>

                                  {/* Unified template criteria view */}
                                  <details className="rounded border bg-muted/20">
                                    <summary className="cursor-pointer px-3 py-2 font-medium">Template Criteria</summary>
                                    <div className="space-y-2 p-3">
                                      <TemplateCriteriaList template={template} />
                                    </div>
                                  </details>
                                  
                                  {review.employeeTargets && review.employeeTargets.length > 0 && (
                                    <details className="rounded border bg-muted/20">
                                      <summary className="cursor-pointer px-3 py-2 font-medium">Employee Targets</summary>
                                      <div className="space-y-2 p-3">
                                        {review.employeeTargets.map((target, idx) => (
                                          <div key={idx} className="bg-muted/30 p-3 rounded">
                                            <p className="text-sm font-medium">{target.target}</p>
                                            {target.description && <p className="text-xs text-muted-foreground mt-1">{target.description}</p>}
                                          </div>
                                        ))}
                                      </div>
                                    </details>
                                  )}
                                  
                                  {/* Manager per-criteria scoring (collapsible) */}
                                  {template && (
                                    <details open className="rounded border">
                                      <summary className="cursor-pointer px-3 py-2 font-medium">Manager Scores</summary>
                                      <div className="space-y-3 p-3">
                                        {template.criteria.map((c, idx) => (
                                          <div key={c.id} className="grid grid-cols-12 gap-2 items-center">
                                            <div className="col-span-6 text-sm">{c.name}</div>
                                            <Input
                                              className="col-span-2"
                                              type="number"
                                              min={1}
                                              max={5}
                                              value={managerScoresDraft[idx]?.score ?? 0}
                                              onChange={(e) => {
                                                const v = Math.max(0, Math.min(5, Number(e.target.value) || 0));
                                                setManagerScoresDraft(prev => {
                                                  const copy = [...prev];
                                                  copy[idx] = { ...copy[idx], criteriaId: c.id, score: v };
                                                  return copy;
                                                });
                                              }}
                                            />
                                            <Textarea
                                              className="col-span-4"
                                              placeholder="Comments"
                                              value={managerScoresDraft[idx]?.comments ?? ''}
                                              onChange={(e) => {
                                                const v = e.target.value;
                                                setManagerScoresDraft(prev => {
                                                  const copy = [...prev];
                                                  copy[idx] = { ...copy[idx], criteriaId: c.id, comments: v, score: copy[idx]?.score ?? 0 };
                                                  return copy;
                                                });
                                              }}
                                              rows={2}
                                            />
                                          </div>
                                        ))}
                                      </div>
                                    </details>
                                  )}
                                  
                                  <div>
                                    <label className="font-medium block mb-2">Manager Comments:</label>
                                    <Textarea 
                                      value={editComments}
                                      onChange={(e) => setEditComments(e.target.value)}
                                      placeholder="Provide detailed feedback on the employee's performance..."
                                      rows={4}
                                    />
                                  </div>
                                </div>
                                <DialogFooter>
                                  <Button variant="outline" onClick={() => setSelectedReview(null)}>
                                    Cancel
                                  </Button>
                                  <Button 
                                    className="bg-green-600 hover:bg-green-700 text-white"
                                    onClick={() => {
                                      if (selectedReview && editComments) {
                                        submitManagerReview(selectedReview.id, managerScoresDraft, editComments);
                                        setSelectedReview(null);
                                        setEditComments('');
                                        setManagerScoresDraft([]);
                                        setEditMode(false);
                                      }
                                    }}
                                    disabled={!editComments}
                                  >
                                    Submit Review
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </TabsContent>
        )}

        <TabsContent value="active">
          <div className="space-y-4">
            <div className="flex items-center justify-end gap-3">
              <label className="text-sm text-muted-foreground">Filter:</label>
              <Select value={activeEmployeeFilter} onValueChange={(v: any) => setActiveEmployeeFilter(v)}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {reviews.filter(r => r.employeeId === user?.id && r.status !== "completed").length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center text-muted-foreground">
                  No active appraisals.
                </CardContent>
              </Card>
            ) : (
              reviews
                .filter(r => r.employeeId === user?.id && r.status !== "completed")
                .filter(r => {
                  if (activeEmployeeFilter === 'all') return true;
                  if (activeEmployeeFilter === 'new') return r.status === 'new' || r.status === 'draft';
                  // active
                  return ['manager_review', 'employee_ack', 'hr_review', 'targets_set'].includes(r.status);
                })
                .map((review) => {
                  const template = templates.find(t => t.id === review.templateId);

                  return (
                    <Card key={review.id}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle>
                            {review.reviewPeriod} {template ? `- ${template.name}` : ""}
                          </CardTitle>
                          <div className="flex items-center gap-2">
                            {review.status === 'new' || review.status === 'draft' ? (
                              <Badge variant="outline" className="bg-gray-100">New</Badge>
                            ) : null}
                            {review.status === 'manager_review' ? (
                              <Badge variant="outline" className="bg-yellow-50 text-yellow-700">Awaiting Manager</Badge>
                            ) : null}
                            {review.status === 'employee_ack' ? (
                              <Badge variant="outline" className="bg-blue-50 text-blue-700">Pending Your Response</Badge>
                            ) : null}
                            {review.status === 'hr_review' ? (
                              <Badge variant="outline" className="bg-purple-50 text-purple-700">Awaiting HR</Badge>
                            ) : null}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div>
                            <span className="font-semibold">Status:</span> {review.status}
                          </div>

                          {review.status === "new" && (
                            <div className="space-y-3">
                              <p className="text-muted-foreground">
                                This is a new appraisal. Please start filling it out.
                              </p>
                              <Button
                                className="bg-blue-600 text-white hover:bg-blue-700"
                                onClick={() => navigate(`/performance/reviews/${review.id}/self`)}
                              >
                                Set Targets
                              </Button>
                            </div>
                          )}

                          {/* Removed duplicate Edit Targets button to avoid duplicates */}

                          {review.status === "draft" && (
                            <div className="space-y-3">
                              <div>
                                <span className="font-semibold">Employee Targets:</span>
                                <div className="mt-2 space-y-2">
                                  {(review.employeeTargets || []).map((t, idx) => {
                                    const c = template?.criteria.find(c => c.id === t.criteriaId);
                                    return (
                                      <div key={idx} className="bg-muted/30 p-2 rounded">
                                        <div className="text-sm font-medium">{c?.name || t.criteriaId}</div>
                                        <div className="text-sm">{t.target}</div>
                                        {t.description && <div className="text-xs text-muted-foreground">{t.description}</div>}
                                      </div>
                                    );
                                  })}
                                  {(!review.employeeTargets || review.employeeTargets.length === 0) && (
                                    <div className="text-sm text-muted-foreground">No goals set yet.</div>
                                  )}
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  className="bg-blue-600 text-white hover:bg-blue-700"
                                  onClick={() => navigate(`/performance/reviews/${review.id}/self`)}
                                >
                                  Edit Targets
                                </Button>
                                <Button
                                  variant="outline"
                                  onClick={() => navigate(`/performance/reviews/${review.id}`)}
                                >
                                  View Details
                                </Button>
                              </div>
                            </div>
                          )}

                          {review.status !== "new" && review.status !== "draft" && (
                            <>
                              <div>
                                <span className="font-semibold">Employee Targets:</span>
                                <div className="mt-2 space-y-2">
                                  {(review.employeeTargets || []).map((t, idx) => {
                                    const c = template?.criteria.find(c => c.id === t.criteriaId);
                                    return (
                                      <div key={idx} className="bg-muted/30 p-2 rounded">
                                        <div className="text-sm font-medium">{c?.name || t.criteriaId}</div>
                                        <div className="text-sm">{t.target}</div>
                                        {t.description && <div className="text-xs text-muted-foreground">{t.description}</div>}
                                      </div>
                                    );
                                  })}
                                  {(!review.employeeTargets || review.employeeTargets.length === 0) && (
                                    <div className="text-sm text-muted-foreground">No goals.</div>
                                  )}
                                </div>
                              </div>

                              {review.status === 'employee_ack' && (
                                <div className="space-y-3 border rounded p-3 bg-blue-50">
                                  <div className="flex items-center justify-between">
                                    <span className="font-semibold">Manager Review Completed</span>
                                    <Badge variant="outline" className="bg-green-100 text-green-700">
                                      Score: {review.overallScore?.toFixed(1)}/5
                                    </Badge>
                                  </div>
                                  <p className="text-sm">Your manager has completed your performance review. Please review and respond.</p>
                                  <Button
                                    className="bg-blue-600 text-white hover:bg-blue-700"
                                    onClick={() => navigate(`/performance/reviews/${review.id}/acknowledge`)}
                                  >
                                    Review & Respond
                                  </Button>
                                </div>
                              )}

                              {review.employeeAckStatus && (
                                <div className={`space-y-2 border rounded p-3 ${review.employeeAckStatus === 'accepted' ? 'bg-green-50' : 'bg-red-50'}`}>
                                  <div className="flex items-center justify-between">
                                    <span className="font-semibold">Your Response</span>
                                    <Badge variant="outline" className={review.employeeAckStatus === 'accepted' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                                      {review.employeeAckStatus === 'accepted' ? 'Accepted' : 'Declined'}
                                    </Badge>
                                  </div>
                                  {review.employeeAckComments && (
                                    <div className="text-sm">
                                      <strong>Your Comments:</strong> {review.employeeAckComments}
                                    </div>
                                  )}
                                  {review.employeeAckDate && (
                                    <div className="text-xs text-muted-foreground">
                                      Responded on: {new Date(review.employeeAckDate).toLocaleDateString()}
                                    </div>
                                  )}
                                </div>
                              )}
                              {review.status === 'completed' && review.overallScore && (
                                <div className="space-y-3 border rounded p-3 bg-green-50">
                                  <div className="flex items-center justify-between">
                                    <span className="font-semibold">Review Completed</span>
                                    <Badge variant="outline" className="bg-green-100 text-green-700">Final Score: {review.overallScore.toFixed(1)}/5</Badge>
                                  </div>
                                  {review.hrComments && (
                                    <div className="text-sm"><strong>HR Comments:</strong> {review.hrComments}</div>
                                  )}
                                  {review.managerComments && (
                                    <div className="text-sm"><strong>Manager Comments:</strong> {review.managerComments}</div>
                                  )}
                                </div>
                              )}
                              <div>
                                <span className="font-semibold">Manager Feedback:</span>{" "}
                                {review.managerComments || "No feedback."}
                              </div>
                              <div>
                                <span className="font-semibold">HR Feedback:</span>{" "}
                                {review.hrComments || "No feedback."}
                              </div>
                              <div>
                                <span className="font-semibold">Next Review Date:</span>{" "}
                                {review.nextReviewDate}
                              </div>
                              <Button
                                variant="outline"
                                onClick={() => navigate(`/performance/reviews/${review.id}`)}
                              >
                                View Full Details
                              </Button>
                            </>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
            )}
          </div>

      {/* ✅ Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedReview?.status === "new" ? "Start Appraisal" : "Edit Appraisal"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <label className="block text-sm font-medium">Goals</label>
            <textarea
              className="w-full border rounded-md p-2"
              rows={4}
              value={goals}
              onChange={(e) => setGoals(e.target.value)}
            />
          </div>

          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button onClick={handleSaveDraft}>
              Save Draft
            </Button>
            <Button className="bg-blue-600 text-white hover:bg-blue-700" onClick={handleSubmitToManager}>
              Submit to Manager
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </TabsContent>
  


        <TabsContent value="history">
          <div className="space-y-4">
            {reviews.filter(r => r.status === 'completed').length === 0 ? (
              <Card><CardContent className="p-6 text-center text-muted-foreground">No appraisal history.</CardContent></Card>
            ) : (
              reviews.filter(r => r.status === 'completed').map((review) => (
                <Card key={review.id}>
                  <CardHeader>
                    <CardTitle>{review.reviewPeriod}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div><span className="font-semibold">Score:</span> {review.overallScore || '-'} / 5</div>
                      <div><span className="font-semibold">Feedback:</span> {review.managerComments || 'No feedback.'}</div>
                      <div>
                        <span className="font-semibold">Employee Targets:</span>
                        <div className="mt-1 space-y-1">
                          {(review.employeeTargets || []).map((t, idx) => {
                            const template = templates.find(tp => tp.id === review.templateId);
                            const c = template?.criteria.find(c => c.id === t.criteriaId);
                            return (
                              <div key={idx} className="text-sm">
                                <span className="font-medium">{c?.name || t.criteriaId}:</span> {t.target}
                                {t.description && <span className="text-xs text-muted-foreground"> — {t.description}</span>}
                              </div>
                            );
                          })}
                          {(!review.employeeTargets || review.employeeTargets.length === 0) && (
                            <div className="text-sm text-muted-foreground">No goals.</div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* Templates */}
        <TabsContent value="templates">
          <Card>
            <CardHeader>
              <CardTitle>Performance Templates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {templates.map((template) => (
                  <div key={template.id} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-medium">{template.name}</h4>
                        <p className="text-sm text-muted-foreground mb-2">{template.description}</p>
                        <Badge variant="outline">{template.type}</Badge>
                      </div>
                      <div className="text-right text-sm text-muted-foreground">
                        <p>Created by {template.createdBy}</p>
                        <p>{new Date(template.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="mb-3">
                      <p className="text-xs font-medium text-muted-foreground mb-1">Criteria:</p>
                      <div className="space-y-1">
                        {template.criteria.map(criteria => (
                          <div key={criteria.id} className="flex justify-between text-sm">
                            <span>{criteria.name}</span>
                            <span className="text-muted-foreground">{criteria.weight}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">Preview</Button>
                      <Button variant="outline" size="sm">Edit</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Target Setting */}
        <TabsContent value="targets">
          <Card>
            <CardHeader>
              <CardTitle>Target Setting</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reviews.filter(r => r.status === 'draft' && r.employeeId === user?.id).map((review) => {
                  const template = templates.find(t => t.id === review.templateId);
                  return (
                    <div key={review.id} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-medium">{review.reviewPeriod}</h4>
                          <p className="text-sm text-muted-foreground">{template?.name}</p>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => navigate(`/performance/reviews/${review.id}/self`)}>
                          <Target className="w-4 h-4 mr-2" />
                          Set Targets
                        </Button>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Set your performance targets for this review period.
                      </p>
                    </div>
                  );
                })}
                {reviews.filter(r => r.status === 'draft' && r.employeeId === user?.id).length === 0 && (
                  <div className="text-center py-8">
                    <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No reviews available for target setting</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Approvals */}
        <TabsContent value="approvals">
          <div className="space-y-4">
            {user?.role === 'manager' && (
              <Card>
                <CardHeader>
                  <CardTitle>Manager Reviews</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {reviews.filter(r => r.status === 'targets_set').map((review) => {
                      const employee = mockEmployees.find(emp => emp.id === review.employeeId);
                      return (
                        <div key={review.id} className="p-4 border rounded-lg">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium">{review.employeeName}</h4>
                              <p className="text-sm text-muted-foreground">{review.reviewPeriod}</p>
                            </div>
                            <Button variant="outline" size="sm">
                              <Edit className="w-4 h-4 mr-2" />
                              Review
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {user?.role === 'hr_manager' && (
              <Card>
                <CardHeader>
                  <CardTitle>HR Reviews</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {reviews.filter(r => r.status === 'manager_review').map((review) => {
                      const employee = mockEmployees.find(emp => emp.id === review.employeeId);
                      return (
                        <div key={review.id} className="p-4 border rounded-lg">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium">{review.employeeName}</h4>
                              <p className="text-sm text-muted-foreground">{review.reviewPeriod}</p>
                            </div>
                            <Button variant="outline" size="sm">
                              <Edit className="w-4 h-4 mr-2" />
                              Final Review
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Target Setting Dialog removed in favor of standalone self-appraisal page */}
    </div>
  );
};