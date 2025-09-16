import React, { useState } from "react";
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

// Mock disciplinary cases data
interface DisciplinaryCase {
  id: number;
  employeeName: string;
  caseType: string;
  status: "open" | "closed" | "pending";
  date: string;
  description: string;
}

const mockCases: DisciplinaryCase[] = [
  {
    id: 1,
    employeeName: "Alice Mwangi",
    caseType: "Absenteeism",
    status: "open",
    date: "2025-07-12",
    description: "Missed work for 3 consecutive days without notice.",
  },
  {
    id: 2,
    employeeName: "John Otieno",
    caseType: "Misconduct",
    status: "pending",
    date: "2025-08-01",
    description: "Unprofessional behavior towards a colleague.",
  },
  {
    id: 3,
    employeeName: "Grace Kamau",
    caseType: "Performance",
    status: "closed",
    date: "2025-06-20",
    description: "Repeatedly failed to meet deadlines.",
  },
];

export const DisciplinaryCases: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [cases, setCases] = useState<DisciplinaryCase[]>(mockCases);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCase, setSelectedCase] = useState<DisciplinaryCase | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [verdictNotes, setVerdictNotes] = useState("");

  // Add new case
  const handleAddCase = (newCase: Omit<DisciplinaryCase, "id">) => {
    const caseWithId = { id: cases.length + 1, ...newCase };
    setCases([...cases, caseWithId]);
  };

  // Complete case handler
  const handleCompleteCase = (caseItem: DisciplinaryCase) => {
    setSelectedCase(caseItem);
    setSelectedStatus(caseItem.status);
    setVerdictNotes("");
    setModalOpen(true);
  };

  const handleModalSubmit = () => {
    if (!selectedCase) return;
    setCases((prev) =>
      prev.map((c) =>
        c.id === selectedCase.id
          ? {
              ...c,
              status: selectedStatus as "open" | "closed" | "pending",
              description:
                selectedStatus === "closed" && verdictNotes
                  ? c.description + " Verdict: " + verdictNotes
                  : c.description,
            }
          : c
      )
    );
    setModalOpen(false);
    setSelectedCase(null);
    setSelectedStatus("");
    setVerdictNotes("");
  };

  const filteredCases = cases.filter(
    (c) =>
      c.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.caseType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.status.toLowerCase().includes(searchQuery.toLowerCase())
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
              Add Case
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>New Disciplinary Case</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              {/* Simple mock form */}
              <Input placeholder="Employee Name" id="employeeName" />
              <Input placeholder="Case Type" id="caseType" />
              <Input placeholder="Status (open/pending/closed)" id="status" />
              <Input placeholder="Date (YYYY-MM-DD)" id="date" />
              <Input placeholder="Description" id="description" />
              <Button
                onClick={() => {
                  const employeeName = (
                    document.getElementById("employeeName") as HTMLInputElement
                  ).value;
                  const caseType = (
                    document.getElementById("caseType") as HTMLInputElement
                  ).value;
                  const status = (
                    document.getElementById("status") as HTMLInputElement
                  ).value as "open" | "closed" | "pending";
                  const date = (
                    document.getElementById("date") as HTMLInputElement
                  ).value;
                  const description = (
                    document.getElementById("description") as HTMLInputElement
                  ).value;

                  handleAddCase({
                    employeeName,
                    caseType,
                    status,
                    date,
                    description,
                  });
                }}
              >
                Save Case
              </Button>
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
              placeholder="Search by employee, case type, or status..."
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
              </tr>
            </thead>
            <tbody>
              {filteredCases.map((c) => (
                <tr key={c.id} className="border-t">
                  <td className="p-3">{c.employeeName}</td>
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
                  <td className="p-3">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCompleteCase(c)}
                      disabled={c.status === "closed"}
                    >
                      Update Case Status
                    </Button>
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
