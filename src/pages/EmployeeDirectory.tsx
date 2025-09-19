import React, { useState } from "react"
import { Search, Plus, Download, Grid, List } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useEmployees } from "@/contexts/EmployeesContext"
import { useAuth } from "@/contexts/AuthContext"
import { useNavigate } from "react-router-dom"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { EmployeeForm } from "@/components/EmployeeForm"

export const EmployeeDirectory: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("")
  const [departmentFilter, setDepartmentFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const navigate = useNavigate()
  const { employees, addEmployee } = useEmployees()

  // Get logged-in user (manager) from context
  // Use useAuth hook for consistent logic
  const { user } = useAuth();

  // Scope employees by role (manager sees only direct reports; others see all)
  const baseEmployees = user?.role === 'manager'
    ? employees.filter(e => e.manager === user.name)
    : employees;

  // Unique departments based on scoped employees
  const departments = [...new Set(baseEmployees.map((emp) => emp.department))]

  // Filter employees within scoped set
  const filteredEmployees = baseEmployees.filter((employee) => {
    const matchesSearch =
      employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.department.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesDepartment =
      departmentFilter === "all" || employee.department === departmentFilter
    const matchesStatus =
      statusFilter === "all" || employee.status === statusFilter

    return matchesSearch && matchesDepartment && matchesStatus
  })

  const handleEmployeeClick = (employeeId: string) => {
    navigate(`/employees/${employeeId}`)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold mb-2">Employee Directory</h1>
          <p className="text-muted-foreground">
            Manage and view all employee information and profiles
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>

          {/* Add Employee Modal */}
          <Dialog>
            <DialogTrigger asChild>
             {["admin", "hr_manager"].includes(user?.role) && ( 
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Employee
              </Button>)}
            </DialogTrigger>
            <DialogContent className="sm:max-w-4xl">
              <DialogHeader>
                <DialogTitle>Add New Employee</DialogTitle>
              </DialogHeader>
              <EmployeeForm
                defaultValues={{
                  name: "",
                  email: "",
                  phone: "",
                  position: "",
                  department: "",
                  gender: undefined,
                  employmentType: "Permanent",
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
                  hireDate: "",
                  emergencyContact: "",
                  salary: undefined,
                  status: "active"
                }}
                onSave={(data) => {
                  addEmployee({
                    id: undefined as any, // will be generated in context
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
                    employmentType: data.employmentType,
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
                  } as any)
                  alert(`Employee ${data.name} saved!`)
                }}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search employees by name, email, position, or department..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex gap-2">
              {["admin", "hr_manager"].includes(user?.role) && (
              <Select
                value={departmentFilter}
                onValueChange={setDepartmentFilter}
              >
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="All Departments" />
                </SelectTrigger>
                
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select> )}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="terminated">Terminated</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex border rounded-md">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className="rounded-r-none"
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className="rounded-l-none"
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
          </div>
         
        </CardContent>
      </Card>

      {/* Results Summary */}
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          Showing {filteredEmployees.length} of {baseEmployees.length} employees
        </p>
      </div>

      {/* Employee Grid/List */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredEmployees.map((employee) => (
            <Card
              key={employee.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => handleEmployeeClick(employee.id)}
            >
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center">
                  <Avatar className="w-16 h-16 mb-4">
                    <AvatarImage src={employee.avatar} />
                    <AvatarFallback className="text-lg font-semibold">
                      {employee.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="font-semibold text-lg mb-1">
                    {employee.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-1">
                    {employee.position}
                  </p>
                  <p className="text-xs text-muted-foreground mb-3">
                    {employee.department}
                  </p>
                  <Badge
                    variant={
                      employee.status === "active" ? "default" : "secondary"
                    }
                    className="mb-3"
                  >
                    {employee.status}
                  </Badge>
                  <div className="w-full text-xs text-muted-foreground space-y-1">
                    <p>📧 {employee.email}</p>
                    {employee.phone && <p>📞 {employee.phone}</p>}
                    <p>
                      📅 Joined{" "}
                      {new Date(employee.hireDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Employee List</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Position</th>
                    <th>Department</th>
                    <th>Status</th>
                    <th>Hire Date</th>
                    <th>Contact</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEmployees.map((employee) => (
                    <tr
                      key={employee.id}
                      className="cursor-pointer"
                      onClick={() => handleEmployeeClick(employee.id)}
                    >
                      <td>
                        <div className="flex items-center gap-3">
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={employee.avatar} />
                            <AvatarFallback>
                              {employee.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{employee.name}</p>
                            <p className="text-xs text-muted-foreground">
                              ID: {employee.id}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <p className="font-medium">{employee.position}</p>
                        {employee.manager && (
                          <p className="text-xs text-muted-foreground">
                            Reports to: {employee.manager}
                          </p>
                        )}
                      </td>
                      <td>{employee.department}</td>
                      <td>
                        <Badge
                          variant={
                            employee.status === "active"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {employee.status}
                        </Badge>
                      </td>
                      <td>{new Date(employee.hireDate).toLocaleDateString()}</td>
                      <td>
                        <div className="text-sm">
                          <p>{employee.email}</p>
                          {employee.phone && (
                            <p className="text-muted-foreground">
                              {employee.phone}
                            </p>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
