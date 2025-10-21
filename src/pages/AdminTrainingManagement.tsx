import React, { useEffect, useMemo, useState } from 'react';
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
import { useToast } from '@/hooks/use-toast';

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
  const { toast } = useToast();
  
  const { trainings: trainingRows, createTraining } = useTraining();
  const { editTraining } = useTraining();
  const [isCreateProgramOpen, setIsCreateProgramOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [editingProgram, setEditingProgram] = useState<any | null>(null);
  const [viewingProgram, setViewingProgram] = useState<any | null>(null);
  // listing controls
  const [q, setQ] = useState('');
  const [statusFilter, setStatusFilter] = useState<'open' | 'closed' | 'all'>('open');
  const [pageSize, setPageSize] = useState<number>(10);
  const [page, setPage] = useState<number>(1);

  // reset to first page when filters or size change or dataset refreshes
  useEffect(() => { setPage(1); }, [q, statusFilter, pageSize, trainingRows]);

  // simple inline validation state
  const [createErrors, setCreateErrors] = useState<{ duration?: string; maxParticipants?: string }>({});
  const [editErrors, setEditErrors] = useState<{ duration?: string; maxParticipants?: string }>({});

  const [newProgram, setNewProgram] = useState<Omit<TrainingProgram, 'id' | 'createdAt'>>({
    name: '',
    description: '',
    category: 'skill_development',
    duration: 1,
    provider: '',
    status: 'active'
  });

  const handleCreateProgram = () => {
    // validate non-negative numbers
    const newErr: typeof createErrors = {};
    if (newProgram.duration < 0) newErr.duration = 'Duration must be non-negative';
    if ((newProgram.maxParticipants ?? 0) < 0) newErr.maxParticipants = 'Max participants must be non-negative';
    setCreateErrors(newErr);
    if (Object.keys(newErr).length) return;

    if (newProgram.name && newProgram.description && newProgram.provider) {
      // create on server (or fallback to local if API unavailable)
      const payload = {
        employeeId: '0',
        title: newProgram.name,
        type: (newProgram.category === 'mandatory' ? 'mandatory' : newProgram.category === 'compliance' ? 'compliance' : 'development') as 'mandatory' | 'development' | 'compliance',
        status: 'not_started' as any,
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
        toast({ title: 'Program created', description: 'Training program saved successfully.' });
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

  const toDateInput = (value: any) => {
    if (!value) return '';
    const s = String(value);
    if (s.includes('T')) return s.split('T')[0];
    return s;
  };

  const openEdit = (program: any) => {
    // program is an aggregated item; use its sampleId and titleKey to update all with same title
    setEditingProgram({
      id: program.sampleId || program.id,
      title: (program.title || program.name) || '',
      titleKey: (program.title || program.name) || '',
      description: program.description || program.details || '',
      provider: program.provider || '',
      duration: program.duration || 1,
      maxParticipants: program.max_participants || program.maxParticipants || undefined,
      prerequisites: program.prerequisites || '',
      category: program.category || 'skill_development',
      type: program.type || (program.category === 'mandatory' ? 'mandatory' : program.category === 'compliance' ? 'compliance' : 'development'),
      expiryDate: toDateInput(program.expiryDate || program.expiry_date || ''),
      status: program.status || 'open'
    });
    setIsEditOpen(true);
  };

  const openView = (program: any) => {
    setViewingProgram({
      ...program,
      expiryDate: program.expiryDate || program.expiry_date || null
    });
    setIsViewOpen(true);
  };

  const handleSaveEdit = () => {
    if (!editingProgram) return;
    // validate
    const errs: typeof editErrors = {};
    if ((editingProgram.duration ?? 0) < 0) errs.duration = 'Duration must be non-negative';
    if ((editingProgram.maxParticipants ?? 0) < 0) errs.maxParticipants = 'Max participants must be non-negative';
    setEditErrors(errs);
    if (Object.keys(errs).length) return;
    // call editTraining to persist changes
  const normalizedStatus = (() => {
    const s = (editingProgram.status || '').toString();
    if (s === 'active' || s === 'not_started') return 'not_started';
    if (s === 'inactive' || s === 'closed') return 'closed';
    if (['in_progress','completed'].includes(s)) return s;
    return 'not_started';
  })();
  const editPayload = {
    title: editingProgram.title,
    provider: editingProgram.provider,
    description: editingProgram.description,
    duration: editingProgram.duration,
    maxParticipants: editingProgram.maxParticipants,
    prerequisites: editingProgram.prerequisites,
    category: editingProgram.category,
    type: editingProgram.type,
    expiryDate: editingProgram.expiryDate || undefined,
    status: normalizedStatus
  } as Partial<any>;

  const applyToIds = (trainingRows || []).filter((row:any) => (row.title || '') === (editingProgram.titleKey || editingProgram.title)).map((r:any) => r.id);
  const targets = applyToIds.length > 0 ? applyToIds : [editingProgram.id];

  Promise.all(targets.map((id:string) => editTraining(id, editPayload)))
    .then(() => {
      addLog({
        action: 'Edited training program',
        actionType: 'update',
        details: `Edited program: ${editingProgram.title} (${targets.length} record${targets.length !== 1 ? 's' : ''})`,
        entityType: 'training_program',
        entityId: editingProgram.id,
        status: 'success'
      });

      setIsEditOpen(false);
      setEditingProgram(null);
      toast({ title: 'Program updated', description: 'Changes saved successfully.' });
    })
    .catch((err) => {
      console.error('Failed to save training edit', err);
      toast({ title: 'Update failed', description: 'Could not save changes.', variant: 'destructive' });
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
      case 'open': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
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
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-category">Category</Label>
                      <Select value={editingProgram.category} onValueChange={(value:any) => setEditingProgram((p:any) => ({ ...p, category: value }))}>
                        <SelectTrigger id="edit-category">
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
                    <div className="space-y-2">
                      <Label htmlFor="edit-type">Type</Label>
                      <Select value={editingProgram.type} onValueChange={(value:any) => setEditingProgram((p:any) => ({ ...p, type: value }))}>
                        <SelectTrigger id="edit-type">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="mandatory">mandatory</SelectItem>
                          <SelectItem value="development">development</SelectItem>
                          <SelectItem value="compliance">compliance</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-expiry">Expiry Date</Label>
                      <Input id="edit-expiry" type="date" value={editingProgram.expiryDate || ''} onChange={(e) => setEditingProgram((p:any) => ({ ...p, expiryDate: e.target.value || '' }))} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-desc">Description</Label>
                    <Textarea id="edit-desc" value={editingProgram.description} onChange={(e) => setEditingProgram((p:any) => ({ ...p, description: e.target.value }))} />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-duration">Duration (hours)</Label>
                      <Input id="edit-duration" type="number" value={String(editingProgram.duration ?? '')} onChange={(e) => {
                        const v = e.target.value === '' ? undefined : parseInt(e.target.value);
                        setEditingProgram((p:any) => ({ ...p, duration: v }));
                        setEditErrors(prev => ({ ...prev, duration: v !== undefined && v < 0 ? 'Duration must be non-negative' : undefined }));
                      }} />
                      {editErrors.duration && <p className="text-xs text-destructive">{editErrors.duration}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-max">Max Participants</Label>
                      <Input id="edit-max" type="number" value={editingProgram.maxParticipants?.toString() || ''} onChange={(e) => {
                        const v = e.target.value ? parseInt(e.target.value) : undefined;
                        setEditingProgram((p:any) => ({ ...p, maxParticipants: v }));
                        setEditErrors(prev => ({ ...prev, maxParticipants: v !== undefined && v < 0 ? 'Max participants must be non-negative' : undefined }));
                      }} />
                      {editErrors.maxParticipants && <p className="text-xs text-destructive">{editErrors.maxParticipants}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-status">Status</Label>
                      <Select value={editingProgram.status} onValueChange={(value:any) => setEditingProgram((p:any) => ({ ...p, status: value }))}>
                        <SelectTrigger id="edit-status">
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
                    <Label htmlFor="edit-prereq">Prerequisites</Label>
                    <Textarea id="edit-prereq" value={editingProgram.prerequisites} onChange={(e) => setEditingProgram((p:any) => ({ ...p, prerequisites: e.target.value }))} />
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

      {/* Aggregate records by program title to avoid duplicates, then filter and table-render */}
      {(() => {
        const progMap = new Map<string, any>();
        (trainingRows || []).forEach((row: any) => {
          const key = row.title || 'Untitled';
          if (!progMap.has(key)) {
            progMap.set(key, {
              title: key,
              name: key,
              provider: row.provider || '',
              category: row.category || 'skill_development',
              type: row.type || (row.category === 'mandatory' ? 'mandatory' : row.category === 'compliance' ? 'compliance' : 'development'),
              description: row.description || '',
              duration: row.duration || undefined,
              max_participants: row.max_participants || (row as any).maxParticipants,
              prerequisites: row.prerequisites || '',
              expiryDate: row.expiryDate || row.expiry_date || undefined,
              sampleId: row.id,
              counts: { total: 0, archived: 0, completed: 0 },
            });
          }
          const p = progMap.get(key)!;
          p.counts.total += 1;
          if (row.archived) p.counts.archived += 1;
          if (row.status === 'completed') p.counts.completed += 1;
          const curExp = p.expiryDate ? new Date(p.expiryDate) : null;
          const nextExp = row.expiryDate || row.expiry_date ? new Date(row.expiryDate || row.expiry_date) : null;
          if ((!curExp && nextExp) || (curExp && nextExp && nextExp.getTime() < curExp.getTime())) p.expiryDate = (row.expiryDate || row.expiry_date);
          if (!p.description && row.description) p.description = row.description;
          if (!p.provider && row.provider) p.provider = row.provider;
          if (!p.duration && row.duration) p.duration = row.duration;
        });
        const programList = Array.from(progMap.values()).map(p => ({
          ...p,
          status: p.counts.archived === p.counts.total ? 'closed' : 'open'
        }));
        const filtered = programList.filter((p:any) => {
          const matchesQ = q ? (
            (p.title || '').toLowerCase().includes(q.toLowerCase()) ||
            (p.provider || '').toLowerCase().includes(q.toLowerCase())
          ) : true;
          const matchesStatus = statusFilter === 'all' ? true : p.status === statusFilter;
          return matchesQ && matchesStatus;
        });
        return (
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Input className="max-w-xs" placeholder="Search by name/provider" value={q} onChange={(e)=>setQ(e.target.value)} />
              <Select value={statusFilter} onValueChange={(v:any)=>setStatusFilter(v)}>
                <SelectTrigger className="w-40"><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                  <SelectItem value="all">All</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex items-center gap-2 ml-auto">
                <span className="text-xs text-muted-foreground">Rows per page</span>
                <Select value={String(pageSize)} onValueChange={(v:any)=>setPageSize(Number(v))}>
                  <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full table-auto border rounded">
                <thead className="bg-muted/50">
                  <tr className="text-left text-sm">
                    <th className="p-2">Program</th>
                    <th className="p-2">Category</th>
                    <th className="p-2">Provider</th>
                    <th className="p-2">Duration</th>
                    <th className="p-2">Expiry</th>
                    <th className="p-2">Enrolled</th>
                    <th className="p-2">Completed</th>
                    <th className="p-2">Status</th>
                    <th className="p-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    const total = filtered.length;
                    const totalPages = Math.max(1, Math.ceil(total / pageSize));
                    const safePage = Math.min(page, totalPages);
                    const startIdx = (safePage - 1) * pageSize;
                    const endIdx = Math.min(total, startIdx + pageSize);
                    const paged = filtered.slice(startIdx, endIdx);
                    return paged.map((program:any) => (
                    <tr key={program.title} className="border-b last:border-0">
                      <td className="p-2">
                        <div className="flex items-center gap-2">
                          <BookOpen className="w-4 h-4" />
                          <div className="font-medium">{program.title}</div>
                        </div>
                      </td>
                      <td className="p-2"><Badge className={getCategoryColor(program.category)}>{(program.category || '').replace('_',' ')}</Badge></td>
                      <td className="p-2 text-sm">{program.provider || 'N/A'}</td>
                      <td className="p-2 text-sm">{program.duration ? `${program.duration}h` : 'N/A'}</td>
                      <td className="p-2 text-sm">{program.expiryDate ? new Date(program.expiryDate).toLocaleDateString() : 'N/A'}</td>
                      <td className="p-2 text-sm">{program.counts?.total ?? 0}</td>
                      <td className="p-2 text-sm">{program.counts?.completed ?? 0}</td>
                      <td className="p-2"><Badge className={getStatusColor(program.status)}>{program.status}</Badge></td>
                      <td className="p-2">
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="outline" onClick={() => openView(program)}>View</Button>
                          <Button size="sm" variant="ghost" onClick={() => openEdit(program)}>Edit</Button>
                        </div>
                      </td>
                    </tr>
                  ));})()}
                  {filtered.length === 0 && (
                    <tr><td className="p-3 text-sm text-muted-foreground" colSpan={9}>No programs match your filters.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            {(() => {
              const total = filtered.length;
              if (total === 0) return null;
              const totalPages = Math.max(1, Math.ceil(total / pageSize));
              const safePage = Math.min(page, totalPages);
              const start = (safePage - 1) * pageSize + 1;
              const end = Math.min(total, safePage * pageSize);
              return (
                <div className="flex items-center justify-between mt-2 text-sm">
                  <div className="text-muted-foreground">Showing {start}-{end} of {total}</div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" disabled={safePage <= 1} onClick={() => setPage(p => Math.max(1, p - 1))}>Prev</Button>
                    <span className="text-muted-foreground">Page {safePage} of {totalPages}</span>
                    <Button size="sm" variant="outline" disabled={safePage >= totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}>Next</Button>
                  </div>
                </div>
              );
            })()}
          </div>
        );
      })()}

      {/* View Program Dialog */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Program Details</DialogTitle>
          </DialogHeader>
          {viewingProgram && (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div><span className="font-medium">Title:</span> {(viewingProgram.title || viewingProgram.name)}</div>
                <div><span className="font-medium">Provider:</span> {viewingProgram.provider || 'N/A'}</div>
                <div><span className="font-medium">Type:</span> {viewingProgram.type || 'N/A'}</div>
                <div><span className="font-medium">Category:</span> {(viewingProgram.category || '').toString().replace('_',' ') || 'N/A'}</div>
                <div><span className="font-medium">Duration:</span> {viewingProgram.duration ? `${viewingProgram.duration} hours` : 'N/A'}</div>
                <div><span className="font-medium">Max Participants:</span> {viewingProgram.max_participants ?? viewingProgram.maxParticipants ?? 'N/A'}</div>
                <div><span className="font-medium">Status:</span> {viewingProgram.status || 'N/A'}</div>
                <div><span className="font-medium">Expiry:</span> {viewingProgram.expiryDate ? new Date(viewingProgram.expiryDate).toLocaleDateString() : (viewingProgram.expiry_date ? new Date(viewingProgram.expiry_date).toLocaleDateString() : 'N/A')}</div>
              </div>
              {viewingProgram.prerequisites && (
                <div>
                  <span className="font-medium">Prerequisites:</span>
                  <p className="text-muted-foreground">{viewingProgram.prerequisites}</p>
                </div>
              )}
              {viewingProgram.description && (
                <div>
                  <span className="font-medium">Description:</span>
                  <p className="text-muted-foreground">{viewingProgram.description}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}