import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Edit, Trash2, Eye, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { usePerformance, PerformanceTemplate } from '@/contexts/PerformanceContext';
import { useSystemLogs } from '@/contexts/SystemLogsContext';
import { mockEmployees } from '@/data/mockEmployees';

type NewTemplate = Omit<PerformanceTemplate, 'id' | 'createdAt' | 'createdBy'>;

export default function AdminPerformanceTemplates() {
  const navigate = useNavigate();
  const { templates, createTemplate, createReview } = usePerformance();
  const { addLog } = useSystemLogs();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<PerformanceTemplate | null>(null);
  const [viewTemplate, setViewTemplate] = useState<PerformanceTemplate | null>(null);
  
  const [newTemplate, setNewTemplate] = useState<NewTemplate>({
    name: '',
    type: 'quarterly',
    description: '',
    criteria: []
  });

  const [reviewForm, setReviewForm] = useState({
    employeeId: '',
    reviewPeriod: '',
    nextReviewDate: ''
  });

  const [newCriteria, setNewCriteria] = useState({
    name: '',
    weight: 0,
    description: ''
  });

  const handleCreateTemplate = () => {
    if (newTemplate.name && newTemplate.criteria.length > 0) {
      // Validate weights sum to 100
      const totalWeight = newTemplate.criteria.reduce((sum, c) => sum + c.weight, 0);
      if (totalWeight !== 100) {
        alert('Criteria weights must sum to 100%');
        return;
      }

      createTemplate({
        ...newTemplate,
        createdBy: 'admin'
      });
      
      addLog({
        action: 'Created performance review template',
        actionType: 'create',
        details: `Created template: ${newTemplate.name} (${newTemplate.type})`,
        entityType: 'performance_template',
        status: 'success'
      });

      setNewTemplate({ name: '', type: 'quarterly', description: '', criteria: [] });
      setIsCreateOpen(false);
    }
  };

  const addCriteria = () => {
    if (newCriteria.name && newCriteria.weight > 0) {
      setNewTemplate(prev => ({
        ...prev,
        criteria: [
          ...prev.criteria,
          {
            id: crypto.randomUUID(),
            ...newCriteria
          }
        ]
      }));
      setNewCriteria({ name: '', weight: 0, description: '' });
    }
  };

  const removeCriteria = (id: string) => {
    setNewTemplate(prev => ({
      ...prev,
      criteria: prev.criteria.filter(c => c.id !== id)
    }));
  };

  const handleAssignTemplate = () => {
    if (selectedTemplate && reviewForm.employeeId && reviewForm.reviewPeriod) {
      const employee = mockEmployees.find(e => e.id === reviewForm.employeeId);
      if (!employee) return;

      createReview({
        employeeId: reviewForm.employeeId,
        employeeName: employee.name,
        templateId: selectedTemplate.id,
        reviewPeriod: reviewForm.reviewPeriod,
        status: 'draft',
        nextReviewDate: reviewForm.nextReviewDate,
        createdBy: 'admin'
      });

      addLog({
        action: 'Assigned performance review template',
        actionType: 'assign',
        details: `Assigned ${selectedTemplate.name} template to ${employee.name}`,
        entityType: 'performance_review',
        status: 'success'
      });

      setReviewForm({ employeeId: '', reviewPeriod: '', nextReviewDate: '' });
      setSelectedTemplate(null);
      setIsAssignOpen(false);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'quarterly': return 'bg-blue-100 text-blue-800';
      case 'half-yearly': return 'bg-green-100 text-green-800';
      case 'yearly': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/admin')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Admin Panel
        </Button>
      </div>

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Performance Review Templates</h1>
          <p className="text-muted-foreground">Create and manage performance review templates</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Create Template
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Performance Template</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Template Name</Label>
                  <Input
                    id="name"
                    value={newTemplate.name}
                    onChange={(e) => setNewTemplate(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g. Quarterly Review 2024"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Review Type</Label>
                  <Select
                    value={newTemplate.type}
                    onValueChange={(value: 'quarterly' | 'half-yearly' | 'yearly') =>
                      setNewTemplate(prev => ({ ...prev, type: value }))
                    }
                  >
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
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newTemplate.description}
                  onChange={(e) => setNewTemplate(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe the purpose of this template..."
                />
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Evaluation Criteria</h3>
                
                <div className="grid grid-cols-12 gap-2">
                  <div className="col-span-5">
                    <Input
                      placeholder="Criteria name"
                      value={newCriteria.name}
                      onChange={(e) => setNewCriteria(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div className="col-span-2">
                    <Input
                      type="number"
                      placeholder="Weight %"
            value={newCriteria.weight.toString() || ''}
            onChange={(e) => setNewCriteria(prev => ({ ...prev, weight: parseInt(e.target.value) || 0 }))}
                    />
                  </div>
                  <div className="col-span-4">
                    <Input
                      placeholder="Description"
                      value={newCriteria.description}
                      onChange={(e) => setNewCriteria(prev => ({ ...prev, description: e.target.value }))}
                    />
                  </div>
                  <div className="col-span-1">
                    <Button onClick={addCriteria} size="sm" className="w-full">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {newTemplate.criteria.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-sm font-medium">
                      Current Criteria (Total Weight: {newTemplate.criteria.reduce((sum, c) => sum + c.weight, 0)}%)
                    </div>
                    {newTemplate.criteria.map((criteria) => (
                      <div key={criteria.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <div className="flex-1">
                          <div className="font-medium">{criteria.name} ({criteria.weight}%)</div>
                          <div className="text-sm text-muted-foreground">{criteria.description}</div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeCriteria(criteria.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateTemplate}>Create Template</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6">
        {templates.map((template) => (
          <Card key={template.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {template.name}
                    <Badge className={getTypeColor(template.type)}>
                      {template.type}
                    </Badge>
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    {template.description}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Created: {new Date(template.createdAt).toLocaleDateString()} | 
                    Criteria: {template.criteria.length}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setViewTemplate(template)}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedTemplate(template);
                      setIsAssignOpen(true);
                    }}
                  >
                    <Users className="w-4 h-4" />
                    Assign
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <h4 className="font-medium">Evaluation Criteria:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {template.criteria.map((criteria) => (
                    <div key={criteria.id} className="flex justify-between items-center p-2 bg-muted rounded">
                      <span className="text-sm">{criteria.name}</span>
                      <Badge variant="secondary">{criteria.weight}%</Badge>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* View Template Dialog */}
      <Dialog open={!!viewTemplate} onOpenChange={() => setViewTemplate(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Template Details: {viewTemplate?.name}</DialogTitle>
          </DialogHeader>
          {viewTemplate && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Type</Label>
                  <Badge className={getTypeColor(viewTemplate.type)}>{viewTemplate.type}</Badge>
                </div>
                <div>
                  <Label>Created</Label>
                  <p>{new Date(viewTemplate.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              <div>
                <Label>Description</Label>
                <p className="text-sm text-muted-foreground">{viewTemplate.description}</p>
              </div>
              <div>
                <Label>Evaluation Criteria</Label>
                <div className="space-y-2">
                  {viewTemplate.criteria.map((criteria) => (
                    <div key={criteria.id} className="p-3 border rounded-lg">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-medium">{criteria.name}</span>
                        <Badge variant="secondary">{criteria.weight}%</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{criteria.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Assign Template Dialog */}
      <Dialog open={isAssignOpen} onOpenChange={setIsAssignOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Template: {selectedTemplate?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Select Employee</Label>
              <Select
                value={reviewForm.employeeId}
                onValueChange={(value) => setReviewForm(prev => ({ ...prev, employeeId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose employee..." />
                </SelectTrigger>
                <SelectContent>
                  {mockEmployees.map((employee) => (
                    <SelectItem key={employee.id.toString()} value={employee.id.toString()}>
                      {employee.name} - Developer
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Review Period</Label>
              <Input
                value={reviewForm.reviewPeriod}
                onChange={(e) => setReviewForm(prev => ({ ...prev, reviewPeriod: e.target.value }))}
                placeholder="e.g. Q1 2024, Jan-Mar 2024"
              />
            </div>

            <div className="space-y-2">
              <Label>Next Review Date</Label>
              <Input
                type="date"
                value={reviewForm.nextReviewDate}
                onChange={(e) => setReviewForm(prev => ({ ...prev, nextReviewDate: e.target.value }))}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsAssignOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAssignTemplate}>Assign Template</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}