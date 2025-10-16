import React, { useMemo, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTraining } from '@/contexts/TrainingContext';
import { useEmployees } from '@/contexts/EmployeesContext';
import { Calendar, CheckCircle, Clock, GraduationCap, ArrowLeft, ExternalLink } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

const TrainingProgramDetails: React.FC = () => {
  const { title: encoded } = useParams();
  const navigate = useNavigate();
  const title = decodeURIComponent(encoded || '');
  const { trainings, getCertificateUrl, editTraining } = useTraining();
  const { employees } = useEmployees();
  const { toast } = useToast();
  const [q, setQ] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'in_progress' | 'not_started' | 'closed'>('all');
  const [deptFilter, setDeptFilter] = useState<string>('all');
  const [bulkBusy, setBulkBusy] = useState(false);

  const related = useMemo(() => trainings.filter(t => (t.title || 'Untitled') === title), [trainings, title]);
  const sample = related.find(r => r.description || r.provider || (r as any).duration || r.expiryDate || r.type || r.category);
  const counts = useMemo(() => ({
    total: related.length,
    completed: related.filter(r => r.status === 'completed').length,
    in_progress: related.filter(r => r.status === 'in_progress').length,
    not_started: related.filter(r => r.status === 'not_started').length,
    closed: related.filter(r => r.status === 'closed').length,
    archived: related.filter(r => r.archived).length,
  }), [related]);

  const people = useMemo(() => related.map(r => {
    const emp = (employees || []).find(e => e.id === r.employeeId);
    return {
      id: r.id,
      employeeId: r.employeeId,
      name: emp?.name || `Employee ${r.employeeId}`,
      department: emp?.stationName,
      status: r.status,
      completionDate: r.completionDate,
      expiryDate: r.expiryDate,
      archived: r.archived,
      certUrl: getCertificateUrl(r.id),
      provider: r.provider,
    };
  }).sort((a,b) => a.name.localeCompare(b.name)), [related, employees, getCertificateUrl]);

  const departments = useMemo(() => {
    const s = new Set<string>();
    people.forEach(p => { if (p.department) s.add(p.department); });
    return ['all', ...Array.from(s.values()).sort((a,b)=>a.localeCompare(b))];
  }, [people]);

  const filteredPeople = useMemo(() => {
    return people.filter(p => {
      if (q && !p.name.toLowerCase().includes(q.toLowerCase())) return false;
      if (statusFilter !== 'all' && p.status !== statusFilter) return false;
      if (deptFilter !== 'all' && p.department !== deptFilter) return false;
      return true;
    });
  }, [people, q, statusFilter, deptFilter]);

  // Bulk action candidates are scoped to the current filtered view for clarity
  const archiveCandidates = useMemo(() => (
    filteredPeople.filter(p => p.status === 'completed' && !p.archived).map(p => p.id)
  ), [filteredPeople]);
  const restoreCandidates = useMemo(() => (
    filteredPeople.filter(p => p.archived).map(p => p.id)
  ), [filteredPeople]);

  const csvExport = () => {
    const header = ['Name','Department','Status','Completion Date','Expiry Date'];
    const rows = filteredPeople.map(p => [
      p.name,
      p.department || '',
      p.status,
      p.completionDate ? new Date(p.completionDate).toLocaleDateString() : '',
      p.expiryDate ? new Date(p.expiryDate).toLocaleDateString() : ''
    ]);
    const data = [header, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n');
    const blob = new Blob([data], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title}-assignments.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const restoreAllArchived = async () => {
    if (restoreCandidates.length === 0) return;
    const ok = window.confirm(`Reopen ${restoreCandidates.length} archived assignment(s) in the current view?`);
    if (!ok) return;
    setBulkBusy(true);
    try {
      // For any previously closed records, set status back to not_started so they reappear in Assignments/UI flows
      const affected = people.filter(p => restoreCandidates.includes(p.id));
      await Promise.all(affected.map(p => editTraining(p.id, { archived: false, ...(p.status === 'closed' ? { status: 'not_started' as any } : {}) })));
      toast({ title: 'Reopened', description: `Reopened ${restoreCandidates.length} assignment(s).` });
    } catch (err) {
      console.error(err);
      toast({ title: 'Reopen failed', description: 'Could not reopen some assignments. Please retry.', variant: 'destructive' as any });
    } finally {
      setBulkBusy(false);
    }
  };

  const archiveAllCompleted = async () => {
    if (archiveCandidates.length === 0) return;
    const ok = window.confirm(`Archive ${archiveCandidates.length} completed assignment(s) in the current view?`);
    if (!ok) return;
    setBulkBusy(true);
    try {
      await Promise.all(archiveCandidates.map(id => editTraining(id, { archived: true })));
      toast({ title: 'Archived', description: `Archived ${archiveCandidates.length} completed assignment(s).` });
    } catch (err) {
      console.error(err);
      toast({ title: 'Archive failed', description: 'Could not archive some assignments. Please retry.', variant: 'destructive' as any });
    } finally {
      setBulkBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => navigate('/training')}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
          <h1 className="text-2xl font-bold">{title}</h1>
          {sample?.type && <Badge variant={sample.type === 'mandatory' ? 'destructive' : 'secondary'}>{sample.type}</Badge>}
          {sample?.category && <Badge variant="outline">{String(sample.category).replace('_',' ')}</Badge>}
        </div>
        <div className="text-right">
          {sample?.provider && <div className="text-sm text-muted-foreground">Provider: {sample.provider}</div>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="bg-success/10 p-2 rounded"><CheckCircle className="w-5 h-5 text-success" /></div>
            <div><p className="text-sm text-muted-foreground">Completed</p><p className="text-xl font-bold">{counts.completed}</p></div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="bg-warning/10 p-2 rounded"><Clock className="w-5 h-5 text-warning" /></div>
            <div><p className="text-sm text-muted-foreground">In Progress</p><p className="text-xl font-bold">{counts.in_progress}</p></div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="bg-muted/50 p-2 rounded"><GraduationCap className="w-5 h-5 text-muted-foreground" /></div>
            <div><p className="text-sm text-muted-foreground">Not Started</p><p className="text-xl font-bold">{counts.not_started}</p></div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Filters & Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-3">
            <Input placeholder="Search by name" value={q} onChange={(e)=>setQ(e.target.value)} className="max-w-xs" />
            <Select value={statusFilter} onValueChange={(v:any)=>setStatusFilter(v)}>
              <SelectTrigger className="w-48"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="in_progress">In progress</SelectItem>
                <SelectItem value="not_started">Not started</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={deptFilter} onValueChange={(v:any)=>setDeptFilter(v)}>
              <SelectTrigger className="w-56"><SelectValue placeholder="Department" /></SelectTrigger>
              <SelectContent>
                {departments.map(d => (<SelectItem key={d} value={d}>{d === 'all' ? 'All departments' : d}</SelectItem>))}
              </SelectContent>
            </Select>
            <div className="ml-auto flex items-center gap-2">
              <Button onClick={() => navigate(`/training/assign/${encodeURIComponent(title)}`)}>Assign</Button>
              <Button variant="outline" onClick={csvExport} disabled={bulkBusy}>Export CSV</Button>
              <Button
                variant="secondary"
                onClick={restoreAllArchived}
                disabled={bulkBusy || restoreCandidates.length === 0}
                title="Applies to the current filtered list"
              >
                {`Reopen (${restoreCandidates.length})`}
              </Button>
              <Button
                onClick={archiveAllCompleted}
                disabled={bulkBusy || archiveCandidates.length === 0}
                title="Applies to the current filtered list"
              >
                {`Close Completed (${archiveCandidates.length})`}
              </Button>
            </div>
            <div className="w-full text-right text-xs text-muted-foreground mt-1">
              Bulk actions apply to the current filters.
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Department heatmap */}
      <Card>
        <CardHeader>
          <CardTitle>Per-Department Completion</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {(() => {
            const byDept: Record<string, { total: number; completed: number }> = {};
            related.forEach(r => {
              const dept = (employees || []).find(e=>e.id===r.employeeId)?.stationName || 'Unknown';
              if (!byDept[dept]) byDept[dept] = { total: 0, completed: 0 };
              byDept[dept].total += 1;
              if (r.status === 'completed') byDept[dept].completed += 1;
            });
            const entries = Object.entries(byDept).sort((a,b)=>a[0].localeCompare(b[0]));
            if (entries.length === 0) return <p className="text-sm text-muted-foreground">No data</p>;
            return entries.map(([dept, v]) => {
              const pct = v.total ? Math.round((v.completed / v.total) * 100) : 0;
              return (
                <div key={dept} className="space-y-1">
                  <div className="flex justify-between text-sm"><span className="font-medium">{dept}</span><span className="text-muted-foreground">{v.completed}/{v.total} ({pct}%)</span></div>
                  <div className="h-2 bg-muted rounded"><div className="h-2 rounded" style={{ width: `${pct}%`, backgroundColor: pct >= 80 ? '#16a34a' : pct >= 50 ? '#eab308' : '#ef4444' }} /></div>
                </div>
              );
            });
          })()}
        </CardContent>
      </Card>

      {/* Assignments breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Assignments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-semibold mb-2">Completed ({filteredPeople.filter(p=>p.status==='completed').length})</p>
              <div className="space-y-2 max-h-72 overflow-y-auto">
                {filteredPeople.filter(p => p.status === 'completed').map(p => (
                  <div key={p.id} className="p-3 border rounded">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">{p.name}</p>
                        {p.department && <p className="text-xs text-muted-foreground">{p.department}</p>}
                        {p.completionDate && <p className="text-xs text-muted-foreground">Completed: {new Date(p.completionDate).toLocaleDateString()}</p>}
                      </div>
                      <div>
                        {p.certUrl ? (
                          <a href={p.certUrl} target="_blank" rel="noreferrer" className="text-sm inline-flex items-center gap-1 text-blue-600 hover:underline">
                            View Certificate <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : (
                          <span className="text-xs text-muted-foreground">No certificate</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {filteredPeople.filter(p => p.status === 'completed').length === 0 && <p className="text-xs text-muted-foreground">No completions</p>}
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold mb-2">Not Completed ({filteredPeople.filter(p=>p.status !== 'completed').length})</p>
              <div className="space-y-2 max-h-72 overflow-y-auto">
                {filteredPeople.filter(p => p.status !== 'completed').map(p => (
                  <div key={p.id} className="p-3 border rounded">
                    <p className="text-sm font-medium">{p.name}</p>
                    {p.department && <p className="text-xs text-muted-foreground">{p.department}</p>}
                    <p className="text-xs text-muted-foreground">Status: {p.status.replace('_',' ')}</p>
                    {p.expiryDate && <p className="text-xs text-muted-foreground">Expiry: {new Date(p.expiryDate).toLocaleDateString()}</p>}
                    {p.archived && p.status === 'closed' && (
                      <p className="text-xs text-muted-foreground">Closed by HR</p>
                    )}
                  </div>
                ))}
                {filteredPeople.filter(p => p.status !== 'completed').length === 0 && <p className="text-xs text-muted-foreground">Everyone completed</p>}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TrainingProgramDetails;
