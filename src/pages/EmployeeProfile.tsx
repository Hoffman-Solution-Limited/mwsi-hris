import React, { useMemo, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { 
  ArrowLeft, 
  Edit, 
  Download, 
  Upload, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  User,
  FileText,
  TrendingUp,
  GraduationCap,
  Shield
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  mockTrainingRecords,
  mockPerformanceReviews,
  mockLeaveRequests 
} from '@/data/mockData';
import { useAuth } from '@/contexts/AuthContext';
import { usePerformance } from '@/contexts/PerformanceContext';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { EditProfileForm } from "@/components/EditProfileForm"
import { useDocuments } from '@/contexts/DocumentContext';
import { useEmployees } from '@/contexts/EmployeesContext';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export const EmployeeProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { templates } = usePerformance();
  const { updateEmployee } = useEmployees();
  const [activeTab, setActiveTab] = useState('personal');
  const { documents, addDocument, getDocumentUrl } = useDocuments();
  const [docOpen, setDocOpen] = useState(false);
  const [docName, setDocName] = useState('');
  const [docType, setDocType] = useState<'contract' | 'certificate' | 'policy' | 'form' | 'report'>('form');
  const [docCategory, setDocCategory] = useState('General');
  const [docFile, setDocFile] = useState<File | null>(null);

  // For testing, always use Michael Davis (id: '3') as the target employee
    // If on /profile route, show current user's profile
    const isMyProfile = location.pathname === '/profile';
    // For manager, allow viewing/editing their own profile
    const targetEmployeeId = isMyProfile ? user?.id : id;
    const { employees } = useEmployees();
    const employee = employees.find(emp => emp.id === targetEmployeeId);

  // Check if current user can access this profile
  // Managers can view/edit their own profile and direct reports
  const canAccessProfile = isMyProfile || 
    ['admin', 'hr_manager', 'hr_staff'].includes(user?.role || '') ||
    (user?.role === 'manager' && (user?.id === targetEmployeeId || (employee && employee.manager === user?.name)));
  const employeeDocuments = useMemo(() => {
    if (!employee) return [];
    return documents.filter(doc => doc.uploadedBy === employee.name);
  }, [documents, employee]);
    const employeeTrainings = mockTrainingRecords.filter(training => 
      training.employeeId === targetEmployeeId
    );
    const employeeReviews = mockPerformanceReviews.filter(review => 
      review.employeeId === targetEmployeeId
    );
    const employeeLeaves = mockLeaveRequests.filter(leave => 
      leave.employeeId === targetEmployeeId
    );

  if (!canAccessProfile) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
          <p className="text-muted-foreground mb-4">You don't have permission to view this profile.</p>
          <Button onClick={() => navigate('/')}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Employee Not Found</h2>
          <p className="text-muted-foreground mb-4">The requested employee profile could not be found.</p>
          <Button onClick={() => navigate(isMyProfile ? '/' : '/employees')}>
            {isMyProfile ? 'Back to Dashboard' : 'Back to Directory'}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="sm" onClick={() => navigate(isMyProfile ? '/' : '/employees')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          {isMyProfile ? 'Back to Dashboard' : 'Back to Directory'}
        </Button>
      </div>

      {/* Employee Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex flex-col md:flex-row gap-6 flex-1">
              <Avatar className="w-24 h-24 mx-auto md:mx-0">
                <AvatarImage src={employee.avatar} />
                <AvatarFallback className="text-2xl font-bold">
                  {employee.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="text-center md:text-left">
                <h1 className="text-3xl font-bold mb-2">{employee.name}</h1>
                <p className="text-xl text-muted-foreground mb-1">{employee.position}</p>
                <p className="text-muted-foreground mb-4">{employee.department}</p>
                <div className="flex flex-wrap gap-2 justify-center md:justify-start mb-4">
                  <Badge variant={employee.status === 'active' ? 'default' : 'secondary'}>
                    {employee.status}
                  </Badge>
                  <Badge variant="outline">ID: {employee.id}</Badge>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span>{employee.email}</span>
                  </div>
                  {employee.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <span>{employee.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span>Joined {new Date(employee.hireDate).toLocaleDateString()}</span>
                  </div>
                  {employee.manager && (
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span>Reports to {employee.manager}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            {(['hr_manager', 'hr_staff'].includes(user?.role || '')) && (
              <div className="flex gap-2">
               <Dialog>
  <DialogTrigger asChild>
    <Button variant="outline" size="sm">
      <Edit className="w-4 h-4 mr-2" />
      Edit Profile
    </Button>
  </DialogTrigger>
  <DialogContent className="sm:max-w-4xl">
    <DialogHeader>
      <DialogTitle>Edit Employee Profile</DialogTitle>
    </DialogHeader>
                    <EditProfileForm 
                      defaultValues={{
                        name: employee.name,
                        email: employee.email,
                        phone: employee.phone,
                        position: employee.position,
                        department: employee.department,
                        gender: employee.gender,
                        employmentType: employee.employmentType,
                        staffNumber: employee.staffNumber,
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
                        status: employee.status
                      }}
      onSave={(data) => {
        // Persist updates to Employees store so they reflect across the app
        updateEmployee(employee.id, {
          name: data.name,
          email: data.email,
          phone: data.phone,
          position: data.position,
          department: data.department,
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
          hireDate: data.hireDate,
          emergencyContact: data.emergencyContact,
          salary: data.salary,
          status: data.status,
        });
      }}
    />
  </DialogContent>
</Dialog>

                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="personal" className="flex items-center gap-2">
            <User className="w-4 h-4" />
            Personal
          </TabsTrigger>
        {(isMyProfile 
          || ["admin", "hr_manager", "hr_staff"].includes(user?.role || "")) && (
            <TabsTrigger value="documents" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Documents
            </TabsTrigger>
        )}
          <TabsTrigger value="performance" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Performance
          </TabsTrigger>
          <TabsTrigger value="training" className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4" />
            Training
          </TabsTrigger>
          <TabsTrigger value="leave" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Leave
          </TabsTrigger>
        </TabsList>

        {/* Personal Information */}
        <TabsContent value="personal">
          <Card>
            <CardContent className="p-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-6">
                {/* Left Column */}
                <div className="space-y-6">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1 block">Series *</label>
                    <div className="bg-muted px-3 py-2 rounded-md text-sm">
                      HR-{employee.department?.substring(0, 4)?.toUpperCase()}-
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1 block">First Name *</label>
                    <div className="bg-muted px-3 py-2 rounded-md text-sm">
                      {employee.name.split(' ')[0]}
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1 block">Other Name</label>
                    <div className="bg-muted px-3 py-2 rounded-md text-sm">
                      {employee.name.split(' ').slice(1, -1).join(' ') || ''}
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1 block">Surname</label>
                    <div className="bg-muted px-3 py-2 rounded-md text-sm">
                      {employee.name.split(' ').slice(-1)[0]}
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1 block">Salutation</label>
                    <div className="bg-muted px-3 py-2 rounded-md text-sm">
                      {employee.gender === 'female' ? 'Ms.' : 'Mr.'}
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1 block">Full Name</label>
                    <div className="bg-muted px-3 py-2 rounded-md text-sm font-medium">
                      {employee.name}
                    </div>
                  </div>
                                 <div>
                    <label className="text-sm font-medium text-foreground mb-1 block">Emergency Contact</label>
                    <div className="bg-muted px-3 py-2 rounded-md text-sm font-medium">
                      {employee.emergencyContact || 'Not specified'}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1 block">Employment Type</label>
                    <div className="bg-muted px-3 py-2 rounded-md text-sm">
                      {employee.employmentType || 'Permanent'}
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1 block">Staff No *</label>
                    <div className="bg-muted px-3 py-2 rounded-md text-sm font-mono">
                      {employee.staffNumber || `${new Date().getFullYear()}${employee.id.padStart(6, '0')}`}
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1 block">ID Number</label>
                    <div className="bg-muted px-3 py-2 rounded-md text-sm font-mono">
                      {employee.nationalId || '***********'}
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1 block">KRA PIN</label>
                    <div className="bg-muted px-3 py-2 rounded-md text-sm font-mono">
                      {employee.kraPin || 'A001234567X'}
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1 block">Children</label>
                    <div className="bg-muted px-3 py-2 rounded-md text-sm">
                      {employee.children || '0'}
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1 block">Work County</label>
                    <div className="bg-muted px-3 py-2 rounded-md text-sm">
                      {employee.workCounty || 'Nairobi'}
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1 block">Home County</label>
                    <div className="bg-muted px-3 py-2 rounded-md text-sm">
                      {employee.homeCounty || 'Nairobi'}
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1 block">Postal Address</label>
                    <div className="bg-muted px-3 py-2 rounded-md text-sm">
                      {employee.postalAddress || 'P.O. Box 12345'}
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1 block">Postal Code</label>
                    <div className="bg-muted px-3 py-2 rounded-md text-sm">
                      {employee.postalCode || '00100'}
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1 block">Station Name</label>
                    <div className="bg-muted px-3 py-2 rounded-md text-sm">
                      {employee.stationName || `${employee.department} - ${employee.position}`}
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1 block">Skill Level</label>
                    <div className="bg-muted px-3 py-2 rounded-md text-sm">
                      {employee.skillLevel || 'Form-4 (KCSE)'}
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1 block">Company *</label>
                    <div className="bg-muted px-3 py-2 rounded-md text-sm">
                      {employee.company || 'Ministry of Water, Sanitation and Irrigation'}
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1 block">Status *</label>
                    <div className="bg-muted px-3 py-2 rounded-md text-sm">
                      <Badge variant={employee.status === 'active' ? 'default' : 'secondary'}>
                        {employee.status}
                      </Badge>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1 block">Gender *</label>
                    <div className="bg-muted px-3 py-2 rounded-md text-sm capitalize">
                      {employee.gender || 'Not specified'}
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1 block">Date of Birth *</label>
                    <div className="bg-muted px-3 py-2 rounded-md text-sm">
                      {employee.dateOfBirth ? new Date(employee.dateOfBirth).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: '2-digit', 
                        year: 'numeric'
                      }) : '01-01-1980'}
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1 block">Date of Joining *</label>
                    <div className="bg-muted px-3 py-2 rounded-md text-sm">
                      {new Date(employee.hireDate).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Documents */}
        {(isMyProfile || ["admin", "hr_manager", "hr_staff"].includes(user?.role || "")) && (
        <TabsContent value="documents">

          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Employee Documents</CardTitle>
                {isMyProfile && (
                  <Dialog open={docOpen} onOpenChange={setDocOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm">
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Document
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Upload Document</DialogTitle>
                        <DialogDescription>Add a document to your profile.</DialogDescription>
                      </DialogHeader>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                          <label className="text-sm font-medium">Document Name</label>
                          <Input className="mt-1" placeholder="e.g. National ID Scan.pdf" value={docName} onChange={(e) => setDocName(e.target.value)} />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Document Type</label>
                          <Select value={docType} onValueChange={(v) => setDocType(v as any)}>
                            <SelectTrigger className="w-full mt-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="contract">Contract</SelectItem>
                              <SelectItem value="certificate">Certificate</SelectItem>
                              <SelectItem value="policy">Policy</SelectItem>
                              <SelectItem value="form">Form</SelectItem>
                              <SelectItem value="report">Report</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <label className="text-sm font-medium">Category</label>
                          <Input className="mt-1" placeholder="e.g. HR Records" value={docCategory} onChange={(e) => setDocCategory(e.target.value)} />
                        </div>
                        <div className="md:col-span-2">
                          <label className="text-sm font-medium">Select File</label>
                          <Input className="mt-1" type="file" onChange={(e) => setDocFile(e.target.files && e.target.files[0] ? e.target.files[0] : null)} />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button onClick={() => {
                          if (!docName) return;
                          addDocument({ name: docName, type: docType, category: docCategory, file: docFile });
                          setDocName('');
                          setDocType('form');
                          setDocCategory('General');
                          setDocFile(null);
                          setDocOpen(false);
                        }}>Submit</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {employeeDocuments.map((document) => (
                  <div key={document.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="bg-primary/10 p-2 rounded">
                        <FileText className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{document.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {document.category} • {document.uploadDate} • {document.size}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={`status-${document.status}`}>
                        {document.status}
                      </Badge>
                      <Button variant="outline" size="sm" onClick={() => {
                        const url = getDocumentUrl(document.id);
                        if (url) window.open(url, '_blank');
                      }} disabled={!getDocumentUrl(document.id)}>
                        View
                      </Button>
                      <a
                        href={getDocumentUrl(document.id) || '#'}
                        download={document.name}
                        onClick={(e) => { if (!getDocumentUrl(document.id)) e.preventDefault(); }}
                      >
                        <Button variant="outline" size="sm" disabled={!getDocumentUrl(document.id)}>
                          <Download className="w-4 h-4" />
                        </Button>
                      </a>
                    </div>
                  </div>
                ))}
                {employeeDocuments.length === 0 && (
                  <div className="text-center py-8">
                    <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No documents uploaded yet</p>
                  </div>
                )}
              </div>
            </CardContent> 
          </Card>
        </TabsContent>
        )}
        {/* Performance */}
        <TabsContent value="performance">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance Reviews</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {employeeReviews.map((review) => (
                    <div key={review.id} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium">{review.reviewPeriod}</h4>
                        <Badge className={`status-${review.status}`}>
                          {review.status}
                        </Badge>
                      </div>
                      {review.score && (
                        <div className="mb-2">
                          <div className="flex justify-between text-sm mb-1">
                            <span>Overall Score</span>
                            <span>{review.score}/5.0</span>
                          </div>
                          <Progress value={(review.score / 5) * 100} />
                        </div>
                      )}
                      {/* Per-criteria details */}
                      {(() => {
                        const template = templates.find(t => t.id === review.templateId);
                        return (
                          <div className="space-y-3 mt-3">
                            {/* Employee Targets mapped to criteria */}
                            {review.employeeTargets && review.employeeTargets.length > 0 && (
                              <div>
                                <p className="font-medium mb-1">Employee Targets</p>
                                <div className="space-y-2">
                                  {review.employeeTargets.map((t, idx) => {
                                    const c = template?.criteria.find(c => c.id === t.criteriaId);
                                    return (
                                      <div key={idx} className="bg-muted/30 p-3 rounded">
                                        <div className="flex justify-between text-sm">
                                          <span className="font-medium">{c?.name || t.criteriaId}</span>
                                        </div>
                                        <p className="text-sm">{t.target}</p>
                                        {t.description && (
                                          <p className="text-xs text-muted-foreground mt-1">{t.description}</p>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}

                            {/* Manager Scores mapped to criteria */}
                            {review.managerScores && review.managerScores.length > 0 && (
                              <div>
                                <p className="font-medium mb-1">Manager Scores</p>
                                <div className="space-y-2">
                                  {review.managerScores.map((s, idx) => {
                                    const c = template?.criteria.find(c => c.id === s.criteriaId);
                                    return (
                                      <div key={idx} className="p-3 border rounded">
                                        <div className="flex justify-between text-sm">
                                          <span>{c?.name || s.criteriaId}</span>
                                          <span>{s.score}/5</span>
                                        </div>
                                        {s.comments && (
                                          <p className="text-xs text-muted-foreground mt-1">{s.comments}</p>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}

                            {/* HR Scores mapped to criteria */}
                            {review.hrScores && review.hrScores.length > 0 && (
                              <div>
                                <p className="font-medium mb-1">HR Scores</p>
                                <div className="space-y-2">
                                  {review.hrScores.map((s, idx) => {
                                    const c = template?.criteria.find(c => c.id === s.criteriaId);
                                    return (
                                      <div key={idx} className="p-3 border rounded">
                                        <div className="flex justify-between text-sm">
                                          <span>{c?.name || s.criteriaId}</span>
                                          <span>{s.score}/5</span>
                                        </div>
                                        {s.comments && (
                                          <p className="text-xs text-muted-foreground mt-1">{s.comments}</p>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })()}
                      <p className="text-sm text-muted-foreground mb-2">{review.feedback}</p>
                      <p className="text-xs text-muted-foreground">
                        Next review: {new Date(review.nextReviewDate).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                  {employeeReviews.length === 0 && (
                    <div className="text-center py-8">
                      <TrendingUp className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No performance reviews yet</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Goals & Objectives</CardTitle>
              </CardHeader>
              <CardContent>
                {employeeReviews.length > 0 && employeeReviews[0].goals ? (
                  <div className="space-y-3">
                    {employeeReviews[0].goals.map((goal, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                        <p className="text-sm">{goal}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No goals set yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Training */}
        <TabsContent value="training">
          <Card>
            <CardHeader>
              <CardTitle>Training & Development</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {employeeTrainings.map((training) => (
                  <div key={training.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="bg-success/10 p-2 rounded">
                        <GraduationCap className="w-5 h-5 text-success" />
                      </div>
                      <div>
                        <p className="font-medium">{training.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {training.provider} • {training.type}
                        </p>
                        {training.completionDate && (
                          <p className="text-xs text-muted-foreground">
                            Completed: {new Date(training.completionDate).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={`status-${training.status === 'completed' ? 'approved' : training.status === 'in_progress' ? 'pending' : 'draft'}`}>
                        {training.status.replace('_', ' ')}
                      </Badge>
                      {training.expiryDate && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Expires: {new Date(training.expiryDate).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
                {employeeTrainings.length === 0 && (
                  <div className="text-center py-8">
                    <GraduationCap className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No training records yet</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Leave */}
        <TabsContent value="leave">
          <Card>
            <CardHeader>
              <CardTitle>Leave History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {employeeLeaves.map((leave) => (
                  <div key={leave.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium">{leave.type.replace('_', ' ').toUpperCase()}</p>
                        <Badge className={`status-${leave.status}`}>
                          {leave.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">
                        {leave.startDate} to {leave.endDate} • {leave.days} day{leave.days > 1 ? 's' : ''}
                      </p>
                      <p className="text-sm">{leave.reason}</p>
                    </div>
                    <div className="text-right text-xs text-muted-foreground">
                      <p>Applied: {new Date(leave.appliedDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
                {employeeLeaves.length === 0 && (
                  <div className="text-center py-8">
                    <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No leave requests yet</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};