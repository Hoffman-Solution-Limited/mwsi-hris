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
import { useTraining } from '@/contexts/TrainingContext';

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

// training programs are sourced from backend via `useTraining()` (no local mock data)

export default function AdminTrainingManagement() {
  const navigate = useNavigate();
  const { addLog } = useSystemLogs();
  
  const { trainings: programs, createTraining } = useTraining();
  const { editTraining } = useTraining();
  const [isCreateProgramOpen, setIsCreateProgramOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingProgram, setEditingProgram] = useState<any | null>(null);

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
      // create on server (or fallback to local if API unavailable)
      const payload = {
        employeeId: '0',
        title: newProgram.name,
        type: (newProgram.category === 'mandatory' ? 'mandatory' : newProgram.category === 'compliance' ? 'compliance' : 'development') as 'mandatory' | 'development' | 'compliance',
        status: newProgram.status as 'active' | 'inactive',
        provider: newProgram.provider,
        description: newProgram.description,
        duration: newProgram.duration,
        max_participants: newProgram.maxParticipants,
        prerequisites: newProgram.prerequisites,
        category: newProgram.category as any
      } as Partial<any>;

      createTraining(payload).then((program) => {
        // log uses program id when available
        addLog({
          action: 'Created training program',
          actionType: 'create',
          details: `Created program: ${newProgram.name} (${newProgram.category})`,
          entityType: 'training_program',
          entityId: program ? program.id : 'local',
          status: 'success'
        });
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

  const openEdit = (program: any) => {
    setEditingProgram({
      id: program.id,
      title: (program.title || program.name) || '',
      description: program.description || program.details || '',
      provider: program.provider || '',
      duration: program.duration || 1,
      maxParticipants: program.max_participants || program.maxParticipants || undefined,
      prerequisites: program.prerequisites || '',
      category: program.category || 'skill_development',
      status: program.status || 'active'
    });
    setIsEditOpen(true);
  };

  const handleSaveEdit = () => {
    if (!editingProgram) return;
    // call editTraining to persist changes
  const editPayload = {
    title: editingProgram.title,
    provider: editingProgram.provider,
    description: editingProgram.description,
    duration: editingProgram.duration,
    max_participants: editingProgram.maxParticipants,
    prerequisites: editingProgram.prerequisites,
    category: editingProgram.category,
    status: editingProgram.status
  } as Partial<any>;

  editTraining(editingProgram.id || '', editPayload)
    .then(() => {
      addLog({
        action: 'Edited training program',
        actionType: 'update',
        details: `Edited program: ${editingProgram.title}`,
        entityType: 'training_program',
        entityId: editingProgram.id,
        status: 'success'
      });

      setIsEditOpen(false);
      setEditingProgram(null);
    })
    .catch((err) => {
      console.error('Failed to save training edit', err);
    });

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
          {/* Edit Program Dialog */}
          <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Edit Training Program</DialogTitle>
              </DialogHeader>
              {editingProgram && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-name">Program Name</Label>
                    <Input id="edit-name" value={editingProgram.title} onChange={(e) => setEditingProgram((p:any) => ({ ...p, title: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-provider">Provider</Label>
                    <Input id="edit-provider" value={editingProgram.provider} onChange={(e) => setEditingProgram((p:any) => ({ ...p, provider: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-desc">Description</Label>
                    <Textarea id="edit-desc" value={editingProgram.description} onChange={(e) => setEditingProgram((p:any) => ({ ...p, description: e.target.value }))} />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => { setIsEditOpen(false); setEditingProgram(null); }}>Cancel</Button>
                    <Button onClick={handleSaveEdit}>Save</Button>
                  </div>
                </div>
              )}
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
                      {(program as any).title || (program as any).name}
                      <Badge className={getCategoryColor((program as any).category)}>
                        {((program as any).category || '').replace('_', ' ')}
                      </Badge>
                      <Badge className={getStatusColor((program as any).status)}>
                        {(program as any).status}
                      </Badge>
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {(program as any).description || (program as any).details || ''}
                    </p>
                  </div>
                  <div className="ml-4 flex items-center gap-2">
                    <Button size="sm" variant="ghost" onClick={() => openEdit(program)}>Edit</Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Duration:</span> {(program as any).duration ? `${(program as any).duration} hours` : 'N/A'}
                    </div>
                    <div>
                      <span className="font-medium">Provider:</span> {(program as any).provider || 'N/A'}
                    </div>
                  </div>

                  {(program as any).prerequisites && (
                    <div>
                      <span className="font-medium text-sm">Prerequisites:</span>
                      <p className="text-sm text-muted-foreground">{(program as any).prerequisites}</p>
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