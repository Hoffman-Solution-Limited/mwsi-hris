import HRPerformanceFilledList from "@/pages/HRPerformanceFilledList";
import React from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { LeaveProvider } from "@/contexts/LeaveContext";
import { DocumentProvider } from "@/contexts/DocumentContext";
import { PerformanceProvider } from "@/contexts/PerformanceContext";
import { TrainingProvider } from "@/contexts/TrainingContext";
import { UsersProvider } from "@/contexts/UsersContext";
import { SystemCatalogProvider } from "@/contexts/SystemCatalogContext";
import { SystemLogsProvider } from "@/contexts/SystemLogsContext";
import { EmployeesProvider } from "@/contexts/EmployeesContext";
import { LoginPage } from "@/components/auth/LoginPage";
import { Layout } from "@/components/layout/Layout";
import { Dashboard } from "@/pages/Dashboard";
import { GlobalSearch } from "@/pages/GlobalSearch";
import { EmployeeDirectory } from "@/pages/EmployeeDirectory";
import { EmployeeProfile } from "@/pages/EmployeeProfile";
import Recruitment from "@/pages/Recruitment";
import { Training } from "@/pages/Training";
import { LeaveManagement } from "@/pages/LeaveManagement";
import { PerformanceReviews } from "@/pages/PerformanceReviews";
import { Documents } from "@/pages/Documents";
import { Reports } from "@/pages/Reports";
import { Admin } from "@/pages/Admin";
import { DesignationPage } from "@/pages/Designation";
import {SkillsPage} from "@/pages/Skills";
import ApplyLeave from "@/pages/ApplyLeave";
import ManagerApplyLeave from "@/pages/ManagerApplyLeave";
import { EmployeeByCounty } from "@/pages/EmployeeByCounty";
import { DisciplinaryCases } from "@/pages/DisciplinaryCases";
import { ForgotPasswordPage } from "@/components/auth/ForgotPasswordPage";
import AdminUserManagement from '@/pages/AdminUserManagement';
import RoleConfiguration from '@/pages/AdminRoleConfiguration';
import SystemSettings from '@/pages/AdminSystemSettings';
import DataManagement from '@/pages/AdminDataManagement';
import AdminPerformanceTemplates from '@/pages/AdminPerformanceTemplates';
import AdminTrainingManagement from '@/pages/AdminTrainingManagement';
import AdminSystemLogs from '@/pages/AdminSystemLogs';
import WorkStationsPage from '@/pages/WorkStations';
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  
  if (!user) {
    return <LoginPage />;
  }
  
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <SystemLogsProvider>
        <LeaveProvider>
          <DocumentProvider>
            <PerformanceProvider>
              <TrainingProvider>
                <UsersProvider>
                  <SystemCatalogProvider>
                    <EmployeesProvider>
                    <TooltipProvider>
                      <Toaster />
                      <Sonner />
                      <BrowserRouter>
                        <Routes>
                          <Route path="/login" element={<LoginPage />} />
                          <Route path="/apply-leave" element={<ProtectedRoute><ApplyLeave /></ProtectedRoute>} />
                          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                          <Route path="/" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
                          <Route path="/search" element={<ProtectedRoute><Layout><GlobalSearch /></Layout></ProtectedRoute>} />
                          <Route path="/employees" element={<ProtectedRoute><Layout><EmployeeDirectory /></Layout></ProtectedRoute>} />
                          <Route path="/employees/:id" element={<ProtectedRoute><Layout><EmployeeProfile /></Layout></ProtectedRoute>} />
                          <Route path="/profile" element={<ProtectedRoute><Layout><EmployeeProfile /></Layout></ProtectedRoute>} />
                          <Route path="/recruitment" element={<ProtectedRoute><Layout><Recruitment /></Layout></ProtectedRoute>} />
                          <Route path="/training" element={<ProtectedRoute><Layout><Training /></Layout></ProtectedRoute>} />
                          <Route path="/leave" element={<ProtectedRoute><Layout><LeaveManagement /></Layout></ProtectedRoute>} />
                          <Route path="/performance" element={<ProtectedRoute><Layout><PerformanceReviews /></Layout></ProtectedRoute>} />
                          <Route path="/hr-performance-filled" element={<ProtectedRoute><Layout><HRPerformanceFilledList /></Layout></ProtectedRoute>} />
                          <Route path="/documents" element={<ProtectedRoute><Layout><Documents /></Layout></ProtectedRoute>} />
                          <Route path="/reports" element={<ProtectedRoute><Layout><Reports /></Layout></ProtectedRoute>} />
                          <Route path="/admin" element={<ProtectedRoute><Layout><Admin /></Layout></ProtectedRoute>} />
                          <Route path="/manager-apply-leave" element={<ProtectedRoute><Layout><ManagerApplyLeave /></Layout></ProtectedRoute>} />

                          {/* ✅ Wrap Designations same way */}
                          <Route path="/Designation" element={<ProtectedRoute><Layout><DesignationPage /></Layout></ProtectedRoute>} />
                          <Route path="/employees-by-county" element={<ProtectedRoute><Layout><EmployeeByCounty /></Layout></ProtectedRoute>} />
                          <Route path="/disciplinary" element={<ProtectedRoute><Layout><DisciplinaryCases /></Layout></ProtectedRoute>} />
                          <Route path="/skills" element={<ProtectedRoute><Layout><SkillsPage /></Layout></ProtectedRoute>} />
                          <Route path="/admin/users" element={<ProtectedRoute><Layout><AdminUserManagement /></Layout></ProtectedRoute>} />
                          <Route path="/admin/roles" element={<ProtectedRoute><Layout><RoleConfiguration /></Layout></ProtectedRoute>} />
                          <Route path="/admin/settings" element={<ProtectedRoute><Layout><SystemSettings /></Layout></ProtectedRoute>} />
                          <Route path="/admin/data" element={<ProtectedRoute><Layout><DataManagement /></Layout></ProtectedRoute>} />
                          <Route path="/admin/performance-templates" element={<ProtectedRoute><Layout><AdminPerformanceTemplates /></Layout></ProtectedRoute>} />
                          <Route path="/admin/training-management" element={<ProtectedRoute><Layout><AdminTrainingManagement /></Layout></ProtectedRoute>} />
                          <Route path="/admin/system-logs" element={<ProtectedRoute><Layout><AdminSystemLogs /></Layout></ProtectedRoute>} />
                          <Route path="/work-stations" element={<ProtectedRoute><Layout><WorkStationsPage /></Layout></ProtectedRoute>} />
                          <Route path="*" element={<NotFound />} />
                        </Routes>
                      </BrowserRouter>
                    </TooltipProvider>
                    </EmployeesProvider>
                  </SystemCatalogProvider>
                </UsersProvider>
              </TrainingProvider>
            </PerformanceProvider>
          </DocumentProvider>
        </LeaveProvider>
      </SystemLogsProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
