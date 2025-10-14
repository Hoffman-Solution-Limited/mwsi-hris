import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  mockEmployees, 
  mockDocuments, 
  mockTrainingRecords,
  mockPerformanceReviews,
  mockLeaveRequests 
} from '@/data/mockData';

export const EmployeeProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('personal');

  const employee = mockEmployees.find(emp => emp.id === id);
  const employeeDocuments = mockDocuments.filter(doc => 
    doc.uploadedBy === employee?.name || Math.random() > 0.5
  );
  const employeeTrainings = mockTrainingRecords.filter(training => 
    training.employeeId === id
  );
  const employeeReviews = mockPerformanceReviews.filter(review => 
    review.employeeId === id
  );
  const employeeLeaves = mockLeaveRequests.filter(leave => 
    leave.employeeId === id
  );

  if (!employee) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Employee Not Found</h2>
          <p className="text-muted-foreground mb-4">The requested employee profile could not be found.</p>
          <Button onClick={() => navigate('/employees')}>
            Back to Directory
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="sm" onClick={() => navigate('/employees')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Directory
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
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Edit className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
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
          <TabsTrigger value="documents" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Documents
          </TabsTrigger>
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Personal Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                  <p className="font-medium">{employee.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Email Address</label>
                  <p className="font-medium">{employee.email}</p>
                </div>
                {employee.phone && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Phone Number</label>
                    <p className="font-medium">{employee.phone}</p>
                  </div>
                )}
                {employee.emergencyContact && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Emergency Contact</label>
                    <p className="font-medium">{employee.emergencyContact}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Employment Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Position</label>
                  <p className="font-medium">{employee.position}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Department</label>
                  <p className="font-medium">{employee.department}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Hire Date</label>
                  <p className="font-medium">{new Date(employee.hireDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Employment Status</label>
                  <Badge variant={employee.status === 'active' ? 'default' : 'secondary'}>
                    {employee.status}
                  </Badge>
                </div>
                {employee.manager && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Direct Manager</label>
                    <p className="font-medium">{employee.manager}</p>
                  </div>
                )}
                {employee.salary && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Annual Salary</label>
                    <p className="font-medium">${employee.salary.toLocaleString()}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Documents */}
        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Employee Documents</CardTitle>
                <Button size="sm">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Document
                </Button>
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
                      <Button variant="outline" size="sm">
                        View
                      </Button>
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