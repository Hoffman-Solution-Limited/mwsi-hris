import React, { useMemo, useState } from 'react';
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
import { Textarea } from '@/components/ui/textarea';
import { mockEmployees } from '@/data/mockData';
import { useAuth } from '@/contexts/AuthContext';
import { usePerformance, PerformanceTemplate, PerformanceReview } from '@/contexts/PerformanceContext';

export const PerformanceReviews: React.FC = () => {
  const { user } = useAuth();
  const { templates, reviews, createTemplate, createReview, setEmployeeTargets, submitManagerReview, submitHrReview, updateReview } = usePerformance();
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [targetDialogOpen, setTargetDialogOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState<PerformanceReview | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editComments, setEditComments] = useState('');
  const [editScore, setEditScore] = useState<number | ''>('');

  // Manager-specific review filters
  const myAppraisals = useMemo(() => {
    if (!user || user.role !== 'manager') return [];
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
  const inProgressReviews = reviews.filter(review => ['targets_set', 'manager_review', 'hr_review'].includes(review.status));
  const draftReviews = reviews.filter(review => review.status === 'draft');

  const performanceMetrics = {
    avgScore: completedReviews.length > 0 
      ? completedReviews.reduce((sum, review) => sum + (review.overallScore || 0), 0) / completedReviews.length 
      : 0,
    completionRate: reviews.length > 0 ? (completedReviews.length / reviews.length) * 100 : 0,
    pendingManager: reviews.filter(r => r.status === 'targets_set').length,
    pendingHr: reviews.filter(r => r.status === 'manager_review').length
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

  const createNewReview = () => {
    if (!user || !reviewForm.employeeId || !reviewForm.templateId) return;
    
    const employee = mockEmployees.find(emp => emp.id === reviewForm.employeeId);
    if (!employee) return;

    const template = templates.find(t => t.id === reviewForm.templateId);
    if (!template) return;

    createReview({
      employeeId: reviewForm.employeeId,
      employeeName: employee.name,
      templateId: reviewForm.templateId,
      reviewPeriod: reviewForm.reviewPeriod,
      status: 'draft',
      employeeTargets: [],
      managerScores: [],
      hrScores: [],
      managerComments: '',
      hrComments: '',
      nextReviewDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      createdBy: user.name
    });
    
    setReviewForm({ employeeId: '', templateId: '', reviewPeriod: '' });
    setReviewDialogOpen(false);
  };

  // Target setting
  const [targets, setTargets] = useState<{ criteriaId: string; target: string; description: string }[]>([]);

  const handleSetTargets = () => {
    if (!selectedReview) return;
    setEmployeeTargets(selectedReview.id, targets);
    setTargetDialogOpen(false);
    setTargets([]);
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
    }
    setTargetDialogOpen(true);
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
          {user?.role !== 'employee' && (
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
              
              <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    New Review
                  </Button>
                </DialogTrigger>
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
          <TabsList className="grid w-full grid-cols-2 gap-2">
            <TabsTrigger
              value="my-appraisals"
              className="bg-blue-600 text-white data-[state=active]:bg-blue-800 data-[state=active]:text-white rounded-lg py-2 text-lg font-semibold shadow"
            >
              My Appraisals
            </TabsTrigger>
            <TabsTrigger
              value="team-appraisals"
              className="bg-gray-200 text-gray-800 data-[state=active]:bg-yellow-500 data-[state=active]:text-white rounded-lg py-2 text-lg font-semibold shadow"
            >
              Team Appraisals
            </TabsTrigger>
          </TabsList>
        ) : user?.role === 'hr_manager' || user?.role === 'hr_staff' ? (
          <TabsList className="grid w-full grid-cols-3 gap-2">
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
              value="history"
              className="bg-gray-200 text-gray-800 data-[state=active]:bg-green-500 data-[state=active]:text-white rounded-lg py-2 text-lg font-semibold shadow"
            >
              Review History
            </TabsTrigger>
          </TabsList>
        ) : (
          <TabsList className="grid w-full grid-cols-2 gap-2">
            <TabsTrigger
              value="active"
              className="bg-blue-600 text-white data-[state=active]:bg-blue-800 data-[state=active]:text-white rounded-lg py-2 text-lg font-semibold shadow"
            >
              Active Appraisal
            </TabsTrigger>
            <TabsTrigger
              value="history"
              className="bg-gray-200 text-gray-800 data-[state=active]:bg-yellow-500 data-[state=active]:text-white rounded-lg py-2 text-lg font-semibold shadow"
            >
              Appraisal History
            </TabsTrigger>
          </TabsList>
        )}

        {/* Manager: My Appraisals Tab */}
        {user?.role === 'manager' && (
          <TabsContent value="my-appraisals">
            <div className="space-y-4">
              <h2 className="text-xl font-bold mb-2">My Active Appraisals</h2>
              {myAppraisals.filter(r => r.status !== 'completed').length === 0 ? (
                <Card><CardContent className="p-6 text-center text-muted-foreground">No active appraisals.</CardContent></Card>
              ) : (
                myAppraisals.filter(r => r.status !== 'completed').map((review) => {
                  const template = templates.find(t => t.id === review.templateId);
                  return (
                    <Card key={review.id}>
                      <CardHeader>
                        <CardTitle>{review.reviewPeriod} {template ? `- ${template.name}` : ''}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div><span className="font-semibold">Status:</span> <Badge>{review.status}</Badge></div>
                          <div><span className="font-semibold">Score:</span> {review.overallScore || '-'} / 5</div>
                          <div><span className="font-semibold">Feedback:</span> {review.managerComments || 'No feedback.'}</div>
                          <div><span className="font-semibold">Goals:</span> {review.employeeTargets && review.employeeTargets.length > 0 ? review.employeeTargets.map(t => t.target).join(', ') : 'No goals.'}</div>
                          <div className="flex gap-2 mt-2">
                            <Button variant="default" size="sm" onClick={() => {
                              setSelectedReview(review);
                              setEditMode(true);
                              // Prepare editable targets for modal
                              const template = templates.find(t => t.id === review.templateId);
                              if (template) {
                                setTargets(
                                  template.criteria.map(criteria => {
                                    const existing = review.employeeTargets?.find(t => t.criteriaId === criteria.id);
                                    return {
                                      criteriaId: criteria.id,
                                      target: existing?.target || '',
                                      description: existing?.description || ''
                                    };
                                  })
                                );
                              }
                            }}>Edit</Button>
                            {/* Modal for editing manager's own goals/targets */}
                            <Dialog open={!!selectedReview && editMode} onOpenChange={(open) => { if (!open) setSelectedReview(null); }}>
                              <DialogContent className="max-w-xl">
                                <DialogHeader>
                                  <DialogTitle>Edit Your Goals</DialogTitle>
                                  <DialogDescription>Edit your performance targets for this review period.</DialogDescription>
                                </DialogHeader>
                                {selectedReview && (
                                  <div className="space-y-4">
                                    {targets.map((target, idx) => {
                                      const criteria = templates.find(t => t.id === selectedReview.templateId)?.criteria.find(c => c.id === target.criteriaId);
                                      return (
                                        <div key={target.criteriaId} className="space-y-2">
                                          <label className="text-sm font-medium">{criteria?.name}</label>
                                          <p className="text-xs text-muted-foreground">{criteria?.description}</p>
                                          <Input
                                            placeholder="Your target for this criteria"
                                            value={target.target}
                                            onChange={e => {
                                              const newTargets = [...targets];
                                              newTargets[idx].target = e.target.value;
                                              setTargets(newTargets);
                                            }}
                                          />
                                          <Textarea
                                            placeholder="Describe how you plan to achieve this target"
                                            value={target.description}
                                            onChange={e => {
                                              const newTargets = [...targets];
                                              newTargets[idx].description = e.target.value;
                                              setTargets(newTargets);
                                            }}
                                            rows={2}
                                          />
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                                <DialogFooter>
                                  <div className="flex gap-2">
                                    <Button variant="outline" onClick={() => setSelectedReview(null)}>Close</Button>
                                    {selectedReview && (
                                      <Button variant="default" onClick={() => {
                                        setEmployeeTargets(selectedReview.id, targets);
                                        setSelectedReview(null);
                                      }}>Save</Button>
                                    )}
                                  </div>
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
              <h2 className="text-xl font-bold mt-8 mb-2">My Appraisal History</h2>
              {myAppraisals.filter(r => r.status === 'completed').length === 0 ? (
                <Card><CardContent className="p-6 text-center text-muted-foreground">No appraisal history.</CardContent></Card>
              ) : (
                myAppraisals.filter(r => r.status === 'completed').map((review) => {
                  const template = templates.find(t => t.id === review.templateId);
                  return (
                    <Card key={review.id}>
                      <CardHeader>
                        <CardTitle>{review.reviewPeriod} {template ? `- ${template.name}` : ''}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div><span className="font-semibold">Score:</span> {review.overallScore || '-'} / 5</div>
                          <div><span className="font-semibold">Feedback:</span> {review.managerComments || 'No feedback.'}</div>
                          <div><span className="font-semibold">Goals:</span> {review.employeeTargets && review.employeeTargets.length > 0 ? review.employeeTargets.map(t => t.target).join(', ') : 'No goals.'}</div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </TabsContent>
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
                      <label className="text-sm font-medium">Employee</label>
                      <Select value={reviewForm.employeeId} onValueChange={(v) => setReviewForm(prev => ({ ...prev, employeeId: v }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select employee" />
                        </SelectTrigger>
                        <SelectContent>
                          {mockEmployees.map(emp => (
                            <SelectItem key={emp.id} value={emp.id.toString()}>{emp.name}</SelectItem>
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
                  </div>
                  <Button onClick={createNewReview}>
                    <Plus className="w-4 h-4 mr-2" />
                    Assign Review
                  </Button>
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
                  {reviews.filter(r => r.status === 'manager_review').map((review) => {
                    const employee = mockEmployees.find(emp => emp.id.toString() === review.employeeId);
                    const template = templates.find(t => t.id === review.templateId);
                    return (
                      <div key={review.id} className="p-4 border rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium">{review.employeeName}</h4>
                            <p className="text-sm text-muted-foreground">{review.reviewPeriod} • {template?.name}</p>
                            <p className="text-sm text-muted-foreground">Department: {employee?.department}</p>
                            <div className="mt-2">
                              <Badge variant="outline" className="bg-yellow-50">Pending HR Review</Badge>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">Manager Score: {review.overallScore?.toFixed(1)}/5.0</p>
                            <Button variant="outline" size="sm" className="mt-2">
                              <Eye className="w-4 h-4 mr-2" />
                              Review & Approve
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {reviews.filter(r => r.status === 'manager_review').length === 0 && (
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
        {user?.role === 'manager' && (
          <TabsContent value="team-appraisals">
            <div className="space-y-4">
              <h2 className="text-xl font-bold mb-2">Team Appraisals</h2>
              {teamAppraisals.length === 0 ? (
                <Card><CardContent className="p-6 text-center text-muted-foreground">No team appraisals found.</CardContent></Card>
              ) : (
                teamAppraisals.map((review) => {
                  const template = templates.find(t => t.id === review.templateId);
                  const canReview = ['manager_review', 'targets_set'].includes(review.status);
                  return (
                    <Card key={review.id}>
                      <CardHeader>
                        <CardTitle>{review.employeeName} - {review.reviewPeriod} {template ? `- ${template.name}` : ''}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div><span className="font-semibold">Score:</span> {review.overallScore || '-'} / 5</div>
                          <div><span className="font-semibold">Feedback:</span> {review.managerComments || 'No feedback.'}</div>
                          <div><span className="font-semibold">Goals:</span> {review.employeeTargets && review.employeeTargets.length > 0 ? review.employeeTargets.map(t => t.target).join(', ') : 'No goals.'}</div>
                          {canReview && (
                            <Button variant="outline" size="sm" onClick={() => setSelectedReview(review)}>
                              Review & Submit
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
            {/* Review dialog/modal for selectedReview */}
            <Dialog open={!!selectedReview} onOpenChange={(open) => { if (!open) setSelectedReview(null); }}>
              <DialogContent className="max-w-xl">
                <DialogHeader>
                  <DialogTitle>{editMode ? 'Edit Appraisal' : 'View Appraisal'}</DialogTitle>
                  <DialogDescription>
                    {editMode ? 'Edit your feedback and score for this appraisal.' : 'View appraisal details.'}
                  </DialogDescription>
                </DialogHeader>
                {selectedReview && (
                  <div className="space-y-4">
                    <div><span className="font-semibold">Employee:</span> {selectedReview.employeeName}</div>
                    <div><span className="font-semibold">Review Period:</span> {selectedReview.reviewPeriod}</div>
                    <div><span className="font-semibold">Status:</span> <Badge>{selectedReview.status}</Badge></div>
                    <div><span className="font-semibold">Goals:</span> {selectedReview.employeeTargets && selectedReview.employeeTargets.length > 0 ? selectedReview.employeeTargets.map(t => t.target).join(', ') : 'No goals.'}</div>
                    {editMode ? (
                      <>
                        <div>
                          <label className="font-semibold">Score:</label>
                          <Input type="number" min={1} max={5} value={editScore} onChange={e => setEditScore(Number(e.target.value))} className="mt-1" />
                        </div>
                        <div>
                          <label className="font-semibold">Manager Comments:</label>
                          <Textarea value={editComments} onChange={e => setEditComments(e.target.value)} rows={3} className="mt-1" />
                        </div>
                      </>
                    ) : (
                      <>
                        <div><span className="font-semibold">Score:</span> {selectedReview.overallScore || '-'} / 5</div>
                        <div><span className="font-semibold">Manager Comments:</span> {selectedReview.managerComments || 'No feedback.'}</div>
                      </>
                    )}
                  </div>
                )}
                <DialogFooter>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setSelectedReview(null)}>Close</Button>
                    {editMode && selectedReview && (
                      <Button variant="default" onClick={() => {
                        // Save logic: update review with new comments and score
                        submitManagerReview(
                          selectedReview.id,
                          [], // managerScores (criteria-level scores not edited here)
                          editComments
                        );
                        if (typeof editScore === 'number') {
                          updateReview(selectedReview.id, { overallScore: editScore });
                        }
                        setSelectedReview(null);
                      }}>Save</Button>
                    )}
                  </div>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </TabsContent>
  )}

        {/* Active Appraisal Tab */}
        <TabsContent value="active">
          <div className="space-y-4">
            {reviews.filter(r => r.employeeId === user?.id && r.status !== 'completed').length === 0 ? (
              <Card><CardContent className="p-6 text-center text-muted-foreground">No active appraisals.</CardContent></Card>
            ) : (
              reviews.filter(r => r.employeeId === user?.id && r.status !== 'completed').map((review) => {
                const template = templates.find(t => t.id === review.templateId);
                return (
                  <Card key={review.id}>
                    <CardHeader>
                      <CardTitle>{review.reviewPeriod} {template ? `- ${template.name}` : ''}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div><span className="font-semibold">Status:</span> {review.status}</div>
                        <div><span className="font-semibold">Goals:</span> {review.employeeTargets && review.employeeTargets.length > 0 ? review.employeeTargets.map(t => t.target).join(', ') : 'No goals.'}</div>
                        <div><span className="font-semibold">Manager Feedback:</span> {review.managerComments || 'No feedback.'}</div>
                        <div><span className="font-semibold">HR Feedback:</span> {review.hrComments || 'No feedback.'}</div>
                        <div><span className="font-semibold">Next Review Date:</span> {review.nextReviewDate}</div>
                        {/* No edit/view buttons for employee active appraisal */}
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
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
                      <div><span className="font-semibold">Goals:</span> {review.employeeTargets && review.employeeTargets.length > 0 ? review.employeeTargets.map(t => t.target).join(', ') : 'No goals.'}</div>
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
                        <Button variant="outline" size="sm" onClick={() => openTargetDialog(review)}>
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

      {/* Target Setting Dialog */}
      <Dialog open={targetDialogOpen} onOpenChange={setTargetDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Set Performance Targets</DialogTitle>
            <DialogDescription>Define your targets for this review period.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {targets.map((target, index) => {
              const criteria = selectedReview ? templates.find(t => t.id === selectedReview.templateId)?.criteria.find(c => c.id === target.criteriaId) : null;
              return (
                <div key={target.criteriaId} className="space-y-2">
                  <label className="text-sm font-medium">{criteria?.name}</label>
                  <p className="text-xs text-muted-foreground">{criteria?.description}</p>
                  <Input
                    placeholder="Your target for this criteria"
                    value={target.target}
                    onChange={(e) => {
                      const newTargets = [...targets];
                      newTargets[index].target = e.target.value;
                      setTargets(newTargets);
                    }}
                  />
                  <Textarea
                    placeholder="Describe how you plan to achieve this target"
                    value={target.description}
                    onChange={(e) => {
                      const newTargets = [...targets];
                      newTargets[index].description = e.target.value;
                      setTargets(newTargets);
                    }}
                    rows={2}
                  />
                </div>
              );
            })}
          </div>
          <DialogFooter>
            <Button onClick={handleSetTargets}>Set Targets</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};