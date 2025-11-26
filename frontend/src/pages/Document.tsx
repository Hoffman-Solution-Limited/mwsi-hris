import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { toast } from "sonner";
import { mapRole } from "@/lib/roles";

import {
  Card, CardContent, CardHeader, CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";

import { useAuth } from "@/contexts/AuthContext";
import { useSystemCatalog } from '@/contexts/SystemCatalogContext';

import {
  useGetEmployeesQuery,
} from "@/features/employee/employeeApi";

import {
  useGetFileByEmployeeQuery,
} from "@/features/employeeFile/employeeFileApi";

import {
  useApproveFileRequestMutation,
  useGetAllFileRequestsQuery,
  useGetFileMovementsByEmployeeQuery,
  useGetFileRequestsByEmployeeQuery,
  useRejectFileRequestMutation,
  useRequestFileMutation
} from "@/features/fileRequest/fileRequestApi";

// ✅ Validation Schemas
const requestSchema = yup.object({
  remarks: yup.string().required("Remarks are required"),
});

const approveSchema = yup.object({
  toLocation: yup.string().required("Destination location is required"),
  comment: yup.string().required("Comment is required"),
});

const DocumentTrackingPage: React.FC = () => {
  const { user } = useAuth();

  const { data: employees = [] } = useGetEmployeesQuery();
  const { catalogs = {} } = useSystemCatalog();
  const { stations = [], stationNames = [] } = catalogs || {};

  const [employeeFilter, setEmployeeFilter] = useState("");
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
  const [requestModal, setRequestModal] = useState<{ open: boolean; employeeId?: string }>({ open: false });
  const [approveModal, setApproveModal] = useState<{ open: boolean; requestId?: string; employeeId?: string }>({ open: false });

  const { data: allRequests = [] } = useGetAllFileRequestsQuery();
  const [requestFile, { isLoading: requesting }] = useRequestFileMutation();
  const [approveFileRequest, { isLoading: approving }] = useApproveFileRequestMutation();
  const [rejectFileRequest] = useRejectFileRequestMutation();
  const { data: fileRequests = [] } = useGetFileRequestsByEmployeeQuery(selectedEmployeeId!, { skip: !selectedEmployeeId });
  const { data: employeeFile } = useGetFileByEmployeeQuery(selectedEmployeeId!, { skip: !selectedEmployeeId });
  const { data: apiMovements = [] } = useGetFileMovementsByEmployeeQuery(selectedEmployeeId!, { skip: !selectedEmployeeId });

  const selectedEmployee = employees.find((e) => e.id === selectedEmployeeId);
  const currentUserEmployee = employees.find((e) => e.id === user?.id);

  const LOCATIONS = (() => {
    const managerStations = employees
      .filter((e) => /manager/i.test(e.position || ""))
      .map((e) => e.stationName)
      .filter(Boolean);
    return managerStations.length > 0
      ? managerStations
      : stationNames.length > 0
      ? stationNames
      : ["Registry Office"];
  })();

  // ✅ Request File Form
  const {
    register: registerRequest,
    handleSubmit: handleSubmitRequest,
    reset: resetRequest,
    formState: { errors: errorsRequest },
  } = useForm({ resolver: yupResolver(requestSchema) });

  // ✅ Approve Request Form
  const {
    register: registerApprove,
    handleSubmit: handleSubmitApprove,
    reset: resetApprove,
    formState: { errors: errorsApprove },
  } = useForm({ resolver: yupResolver(approveSchema) });

  // Filter employees
  const filteredEmployees = employeeFilter.trim()
    ? employees.filter(
        (e) =>
          e.id.toLowerCase().includes(employeeFilter.toLowerCase()) ||
          e.name.toLowerCase().includes(employeeFilter.toLowerCase()) ||
          (e.employeeNumber || "").toLowerCase().includes(employeeFilter.toLowerCase())
      )
    : employees;

  // ✅ Request Submission
  const onSubmitRequest = async (data: any) => {
    if (!requestModal.employeeId || !employeeFile) return;
    const document_type_ids = (employeeFile.documents || [])
      .map((doc) => doc.document_type_id)
      .filter(Boolean);

    if (document_type_ids.length === 0) {
      toast.error("This employee file has no documents to request.");
      return;
    }

    try {
      await requestFile({
        employee_id: employeeFile.employee_id,
        file_id: employeeFile.id,
        requested_by_user_id: user?.id || "",
        requested_by_name: user?.name || "",
        document_type_ids,
        requested_by_department: currentUserEmployee?.department || "",
        remarks: data.remarks,
      }).unwrap();

      toast.success("File request submitted");
      setRequestModal({ open: false });
      resetRequest();
    } catch {
      toast.error("Failed to request file");
    }
  };

  // ✅ Approve Submission
  const onSubmitApprove = async (data: any) => {
    if (!approveModal.requestId) return;
    try {
      await approveFileRequest({
        requestId: approveModal.requestId,
        toLocation: data.toLocation,
        comment: data.comment,
      }).unwrap();
      toast.success("File request approved");
      setApproveModal({ open: false });
      resetApprove();
    } catch {
      toast.error("Failed to approve request");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Employee File Tracking</h1>
          <p className="text-muted-foreground">Track physical employee files and movement history.</p>
        </div>
      </div>

      {/* FIXED FLEX LAYOUT */}
      <div className="flex flex-col md:flex-row gap-4 items-start">
        {/* EMPLOYEE LIST - FIXED WIDTH */}
        <div className="min-w-[300px] max-w-[320px] flex-shrink-0">
          <Card>
            <CardHeader><CardTitle>Find Employee</CardTitle></CardHeader>
            <CardContent>
              <Input
                placeholder="Search by ID, Name, or Employee No"
                value={employeeFilter}
                onChange={(e) => setEmployeeFilter(e.target.value)}
              />
              <div className="mt-4 space-y-2 max-h-[400px] overflow-auto">
                {filteredEmployees.map((emp) => (
                  <div
                    key={emp.id}
                    className={`p-2 border rounded cursor-pointer ${
                      emp.id === selectedEmployeeId
                        ? "bg-primary/10 border-primary"
                        : "hover:bg-muted"
                    }`}
                    onClick={() => setSelectedEmployeeId(emp.id)}
                  >
                    <div className="font-medium">{emp.name}</div>
                    <div className="text-xs text-muted-foreground">
                      ID: {emp.id} • Employee No: {emp.employeeNumber}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* MAIN FILE DETAILS - EXPANDS */}
        <div className="flex-1 w-full">
          {!selectedEmployeeId ? (
            <Card>
              <CardContent className="text-center p-8 text-muted-foreground">
                Select an employee to view details.
              </CardContent>
            </Card>
          ) : (
            <Tabs defaultValue="file">
              <TabsList className="grid grid-cols-2 w-full">
                <TabsTrigger value="file">Employee File</TabsTrigger>
                <TabsTrigger value="requests">Requests</TabsTrigger>
              </TabsList>

              {/* FILE TAB */}
              <TabsContent value="file">
                <Card>
                  <CardHeader>
                    <CardTitle>
                      Employee File: {selectedEmployee?.employeeNumber || selectedEmployeeId}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {employeeFile ? (
                      <div className="space-y-4">
                        {/* Current Location */}
                        <div className="p-3 border rounded flex justify-between">
                          <div>
                            <div className="font-medium">
                              Current Location: {employeeFile.current_location}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {employeeFile.assigned_user_name || "Registry"}
                            </div>
                          </div>
                          {user && ["hr", "manager"].includes(mapRole(user.role)) && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setRequestModal({ open: true, employeeId: employeeFile.employee_id })}
                            >
                              Request File
                            </Button>
                          )}
                        </div>

                        {/* Documents */}
                        <div className="p-3 border rounded">
                          <div className="text-sm font-medium mb-1">Default Documents</div>
                          <ul className="list-disc list-inside text-sm text-muted-foreground">
                            {(employeeFile.documents || []).map((d) => (
                              <li key={d.id}>
                                {`${employeeFile.file_number}_${d.document_name}`}
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Movements */}
                        <div className="p-3 border rounded">
                          <div className="text-sm font-medium mb-1">Movement History</div>
                          <ul className="text-xs text-muted-foreground space-y-1">
                            {apiMovements?.movements?.map((m) => (
                              <li key={m.id}>
                                {new Date(m.timestamp || "").toLocaleString()}: {m.by_user_name} moved from {m.from_location} to {m.to_location}
                                {m.to_assignee_name ? ` • New Holder: ${m.to_assignee_name}` : ""}
                                {m.remarks ? ` • Remarks: ${m.remarks}` : ""}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ) : (
                      <div className="text-sm text-muted-foreground">No file found.</div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* REQUEST TAB */}
              <TabsContent value="requests">
                <Card>
                  <CardHeader><CardTitle>File Requests</CardTitle></CardHeader>
                  <CardContent>
                    {fileRequests.length === 0
                      ? <p className="text-sm text-muted-foreground">No requests.</p>
                      : fileRequests.map((r) => (
                        <div key={r.id} className="p-2 border rounded mb-2">
                          <div className="font-medium">Requested by: {r.requested_by_name}</div>
                          <div className="text-xs text-muted-foreground">{r.remarks}</div>
                          <div className="flex justify-end mt-2 gap-2">
                            {user?.role === "admin" && (
                              <>
                                <Button
                                  size="sm"
                                  onClick={() => setApproveModal({ open: true, requestId: r.id, employeeId: r.employee_id })}
                                >
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => rejectFileRequest({ requestId: r.id, remarks: "Rejected" })}
                                >
                                  Reject
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </div>

      {/* ✅ Request Dialog */}
      <Dialog open={requestModal.open} onOpenChange={(o) => setRequestModal({ open: o })}>
        <DialogContent>
          <form onSubmit={handleSubmitRequest(onSubmitRequest)}>
            <DialogHeader>
              <DialogTitle>Request Employee File</DialogTitle>
              <DialogDescription>Submit a request to retrieve the file.</DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <Textarea rows={3} placeholder="Remarks" {...registerRequest("remarks")} />
              {errorsRequest.remarks && (
                <p className="text-red-500 text-sm">{errorsRequest.remarks.message}</p>
              )}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setRequestModal({ open: false })}>
                Cancel
              </Button>
              <Button type="submit" disabled={requesting}>
                {requesting ? "Submitting..." : "Submit Request"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ✅ Approve Dialog */}
      <Dialog open={approveModal.open} onOpenChange={(o) => setApproveModal({ open: o })}>
        <DialogContent>
          <form onSubmit={handleSubmitApprove(onSubmitApprove)}>
            <DialogHeader>
              <DialogTitle>Approve File Request</DialogTitle>
              <DialogDescription>Confirm destination and remarks.</DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <Select {...registerApprove("toLocation")}>
                <SelectTrigger><SelectValue placeholder="Select location" /></SelectTrigger>
                <SelectContent>
                  {LOCATIONS.map((loc) => (
                    <SelectItem key={loc} value={loc}>
                      {loc}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errorsApprove.toLocation && (
                <p className="text-red-500 text-sm">{errorsApprove.toLocation.message}</p>
              )}
              <Textarea rows={3} placeholder="Comment" {...registerApprove("comment")} />
              {errorsApprove.comment && (
                <p className="text-red-500 text-sm">{errorsApprove.comment.message}</p>
              )}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setApproveModal({ open: false })}>
                Cancel
              </Button>
              <Button type="submit" disabled={approving}>
                {approving ? "Approving..." : "Approve"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DocumentTrackingPage;
