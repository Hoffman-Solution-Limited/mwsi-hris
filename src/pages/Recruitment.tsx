import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { EmployeeForm } from "@/components/EmployeeForm";
import { useEmployees } from "@/contexts/EmployeesContext";
import { useAuth } from "@/contexts/AuthContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { ChevronsUpDown, Check } from "lucide-react";
import { useSystemCatalog } from "@/contexts/SystemCatalogContext";
import api from "@/lib/api";

const Recruitment: React.FC = () => {
  const [activeTab, setActiveTab] = useState("positions");
  const [showJobDialog, setShowJobDialog] = useState(false);
  const [editingJob, setEditingJob] = useState<any>(null);
  const [positions, setPositions] = useState<any[]>(() => {
    try {
      const raw = localStorage.getItem('hris-positions');
      if (raw) return JSON.parse(raw) as any[];
    } catch {}
    return [];
  });
  // helpers to map API <-> UI job shapes
  const fromApi = (row: any) => ({
    ...row,
    grossSalary: row.grossSalary ?? row.gross_salary,
    employmentType: row.employmentType ?? row.employment_type,
    postedDate: (row.postedDate ?? row.posted_date)?.slice(0, 10),
    closingDate: (row.closingDate ?? row.closing_date)?.slice(0, 10),
  });
  const toApi = (row: any) => ({
    title: row.title,
    designation: row.designation,
    stations: row.stations,
    gross_salary: row.grossSalary ?? row.gross_salary,
    employment_type: row.employmentType ?? row.employment_type,
    status: row.status,
    description: row.description,
    posted_date: row.postedDate ?? row.posted_date,
    closing_date: row.closingDate ?? row.closing_date,
    applicants: row.applicants ?? 0,
  });

  // load positions from backend on mount
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const rows = await api.get('/api/positions');
        if (!mounted) return;
        if (Array.isArray(rows) && rows.length > 0) setPositions((rows as any[]).map(fromApi));
      } catch (err) {
        // keep local positions
      }
    })();
    return () => { mounted = false; };
  }, []);
  const { addEmployee } = useEmployees();
  const { user } = useAuth();
  const { designations, stations, engagementTypes } = useSystemCatalog();
  // designations: Item[] -> map to string[] for Select usage
  const designationOptions = designations.map(d => d.value);
  // stations: StationItem[] -> map to string[] for the multi-select UI
  const stationOptions = stations.map(s => s.name);
  // engagementTypes: Item[] -> map to string[]
  const engagementTypeOptions = engagementTypes.map(e => e.value);
  const [jobForm, setJobForm] = useState({
    title: "", // kept for display, synced from designation
    designation: "",
    stations: [] as string[],
    grossSalary: "",
    employmentType: "",
    status: "open",
    description: "",
    postedDate: new Date().toISOString().slice(0,10),
    closingDate: "",
    applicants: 0,
  });
  const [closeJobDialogOpen, setCloseJobDialogOpen] = useState(false);
  const [jobToClose, setJobToClose] = useState<any>(null);
  // New Hire flow (replaces shortlisting)
  const [hireDialogOpen, setHireDialogOpen] = useState(false);
  const [hireJob, setHireJob] = useState<any>(null);
  const [hireFirstName, setHireFirstName] = useState("");
  const [hireMiddleName, setHireMiddleName] = useState("");
  const [hireSurname, setHireSurname] = useState("");
  const [hireCloseJob, setHireCloseJob] = useState(true);
  const [hireConfirmOpen, setHireConfirmOpen] = useState(false);
  const [hireStation, setHireStation] = useState<string>("");
  // View Details dialog for job postings
  const [viewOpen, setViewOpen] = useState(false);
  const [viewJob, setViewJob] = useState<any>(null);
  const [viewHiredOpen, setViewHiredOpen] = useState(false);
  const [viewHired, setViewHired] = useState<any>(null);
  const [hiredCandidates, setHiredCandidates] = useState<any[]>(() => {
    try {
      const raw = localStorage.getItem('hris-hired-candidates');
      if (raw) return JSON.parse(raw) as any[];
    } catch {}
    return [];
  });

  // persist positions and hired candidates to localStorage
  useEffect(() => {
    try { localStorage.setItem('hris-positions', JSON.stringify(positions)); } catch {}
  }, [positions]);
  useEffect(() => {
    try { localStorage.setItem('hris-hired-candidates', JSON.stringify(hiredCandidates)); } catch {}
  }, [hiredCandidates]);

  // Create Employee dialog state (for hired candidates)
  const [createEmpOpen, setCreateEmpOpen] = useState(false);
  const [prefillCandidate, setPrefillCandidate] = useState<any>(null);

  const canCreateEmployee = ["admin", "hr_manager", "hr_staff"].includes(user?.role || "");

  const openCreateEmployee = (candidate: any) => {
    setPrefillCandidate(candidate);
    setCreateEmpOpen(true);
  };

  const handleCreateEmployeeSave = (data: any) => {
    // Minimal mapping; HR can complete missing fields (e.g., department)
    addEmployee({
      id: undefined as any,
      name: data.name,
      email: data.email,
      position: data.position,
      department: data.department,
      manager: undefined,
      hireDate: data.hireDate || new Date().toISOString().slice(0,10),
      status: (data.status as any) || 'active',
      avatar: '',
      phone: data.phone,
      salary: data.salary,
      documents: [],
      skills: [],
      gender: data.gender,
      cadre: data.cadre,
      employmentType: data.employmentType,
      engagementType: data.employmentType,
      jobGroup: data.jobGroup,
      ethnicity: data.ethnicity,
      employeeNumber: data.employeeNumber,
      nationalId: data.nationalId,
      kraPin: data.kraPin,
      children: data.children,
      workCounty: data.workCounty,
      homeCounty: data.homeCounty,
      postalAddress: data.postalAddress,
      postalCode: data.postalCode,
      stationName: data.stationName,
      skillLevel: data.skillLevel,
      company: data.company,
      dateOfBirth: data.dateOfBirth,
    } as any);
    setCreateEmpOpen(false);
    setPrefillCandidate(null);
    alert(`Employee ${data.name} created from recruitment!`);
  };

  const handleSaveJob = () => {
    // Compose new/updated job object
    const job = {
      id: editingJob?.id ?? String(Date.now()),
      title: jobForm.title || jobForm.designation,
      designation: jobForm.designation,
      stations: jobForm.stations,
      grossSalary: jobForm.grossSalary ? Number(jobForm.grossSalary) : undefined,
      employmentType: jobForm.employmentType,
      status: jobForm.status || 'open',
      description: jobForm.description,
      postedDate: jobForm.postedDate,
      closingDate: jobForm.closingDate,
      applicants: editingJob?.applicants ?? 0,
    } as any;

    (async () => {
      try {
        if (editingJob) {
          const updated = await api.put(`/api/positions/${editingJob.id}`, toApi(job));
          setPositions(prev => prev.map(p => (p.id === editingJob.id ? fromApi(updated) : p)));
        } else {
          const created = await api.post('/api/positions', toApi(job));
          setPositions(prev => [fromApi(created), ...prev]);
        }
      } catch (err) {
        // fallback to local
        setPositions(prev => {
          if (editingJob) return prev.map(p => (p.id === editingJob.id ? { ...p, ...job } : p));
          return [job, ...prev];
        });
      }
    })();

    setShowJobDialog(false);
    setEditingJob(null);
    setJobForm({
      title: "",
      designation: "",
      stations: [],
      grossSalary: "",
      employmentType: "",
      status: "open",
      description: "",
      postedDate: new Date().toISOString().slice(0,10),
      closingDate: "",
      applicants: 0,
    });
  };
  const handleHireCandidate = () => {
    const fullName = [hireFirstName, hireMiddleName, hireSurname].map(s => s.trim()).filter(Boolean).join(' ');
    if (!hireJob || !fullName) return;
    const id = (crypto?.randomUUID && crypto.randomUUID()) || String(Date.now());
    const hired = {
      id,
      name: fullName,
      firstName: hireFirstName.trim(),
      middleName: hireMiddleName.trim(),
      surname: hireSurname.trim(),
      position: hireJob.title,
      designation: hireJob.designation,
      stations: hireStation ? [hireStation] : ((hireJob as any)?.stations || (hireJob?.stationName ? [hireJob.stationName] : [])),
      grossSalary: (hireJob as any)?.grossSalary,
      employmentType: hireJob.employmentType,
      description: hireJob.description,
      closingDate: hireJob.closingDate,
    } as any;
    setHiredCandidates(prev => [hired, ...prev]);
    if (hireCloseJob && hireJob?.id) {
      setPositions(prev => prev.map(p => p.id === hireJob.id ? { ...p, status: 'closed' } : p));
    }
    setHireDialogOpen(false);
    setHireJob(null);
    setHireFirstName("");
    setHireMiddleName("");
    setHireSurname("");
    setHireStation("");
    setHireCloseJob(true);
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Recruitment & Positions</h1>
          <p className="text-muted-foreground">
            Add jobs manually, manage hired candidates, and onboard.
          </p>
        </div>
        <Button
          className="ml-4"
          onClick={() => {
            setEditingJob(null);
            setJobForm({
              title: "",
              designation: "",
              stations: [],
              grossSalary: "",
              employmentType: "",
              status: "open",
              description: "",
              postedDate: new Date().toISOString().slice(0,10),
              closingDate: "",
              applicants: 0,
            });
            setShowJobDialog(true);
          }}
        >
          <Plus className="w-4 h-4 mr-2" /> Add New Job
        </Button>
      </div>

      <Dialog open={showJobDialog} onOpenChange={setShowJobDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingJob ? "Edit Job" : "Add New Job"}</DialogTitle>
          </DialogHeader>
          <form
            className="space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              handleSaveJob();
            }}
          >
            {/* Designation (Position) */}
            <div>
              <label className="text-sm font-medium">Designation (Position)</label>
                <Select value={jobForm.designation} onValueChange={(v) => setJobForm(prev => ({ ...prev, designation: v, title: v }))}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select designation" />
                </SelectTrigger>
                <SelectContent>
                  {designationOptions.map(d => (
                    <SelectItem key={d} value={d}>{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {/* Stations (Searchable multi-select) */}
            <div>
              <label className="text-sm font-medium">Stations</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" type="button" className="mt-1 w-full justify-between">
                    {jobForm.stations.length > 0 ? `${jobForm.stations.length} selected` : "Select stations"}
                    <ChevronsUpDown className="h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="p-0 w-[300px]">
                  <Command>
                    <CommandInput placeholder="Search stations..." />
                    <CommandList>
                      <CommandEmpty>No stations found.</CommandEmpty>
                      <CommandGroup>
                        {stationOptions.map((s) => {
                          const checked = jobForm.stations.includes(s);
                          return (
                            <CommandItem
                              key={s}
                              value={s}
                              onSelect={() => {
                                const next = checked
                                  ? jobForm.stations.filter((x) => x !== s)
                                  : [...jobForm.stations, s];
                                setJobForm((prev) => ({ ...prev, stations: next }));
                              }}
                              className="flex items-center justify-between"
                            >
                              <span>{s}</span>
                              <Check className={`h-4 w-4 ${checked ? 'opacity-100' : 'opacity-0'}`} />
                            </CommandItem>
                          );
                        })}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              {jobForm.stations.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {jobForm.stations.map((s) => (
                    <span key={s} className="px-2 py-0.5 text-xs rounded bg-secondary text-secondary-foreground">
                      {s}
                    </span>
                  ))}
                </div>
              )}
            </div>
            {/* Gross Salary */}
            <div>
              <label className="text-sm font-medium">Gross Salary</label>
              <Input
                className="mt-1"
                type="number"
                placeholder="e.g. 120000"
                value={jobForm.grossSalary}
                onChange={(e) => setJobForm(prev => ({ ...prev, grossSalary: e.target.value }))}
              />
            </div>
            {/* Employment Type */}
            <div>
              <label className="text-sm font-medium">Employment Type</label>
              <Select value={jobForm.employmentType} onValueChange={(v) => setJobForm(prev => ({ ...prev, employmentType: v }))}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select employment type" />
                </SelectTrigger>
                <SelectContent>
                  {engagementTypeOptions.map(e => (
                    <SelectItem key={e} value={e}>{e}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {/* Job Description */}
            <div>
              <label className="text-sm font-medium">Job Description</label>
              <div className="mt-1">
                <ReactQuill theme="snow" value={jobForm.description} onChange={(val) => setJobForm(prev => ({ ...prev, description: val }))} />
              </div>
            </div>
            {/* Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium">Posted Date</label>
                <Input
                  type="date"
                  value={jobForm.postedDate}
                  onChange={(e) => setJobForm({ ...jobForm, postedDate: e.target.value })}
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Closing Date</label>
                <Input
                  type="date"
                  value={jobForm.closingDate}
                  onChange={(e) => setJobForm({ ...jobForm, closingDate: e.target.value })}
                  required
                  className="mt-1"
                />
              </div>
            </div>
            <Button type="submit" className="w-full">
              {editingJob ? "Save Changes" : "Add Job"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4 flex w-full gap-4">
          <TabsTrigger
            value="positions"
            className={`flex-1 px-4 py-2 rounded-lg font-semibold text-base transition-all shadow-md
              ${activeTab === "positions" ? "bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 text-white" : "bg-gray-100 hover:bg-gradient-to-r hover:from-pink-500 hover:via-red-500 hover:to-yellow-500 hover:text-white"}`}
          >
            Open Positions
          </TabsTrigger>
          {/* Shortlisting removed */}
          <TabsTrigger
            value="candidates"
            className={`flex-1 px-4 py-2 rounded-lg font-semibold text-base transition-all shadow-md
              ${activeTab === "candidates" ? "bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 text-white" : "bg-gray-100 hover:bg-gradient-to-r hover:from-blue-500 hover:via-indigo-500 hover:to-purple-500 hover:text-white"}`}
          >
            Hired Candidates
          </TabsTrigger>
        </TabsList>
        <TabsContent value="positions">
          <div className="grid gap-4">
            {positions.filter(pos => pos.status === "open").length === 0 ? (
              <p className="text-muted-foreground">No open positions available.</p>
            ) : (
              positions.filter(pos => pos.status === "open").map((job) => (
                <Card key={job.id} className="border-l-8 border-primary shadow-md">
                  <CardContent className="flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-bold text-lg text-primary mb-1">{job.title}</p>
                        <p className="text-sm text-muted-foreground">{(job as any).designation ?? job.title} • {(job as any).stations ? (job as any).stations.join(', ') : ((job as any).stationName || '—')} • {typeof (job as any).grossSalary !== 'undefined' ? `KES ${(job as any).grossSalary}` : '—'}</p>
                        <p className="text-xs text-gray-500">Posted: {job.postedDate} &bull; Closes: {job.closingDate}</p>
                        <div className="mt-2 text-gray-700">
                          <div dangerouslySetInnerHTML={{ __html: job.description }} />
                        </div>
                      </div>
                      <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 font-semibold text-xs">{job.status}</span>
                    </div>
                    <div className="flex gap-2 justify-end mt-2">
                      <Button size="sm" variant="secondary" onClick={() => { setViewJob(job); setViewOpen(true); }}>
                        View Details
                      </Button>
                      <Button size="sm" variant="default" onClick={() => { setHireDialogOpen(true); setHireJob(job); }}>
                        Hire Candidate
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => {
                        setEditingJob(job);
                        setJobForm({
                          title: job.title || job.designation || '',
                          designation: (job as any).designation || '',
                          stations: (job as any).stations || ((job as any).stationName ? [(job as any).stationName] : []),
                          grossSalary: typeof (job as any).grossSalary !== 'undefined' ? String((job as any).grossSalary) : "",
                          employmentType: (job as any).employmentType || '',
                          status: job.status || 'open',
                          description: job.description || '',
                          postedDate: job.postedDate || new Date().toISOString().slice(0,10),
                          closingDate: job.closingDate || '',
                          applicants: (job as any).applicants || 0,
                        });
                        setShowJobDialog(true);
                      }}>
                        Edit
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => { setJobToClose(job); setCloseJobDialogOpen(true); }}>
                        Close
                      </Button>
                      <Button size="sm" variant="ghost" onClick={async () => {
                        if (!confirm('Delete this position?')) return;
                        try {
                          await api.del(`/api/positions/${job.id}`);
                          setPositions(prev => prev.filter(p => p.id !== job.id));
                        } catch (e) {
                          // local fallback
                          setPositions(prev => prev.filter(p => p.id !== job.id));
                        }
                      }}>
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
          {/* Hire Candidate Dialog */}
          <Dialog open={hireDialogOpen} onOpenChange={(v) => { setHireDialogOpen(v); if (!v) { setHireCloseJob(true); } }}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Hire Candidate for {hireJob?.title}</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="text-sm font-medium">First Name</label>
                    <Input className="mt-1" placeholder="e.g. Jane" value={hireFirstName} onChange={(e) => setHireFirstName(e.target.value)} />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Middle Name</label>
                    <Input className="mt-1" placeholder="(optional)" value={hireMiddleName} onChange={(e) => setHireMiddleName(e.target.value)} />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Surname</label>
                    <Input className="mt-1" placeholder="e.g. Doe" value={hireSurname} onChange={(e) => setHireSurname(e.target.value)} />
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">
                  Employment Type: <span className="font-medium">{hireJob?.employmentType || '—'}</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  Stations: <span className="font-medium">{(hireJob as any)?.stations ? (hireJob as any).stations.join(', ') : (hireJob?.stationName || '—')}</span>
                </div>
                {/* Hire station selection (from job's stations) */}
                <div>
                  <label className="text-sm font-medium">Assign Station</label>
                  <Select value={hireStation} onValueChange={setHireStation}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select station" />
                    </SelectTrigger>
                    <SelectContent>
                      {((hireJob as any)?.stations && (hireJob as any).stations.length > 0
                        ? (hireJob as any).stations
                        : (hireJob?.stationName ? [hireJob.stationName] : [])
                      ).map((s: string) => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="text-sm text-muted-foreground">
                  Gross Salary: <span className="font-medium">{typeof (hireJob as any)?.grossSalary !== 'undefined' ? `KES ${(hireJob as any)?.grossSalary}` : '—'}</span>
                </div>
                <label className="flex items-center gap-2 text-sm mt-2">
                  <input type="checkbox" checked={hireCloseJob} onChange={(e) => setHireCloseJob(e.target.checked)} />
                  <span>Close this job after hiring</span>
                </label>
              </div>
              <DialogFooter className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setHireDialogOpen(false)}>Cancel</Button>
                <Button onClick={() => setHireConfirmOpen(true)} disabled={!hireFirstName.trim() || !hireSurname.trim() || (((hireJob as any)?.stations?.length || (hireJob?.stationName ? 1 : 0)) > 0 && !hireStation)}>Confirm Hire</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          {/* Hire Confirmation Dialog */}
          <Dialog open={hireConfirmOpen} onOpenChange={setHireConfirmOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Confirm Hire</DialogTitle>
              </DialogHeader>
              <div className="space-y-2 text-sm">
                <p>Hire <span className="font-semibold">{[hireFirstName, hireMiddleName, hireSurname].filter(Boolean).join(' ')}</span> for <span className="font-semibold">{hireJob?.title}</span>?</p>
                <p>Assign Station: <span className="font-semibold">{hireStation || '—'}</span></p>
                <p>Close job after hiring: <span className="font-semibold">{hireCloseJob ? 'Yes' : 'No'}</span></p>
              </div>
              <DialogFooter className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setHireConfirmOpen(false)}>Cancel</Button>
                <Button onClick={() => { setHireConfirmOpen(false); handleHireCandidate(); }}>Confirm</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* View Hired Candidate Details Dialog */}
          <Dialog open={viewHiredOpen} onOpenChange={setViewHiredOpen}>
            <DialogContent className="sm:max-w-2xl">
              <DialogHeader>
                <DialogTitle>Hired Candidate Details{viewHired?.name ? `: ${viewHired.name}` : ''}</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium">First Name</p>
                  <p className="text-muted-foreground">{(viewHired as any)?.firstName || '—'}</p>
                </div>
                <div>
                  <p className="font-medium">Middle Name</p>
                  <p className="text-muted-foreground">{(viewHired as any)?.middleName || '—'}</p>
                </div>
                <div>
                  <p className="font-medium">Surname</p>
                  <p className="text-muted-foreground">{(viewHired as any)?.surname || '—'}</p>
                </div>
                <div>
                  <p className="font-medium">Position / Designation</p>
                  <p className="text-muted-foreground">{(viewHired as any)?.position || (viewHired as any)?.designation || '—'}</p>
                </div>
                <div>
                  <p className="font-medium">Stations</p>
                  <p className="text-muted-foreground">{(viewHired as any)?.stations ? (viewHired as any).stations.join(', ') : ((viewHired as any)?.stationName || '—')}</p>
                </div>
                <div>
                  <p className="font-medium">Gross Salary</p>
                  <p className="text-muted-foreground">{typeof (viewHired as any)?.grossSalary !== 'undefined' ? `KES ${(viewHired as any)?.grossSalary}` : '—'}</p>
                </div>
                <div>
                  <p className="font-medium">Employment Type</p>
                  <p className="text-muted-foreground">{(viewHired as any)?.employmentType || '—'}</p>
                </div>
                <div>
                  <p className="font-medium">Closing Date</p>
                  <p className="text-muted-foreground">{(viewHired as any)?.closingDate || '—'}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="font-medium mb-1">Job Description</p>
                  <div className="prose prose-sm max-w-none">
                    <div dangerouslySetInnerHTML={{ __html: (viewHired as any)?.description || '' }} />
                  </div>
                </div>
                {((viewHired as any)?.hireReason || (viewHired as any)?.cv) && (
                  <div className="md:col-span-2 space-y-1">
                    { (viewHired as any)?.hireReason && (
                      <div>
                        <p className="font-medium">Hire Reason</p>
                        <p className="text-muted-foreground">{(viewHired as any).hireReason}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setViewHiredOpen(false)}>Close</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          {/* View Position Details Dialog */}
          <Dialog open={viewOpen} onOpenChange={setViewOpen}>
            <DialogContent className="sm:max-w-2xl">
              <DialogHeader>
                <DialogTitle>Position Details{viewJob?.title ? `: ${viewJob.title}` : ''}</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium">Designation</p>
                  <p className="text-muted-foreground">{(viewJob as any)?.designation || '—'}</p>
                </div>
                <div>
                  <p className="font-medium">Stations</p>
                  <p className="text-muted-foreground">{(viewJob as any)?.stations ? (viewJob as any).stations.join(', ') : ((viewJob as any)?.stationName || '—')}</p>
                </div>
                <div>
                  <p className="font-medium">Gross Salary</p>
                  <p className="text-muted-foreground">{typeof (viewJob as any)?.grossSalary !== 'undefined' ? `KES ${(viewJob as any)?.grossSalary}` : '—'}</p>
                </div>
                <div>
                  <p className="font-medium">Employment Type</p>
                  <p className="text-muted-foreground">{(viewJob as any)?.employmentType || '—'}</p>
                </div>
                <div>
                  <p className="font-medium">Status</p>
                  <p className="text-muted-foreground">{viewJob?.status || '—'}</p>
                </div>
                <div>
                  <p className="font-medium">Posted Date</p>
                  <p className="text-muted-foreground">{viewJob?.postedDate || '—'}</p>
                </div>
                <div>
                  <p className="font-medium">Closing Date</p>
                  <p className="text-muted-foreground">{viewJob?.closingDate || '—'}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="font-medium mb-1">Job Description</p>
                  <div className="prose prose-sm max-w-none">
                    <div dangerouslySetInnerHTML={{ __html: (viewJob as any)?.description || '' }} />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setViewOpen(false)}>Close</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          {/* Close Job Confirmation Dialog */}
          <Dialog open={closeJobDialogOpen} onOpenChange={setCloseJobDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Confirm Close Job</DialogTitle>
              </DialogHeader>
              <p>Are you sure you want to close the job posting for <span className="font-semibold">{jobToClose?.title}</span>? This action cannot be undone.</p>
              <DialogFooter className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setCloseJobDialogOpen(false)}>Cancel</Button>
                <Button variant="destructive" onClick={async () => {
                  if (jobToClose) {
                    try {
                      await api.put(`/api/positions/${jobToClose.id}`, { status: 'closed' });
                      setPositions(prev => prev.map(p => p.id === jobToClose.id ? { ...p, status: 'closed' } : p));
                    } catch (e) {
                      setPositions(prev => prev.map(p => p.id === jobToClose.id ? { ...p, status: 'closed' } : p));
                    }
                  }
                  setCloseJobDialogOpen(false);
                  setJobToClose(null);
                }}>Confirm Close</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>
        {/* Shortlist tab removed */}
        <TabsContent value="candidates">
          <div className="grid gap-4">
            {hiredCandidates.length === 0 ? (
              <p className="text-muted-foreground">No hired candidates.</p>
            ) : (
              hiredCandidates.map((candidate) => (
                <Card key={candidate.id}>
                  <CardContent className="flex items-center justify-between gap-2">
                    <div>
                      <p className="font-semibold">{candidate.name}</p>
                      <p className="text-sm text-muted-foreground">{candidate.position} • {candidate.employmentType || '—'}</p>
                      <p className="text-xs text-muted-foreground">{candidate.stations ? candidate.stations.join(', ') : (candidate.stationName || '—')} • {typeof candidate.grossSalary !== 'undefined' ? `KES ${candidate.grossSalary}` : '—'}</p>
                      {candidate.closingDate && (
                        <p className="text-xs text-muted-foreground">Posting closed: {candidate.closingDate}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="secondary" onClick={() => { setViewHired(candidate); setViewHiredOpen(true); }}>View Details</Button>
                      {canCreateEmployee && (
                        <Button size="sm" onClick={() => openCreateEmployee(candidate)}>Create Employee</Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Old confirm dialog removed with shortlisting */}

      {/* Create Employee Dialog from Hired Candidate */}
      <Dialog open={createEmpOpen} onOpenChange={setCreateEmpOpen}>
        <DialogContent className="sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>Create Employee from Candidate</DialogTitle>
          </DialogHeader>
          {prefillCandidate && (
            <EmployeeForm
              defaultValues={{
                name: prefillCandidate.name || "",
                firstName: prefillCandidate.firstName || (typeof prefillCandidate.name === 'string' ? prefillCandidate.name.split(' ')[0] : "") ,
                surname: prefillCandidate.surname || (typeof prefillCandidate.name === 'string' ? prefillCandidate.name.split(' ').slice(1).join(' ') : ""),
                email: "",
                phone: "",
                position: prefillCandidate.position || prefillCandidate.designation || "",
                cadre: undefined as any,
                gender: undefined,
                employmentType: (prefillCandidate.employmentType as any) || "Permanent",
                jobGroup: (prefillCandidate.jobGroup as any) || undefined,
                ethnicity: undefined as any,
                employeeNumber: "",
                nationalId: "",
                kraPin: "",
                children: "",
                workCounty: "",
                homeCounty: "",
                postalAddress: "",
                postalCode: "",
                stationName: (prefillCandidate.stations && prefillCandidate.stations.length > 0) ? prefillCandidate.stations[0] : (prefillCandidate.stationName || ""),
                skillLevel: prefillCandidate.skillLevel || "",
                company: "Ministry of Water, Sanitation and Irrigation",
                dateOfBirth: "",
                hireDate: new Date().toISOString().slice(0,10),
                salary: typeof prefillCandidate.grossSalary !== 'undefined' ? prefillCandidate.grossSalary : undefined,
                status: 'active'
              }}
              onSave={handleCreateEmployeeSave}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Recruitment;
