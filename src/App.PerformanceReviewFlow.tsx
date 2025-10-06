import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { PerformanceProvider } from '@/contexts/PerformanceContext';
import { EmployeesProvider } from '@/contexts/EmployeesContext';
import PerformanceReviews from '@/pages/PerformanceReviews';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Clock, Users } from 'lucide-react';

// Preview component showcasing the new performance review flow
const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <EmployeesProvider>
          <PerformanceProvider>
            <div className="min-h-screen bg-background p-8">
              <div className="max-w-7xl mx-auto space-y-8">
                <div className="space-y-4">
                  <h1 className="text-4xl font-bold">Performance Review Flow - Enhanced</h1>
                  <p className="text-lg text-muted-foreground">
                    New flow with employee acknowledgment: Employee fills targets → Employee self-appraisal → Manager scores → 
                    <span className="font-semibold text-primary"> Employee accepts/declines</span> → HR final review
                  </p>
                  
                  {/* Test Scenarios Overview */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                          <Clock className="w-4 h-4 text-blue-600" />
                          Pending Acknowledgment
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-2xl font-bold text-blue-600">2</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Reviews awaiting employee response
                        </p>
                        <Badge variant="outline" className="mt-2 bg-blue-50 text-blue-700">
                          employee_ack status
                        </Badge>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          Accepted Reviews
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-2xl font-bold text-green-600">2</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Employee accepted manager's appraisal
                        </p>
                        <Badge variant="outline" className="mt-2 bg-green-50 text-green-700">
                          Accepted
                        </Badge>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                          <XCircle className="w-4 h-4 text-red-600" />
                          Declined Reviews
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-2xl font-bold text-red-600">1</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Employee declined with comments
                        </p>
                        <Badge variant="outline" className="mt-2 bg-red-50 text-red-700">
                          Declined
                        </Badge>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Key Features */}
                  <Card className="bg-blue-50 border-blue-200">
                    <CardHeader>
                      <CardTitle className="text-lg">Test Scenarios Available</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-start gap-2">
                        <Users className="w-4 h-4 mt-1 text-blue-600" />
                        <div>
                          <p className="font-medium">As Employee - Michael Davis (ID: 3)</p>
                          <ul className="text-sm text-muted-foreground ml-4 list-disc">
                            <li>PR105 (Q1 2025): Pending acknowledgment - ready to accept/decline</li>
                            <li>PR106 (Q2 2025): Accepted review, now in HR review</li>
                            <li>PR111 (Q3 2025): Declined review with detailed comments</li>
                            <li>PR114 (Q4 2025): Submitted to manager, awaiting manager review</li>
                          </ul>
                        </div>
                      </div>
                      <div className="flex items-start gap-2 mt-3">
                        <Users className="w-4 h-4 mt-1 text-green-600" />
                        <div>
                          <p className="font-medium">As Manager - David Manager (ID: 10)</p>
                          <ul className="text-sm text-muted-foreground ml-4 list-disc">
                            <li><strong>Team Reviews to Complete:</strong></li>
                            <li className="ml-4">PR112 - Jane Smith (Q3 2025): High performer, self-scored 5,4,5</li>
                            <li className="ml-4">PR113 - Robert Chen (Q3 2025): DevOps achievements, self-scored 4,5,4</li>
                            <li className="ml-4">PR114 - Michael Davis (Q4 2025): Security focus, self-scored 5,5,4</li>
                            <li className="mt-2"><strong>Own Performance Reviews:</strong></li>
                            <li className="ml-4">PR109 (Q1 2026): Pending acknowledgment</li>
                            <li className="ml-4">PR110 (Q2 2026): Completed with accepted acknowledgment</li>
                          </ul>
                        </div>
                      </div>
                      <div className="flex items-start gap-2 mt-3">
                        <Users className="w-4 h-4 mt-1 text-purple-600" />
                        <div>
                          <p className="font-medium">As HR - Review All Stages</p>
                          <ul className="text-sm text-muted-foreground ml-4 list-disc">
                            <li>PR106: Accepted acknowledgment ready for HR review</li>
                            <li>PR111: Declined acknowledgment requiring mediation</li>
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="grid gap-6">
                  <div className="p-6 border rounded-lg bg-card">
                    <h2 className="text-2xl font-semibold mb-4">Performance Reviews Dashboard</h2>
                    <PerformanceReviews />
                  </div>
                </div>
              </div>
            </div>
          </PerformanceProvider>
        </EmployeesProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;