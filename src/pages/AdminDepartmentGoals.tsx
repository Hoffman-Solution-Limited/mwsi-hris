import React, { useMemo, useState } from 'react';
import { Plus, Trash2, Edit, Check, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useDepartmentGoals } from '@/contexts/DepartmentGoalsContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const AdminDepartmentGoals: React.FC = () => {
  const { user } = useAuth();
  const canManage = ['admin','hr_manager'].includes(user?.role as string);
  const { goals, getDepartments, getGoalsByDepartment, addGoal, updateGoal, removeGoal } = useDepartmentGoals();

  const [department, setDepartment] = useState<string>('Engineering');

  const departments = useMemo(() => {
    const base = getDepartments();
    return Array.from(new Set([...base, 'Engineering', 'Marketing', 'Finance', 'Human Resources', 'Operations', 'IT']));
  }, [goals]);

  const deptGoals = getGoalsByDepartment(department);

  const [form, setForm] = useState({ title: '', description: '', weight: 0 });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ title: '', description: '', weight: 0, active: true });
  const [saving, setSaving] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { toast } = useToast();

  const totalWeight = deptGoals.reduce((sum, g) => sum + (g.active ? g.weight : 0), 0);

  const handleAdd = async () => {
    if (!canManage) return;
    if (!form.title || form.weight <= 0) return;
    setSaving(true);
    try {
      await addGoal({
        department: department,
        title: form.title,
        description: form.description,
        weight: form.weight,
        active: true,
        createdBy: user?.name || 'System',
      });
      toast({ title: 'Goal added', description: `${form.title} added to ${department}` });
      setForm({ title: '', description: '', weight: 0 });
    } catch (err) {
      toast({ title: 'Add failed', description: 'Unable to add department goal', variant: 'destructive' as any });
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (id: string) => {
    const g = deptGoals.find(d => d.id === id);
    if (!g) return;
    setEditingId(id);
    setEditForm({ title: g.title, description: g.description, weight: g.weight, active: g.active });
  };

  const saveEdit = async () => {
    if (!editingId) return;
    setUpdatingId(editingId);
    try {
      await updateGoal(editingId, { ...editForm });
      toast({ title: 'Goal updated', description: editForm.title });
    } catch (err) {
      toast({ title: 'Update failed', description: 'Unable to update goal', variant: 'destructive' as any });
    } finally {
      setUpdatingId(null);
      setEditingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Departmental Goals</h1>
          <p className="text-muted-foreground">Define and manage goals per department. These goals can generate performance review templates.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Manage Goals</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Department</label>
              <Select value={department} onValueChange={setDepartment}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {departments.map(d => (
                    <SelectItem key={d} value={d}>{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Badge variant={totalWeight === 100 ? 'default' : 'secondary'}>
                Total Weight: {totalWeight}%
              </Badge>
            </div>
          </div>

          <div className="space-y-3">
            {deptGoals.map(g => (
              <div key={g.id} className="p-3 border rounded-lg flex items-center justify-between gap-3">
                {editingId === g.id ? (
                  <div className="flex-1 grid grid-cols-12 gap-2 items-center">
                    <Input className="col-span-3" value={editForm.title} onChange={e => setEditForm(prev => ({ ...prev, title: e.target.value }))} />
                    <Input className="col-span-6" value={editForm.description} onChange={e => setEditForm(prev => ({ ...prev, description: e.target.value }))} />
                    <Input className="col-span-2" type="number" value={editForm.weight} onChange={e => setEditForm(prev => ({ ...prev, weight: parseInt(e.target.value) || 0 }))} />
                    <Button size="sm" className="col-span-1" onClick={saveEdit}><Check className="w-4 h-4" /></Button>
                  </div>
                ) : (
                  <>
                    <div className="flex-1">
                      <div className="font-medium flex items-center gap-2">{g.title} <Badge variant="secondary">{g.weight}%</Badge> {!g.active && <Badge variant="outline">inactive</Badge>}</div>
                      <div className="text-sm text-muted-foreground">{g.description}</div>
                    </div>
                    {canManage && (
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => startEdit(g.id)} disabled={updatingId === g.id || deletingId === g.id}><Edit className="w-4 h-4" /></Button>
                        <Button variant="outline" size="sm" onClick={async () => {
                          setUpdatingId(g.id);
                          try {
                            await updateGoal(g.id, { active: !g.active });
                            toast({ title: g.active ? 'Goal disabled' : 'Goal enabled', description: g.title });
                          } catch (err) {
                            toast({ title: 'Update failed', description: 'Unable to change active state', variant: 'destructive' as any });
                          } finally {
                            setUpdatingId(null);
                          }
                        }} disabled={updatingId === g.id || deletingId === g.id}>{g.active ? 'Disable' : 'Enable'}</Button>
                        <Button variant="ghost" size="sm" onClick={async () => {
                          if (!confirm(`Delete goal "${g.title}"?`)) return;
                          setDeletingId(g.id);
                          try {
                            await removeGoal(g.id);
                            toast({ title: 'Goal deleted', description: g.title });
                          } catch (err) {
                            toast({ title: 'Delete failed', description: 'Unable to delete goal', variant: 'destructive' as any });
                          } finally {
                            setDeletingId(null);
                          }
                        }} disabled={updatingId === g.id || deletingId === g.id}><Trash2 className="w-4 h-4" /></Button>
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
            {deptGoals.length === 0 && (
              <div className="text-sm text-muted-foreground">No goals for this department yet.</div>
            )}
          </div>

          {canManage && (
            <div className="grid grid-cols-12 gap-2 items-end">
              <Input className="col-span-3" placeholder="Goal title" value={form.title} onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))} />
              <Input className="col-span-6" placeholder="Description" value={form.description} onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))} />
              <Input className="col-span-2" type="number" placeholder="Weight %" value={form.weight} onChange={e => setForm(prev => ({ ...prev, weight: parseInt(e.target.value) || 0 }))} />
              <Button className="col-span-1" onClick={handleAdd}><Plus className="w-4 h-4" /></Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDepartmentGoals;
