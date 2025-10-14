import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmployeeForm } from "@/components/EmployeeForm";
import { useEmployees } from "@/contexts/EmployeesContext";
import { useAuth } from "@/contexts/AuthContext";
import { useUsers } from "@/contexts/UsersContext";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const AddEmployeePage: React.FC = () => {
  const { addEmployee } = useEmployees();
  const { user } = useAuth();
  const { users } = useUsers();
  const navigate = useNavigate();

  const canAdd = ["admin", "hr_manager"].includes(user?.role || "");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add New Employee</CardTitle>
        </CardHeader>
        <CardContent>
          {!canAdd ? (
            <div className="text-sm text-muted-foreground">
              You do not have permission to add employees.
            </div>
          ) : (
            <EmployeeForm
              defaultValues={{
                name: "",
                email: "",
                phone: "",
                position: "",
                department: "",
                cadre: undefined as any,
                gender: undefined,
                employmentType: "Permanent",
                jobGroup: undefined as any,
                ethnicity: undefined as any,
                employeeNumber: "",
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
                hireDate: "",
                emergencyContact: "",
                salary: undefined,
                status: "active",
              }}
              onSave={(data) => {
                // Resolve manager name from managerId if provided
                let managerName: string | undefined = undefined;
                if ((data as any).managerId) {
                  const m = users.find(u => u.id === (data as any).managerId || u.email === (data as any).managerId);
                  if (m && m.name) managerName = m.name;
                }
                addEmployee({
                  id: undefined as any,
                  name: data.name,
                  email: data.email,
                  position: data.position,
                  department: data.department,
                  manager: managerName,
                  managerId: (data as any).managerId || undefined,
                  hireDate: data.hireDate || new Date().toISOString().slice(0, 10),
                  status: (data.status as any) || "active",
                  avatar: "",
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
                  employeeNumber: (data as any).employeeNumber,
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
                navigate("/employees");
              }}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AddEmployeePage;
