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
  const { users, updateUser } = useUsers();
  const navigate = useNavigate();

  // Allow admin and HR roles (hr_manager, hr_staff, and legacy 'hr') to add employees
  const canAdd = ["admin", "hr_manager", "hr_staff", "hr"].includes(user?.role || "");

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
                firstName: "",
                middleName: "",
                surname: "",
                email: "",
                phone: "",
                position: "",
                // department removed; use stationName instead
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
                role: 'employee',
                // Next of kin defaults
                nextOfKinName: "",
                nextOfKinRelationship: "",
                nextOfKinPhone: "",
                nextOfKinEmail: "",
                // Special needs defaults
                hasSpecialNeeds: false,
                specialNeedsDescription: "",
              }}
              onSave={async (data) => {
                // Resolve manager name from managerId if provided
                let managerName: string | undefined = undefined;
                if ((data as any).managerId) {
                  const m = users.find(u => u.id === (data as any).managerId || u.email === (data as any).managerId);
                  if (m && m.name) managerName = m.name;
                }
                const created = await addEmployee({
                  id: undefined as any,
                  firstName: data.firstName,
                  middleName: data.middleName,
                  surname: data.surname,
                  name: data.name,
                  email: data.email,
                  position: data.position,
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
                  // Ensure stationName is set from the station selector (form's `department` field)
                  stationName: (data as any).stationName,
                  skillLevel: data.skillLevel,
                  company: data.company,
                  dateOfBirth: data.dateOfBirth,
                  role: (data as any).role,
                  // Next of kin
                  nextOfKinName: (data as any).nextOfKinName,
                  nextOfKinRelationship: (data as any).nextOfKinRelationship,
                  nextOfKinPhone: (data as any).nextOfKinPhone,
                  nextOfKinEmail: (data as any).nextOfKinEmail,
                  // Special needs
                  hasSpecialNeeds: (data as any).hasSpecialNeeds,
                  specialNeedsDescription: (data as any).specialNeedsDescription,
                } as any);
                // If this employee already has a user account, align the user's role
                try {
                  const u = users.find(u => (u.email || '').toLowerCase() === (data.email || '').toLowerCase());
                  if (u && (data as any).role && u.role !== (data as any).role) {
                    updateUser(u.id, { role: (data as any).role });
                  }
                } catch {}
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
