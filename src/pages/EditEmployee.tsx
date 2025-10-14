import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmployeeForm } from "@/components/EmployeeForm";
import { useUsers } from '@/contexts/UsersContext';
import { useEmployees } from "@/contexts/EmployeesContext";
import { useAuth } from "@/contexts/AuthContext";
import { usePermissions } from "@/contexts/PermissionsContext";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";

const EditEmployeePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { employees, updateEmployee, loading } = useEmployees();
  const { users } = useUsers();
  const { user } = useAuth();
  const { can } = usePermissions();
  const navigate = useNavigate();

  const employee = employees.find((e) => e.id === id);
  const canEdit = can(user?.role, 'employee.edit');

  // Basic name splitting, assuming "First Middle Last"
  const nameParts = employee?.name?.split(' ') || [];
  const firstName = nameParts[0] || '';
  const surname = nameParts.length > 1 ? nameParts[nameParts.length - 1] : '';
  const middleName = nameParts.slice(1, -1).join(' ');

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        <span className="ml-4">Loading employee data...</span>
      </div>
    );
  }

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
          <CardHeader>
            <CardTitle>Error</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <p>Employee not found.</p>
            <p className="text-sm text-muted-foreground mt-2">The employee with ID "{id}" could not be found. They may have been deleted, or the link may be incorrect.</p>
          </CardContent>
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
            <EmployeeForm
              defaultValues={{
                ...employee,
                firstName: employee.firstName || firstName,
                middleName: employee.middleName || middleName,
                surname: employee.surname || surname,
                name: employee.name,
                email: employee.email,
                phone: employee.phone,
                position: employee.position,
                stationName: employee.stationName || employee.department,
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
                skillLevel: employee.skillLevel,
                company: employee.company,
                dateOfBirth: employee.dateOfBirth,
                hireDate: employee.hireDate,
                emergencyContact: employee.emergencyContact,
                salary: employee.salary,
                status: employee.status,
                employeeNumber: (employee as any).employeeNumber,
                isManager: (employee as any).isManager,
                managerId: (employee as any).managerId || '',
              }}
              mode="edit"
              onSave={(data) => {
                // Resolve manager name and managerId.
                // If a managerId was provided use it. Otherwise try to resolve managerId
                // from a provided manager name/email by looking up in users or employees.
                let managerName: string | undefined = undefined;
                let resolvedManagerId: string | undefined = undefined;

                if ((data as any).managerId) {
                  resolvedManagerId = (data as any).managerId;
                  const m = users.find(u => u.id === resolvedManagerId || u.email === resolvedManagerId);
                  if (m && m.name) managerName = m.name;
                } else if ((data as any).manager) {
                  const managerStr = String((data as any).manager).toLowerCase();
                  // Try to find a matching user by exact email or name
                  const userMatch = users.find(u => (u.email && u.email.toLowerCase() === managerStr) || (u.name && u.name.toLowerCase() === managerStr));
                  if (userMatch) {
                    resolvedManagerId = userMatch.id;
                    managerName = userMatch.name;
                  } else {
                    // Fallback: try to find an employee with that name/email in employees
                    const empMatch = employees.find(e => (e.email && e.email.toLowerCase() === managerStr) || (e.name && e.name.toLowerCase() === managerStr));
                    if (empMatch) {
                      resolvedManagerId = empMatch.id;
                      managerName = empMatch.name;
                    }
                  }
                }
                updateEmployee(employee.id, {
                  ...data,
                  name: data.name,
                  email: data.email,
                  phone: data.phone,
                  position: data.position,
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
                  // Persist managerId and keep manager name for backward compatibility
                  managerId: resolvedManagerId || (data as any).managerId || undefined,
                  manager: managerName || (data as any).manager || undefined,
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
