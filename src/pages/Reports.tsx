import React, { useMemo } from 'react';
import { BarChart3, Download, Calendar, Users, TrendingUp, PieChart, ClipboardCheck, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useEmployees } from '@/contexts/EmployeesContext';
import { useLeave } from '@/contexts/LeaveContext';
import { usePerformance } from '@/contexts/PerformanceContext';
import { useTraining } from '@/contexts/TrainingContext';
import { useAuth } from '@/contexts/AuthContext';
import { isAuthManager, mapRole } from '@/lib/roles';
import { Progress } from '@/components/ui/progress';

export const Reports: React.FC = () => {
  const { user } = useAuth();
  const isHR = !!user && (mapRole(user.role) === 'hr' || mapRole(user.role) === 'admin');

  const { employees } = useEmployees();
  const { leaveRequests } = useLeave();
  const { reviews } = usePerformance();
  const { trainings } = useTraining();

  // Workforce metrics
  const workforce = useMemo(() => {
    const total = employees.length;
    const active = employees.filter(e => e.status === 'active').length;
    const inactive = total - active;
    const byDept = employees.reduce<Record<string, number>>((acc, e) => {
      acc[e.department] = (acc[e.department] || 0) + 1;
      return acc;
    }, {});
    const byGender = employees.reduce<Record<string, number>>((acc, e) => {
      const g = e.gender || 'unspecified';
      acc[g] = (acc[g] || 0) + 1;
      return acc;
    }, {});
    const recentHires = employees.filter(e => {
      const d = new Date(e.hireDate);
      const now = new Date();
      const diff = now.getTime() - d.getTime();
      return diff <= 1000 * 60 * 60 * 24 * 30; // last 30 days
    }).length;
    return { total, active, inactive, byDept, byGender, recentHires };
  }, [employees]);

  // Leave metrics
  const leave = useMemo(() => {
    const total = leaveRequests.length;
    const byStatus = leaveRequests.reduce<Record<string, number>>((acc, r) => {
      acc[r.status] = (acc[r.status] || 0) + 1;
      return acc;
    }, {});
    const byType = leaveRequests.reduce<Record<string, number>>((acc, r) => {
      acc[r.type] = (acc[r.type] || 0) + 1;
      return acc;
    }, {});
    const approved = byStatus['approved'] || 0;
    const pendingManager = byStatus['pending_manager'] || 0;
    const pendingHR = byStatus['pending_hr'] || 0;
    const avgDays = total > 0 ? Math.round(leaveRequests.reduce((s, r) => s + (r.days || 0), 0) / total) : 0;
    return { total, byStatus, byType, approved, pendingManager, pendingHR, avgDays };
  }, [leaveRequests]);

  // Performance metrics
  const perf = useMemo(() => {
    const total = reviews.length;
    const byStatus = reviews.reduce<Record<string, number>>((acc, r) => {
      acc[r.status] = (acc[r.status] || 0) + 1;
      return acc;
    }, {});
    const completed = byStatus['completed'] || 0;
    const avgScore = (() => {
      const scored = reviews.filter(r => typeof r.overallScore === 'number');
      if (scored.length === 0) return 0;
      const sum = scored.reduce((s, r) => s + (r.overallScore || 0), 0);
      return Math.round((sum / scored.length) * 100) / 100;
    })();
    const topPerformers = reviews
      .filter(r => typeof r.overallScore === 'number')
      .sort((a, b) => (b.overallScore || 0) - (a.overallScore || 0))
      .slice(0, 5);
    return { total, byStatus, completed, avgScore, topPerformers };
  }, [reviews]);

  // Training metrics
  const training = useMemo(() => {
    const total = trainings.length;
    const byStatus = trainings.reduce<Record<string, number>>((acc, t) => {
      acc[t.status] = (acc[t.status] || 0) + 1;
      return acc;
    }, {});
    const completed = byStatus['completed'] || 0;
    const complianceRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    const expiringSoon = trainings.filter(t => {
      if (!t.expiryDate) return false;
      const expiry = new Date(t.expiryDate);
      const now = new Date();
      const diffDays = (expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
      return diffDays >= 0 && diffDays <= 60;
    }).length;
    return { total, byStatus, completed, complianceRate, expiringSoon };
  }, [trainings]);

  // Additional computed datasets to satisfy more reporting needs
  const staffByWorkstation = useMemo(() => {
    const counts = employees.reduce<Record<string, number>>((acc, e) => {
      const station = e.stationName || 'Unassigned';
      acc[station] = (acc[station] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [employees]);

  const ageDistribution = useMemo(() => {
    const now = new Date();
    const groups: Record<string, number> = {
      '18-24': 0,
      '25-34': 0,
      '35-44': 0,
      '45-54': 0,
      '55-59': 0,
      '60+': 0,
    };
    employees.forEach(e => {
      if (!e.dateOfBirth) return;
      const dob = new Date(e.dateOfBirth);
      let age = now.getFullYear() - dob.getFullYear();
      const m = now.getMonth() - dob.getMonth();
      if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) age--;
      if (age < 25) groups['18-24']++;
      else if (age < 35) groups['25-34']++;
      else if (age < 45) groups['35-44']++;
      else if (age < 55) groups['45-54']++;
      else if (age < 60) groups['55-59']++;
      else groups['60+']++;
    });
    return groups;
  }, [employees]);

  const hiresPerYear = useMemo(() => {
    const counts = employees.reduce<Record<string, number>>((acc, e) => {
      const y = e.hireDate ? new Date(e.hireDate).getFullYear().toString() : 'Unknown';
      acc[y] = (acc[y] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(counts).sort((a, b) => b[0].localeCompare(a[0]));
  }, [employees]);

  const pendingPerfCounts = useMemo(() => {
    const statuses = ['draft','targets_set','manager_review','hr_review'];
    const counts: Record<string, number> = {};
    statuses.forEach(s => { counts[s] = 0; });
    reviews.forEach(r => {
      if (statuses.includes(r.status)) counts[r.status] = (counts[r.status] || 0) + 1;
    });
    return counts;
  }, [reviews]);

  const trainingByGender = useMemo(() => {
    const empById = new Map(employees.map(e => [e.id, e]));
    const agg: Record<string, number> = {};
    trainings.forEach(t => {
      const emp = empById.get(t.employeeId);
      const g = emp?.gender || 'unspecified';
      agg[g] = (agg[g] || 0) + 1;
    });
    return agg;
  }, [employees, trainings]);

  // Cadre Breakdown
  const byCadre = useMemo(() => {
    return employees.reduce<Record<string, number>>((acc, e) => {
      const c = e.cadre || 'Unspecified';
      acc[c] = (acc[c] || 0) + 1;
      return acc;
    }, {});
  }, [employees]);

  // Retirement Projections (age 60): upcoming 12 months
  const retirementsUpcoming = useMemo(() => {
    const now = new Date();
    const in12m = new Date();
    in12m.setMonth(in12m.getMonth() + 12);
    const rows = employees
      .filter(e => !!e.dateOfBirth)
      .map(e => {
        const dob = new Date(e.dateOfBirth!);
        const retirement = new Date(dob);
        retirement.setFullYear(retirement.getFullYear() + 60);
        return { id: e.id, name: e.name, department: e.department, cadre: e.cadre, stationName: e.stationName, retirement };
      })
      .filter(r => r.retirement >= now && r.retirement <= in12m)
      .sort((a,b) => a.retirement.getTime() - b.retirement.getTime());
    return rows;
  }, [employees]);

  const exportAll = () => {
    // Simple CSV export of headline metrics (can be expanded)
    const rows = [
      ['Metric', 'Value'],
      ['Headcount', String(workforce.total)],
      ['Active Employees', String(workforce.active)],
      ['Recent Hires (30d)', String(workforce.recentHires)],
      ['Leave Requests', String(leave.total)],
      ['Avg Leave Days', String(leave.avgDays)],
      ['Performance Reviews', String(perf.total)],
      ['Avg Performance Score', String(perf.avgScore)],
      ['Training Items', String(training.total)],
      ['Training Compliance %', String(training.complianceRate)],
    ];
    const csv = rows.map(r => r.map(v => `"${v.replace?.(/"/g, '""') || v}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'hr_reports_summary.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold mb-2">Reports & Analytics</h1>
          <p className="text-muted-foreground">
            Key HR insights and analytics across workforce, leave, performance, and training
          </p>
        </div>
        <Button onClick={exportAll}>
          <Download className="w-4 h-4 mr-2" />
          Export Summary
        </Button>
      </div>

      {!isHR && (
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">
              Limited view. For full analytics, login as HR/Admin.
            </p>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="overview">
            <TabsList className="grid grid-cols-5 w-full text-white font-medium">
              <TabsTrigger value="overview" className="bg-sky-500 hover:bg-sky-600">
                Overview
              </TabsTrigger>
              <TabsTrigger value="workforce" className="bg-emerald-500 hover:bg-emerald-600">
                Workforce
              </TabsTrigger>
              <TabsTrigger value="leave" className="bg-rose-500 hover:bg-rose-600">
                Leave
              </TabsTrigger>
              <TabsTrigger value="performance" className="bg-amber-500 hover:bg-amber-600">
                Performance
              </TabsTrigger>
              <TabsTrigger value="training" className="bg-indigo-500 hover:bg-indigo-600">
                Training
              </TabsTrigger>
            </TabsList>


        {/* Overview */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Users className="w-4 h-4" /> Headcount</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{workforce.total}</div>
                <p className="text-sm text-muted-foreground">Active: {workforce.active} • Inactive: {workforce.inactive}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Calendar className="w-4 h-4" /> Leave</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{leave.total}</div>
                <p className="text-sm text-muted-foreground">Avg days: {leave.avgDays} • Approved: {leave.approved}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><BarChart3 className="w-4 h-4" /> Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{perf.total}</div>
                <p className="text-sm text-muted-foreground">Avg score: {perf.avgScore} • Completed: {perf.completed}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><ClipboardCheck className="w-4 h-4" /> Training</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{training.total}</div>
                <div className="text-sm text-muted-foreground flex items-center gap-2">Compliance
                  <Progress value={training.complianceRate} className="w-28" />
                  <span>{training.complianceRate}%</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><PieChart className="w-4 h-4" /> Department Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(workforce.byDept).map(([dept, count]) => {
                    const pct = workforce.total ? Math.round((count / workforce.total) * 100) : 0;
                    return (
                      <div key={dept} className="flex items-center gap-3">
                        <div className="w-40 text-sm">{dept}</div>
                        <Progress value={pct} className="flex-1" />
                        <div className="w-20 text-right text-sm">{count} ({pct}%)</div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><TrendingUp className="w-4 h-4" /> Recent Hires (30d)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold">{workforce.recentHires}</div>
                <p className="text-sm text-muted-foreground">New joiners in the last 30 days</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Workforce */}
        <TabsContent value="workforce" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Gender Distribution</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {Object.entries(workforce.byGender).map(([g, c]) => {
                  const pct = workforce.total ? Math.round((c / workforce.total) * 100) : 0;
                  return (
                    <div key={g} className="flex items-center gap-3">
                      <div className="w-28 text-sm capitalize">{g}</div>
                      <Progress value={pct} className="flex-1" />
                      <div className="w-16 text-right text-sm">{pct}%</div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Cadre Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {Object.entries(byCadre).map(([cadre, count]) => (
                  <div key={cadre} className="flex items-center gap-3">
                    <div className="w-32 text-sm">{cadre}</div>
                    <Progress value={workforce.total ? Math.round((count / workforce.total) * 100) : 0} className="flex-1" />
                    <div className="w-16 text-right text-sm">{count}</div>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  <Badge variant="default">Active {workforce.active}</Badge>
                  <Badge variant="secondary">Inactive {workforce.inactive}</Badge>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Largest Departments</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {Object.entries(workforce.byDept)
                  .sort((a,b) => b[1]-a[1])
                  .slice(0,5)
                  .map(([dept,count]) => (
                    <div key={dept} className="flex justify-between text-sm">
                      <span>{dept}</span>
                      <span className="text-muted-foreground">{count}</span>
                    </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Staff per Workstation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {staffByWorkstation.slice(0,10).map(([station, count]) => (
                  <div key={station} className="flex justify-between text-sm">
                    <span className="truncate max-w-[60%]" title={station}>{station}</span>
                    <span className="text-muted-foreground">{count}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Age Distribution</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {Object.entries(ageDistribution).map(([range, count]) => (
                  <div key={range} className="flex justify-between text-sm">
                    <span>{range}</span>
                    <span className="text-muted-foreground">{count}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Hires per Year</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {hiresPerYear.map(([year, count]) => (
                <div key={year} className="flex justify-between text-sm">
                  <span>{year}</span>
                  <span className="text-muted-foreground">{count}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Retirement Projections (Next 12 Months)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-sm text-muted-foreground">Total: {retirementsUpcoming.length}</div>
              {retirementsUpcoming.slice(0,10).map(r => (
                <div key={r.id} className="flex justify-between text-sm">
                  <span className="truncate max-w-[60%]" title={`${r.name} • ${r.department} • ${r.cadre || ''}`}>{r.name}</span>
                  <span className="text-muted-foreground">{new Date(r.retirement).toLocaleDateString()}</span>
                </div>
              ))}
              {retirementsUpcoming.length > 10 && (
                <div className="text-xs text-muted-foreground">Showing first 10 records.</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Leave */}
        <TabsContent value="leave" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader><CardTitle>Total Requests</CardTitle></CardHeader>
              <CardContent><div className="text-3xl font-bold">{leave.total}</div></CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Pending (Mgr)</CardTitle></CardHeader>
              <CardContent><div className="text-3xl font-bold">{leave.pendingManager}</div></CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Pending (HR)</CardTitle></CardHeader>
              <CardContent><div className="text-3xl font-bold">{leave.pendingHR}</div></CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Approved</CardTitle></CardHeader>
              <CardContent><div className="text-3xl font-bold">{leave.approved}</div></CardContent>
            </Card>
          </div>
          <Card>
            <CardHeader><CardTitle>By Type</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {Object.entries(leave.byType).map(([type, count]) => {
                const pct = leave.total ? Math.round((count / leave.total) * 100) : 0;
                return (
                  <div key={type} className="flex items-center gap-3">
                    <div className="w-40 text-sm capitalize">{type}</div>
                    <Progress value={pct} className="flex-1" />
                    <div className="w-20 text-right text-sm">{count} ({pct}%)</div>
                  </div>
                );
              })}
              <div className="text-sm text-muted-foreground mt-4">Average leave length: {leave.avgDays} days</div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance */}
        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader><CardTitle>Total Reviews</CardTitle></CardHeader>
              <CardContent><div className="text-3xl font-bold">{perf.total}</div></CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Completed</CardTitle></CardHeader>
              <CardContent><div className="text-3xl font-bold">{perf.completed}</div></CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Average Score</CardTitle></CardHeader>
              <CardContent><div className="text-3xl font-bold">{perf.avgScore}</div></CardContent>
            </Card>
          </div>
          <Card>
            <CardHeader><CardTitle>Pending Performance Reviews</CardTitle></CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {Object.entries(pendingPerfCounts).map(([status, count]) => (
                <Badge key={status} variant="outline" className="capitalize">{status.replace('_',' ')}: {count}</Badge>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>By Status</CardTitle></CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {Object.entries(perf.byStatus).map(([status, count]) => (
                <Badge key={status} variant="outline" className="capitalize">{status.replace('_',' ')}: {count}</Badge>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Top Performers</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {perf.topPerformers.map(r => (
                <div key={r.id} className="flex justify-between text-sm">
                  <span>{r.employeeName} • {r.reviewPeriod}</span>
                  <span className="font-medium">{r.overallScore}</span>
                </div>
              ))}
              {perf.topPerformers.length === 0 && (
                <div className="text-sm text-muted-foreground">No scored reviews yet.</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Training */}
        <TabsContent value="training" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader><CardTitle>Total Items</CardTitle></CardHeader>
              <CardContent><div className="text-3xl font-bold">{training.total}</div></CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Completed</CardTitle></CardHeader>
              <CardContent><div className="text-3xl font-bold">{training.completed}</div></CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Compliance</CardTitle></CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Progress value={training.complianceRate} className="w-40" />
                  <span className="text-xl font-bold">{training.complianceRate}%</span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> Expiring (&lt;=60d)</CardTitle></CardHeader>
              <CardContent><div className="text-3xl font-bold">{training.expiringSoon}</div></CardContent>
            </Card>
          </div>
          <Card>
            <CardHeader><CardTitle>Training by Gender</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {Object.entries(trainingByGender).map(([g, c]) => (
                <div key={g} className="flex justify-between text-sm">
                  <span className="capitalize">{g}</span>
                  <span className="text-muted-foreground">{c}</span>
                </div>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>By Status</CardTitle></CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {Object.entries(training.byStatus).map(([status, count]) => (
                <Badge key={status} variant="outline" className="capitalize">{status.replace('_',' ')}: {count}</Badge>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Training Details</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {trainings.slice(0, 10).map(t => (
                <div key={t.id} className="grid grid-cols-1 md:grid-cols-4 gap-2 text-sm">
                  <span className="font-medium truncate" title={t.title}>{t.title}</span>
                  <span className="text-muted-foreground capitalize">{t.type}</span>
                  <span className="text-muted-foreground capitalize">{t.status.replace('_', ' ')}</span>
                  <span className="text-muted-foreground truncate" title={t.provider}>{t.provider}</span>
                </div>
              ))}
              {trainings.length > 10 && (
                <div className="text-xs text-muted-foreground">Showing first 10 records.</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};