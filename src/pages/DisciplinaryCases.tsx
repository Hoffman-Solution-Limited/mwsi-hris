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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

import { useEmployees } from "@/contexts/EmployeesContext";
import { DisciplinaryCaseMock } from '@/types/models';

// Local disciplinary cases type (seeded empty - add via UI)
type DisciplinaryCase = DisciplinaryCaseMock;
const mockCases: DisciplinaryCase[] = [];

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
    employeeNumber: string; // user-visible employee number used for lookup
    employeeName: string;
    caseType: string;
    status: "open" | "closed" | "pending";
    date: string;
    description: string;
  }>({ employeeNumber: "", employeeName: "", caseType: "", status: "open", date: "", description: "" });

  // Resolve employee name when employeeId is entered
  const resolvedEmployeeName = useMemo(() => {
    // resolve by employeeNumber (human-facing) instead of internal id
    const e = employees.find(emp => ((emp as any)?.employeeNumber || "").toString() === newCase.employeeNumber.trim());
    return e?.name || "";
  }, [employees, newCase.employeeNumber]);

  // Add new case (mapped to employee by ID)
  const handleAddCase = () => {
    // Lookup by employeeNumber and use the internal employee.id when creating the case
    const employee = employees.find(e => ((e as any)?.employeeNumber || "").toString() === newCase.employeeNumber.trim());
    if (!employee) {
      alert("Employee number not found. Please enter a valid Employee Number.");
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
    setNewCase({ employeeNumber: "", employeeName: "", caseType: "", status: "open", date: "", description: "" });
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
              <label className="block font-medium">Employee Number</label>
              <Input
                placeholder="Employee Number"
                value={newCase.employeeNumber}
                onChange={(e) => setNewCase((s) => ({ ...s, employeeNumber: e.target.value }))}
              />
                            <label className="block font-medium">Employee Name</label>

              <Input
                placeholder="Employee Name"
                value={resolvedEmployeeName}
                readOnly
              />
                            <label className="block font-medium">Case Type</label>

              <Input
                placeholder="Case Type"
                value={newCase.caseType}
                onChange={(e) => setNewCase((s) => ({ ...s, caseType: e.target.value }))}
              />
                            <label className="block font-medium">Status</label>

              <select
                className="w-full border rounded p-2"
                value={newCase.status}
                onChange={(e) => setNewCase((s) => ({ ...s, status: e.target.value as any }))}
              >
                <option value="open">Open</option>
                <option value="pending">Pending</option>
                <option value="closed">Closed</option>
              </select>
                            <label className="block font-medium">Date</label>

              <Popover>
                <PopoverTrigger asChild>
                  <Input
                    placeholder="Date (YYYY-MM-DD)"
                    value={newCase.date}
                    readOnly
                    className="cursor-pointer"
                  />
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={newCase.date ? new Date(newCase.date) : undefined}
                    onSelect={(d) => {
                      if (d instanceof Date && !isNaN(d.getTime())) {
                        const iso = d.toISOString().slice(0, 10);
                        setNewCase((s) => ({ ...s, date: iso }));
                      }
                    }}
                  />
                </PopoverContent>
              </Popover>
                            <label className="block font-medium">Description</label>

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
                <th className="text-left p-3">Case History</th>

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
                  </td>
                  <td className="p-3">{c.updates && c.updates.length > 0 && (
                      <UpdateHistoryButton updates={c.updates} />
                    )}</td>
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

// Component to view all status updates in chronological order
const UpdateHistoryButton: React.FC<{ updates: { timestamp: string; text: string }[] }> = ({ updates }) => {
  const [open, setOpen] = useState(false);
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="ghost">
          View History ({updates.length})
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Status Update History</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {updates.map((update, idx) => {
            const dt = new Date(update.timestamp);
            const formatted = isNaN(dt.getTime()) ? update.timestamp : dt.toLocaleString();
            return (
              <div key={idx} className="border-l-2 border-primary pl-4 pb-4 relative">
                <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-primary" />
                <div className="text-xs text-muted-foreground mb-1">{formatted}</div>
                <div className="text-sm whitespace-pre-wrap bg-muted p-3 rounded-md">{update.text}</div>
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
};


