import React from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { LoginPage } from "@/components/auth/LoginPage";
import { Layout } from "@/components/layout/Layout";
import { Dashboard } from "@/pages/Dashboard";
import { GlobalSearch } from "@/pages/GlobalSearch";
import { EmployeeDirectory } from "@/pages/EmployeeDirectory";
import { EmployeeProfile } from "@/pages/EmployeeProfile";
import { Recruitment } from "@/pages/Recruitment";
import { Training } from "@/pages/Training";
import { LeaveManagement } from "@/pages/LeaveManagement";
import { PerformanceReviews } from "@/pages/PerformanceReviews";
import { Documents } from "@/pages/Documents";
import { Reports } from "@/pages/Reports";
import { Admin } from "@/pages/Admin";
import { DesignationPage } from "@/pages/Designation";
import {SkillsPage} from "@/pages/Skills";
import { EmployeeByCounty } from "@/pages/EmployeeByCounty";
import { DisciplinaryCases } from "@/pages/DisciplinaryCases";
import { ForgotPasswordPage } from "@/components/auth/ForgotPasswordPage";
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
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
  <Routes>
  <Route path="/login" element={<LoginPage />} />
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
  <Route path="/documents" element={<ProtectedRoute><Layout><Documents /></Layout></ProtectedRoute>} />
  <Route path="/reports" element={<ProtectedRoute><Layout><Reports /></Layout></ProtectedRoute>} />
  <Route path="/admin" element={<ProtectedRoute><Layout><Admin /></Layout></ProtectedRoute>} />


  {/* ✅ Wrap Designations same way */}
  <Route
    path="/Designation"
    element={
      <ProtectedRoute>
        <Layout>
          <DesignationPage />
        </Layout>
      </ProtectedRoute>
    }
  />
  <Route
  path="/employees-by-county"
  element={
    <ProtectedRoute>
      <Layout>
        <EmployeeByCounty />
      </Layout>
    </ProtectedRoute>
  }
/>
<Route
  path="/disciplinary"
  element={
    <ProtectedRoute>
      <Layout>
        <DisciplinaryCases />
      </Layout>
    </ProtectedRoute>
  }
/>
<Route
  path="/skills"
  element={
    <ProtectedRoute>
      <Layout>
        <SkillsPage />
      </Layout>
    </ProtectedRoute>
  }
/>
  <Route path="*" element={<NotFound />} />
</Routes>

        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
