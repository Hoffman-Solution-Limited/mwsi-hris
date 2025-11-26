import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useTraining } from '@/contexts/TrainingContext';
import { useEmployees } from '@/contexts/EmployeesContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

const TrainingProgress: React.FC = () => {
  const { trainings } = useTraining();
  const { employees } = useEmployees();
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'closed'>('open');
  const [trendRes, setTrendRes] = useState<'monthly' | 'weekly'>('monthly');
  const [deptSort, setDeptSort] = useState<'rate_desc' | 'rate_asc' | 'total_desc' | 'total_asc' | 'name_asc'>('rate_desc');
  const [page, setPage] = useState<number>(1);
  const [year, setYear] = useState<string>('all');
  const pageSize = 10; // fixed page size per requirement

  const programsAgg = useMemo(() => {
    const map = new Map<string, { title: string; total: number; completed: number; open: number; archived: number; rate: number }>();
    trainings.forEach(t => {
      const key = t.title || 'Untitled';
      if (!map.has(key)) map.set(key, { title: key, total: 0, completed: 0, open: 0, archived: 0, rate: 0 });
      const cur = map.get(key)!;
      cur.total += 1;
      if (t.status === 'completed') cur.completed += 1;
      if (t.archived) cur.archived += 1; else cur.open += 1;
    });
    const arr = Array.from(map.values()).map(p => ({ ...p, rate: p.total ? Math.round((p.completed / p.total) * 100) : 0 }));
    return arr.sort((a,b) => b.total - a.total);
  }, [trainings]);

  const totals = useMemo(() => ({
    totalPrograms: programsAgg.length,
    openPrograms: programsAgg.filter(p => p.archived < p.total).length,
    closedPrograms: programsAgg.filter(p => p.archived === p.total).length,
  }), [programsAgg]);

  // programsAgg is defined above

  const filteredPrograms = useMemo(() => {
    return programsAgg.filter(p => {
      if (q && !p.title.toLowerCase().includes(q.toLowerCase())) return false;
      if (statusFilter === 'open' && !(p.archived < p.total)) return false;
      if (statusFilter === 'closed' && !(p.archived === p.total)) return false;
      return true;
    });
  }, [programsAgg, q, statusFilter]);

  // reset to first page on filter/query/data change
  useEffect(() => { setPage(1); }, [q, statusFilter, programsAgg.length]);

  const lowCompletionAlerts = useMemo(() => {
    return programsAgg.filter(p => p.rate < 50).slice(0, 5);
  }, [programsAgg]);

  // Department breakdown across all programs
  const deptBreakdown = useMemo(() => {
    const map = new Map<string, { total: number; completed: number }>();
    trainings.forEach(t => {
      // apply year filter if set
      if (year !== 'all') {
        const y = Number(year);
        const dateStr = t.completionDate || t.expiryDate || '';
        if (!dateStr) return;
        const d = new Date(dateStr);
        if (isNaN(d.getTime()) || d.getFullYear() !== y) return;
      }
      const emp = (employees || []).find(e => e.id === t.employeeId);
  const dept = (emp?.stationName || 'Unknown').toString();
      if (!map.has(dept)) map.set(dept, { total: 0, completed: 0 });
      const cur = map.get(dept)!;
      cur.total += 1;
      if (t.status === 'completed') cur.completed += 1;
    });
    const arr = Array.from(map.entries()).map(([dept, v]) => ({ dept, ...v, rate: v.total ? Math.round((v.completed / v.total) * 100) : 0 }));
    return arr;
  }, [trainings, employees, year]);

  const sortedDept = useMemo(() => {
    const arr = [...deptBreakdown];
    switch (deptSort) {
      case 'rate_desc':
        arr.sort((a,b) => b.rate - a.rate || a.dept.localeCompare(b.dept));
        break;
      case 'rate_asc':
        arr.sort((a,b) => a.rate - b.rate || a.dept.localeCompare(b.dept));
        break;
      case 'total_desc':
        arr.sort((a,b) => b.total - a.total || a.dept.localeCompare(b.dept));
        break;
      case 'total_asc':
        arr.sort((a,b) => a.total - b.total || a.dept.localeCompare(b.dept));
        break;
      case 'name_asc':
      default:
        arr.sort((a,b) => a.dept.localeCompare(b.dept));
        break;
    }
    return arr;
  }, [deptBreakdown, deptSort]);

  const exportDeptCsv = () => {
    const header = ['Department','Completed','Total','Rate'];
    const rows = sortedDept.map(r => [r.dept, String(r.completed), String(r.total), `${r.rate}%`]);
    const data = [header, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n');
    const blob = new Blob([data], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'department_breakdown.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  // Time trend of completions per month (last 12 months)
  type TrendBucket = { key: string; label: string; count: number };
  type Trend = { buckets: TrendBucket[]; max: number };
  const timeTrend: Trend = useMemo(() => {
    if (trendRes === 'monthly') {
      const now = new Date();
      const buckets: TrendBucket[] = [];
      for (let i = 11; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
        const label = d.toLocaleString(undefined, { month: 'short' });
        buckets.push({ key, label, count: 0 });
      }
      const indexByKey = new Map(buckets.map((m, idx) => [m.key, idx] as const));
      trainings.forEach(t => {
        if (t.status !== 'completed' || !t.completionDate) return;
        const d = new Date(t.completionDate);
        if (isNaN(d.getTime())) return;
        const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
        const idx = indexByKey.get(key);
        if (idx !== undefined) buckets[idx].count += 1;
      });
      const max = Math.max(1, ...buckets.map(m => m.count));
      return { buckets, max };
    } else {
      // weekly (last 12 weeks, starting Monday)
      const startOfWeek = (d: Date) => {
        const x = new Date(d);
        const day = x.getDay();
        const diff = (day + 6) % 7; // Monday=0
        x.setDate(x.getDate() - diff);
        x.setHours(0,0,0,0);
        return x;
      };
      const now = new Date();
      const w0 = startOfWeek(now);
      const buckets: TrendBucket[] = [];
      const starts: number[] = [];
      for (let i = 11; i >= 0; i--) {
        const s = new Date(w0);
        s.setDate(s.getDate() - i * 7);
        const key = `${s.getFullYear()}-W${String(Math.ceil(((s.getDate() + ((s.getDay()+6)%7)))/7)).padStart(2,'0')}-${String(s.getMonth()+1).padStart(2,'0')}`; // approximate key
        const label = `${s.toLocaleString(undefined, { month: 'short' })} ${s.getDate()}`;
        buckets.push({ key, label, count: 0 });
        starts.push(s.getTime());
      }
      const indexByStart = new Map(starts.map((t, idx) => [t, idx] as const));
      trainings.forEach(t => {
        if (t.status !== 'completed' || !t.completionDate) return;
        const d = new Date(t.completionDate);
        if (isNaN(d.getTime())) return;
        const s = startOfWeek(d).getTime();
        const idx = indexByStart.get(s);
        if (idx !== undefined) buckets[idx].count += 1;
      });
      const max = Math.max(1, ...buckets.map(m => m.count));
      return { buckets, max };
    }
  }, [trainings, trendRes]);

  // Available years for filtering (from completionDate/expiryDate)
  const availableYears = useMemo(() => {
    const set = new Set<number>();
    trainings.forEach(t => {
      const dates = [t.completionDate, t.expiryDate].filter(Boolean) as string[];
      dates.forEach(ds => { const d = new Date(ds); if (!isNaN(d.getTime())) set.add(d.getFullYear()); });
    });
    return Array.from(set.values()).sort((a,b) => b - a);
  }, [trainings]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Training Progress</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Total Programs</p><p className="text-2xl font-bold">{totals.totalPrograms}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Open Programs</p><p className="text-2xl font-bold">{totals.openPrograms}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Closed Programs</p><p className="text-2xl font-bold">{totals.closedPrograms}</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Programs by Completion</CardTitle>
          <CardDescription>Click a program to inspect details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Controls */}
          <div className="flex flex-wrap items-center gap-3">
            <Input placeholder="Search program" value={q} onChange={(e)=>setQ(e.target.value)} className="max-w-xs" />
            <Select value={statusFilter} onValueChange={(v: 'all' | 'open' | 'closed') => setStatusFilter(v)}>
              <SelectTrigger className="w-44"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table with pagination (10 rows per page) */}
          {(() => {
            const total = filteredPrograms.length;
            if (total === 0) return <p className="text-sm text-muted-foreground">No programs match your filters.</p>;
            const totalPages = Math.max(1, Math.ceil(total / pageSize));
            const safePage = Math.min(page, totalPages);
            const startIdx = (safePage - 1) * pageSize;
            const endIdx = Math.min(total, startIdx + pageSize);
            const rows = filteredPrograms.slice(startIdx, endIdx);
            return (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-full table-auto border rounded">
                    <thead className="bg-muted/50">
                      <tr className="text-left text-sm">
                        <th className="p-2">Program</th>
                        <th className="p-2">Open</th>
                        <th className="p-2">Archived</th>
                        <th className="p-2">Completed</th>
                        <th className="p-2">Rate</th>
                        <th className="p-2">Status</th>
                        <th className="p-2 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map(p => {
                        const statusBadge = p.archived === p.total
                          ? <Badge variant="outline" className="bg-gray-100 text-gray-700">Closed</Badge>
                          : <Badge variant="secondary">Open</Badge>;
                        return (
                          <tr key={p.title} className="border-b last:border-0">
                            <td className="p-2">
                              <button className="text-left font-medium hover:underline" onClick={() => navigate(`/training/program/${encodeURIComponent(p.title)}`)}>
                                {p.title}
                              </button>
                            </td>
                            <td className="p-2 text-sm">{p.open}</td>
                            <td className="p-2 text-sm">{p.archived}</td>
                            <td className="p-2 text-sm">{p.completed}/{p.total}</td>
                            <td className="p-2 text-sm">{p.rate}%
                              <div className="mt-1"><Progress value={p.rate} /></div>
                            </td>
                            <td className="p-2">{statusBadge}</td>
                            <td className="p-2">
                              <div className="flex justify-end">
                                <Button size="sm" variant="outline" onClick={() => navigate(`/training/program/${encodeURIComponent(p.title)}`)}>View</Button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <div className="flex items-center justify-between mt-2 text-sm">
                  <div className="text-muted-foreground">Showing {startIdx + 1}-{endIdx} of {total}</div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" disabled={safePage <= 1} onClick={() => setPage(p => Math.max(1, p - 1))}>Prev</Button>
                    <span className="text-muted-foreground">Page {safePage} of {totalPages}</span>
                    <Button size="sm" variant="outline" disabled={safePage >= totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}>Next</Button>
                  </div>
                </div>
              </>
            );
          })()}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Alerts: Low Completion</CardTitle>
            <CardDescription>Programs under 50% completion</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {lowCompletionAlerts.length === 0 && (
              <p className="text-sm text-muted-foreground">No alerts</p>
            )}
            {lowCompletionAlerts.map(p => (
              <div key={p.title} className="flex items-center justify-between p-2 border rounded">
                <button className="text-left font-medium hover:underline" onClick={() => navigate(`/training/program/${encodeURIComponent(p.title)}`)}>{p.title}</button>
                <span className="text-xs text-muted-foreground">{p.completed}/{p.total} ({p.rate}%)</span>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-2">
              <div>
                <CardTitle>Department Breakdown</CardTitle>
                <CardDescription>Completion rate by department (all programs)</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Select value={deptSort} onValueChange={(v: 'rate_desc' | 'rate_asc' | 'total_desc' | 'total_asc' | 'name_asc') => setDeptSort(v)}>
                  <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rate_desc">Sort: Rate ↓</SelectItem>
                    <SelectItem value="rate_asc">Sort: Rate ↑</SelectItem>
                    <SelectItem value="total_desc">Sort: Total ↓</SelectItem>
                    <SelectItem value="total_asc">Sort: Total ↑</SelectItem>
                    <SelectItem value="name_asc">Sort: Name A–Z</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" onClick={exportDeptCsv}>Export CSV</Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {sortedDept.length === 0 && (
              <p className="text-sm text-muted-foreground">No department data.</p>
            )}
            {sortedDept.map(row => (
              <div key={row.dept} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{row.dept}</span>
                  <span className="text-muted-foreground">{row.completed}/{row.total} ({row.rate}%)</span>
                </div>
                <div className="h-2 bg-muted rounded" title={`${row.dept}: ${row.completed}/${row.total} (${row.rate}%)`}>
                  <div className="h-2 rounded" style={{ width: `${row.rate}%`, backgroundColor: row.rate >= 80 ? '#16a34a' : row.rate >= 50 ? '#eab308' : '#ef4444' }} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Time Trend</CardTitle>
          <div className="flex items-center justify-between">
            <CardDescription>Completions over time</CardDescription>
            <div className="flex items-center gap-2">
              <Select value={year} onValueChange={(v: string) => setYear(v)}>
                  <SelectTrigger className="w-32"><SelectValue placeholder="Year" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Year: All</SelectItem>
                    {availableYears.map(y => (<SelectItem key={y} value={String(y)}>{y}</SelectItem>))}
                  </SelectContent>
                </Select>
              <Button variant={trendRes === 'monthly' ? 'default' : 'outline'} size="sm" onClick={() => setTrendRes('monthly')}>Monthly</Button>
              <Button variant={trendRes === 'weekly' ? 'default' : 'outline'} size="sm" onClick={() => setTrendRes('weekly')}>Weekly</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {timeTrend.buckets.every(m => m.count === 0) ? (
            <p className="text-sm text-muted-foreground">No completions in the last 12 {trendRes === 'monthly' ? 'months' : 'weeks'}.</p>
          ) : (
            <div className="flex items-end gap-2 h-40">
              {timeTrend.buckets.map((b, idx) => {
                const h = Math.max(4, Math.round((b.count / timeTrend.max) * 140));
                return (
                  <div key={idx} className="flex flex-col items-center gap-1">
                    <div className="w-6 bg-blue-600 rounded" style={{ height: `${h}px` }} title={`${b.label}: ${b.count}`} />
                    <span className="text-[10px] text-muted-foreground">{b.label}</span>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TrainingProgress;
