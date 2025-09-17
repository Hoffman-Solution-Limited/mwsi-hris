import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, BookOpen } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useSystemLogs } from '@/contexts/SystemLogsContext';

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

export default function AdminTrainingManagement() {
  const navigate = useNavigate();
  const { addLog } = useSystemLogs();
  
  const [programs, setPrograms] = useState<TrainingProgram[]>(mockTrainingPrograms);
  const [isCreateProgramOpen, setIsCreateProgramOpen] = useState(false);

  const [newProgram, setNewProgram] = useState<Omit<TrainingProgram, 'id' | 'createdAt'>>({
    name: '',
    description: '',
    category: 'skill_development',
    duration: 1,
    provider: '',
    status: 'active'
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
          <h1 className="text-3xl font-bold">Training Management</h1>
          <p className="text-muted-foreground">Create and manage training programs (assignments handled by HR)</p>
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
                  {/* Assignment actions removed for Admin */}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Duration:</span> {program.duration} hours
                    </div>
                    <div>
                      <span className="font-medium">Provider:</span> {program.provider}
                    </div>
                  </div>

                  {program.prerequisites && (
                    <div>
                      <span className="font-medium text-sm">Prerequisites:</span>
                      <p className="text-sm text-muted-foreground">{program.prerequisites}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}