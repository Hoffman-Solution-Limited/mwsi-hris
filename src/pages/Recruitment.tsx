import React, { useState } from "react";
import { mockShortlistedCandidates, mockHiredCandidates, mockPositions } from "@/data/mockData";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { EmployeeForm } from "@/components/EmployeeForm";
import { useEmployees } from "@/contexts/EmployeesContext";
import { useAuth } from "@/contexts/AuthContext";

const Recruitment: React.FC = () => {
  const [activeTab, setActiveTab] = useState("positions");
  const [showJobDialog, setShowJobDialog] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const { addEmployee } = useEmployees();
  const { user } = useAuth();
  const [jobForm, setJobForm] = useState({
    title: "",
    department: "",
    priority: "medium",
    status: "open",
    description: "",
    postedDate: "",
    closingDate: "",
    applicants: 0,
  });
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [shortlistDialogOpen, setShortlistDialogOpen] = useState(false);
  const [shortlistJob, setShortlistJob] = useState(null);
  const [candidateForm, setCandidateForm] = useState({ name: "", cv: null });
  const [closeJobDialogOpen, setCloseJobDialogOpen] = useState(false);
  const [jobToClose, setJobToClose] = useState(null);
  const [confirmCandidate, setConfirmCandidate] = useState(null);
  const [confirmAction, setConfirmAction] = useState("");
  const [confirmReason, setConfirmReason] = useState("");
  const [shortlistedCandidates, setShortlistedCandidates] = useState(
    Object.values(mockShortlistedCandidates).flat()
  );
  const [hiredCandidates, setHiredCandidates] = useState(mockHiredCandidates);

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
      emergencyContact: data.emergencyContact,
      salary: data.salary,
      documents: [],
      skills: [],
      gender: data.gender,
      cadre: data.cadre,
      employmentType: data.employmentType,
      engagementType: data.employmentType,
      jobGroup: data.jobGroup,
      ethnicity: data.ethnicity,
      staffNumber: data.staffNumber,
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
    setShowJobDialog(false);
    setEditingJob(null);
    setJobForm({
      title: "",
      department: "",
      priority: "medium",
      status: "open",
      description: "",
      postedDate: "",
      closingDate: "",
      applicants: 0,
    });
  };
  const handleSelect = (candidate) => {
    setConfirmCandidate(candidate);
    setConfirmAction("select");
    setConfirmDialogOpen(true);
  };
  const handleDecline = (candidate) => {
    setConfirmCandidate(candidate);
    setConfirmAction("decline");
    setConfirmDialogOpen(true);
  };
  const handleDownloadCV = (cv) => {
    alert(`Downloading CV: ${cv.name}`);
  };
  const handleConfirm = () => {
    if (confirmAction === "select") {
      setHiredCandidates([...hiredCandidates, confirmCandidate]);
      setShortlistedCandidates(shortlistedCandidates.filter(c => c.id !== confirmCandidate.id));
    } else if (confirmAction === "decline") {
      setShortlistedCandidates(shortlistedCandidates.filter(c => c.id !== confirmCandidate.id));
    }
    setConfirmDialogOpen(false);
    setConfirmCandidate(null);
    setConfirmReason("");
    setConfirmAction("");
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Recruitment & Positions</h1>
          <p className="text-muted-foreground">
            Add jobs manually, shortlist candidates, and onboard.
          </p>
        </div>
        <Button
          className="ml-4"
          onClick={() => {
            setEditingJob(null);
            setJobForm({
              title: "",
              department: "",
              priority: "medium",
              status: "open",
              description: "",
              postedDate: "",
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
            <Input
              placeholder="Title"
              value={jobForm.title}
              onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })}
              required
            />
            <Input
              placeholder="Department"
              value={jobForm.department}
              onChange={(e) => setJobForm({ ...jobForm, department: e.target.value })}
              required
            />
            <Textarea
              placeholder="Description"
              value={jobForm.description}
              onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })}
              required
            />
            <Input
              type="date"
              placeholder="Posted Date"
              value={jobForm.postedDate}
              onChange={(e) => setJobForm({ ...jobForm, postedDate: e.target.value })}
              required
            />
            <Input
              type="date"
              placeholder="Closing Date"
              value={jobForm.closingDate}
              onChange={(e) => setJobForm({ ...jobForm, closingDate: e.target.value })}
              required
            />
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
          <TabsTrigger
            value="shortlist"
            className={`flex-1 px-4 py-2 rounded-lg font-semibold text-base transition-all shadow-md
              ${activeTab === "shortlist" ? "bg-gradient-to-r from-green-400 via-green-600 to-lime-500 text-white" : "bg-gray-100 hover:bg-gradient-to-r hover:from-green-400 hover:via-green-600 hover:to-lime-500 hover:text-white"}`}
          >
            Shortlisted Candidates
          </TabsTrigger>
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
            {mockPositions.filter(pos => pos.status === "open").length === 0 ? (
              <p className="text-muted-foreground">No open positions available.</p>
            ) : (
              mockPositions.filter(pos => pos.status === "open").map((job) => (
                <Card key={job.id} className="border-l-8 border-primary shadow-md">
                  <CardContent className="flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-bold text-lg text-primary mb-1">{job.title}</p>
                        <p className="text-sm text-muted-foreground">{job.department} &bull; Priority: <span className="font-semibold">{job.priority}</span></p>
                        <p className="text-xs text-gray-500">Posted: {job.postedDate} &bull; Closes: {job.closingDate}</p>
                        <div className="mt-2 text-gray-700">
                          <div dangerouslySetInnerHTML={{ __html: job.description }} />
                        </div>
                      </div>
                      <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 font-semibold text-xs">{job.status}</span>
                    </div>
                    <div className="flex gap-2 justify-end mt-2">
                      <Button size="sm" variant="default" onClick={() => { setShortlistDialogOpen(true); setShortlistJob(job); }}>
                        Shortlist
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => { setEditingJob(job); setShowJobDialog(true); }}>
                        Edit
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => { setJobToClose(job); setCloseJobDialogOpen(true); }}>
                        Close
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
          {/* Shortlist Candidate Dialog */}
          <Dialog open={shortlistDialogOpen} onOpenChange={setShortlistDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Shortlist Candidate for {shortlistJob?.title}</DialogTitle>
              </DialogHeader>
              <form
                className="space-y-3"
                onSubmit={e => {
                  e.preventDefault();
                  // Add logic to save candidate to shortlist
                  alert(`Shortlisted ${candidateForm.name} for ${shortlistJob?.title}`);
                  setCandidateForm({ name: "", cv: null });
                  setShortlistDialogOpen(false);
                }}
              >
                <Input
                  placeholder="Full Name"
                  value={candidateForm.name}
                  onChange={e => setCandidateForm({ ...candidateForm, name: e.target.value })}
                  required
                />
                <label className="block text-sm font-medium">Attach CV Document</label>
                <Input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={e => setCandidateForm({ ...candidateForm, cv: e.target.files[0] })}
                  required
                />
                <Button type="submit" className="w-full">Add Candidate</Button>
              </form>
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
                <Button variant="destructive" onClick={() => { setCloseJobDialogOpen(false); setJobToClose(null); }}>Confirm Close</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>
        <TabsContent value="shortlist">
          <div className="grid gap-6">
            {shortlistedCandidates.length === 0 ? (
              <p className="text-muted-foreground">No shortlisted candidates.</p>
            ) : (
              // Group by position
              Object.entries(shortlistedCandidates.reduce((acc: any, c: any) => {
                acc[c.position] = acc[c.position] || [];
                acc[c.position].push(c);
                return acc;
              }, {})).map(([position, list]: any) => (
                <div key={position} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">{position}</h3>
                    <span className="text-sm text-muted-foreground">{list.length} shortlisted</span>
                  </div>
                  {list.map((candidate: any) => (
                    <Card key={candidate.id}>
                      <CardContent className="flex flex-col gap-2">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-semibold">{candidate.name}</p>
                            <p className="text-sm text-muted-foreground">{candidate.position}</p>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="default" onClick={() => handleSelect(candidate)}>Select</Button>
                            <Button size="sm" variant="destructive" onClick={() => handleDecline(candidate)}>Decline</Button>
                            <Button size="sm" variant="secondary" onClick={() => handleDownloadCV(candidate.cv)}>Download CV</Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ))
            )}
          </div>
        </TabsContent>
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
                      <p className="text-sm text-muted-foreground">{candidate.position}</p>
                    </div>
                    {canCreateEmployee && (
                      <Button size="sm" onClick={() => openCreateEmployee(candidate)}>Create Employee</Button>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{confirmAction === 'select' ? 'Confirm Selection' : 'Confirm Decline'}</DialogTitle>
          </DialogHeader>
          <div className="mb-3">
            <p className="mb-2">Candidate: <span className="font-semibold">{confirmCandidate?.name}</span></p>
            <p className="mb-2">Position: <span className="font-semibold">{confirmCandidate?.position}</span></p>
            <label className="block text-sm font-medium mb-1">Reason for {confirmAction === 'select' ? 'hiring' : 'declining'}:</label>
            <Textarea
              value={confirmReason}
              onChange={e => setConfirmReason(e.target.value)}
              placeholder={confirmAction === 'select' ? 'Why was this candidate hired?' : 'Why was this candidate declined?'}
              required
              className="mb-2"
            />
          </div>
          <DialogFooter className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setConfirmDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleConfirm} disabled={!confirmReason.trim()}>{confirmAction === 'select' ? 'Confirm Hire' : 'Confirm Decline'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
                email: "",
                phone: "",
                position: prefillCandidate.position || "",
                department: "",
                cadre: undefined as any,
                gender: undefined,
                employmentType: "Permanent",
                jobGroup: undefined as any,
                ethnicity: undefined as any,
                staffNumber: "",
                nationalId: "",
                kraPin: "",
                children: "",
                workCounty: "",
                homeCounty: "",
                postalAddress: "",
                postalCode: "",
                stationName: "",
                skillLevel: "",
                company: "Ministry of Water, Sanitation and Irrigation",
                dateOfBirth: "",
                hireDate: new Date().toISOString().slice(0,10),
                emergencyContact: "",
                salary: undefined,
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
