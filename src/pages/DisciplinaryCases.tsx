import React, { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useEmployees } from "@/contexts/EmployeesContext";

// Mock disciplinary cases data
interface DisciplinaryCase {
  id: number;
  employeeId: string; // mapped to EmployeesContext
  employeeName: string; // denormalized for quick display
  caseType: string;
  status: "open" | "closed" | "pending";
  date: string;
  description: string;
  verdict?: string; // set when status becomes closed
  updates?: { timestamp: string; text: string }[]; // chronological log of status update comments
}

const mockCases: DisciplinaryCase[] = [
  {
    id: 1,
    employeeId: "1",
    employeeName: "John Smith",
    caseType: "Absenteeism",
    status: "open",
    date: "2025-07-12",
    description: "Missed work for 3 consecutive days without notice.",
    updates: [
      { timestamp: "2025-07-13T10:15:00Z", text: "HR reached out to employee for explanation." }
    ]
  },
  {
    id: 2,
    employeeId: "3",
    employeeName: "Michael Davis",
    caseType: "Misconduct",
    status: "pending",
    date: "2025-08-01",
    description: "Unprofessional behavior towards a colleague.",
    updates: [
      { timestamp: "2025-08-03T09:00:00Z", text: "Waiting disciplinary committee update." }
    ]
  },
  {
    id: 3,
    employeeId: "4",
    employeeName: "Emily Chen",
    caseType: "Performance",
    status: "closed",
    date: "2025-06-20",
    description: "Repeatedly failed to meet deadlines.",
    verdict: "Final warning issued; performance improvement plan for 60 days.",
    updates: [
      { timestamp: "2025-06-15T14:30:00Z", text: "Final meeting held with the employee and manager." },
      { timestamp: "2025-06-20T16:00:00Z", text: "Case closed with final warning issued." }
    ]
  },
];

export const DisciplinaryCases: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [cases, setCases] = useState<DisciplinaryCase[]>(mockCases);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCase, setSelectedCase] = useState<DisciplinaryCase | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [verdictNotes, setVerdictNotes] = useState("");
  const [statusUpdateNotes, setStatusUpdateNotes] = useState("");
  const { employees } = useEmployees();

  // Add Case form state (controlled)
  const [newCase, setNewCase] = useState<{
    employeeId: string;
    employeeName: string;
    caseType: string;
    status: "open" | "closed" | "pending";
    date: string;
    description: string;
  }>({ employeeId: "", employeeName: "", caseType: "", status: "open", date: "", description: "" });

  // Resolve employee name when employeeId is entered
  const resolvedEmployeeName = useMemo(() => {
    const e = employees.find(emp => emp.id === newCase.employeeId.trim());
    return e?.name || "";
  }, [employees, newCase.employeeId]);

  // Add new case (mapped to employee by ID)
  const handleAddCase = () => {
    const employee = employees.find(e => e.id === newCase.employeeId.trim());
    if (!employee) {
      alert("Employee ID not found. Please enter a valid Employee ID.");
      return;
    }
    const caseWithId: DisciplinaryCase = {
      id: cases.length + 1,
      employeeId: employee.id,
      employeeName: employee.name,
      caseType: newCase.caseType,
      status: newCase.status,
      date: newCase.date,
      description: newCase.description,
    };
    setCases(prev => [...prev, caseWithId]);
    setNewCase({ employeeId: "", employeeName: "", caseType: "", status: "open", date: "", description: "" });
  };

  // Complete case handler
  const handleCompleteCase = (caseItem: DisciplinaryCase) => {
    setSelectedCase(caseItem);
    setSelectedStatus(caseItem.status);
    setVerdictNotes("");
    setStatusUpdateNotes("");
    setModalOpen(true);
  };

  const handleModalSubmit = () => {
    if (!selectedCase) return;
    const now = new Date().toISOString();
    setCases((prev) =>
      prev.map((c) => {
        if (c.id !== selectedCase.id) return c;
        const next: DisciplinaryCase = {
          ...c,
          status: selectedStatus as "open" | "closed" | "pending",
          verdict: selectedStatus === "closed" ? (verdictNotes || c.verdict) : c.verdict,
          updates: [...(c.updates || [])]
        };
        const trimmed = statusUpdateNotes.trim();
        if (trimmed) {
          next.updates!.push({ timestamp: now, text: trimmed });
        }
        return next;
      })
    );
    setModalOpen(false);
    setSelectedCase(null);
    setSelectedStatus("");
    setVerdictNotes("");
    setStatusUpdateNotes("");
  };

  const filteredCases = cases.filter(
    (c) => {
      const q = searchQuery.toLowerCase();
      return (
        c.employeeName.toLowerCase().includes(q) ||
        c.employeeId.toLowerCase().includes(q) ||
        c.caseType.toLowerCase().includes(q) ||
        c.status.toLowerCase().includes(q)
      );
    }
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold mb-2">Disciplinary Cases</h1>
          <p className="text-muted-foreground">
            Track and manage all employee disciplinary cases
          </p>
        </div>

        {/* Add Case Dialog */}
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add A New Case
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>New Disciplinary Case</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <Input
                placeholder="Employee ID"
                value={newCase.employeeId}
                onChange={(e) => setNewCase((s) => ({ ...s, employeeId: e.target.value }))}
              />
              <Input
                placeholder="Employee Name"
                value={resolvedEmployeeName}
                readOnly
              />
              <Input
                placeholder="Case Type"
                value={newCase.caseType}
                onChange={(e) => setNewCase((s) => ({ ...s, caseType: e.target.value }))}
              />
              <select
                className="w-full border rounded p-2"
                value={newCase.status}
                onChange={(e) => setNewCase((s) => ({ ...s, status: e.target.value as any }))}
              >
                <option value="open">Open</option>
                <option value="pending">Pending</option>
                <option value="closed">Closed</option>
              </select>
              <Input
                placeholder="Date (YYYY-MM-DD)"
                value={newCase.date}
                onChange={(e) => setNewCase((s) => ({ ...s, date: e.target.value }))}
              />
              <Input
                placeholder="Description"
                value={newCase.description}
                onChange={(e) => setNewCase((s) => ({ ...s, description: e.target.value }))}
              />
              <Button onClick={handleAddCase}>Save Case</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by employee, ID, case type, or status..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Cases List */}
      <Card>
        <CardHeader>
          <CardTitle>Cases</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-muted">
                <th className="text-left p-3">Employee</th>
                <th className="text-left p-3">Case Type</th>
                <th className="text-left p-3">Status</th>
                <th className="text-left p-3">Date</th>
                <th className="text-left p-3">Description</th>
                <th className="text-left p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCases.map((c) => (
                <tr key={c.id} className="border-t">
                  <td className="p-3">{c.employeeName} <span className="text-xs text-muted-foreground">(ID: {c.employeeId}{(() => {
                    // Best-effort resolve employee number for display
                    try {
                      const emp = employees.find(e => e.id === c.employeeId);
                      const empNo = (emp as any)?.employeeNumber;
                      return empNo ? ` • Employee No: ${empNo}` : '';
                    } catch { return ''; }
                  })()})</span></td>
                  <td className="p-3">{c.caseType}</td>
                  <td className="p-3">
                    <Badge
                      variant={
                        c.status === "open"
                          ? "default"
                          : c.status === "pending"
                          ? "secondary"
                          : "outline"
                      }
                    >
                      {c.status}
                    </Badge>
                  </td>
                  <td className="p-3">{c.date}</td>
                  <td className="p-3">{c.description}</td>
                  <td className="p-3 space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCompleteCase(c)}
                      disabled={c.status === "closed"}
                    >
                      Update Status
                    </Button>
                    {c.updates && c.updates.length > 0 && (
                      <LatestUpdateButton latest={c.updates[c.updates.length - 1]} />
                    )}
                    {c.status === "closed" && c.verdict && (
                      <VerdictButton verdict={c.verdict} />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Complete Case Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Update Case Status</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block mb-1 font-medium">Status</label>
              <select
                className="w-full border rounded p-2"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="open">Open</option>
                <option value="pending">Pending</option>
                <option value="closed">Closed</option>
              </select>
            </div>
            <div>
              <label className="block mb-1 font-medium">Status Update (optional)</label>
              <textarea
                className="w-full border rounded p-2"
                rows={3}
                value={statusUpdateNotes}
                onChange={(e) => setStatusUpdateNotes(e.target.value)}
                placeholder="e.g., Waiting disciplinary committee update"
              />
            </div>
            {selectedStatus === "closed" && (
              <div>
                <label className="block mb-1 font-medium">Verdict Notes</label>
                <textarea
                  className="w-full border rounded p-2"
                  rows={3}
                  value={verdictNotes}
                  onChange={(e) => setVerdictNotes(e.target.value)}
                  placeholder="Enter verdict notes..."
                />
              </div>
            )}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleModalSubmit} disabled={!selectedStatus}>
                Save
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Small inline component to view latest status update in a dialog
const LatestUpdateButton: React.FC<{ latest: { timestamp: string; text: string } }> = ({ latest }) => {
  const [open, setOpen] = useState(false);
  const dt = new Date(latest.timestamp);
  const formatted = isNaN(dt.getTime()) ? latest.timestamp : dt.toLocaleString();
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="ghost">Latest Update</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Latest Update</DialogTitle>
        </DialogHeader>
        <div className="text-sm space-y-2">
          <div className="text-muted-foreground">{formatted}</div>
          <div className="whitespace-pre-wrap">{latest.text}</div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Small inline component to view verdict in a dialog
const VerdictButton: React.FC<{ verdict: string }> = ({ verdict }) => {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="secondary">View Verdict</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Case Verdict</DialogTitle>
        </DialogHeader>
        <div className="text-sm whitespace-pre-wrap">{verdict}</div>
      </DialogContent>
    </Dialog>
  );
};
