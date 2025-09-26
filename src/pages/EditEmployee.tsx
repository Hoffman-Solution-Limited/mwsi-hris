import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EditProfileForm } from "@/components/EditProfileForm";
import { useEmployees } from "@/contexts/EmployeesContext";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const EditEmployeePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { employees, updateEmployee } = useEmployees();
  const { user } = useAuth();
  const navigate = useNavigate();

  const employee = employees.find((e) => e.id === id);
  const canEdit = ["hr_manager", "hr_staff"].includes(user?.role || "");

  if (!employee) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>
        <Card>
          <CardContent className="p-6">Employee not found.</CardContent>
        </Card>
      </div>
    );
  }

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
          <CardTitle>Edit Employee Profile</CardTitle>
        </CardHeader>
        <CardContent>
          {!canEdit ? (
            <div className="text-sm text-muted-foreground">
              You do not have permission to edit employees.
            </div>
          ) : (
            <EditProfileForm
              defaultValues={{
                name: employee.name,
                email: employee.email,
                phone: employee.phone,
                position: employee.position,
                department: employee.department,
                gender: employee.gender,
                cadre: employee.cadre as any,
                employmentType: employee.employmentType,
                jobGroup: (employee as any).jobGroup,
                ethnicity: (employee as any).ethnicity,
                nationalId: employee.nationalId,
                kraPin: employee.kraPin,
                children: employee.children,
                workCounty: employee.workCounty,
                homeCounty: employee.homeCounty,
                postalAddress: employee.postalAddress,
                postalCode: employee.postalCode,
                stationName: employee.stationName,
                skillLevel: employee.skillLevel,
                company: employee.company,
                dateOfBirth: employee.dateOfBirth,
                hireDate: employee.hireDate,
                emergencyContact: employee.emergencyContact,
                salary: employee.salary,
                status: employee.status,
                employeeNumber: (employee as any).employeeNumber,
              }}
              onSave={(data) => {
                updateEmployee(employee.id, {
                  name: data.name,
                  email: data.email,
                  phone: data.phone,
                  position: data.position,
                  department: data.department,
                  gender: data.gender,
                  cadre: data.cadre as any,
                  employmentType: data.employmentType,
                  engagementType: data.employmentType,
                  jobGroup: (data as any).jobGroup,
                  ethnicity: (data as any).ethnicity,
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
                  hireDate: data.hireDate,
                  emergencyContact: data.emergencyContact,
                  salary: data.salary,
                  status: data.status,
                });
                navigate(`/employees/${employee.id}`);
              }}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EditEmployeePage;
