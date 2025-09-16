import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Users, Calendar, BookOpen, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { useSystemLogs } from '@/contexts/SystemLogsContext';
import { mockEmployees } from '@/data/mockEmployees';

interface TrainingProgram {
  id: string;
  name: string;
  description: string;
  category: 'mandatory' | 'skill_development' | 'compliance' | 'leadership';
  duration: number; // in hours
  provider: string;
  maxParticipants?: number;
  prerequisites?: string;
  createdAt: string;
  status: 'active' | 'inactive';
}

interface TrainingAssignment {
  id: string;
  programId: string;
  employeeId: number;
  assignedDate: string;
  dueDate?: string;
  status: 'assigned' | 'in_progress' | 'completed' | 'overdue';
  completedDate?: string;
  score?: number;
}

const mockTrainingPrograms: TrainingProgram[] = [
  {
    id: '1',
    name: 'Cybersecurity Awareness',
    description: 'Essential cybersecurity training covering phishing, passwords, and data protection',
    category: 'mandatory',
    duration: 2,
    provider: 'Internal IT Department',
    createdAt: '2024-01-15T10:00:00Z',
    status: 'active'
  },
  {
    id: '2',
    name: 'Leadership Development Program',
    description: 'Comprehensive leadership skills development for managers and supervisors',
    category: 'leadership',
    duration: 16,
    provider: 'External Training Provider',
    maxParticipants: 20,
    prerequisites: 'Management position or 3+ years experience',
    createdAt: '2024-02-01T09:00:00Z',
    status: 'active'
  },
  {
    id: '3',
    name: 'Data Protection & GDPR Compliance',
    description: 'Understanding GDPR requirements and data protection best practices',
    category: 'compliance',
    duration: 4,
    provider: 'Legal Department',
    createdAt: '2024-01-20T14:00:00Z',
    status: 'active'
  }
];

const mockTrainingAssignments: TrainingAssignment[] = [
  {
    id: '1',
    programId: '1',
    employeeId: 1,
    assignedDate: '2024-03-01T10:00:00Z',
    dueDate: '2024-03-31T23:59:59Z',
    status: 'completed',
    completedDate: '2024-03-15T16:30:00Z',
    score: 95
  },
  {
    id: '2',
    programId: '2',
    employeeId: 2,
    assignedDate: '2024-03-05T09:00:00Z',
    status: 'in_progress'
  }
];

export default function AdminTrainingManagement() {
  const navigate = useNavigate();
  const { addLog } = useSystemLogs();
  
  const [programs, setPrograms] = useState<TrainingProgram[]>(mockTrainingPrograms);
  const [assignments, setAssignments] = useState<TrainingAssignment[]>(mockTrainingAssignments);
  const [isCreateProgramOpen, setIsCreateProgramOpen] = useState(false);
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<TrainingProgram | null>(null);
  
  const [newProgram, setNewProgram] = useState<Omit<TrainingProgram, 'id' | 'createdAt'>>({
    name: '',
    description: '',
    category: 'skill_development',
    duration: 1,
    provider: '',
    status: 'active'
  });

  const [assignmentForm, setAssignmentForm] = useState({
    employeeIds: [] as number[],
    dueDate: ''
  });

  const handleCreateProgram = () => {
    if (newProgram.name && newProgram.description && newProgram.provider) {
      const program: TrainingProgram = {
        ...newProgram,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString()
      };

      setPrograms(prev => [program, ...prev]);
      
      addLog({
        action: 'Created training program',
        actionType: 'create',
        details: `Created program: ${newProgram.name} (${newProgram.category})`,
        entityType: 'training_program',
        entityId: program.id,
        status: 'success'
      });

      setNewProgram({
        name: '',
        description: '',
        category: 'skill_development',
        duration: 1,
        provider: '',
        status: 'active'
      });
      setIsCreateProgramOpen(false);
    }
  };

  const handleAssignProgram = () => {
    if (selectedProgram && assignmentForm.employeeIds.length > 0) {
      const newAssignments = assignmentForm.employeeIds.map(employeeId => {
        const assignment: TrainingAssignment = {
          id: crypto.randomUUID(),
          programId: selectedProgram.id,
          employeeId,
          assignedDate: new Date().toISOString(),
          dueDate: assignmentForm.dueDate || undefined,
          status: 'assigned'
        };
        return assignment;
      });

      setAssignments(prev => [...newAssignments, ...prev]);
      
      const employeeNames = assignmentForm.employeeIds
        .map(id => mockEmployees.find(e => e.id === id)?.name)
        .filter(Boolean)
        .join(', ');

      addLog({
        action: 'Assigned training program',
        actionType: 'assign',
        details: `Assigned "${selectedProgram.name}" to ${assignmentForm.employeeIds.length} employees: ${employeeNames}`,
        entityType: 'training_assignment',
        status: 'success'
      });

      setAssignmentForm({ employeeIds: [], dueDate: '' });
      setSelectedProgram(null);
      setIsAssignOpen(false);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'mandatory': return 'bg-red-100 text-red-800';
      case 'compliance': return 'bg-orange-100 text-orange-800';
      case 'leadership': return 'bg-purple-100 text-purple-800';
      case 'skill_development': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'assigned': return 'bg-yellow-100 text-yellow-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAssignmentsForProgram = (programId: string) => {
    return assignments.filter(a => a.programId === programId);
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
          <h1 className="text-3xl font-bold">Training Management</h1>
          <p className="text-muted-foreground">Create and manage training programs and assignments</p>
        </div>
        <Dialog open={isCreateProgramOpen} onOpenChange={setIsCreateProgramOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Create Program
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Training Program</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Program Name</Label>
                  <Input
                    id="name"
                    value={newProgram.name}
                    onChange={(e) => setNewProgram(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g. Cybersecurity Awareness"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={newProgram.category}
                    onValueChange={(value: TrainingProgram['category']) =>
                      setNewProgram(prev => ({ ...prev, category: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mandatory">Mandatory</SelectItem>
                      <SelectItem value="compliance">Compliance</SelectItem>
                      <SelectItem value="skill_development">Skill Development</SelectItem>
                      <SelectItem value="leadership">Leadership</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newProgram.description}
                  onChange={(e) => setNewProgram(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe the training program..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="provider">Training Provider</Label>
                  <Input
                    id="provider"
                    value={newProgram.provider}
                    onChange={(e) => setNewProgram(prev => ({ ...prev, provider: e.target.value }))}
                    placeholder="e.g. Internal HR Department"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (hours)</Label>
                  <Input
                    id="duration"
                    type="number"
            value={newProgram.duration.toString()}
            onChange={(e) => setNewProgram(prev => ({ ...prev, duration: parseInt(e.target.value) || 1 }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="maxParticipants">Max Participants (optional)</Label>
                  <Input
                    id="maxParticipants"
                    type="number"
                    value={newProgram.maxParticipants?.toString() || ''}
                    onChange={(e) => setNewProgram(prev => ({ 
                      ...prev, 
                      maxParticipants: e.target.value ? parseInt(e.target.value) : undefined 
                    }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={newProgram.status}
                    onValueChange={(value: 'active' | 'inactive') =>
                      setNewProgram(prev => ({ ...prev, status: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="prerequisites">Prerequisites (optional)</Label>
                <Textarea
                  id="prerequisites"
                  value={newProgram.prerequisites || ''}
                  onChange={(e) => setNewProgram(prev => ({ ...prev, prerequisites: e.target.value || undefined }))}
                  placeholder="Any prerequisites for this training..."
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCreateProgramOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateProgram}>Create Program</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6">
        {programs.map((program) => {
          const programAssignments = getAssignmentsForProgram(program.id);
          return (
            <Card key={program.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="w-5 h-5" />
                      {program.name}
                      <Badge className={getCategoryColor(program.category)}>
                        {program.category.replace('_', ' ')}
                      </Badge>
                      <Badge className={getStatusColor(program.status)}>
                        {program.status}
                      </Badge>
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {program.description}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedProgram(program);
                      setIsAssignOpen(true);
                    }}
                    className="flex items-center gap-2"
                  >
                    <UserPlus className="w-4 h-4" />
                    Assign Employees
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Duration:</span> {program.duration} hours
                    </div>
                    <div>
                      <span className="font-medium">Provider:</span> {program.provider}
                    </div>
                    <div>
                      <span className="font-medium">Assignments:</span> {programAssignments.length}
                    </div>
                    <div>
                      <span className="font-medium">Completion Rate:</span>{' '}
                      {programAssignments.length > 0
                        ? `${Math.round((programAssignments.filter(a => a.status === 'completed').length / programAssignments.length) * 100)}%`
                        : 'N/A'
                      }
                    </div>
                  </div>

                  {program.prerequisites && (
                    <div>
                      <span className="font-medium text-sm">Prerequisites:</span>
                      <p className="text-sm text-muted-foreground">{program.prerequisites}</p>
                    </div>
                  )}

                  {programAssignments.length > 0 && (
                    <div>
                      <h4 className="font-medium text-sm mb-2">Recent Assignments:</h4>
              <div className="space-y-1">
                {programAssignments.slice(0, 3).map((assignment) => {
                  const assignedEmployee = mockEmployees.find(e => e.id === assignment.employeeId);
                  return (
                    <div key={assignment.id} className="flex justify-between items-center text-sm p-2 bg-muted rounded">
                      <span>{assignedEmployee?.name || 'Unknown Employee'}</span>
                      <Badge className={getStatusColor(assignment.status)} variant="secondary">
                        {assignment.status}
                      </Badge>
                    </div>
                  );
                })}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Assign Program Dialog */}
      <Dialog open={isAssignOpen} onOpenChange={setIsAssignOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Assign Training Program: {selectedProgram?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Select Employees</Label>
              <div className="max-h-60 overflow-y-auto border rounded p-2 space-y-2">
                {mockEmployees.map((employee) => (
                  <div key={employee.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={employee.id.toString()}
                      checked={assignmentForm.employeeIds.includes(employee.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setAssignmentForm(prev => ({
                            ...prev,
                            employeeIds: [...prev.employeeIds, employee.id]
                          }));
                        } else {
                          setAssignmentForm(prev => ({
                            ...prev,
                            employeeIds: prev.employeeIds.filter(id => id !== employee.id)
                          }));
                        }
                      }}
                    />
                    <Label htmlFor={employee.id.toString()} className="flex-1 cursor-pointer">
                      <div>
                        <div className="font-medium">{employee.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {employee.county} County
                        </div>
                      </div>
                    </Label>
                  </div>
                ))}
              </div>
              <p className="text-sm text-muted-foreground">
                Selected: {assignmentForm.employeeIds.length} employees
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date (optional)</Label>
              <Input
                id="dueDate"
                type="date"
                value={assignmentForm.dueDate}
                onChange={(e) => setAssignmentForm(prev => ({ ...prev, dueDate: e.target.value }))}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsAssignOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleAssignProgram}
                disabled={assignmentForm.employeeIds.length === 0}
              >
                Assign to {assignmentForm.employeeIds.length} employees
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}