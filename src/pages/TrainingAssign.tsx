import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { useEmployees } from '@/contexts/EmployeesContext';
import { useTraining } from '@/contexts/TrainingContext';
import { useToast } from '@/hooks/use-toast';

const PAGE_SIZE = 24;

const TrainingAssign: React.FC = () => {
  const { title: routeTitle } = useParams<{ title: string }>();
  const navigate = useNavigate();
  const { employees } = useEmployees();
  const { trainings, createTrainingsBatch } = useTraining();
  const { toast } = useToast();

  const title = decodeURIComponent(routeTitle || '');
  const [q, setQ] = useState('');
  const [department, setDepartment] = useState<string>('all');
  const [station, setStation] = useState<string>('all');
  const [page, setPage] = useState<number>(1);
  const [selected, setSelected] = useState<string[]>([]);
  const [isAssigning, setIsAssigning] = useState(false);
  const [allFilteredSelected, setAllFilteredSelected] = useState(false);

  // Derive program metadata from any existing row with the same title
  const programMeta = useMemo(() => {
    const m = trainings.find(t => t.title === title);
    return m ? {
      title: m.title,
      provider: m.provider,
      type: m.type,
      description: m.description,
      duration: m.duration,
      expiryDate: m.expiryDate,
    } : { title };
  }, [trainings, title]);

  // Already assigned set (non-archived)
  const assignedSet = useMemo(() => {
    const s = new Set<string>();
    trainings.forEach(t => {
      if (t.title === title && !t.archived) s.add(String(t.employeeId));
    });
    return s;
  }, [trainings, title]);

  // Build filter options
  const departments = useMemo(() => {
    const set = new Set<string>();
    (employees || []).forEach(e => { if (e.department) set.add(String(e.department)); });
    return Array.from(set).sort();
  }, [employees]);
  const stations = useMemo(() => {
    const set = new Set<string>();
    (employees || []).forEach(e => { if (e.stationName) set.add(String(e.stationName)); });
    return Array.from(set).sort();
  }, [employees]);

  // Filter employees (exclude HR roles as in existing modal)
  const baseList = useMemo(() => (employees || []).filter(emp => !/hr_(manager|staff)/i.test(String(emp.position || '').toLowerCase())), [employees]);

  const filtered = useMemo(() => {
    return baseList.filter(e => {
      if (department !== 'all' && String(e.department) !== department) return false;
      if (station !== 'all' && String(e.stationName) !== station) return false;
      if (q) {
        const hay = `${e.name || ''} ${e.position || ''} ${e.department || ''} ${e.stationName || ''}`.toLowerCase();
        if (!hay.includes(q.toLowerCase())) return false;
      }
      return true;
    });
  }, [baseList, department, station, q]);

  // keep all-filtered selection in sync when filters change
  useEffect(() => {
    if (allFilteredSelected) {
      const ids = filtered.map(e => String(e.id)).filter(id => !assignedSet.has(id));
      setSelected(Array.from(new Set(ids)));
    }
  }, [allFilteredSelected, filtered, assignedSet]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  useEffect(() => { setPage(1); }, [department, station, q]);
  const startIdx = (page - 1) * PAGE_SIZE;
  const pageRows = filtered.slice(startIdx, startIdx + PAGE_SIZE);

  const toggleSelectAllFiltered = (checked: boolean) => {
    if (checked) {
      const ids = pageRows.map(e => String(e.id)).filter(id => !assignedSet.has(id));
      setSelected(prev => Array.from(new Set([...prev, ...ids])));
    } else {
      const ids = new Set(pageRows.map(e => String(e.id)));
      setSelected(prev => prev.filter(id => !ids.has(id)));
    }
  };

  const toggleSelectAllAcrossFiltered = (checked: boolean) => {
    setAllFilteredSelected(checked);
    if (checked) {
      const ids = filtered.map(e => String(e.id)).filter(id => !assignedSet.has(id));
      setSelected(Array.from(new Set([...selected, ...ids])));
    } else {
      // remove all filtered from selection
      const ids = new Set(filtered.map(e => String(e.id)));
      setSelected(prev => prev.filter(id => !ids.has(id)));
    }
  };

  const assignSelected = async () => {
    if (!title || selected.length === 0) return;
    setIsAssigning(true);
    try {
      const items = selected
        .filter(empId => !assignedSet.has(empId))
        .map(empId => ({
          employeeId: empId,
          title: programMeta.title,
          type: (programMeta as any).type || 'development',
          provider: (programMeta as any).provider || '',
          expiryDate: (programMeta as any).expiryDate,
          status: 'not_started' as const,
        }));
      const created = await createTrainingsBatch(items);
      toast({ title: 'Training assigned', description: `Assigned to ${created.length} employee${created.length === 1 ? '' : 's'}.` });
      navigate(`/training/program/${encodeURIComponent(title)}`);
    } finally {
      setIsAssigning(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Assign Training</h1>
        <Button variant="outline" onClick={() => navigate(-1)}>Back</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{programMeta.title}</CardTitle>
          <CardDescription>Assign this program to employees. Use filters to narrow by department or workstation.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2 items-center">
          {(programMeta as any).type && <Badge variant={(programMeta as any).type === 'mandatory' ? 'destructive' : 'secondary'}>{(programMeta as any).type}</Badge>}
          {(programMeta as any).duration && <Badge variant="outline">{(programMeta as any).duration}h</Badge>}
          {(programMeta as any).provider && <Badge variant="outline">{(programMeta as any).provider}</Badge>}
          {(programMeta as any).expiryDate && <Badge variant="outline">Expires {(programMeta as any).expiryDate}</Badge>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3 items-center">
          <Input placeholder="Search name, position, dept, station" value={q} onChange={(e) => setQ(e.target.value)} className="max-w-sm" />
          <Select value={department} onValueChange={(v: string) => setDepartment(v)}>
            <SelectTrigger className="w-56"><SelectValue placeholder="Department" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {departments.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={station} onValueChange={(v: string) => setStation(v)}>
            <SelectTrigger className="w-56"><SelectValue placeholder="Workstation" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Workstations</SelectItem>
              {stations.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Select Employees</CardTitle>
              <CardDescription>Total {filtered.length} matching • Page {page} of {totalPages}</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox checked={pageRows.every(e => selected.includes(String(e.id)) || assignedSet.has(String(e.id)))} onCheckedChange={(c) => toggleSelectAllFiltered(Boolean(c))} />
              <span className="text-sm">Select All (this page)</span>
              <div className="w-px h-5 bg-muted" />
              <Checkbox checked={allFilteredSelected} onCheckedChange={(c) => toggleSelectAllAcrossFiltered(Boolean(c))} />
              <span className="text-sm">Select All (filtered)</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Selection summary chips */}
          {selected.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <Badge variant="outline">Selected: {selected.length}</Badge>
              {department !== 'all' && <Badge variant="secondary">Dept: {department}</Badge>}
              {station !== 'all' && <Badge variant="secondary">Workstation: {station}</Badge>}
              {q && <Badge variant="outline">Search: "{q}"</Badge>}
              <Button size="sm" variant="ghost" onClick={() => { setSelected([]); setAllFilteredSelected(false); }}>Clear</Button>
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {pageRows.map(emp => {
              const id = String(emp.id);
              const already = assignedSet.has(id);
              const checked = selected.includes(id) || already;
              return (
                <div key={id} className={`flex items-center space-x-3 p-3 border rounded-lg ${already ? 'opacity-60' : ''}`}>
                  <Checkbox
                    checked={checked}
                    disabled={already}
                    onCheckedChange={(c) => {
                      if (already) return;
                      if (c) setSelected(prev => prev.includes(id) ? prev : [...prev, id]);
                      else setSelected(prev => prev.filter(x => x !== id));
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{emp.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{emp.position} • {emp.department || emp.stationName}</p>
                  </div>
                  {already && <Badge variant="outline">Already assigned</Badge>}
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between mt-3">
            <div className="text-sm text-muted-foreground">Showing {startIdx + 1}-{Math.min(filtered.length, startIdx + PAGE_SIZE)} of {filtered.length}</div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))}>Prev</Button>
              <span className="text-sm text-muted-foreground">Page {page} / {totalPages}</span>
              <Button size="sm" variant="outline" disabled={page >= totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}>Next</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <div className="text-sm text-blue-600 font-medium">{selected.length} employee{selected.length === 1 ? '' : 's'} selected</div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => navigate(-1)}>Cancel</Button>
          <Button onClick={assignSelected} disabled={selected.length === 0 || isAssigning}>
            {isAssigning ? 'Assigning…' : `Assign Training to ${selected.length} Employee${selected.length === 1 ? '' : 's'}`}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TrainingAssign;
