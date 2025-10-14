import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { 
  ArrowLeft, 
  Edit, 
  Download, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  User,
  FileText,
  TrendingUp,
  GraduationCap,
  Shield,
  Bell
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { useTraining } from '@/contexts/TrainingContext';
import { useLeave } from '@/contexts/LeaveContext';
import { useAuth } from '@/contexts/AuthContext';
import { usePerformance } from '@/contexts/PerformanceContext';
 
import { useEmployees } from '@/contexts/EmployeesContext';
import { useUsers } from '@/contexts/UsersContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
// Removed Select import used only by document upload UI
import { useNotifications } from '@/contexts/NotificationsContext';
import { mapRole } from '@/lib/roles';

export const EmployeeProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const { templates } = usePerformance();
  const { updateEmployee } = useEmployees();
  const [activeTab, setActiveTab] = useState('personal');

  // For testing, always use Michael Davis (id: '3') as the target employee
    // If on /profile route, show current user's profile
    const isMyProfile = location.pathname === '/profile';
    // For manager, allow viewing/editing their own profile
    const targetEmployeeId = isMyProfile ? user?.id : id;
  const { employees } = useEmployees();
  // Try to find the employee in EmployeesContext first; if not found, fall back to UsersContext
  let employee = employees.find(emp => String(emp.id) === String(targetEmployeeId));
    const { updateUser } = useAuth();
    const { users, changePassword, findByEmail } = useUsers();
    if (!employee && targetEmployeeId) {
      const fallback = users.find(u => String(u.id) === String(targetEmployeeId) || String(u.email) === String(targetEmployeeId));
      if (fallback) {
        // Treat the user record as an employee-like object for profile rendering and access checks
        employee = fallback as any;
      }
    }
  // Last-resort fallback disabled for UAT: rely on backend for employee data.
  // If backend is unreachable, the UI will show "No data — connect to backend" instead of using seeded mocks.
  const mockEmployees: any[] = [];
        if (!employee && targetEmployeeId) {
          const seedFallback = mockEmployees.find(m => String(m.id) === String(targetEmployeeId) || String(m.email) === String(targetEmployeeId));
          if (seedFallback) {
            employee = seedFallback as any;
          }
        }

    // If we found an EmployeesContext record but it lacks manager info, try to enrich it
    if (employee && !(employee.managerId || employee.manager) && targetEmployeeId) {
      const enrichFromUsers = users.find(u => String(u.id) === String(targetEmployeeId) || String(u.email) === String(targetEmployeeId));
      const enrichFromSeed = mockEmployees.find(m => String(m.id) === String(targetEmployeeId) || String(m.email) === String(targetEmployeeId));
      const enrich = enrichFromUsers || enrichFromSeed;
      if (enrich) {
        // merge missing fields (do not persist back to context/localStorage here)
        employee = { ...employee, ...(enrich.manager ? { manager: enrich.manager } : {}), ...(enrich.managerId ? { managerId: enrich.managerId } : {}) } as any;
      }
    }
    // If the target is not an employee but corresponds to a pure Admin account in UsersContext,
    // show a simplified admin account view instead of the full employee profile.
    const adminUser = targetEmployeeId ? users.find(u => u.id === targetEmployeeId || u.email === targetEmployeeId) : undefined;
    const { getUserNotifications, markAllRead, markRead } = useNotifications();
    const notifications = targetEmployeeId ? getUserNotifications(targetEmployeeId) : [];

    // Helper: resize/compress image to target max size (bytes)
    const resizeImageToMaxSize = (file: File, maxBytes = 1_000_000): Promise<string> => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        const reader = new FileReader();
        reader.onload = () => {
          img.onload = async () => {
            try {
              const canvas = document.createElement('canvas');
              const ctx = canvas.getContext('2d');
              if (!ctx) return reject(new Error('Canvas not supported'));

              // Start with natural size, then scale down if needed
              let [w, h] = [img.naturalWidth, img.naturalHeight];
              // Limit longest side to 1024px to avoid huge images
              const maxSide = 1024;
              if (Math.max(w, h) > maxSide) {
                const scale = maxSide / Math.max(w, h);
                w = Math.round(w * scale);
                h = Math.round(h * scale);
              }

              canvas.width = w;
              canvas.height = h;
              ctx.clearRect(0, 0, w, h);
              ctx.drawImage(img, 0, 0, w, h);

              // Iteratively attempt to get under maxBytes by lowering quality
              let quality = 0.92;
              let dataUrl = canvas.toDataURL('image/jpeg', quality);
              const toBytes = (d: string) => Math.ceil((d.length - 'data:image/jpeg;base64,'.length) * 3 / 4);
              let bytes = toBytes(dataUrl);
              while (bytes > maxBytes && quality > 0.3) {
                quality -= 0.07;
                dataUrl = canvas.toDataURL('image/jpeg', quality);
                bytes = toBytes(dataUrl);
              }

              // If still too large, downscale canvas further and try again
              while (bytes > maxBytes && Math.max(canvas.width, canvas.height) > 200) {
                const scale = 0.85;
                const newW = Math.round(canvas.width * scale);
                const newH = Math.round(canvas.height * scale);
                const tmp = document.createElement('canvas');
                tmp.width = newW;
                tmp.height = newH;
                const tctx = tmp.getContext('2d');
                if (!tctx) break;
                tctx.drawImage(canvas, 0, 0, newW, newH);
                canvas.width = newW;
                canvas.height = newH;
                ctx.clearRect(0, 0, newW, newH);
                ctx.drawImage(tmp, 0, 0);
                // retry quality loop
                quality = Math.max(quality, 0.6);
                dataUrl = canvas.toDataURL('image/jpeg', quality);
                bytes = toBytes(dataUrl);
              }

              resolve(dataUrl);
            } catch (err) {
              reject(err);
            }
          };
          img.onerror = () => reject(new Error('Failed loading image'));
          img.src = String(reader.result || '');
        };
        reader.onerror = () => reject(new Error('Failed reading file'));
        reader.readAsDataURL(file);
      });
    };

    // Avatar upload handler with validation + resizing
    useEffect(() => {
      const input = document.getElementById('avatarUpload') as HTMLInputElement | null;
      if (!input) return;
      const onChange = async (e: Event) => {
        const el = e.target as HTMLInputElement;
        const file = el.files && el.files[0];
        if (!file || !employee) return;

        const MAX_BYTES = 1_000_000; // 1 MB
        try {
          let dataUrl: string;
          if (file.size > MAX_BYTES) {
            // attempt to resize/compress
            dataUrl = await resizeImageToMaxSize(file, MAX_BYTES);
          } else {
            // small enough, just read
            dataUrl = await new Promise<string>((res, rej) => {
              const r = new FileReader();
              r.onload = () => res(String(r.result || ''));
              r.onerror = () => rej(new Error('Failed reading file'));
              r.readAsDataURL(file);
            });
          }

          // Update employee context
          try { updateEmployee(employee.id, { avatar: dataUrl }); } catch (err) {}
          // If updating current logged-in user's profile, update auth user too
          try { if (user && user.id === employee.id) { updateUser && updateUser({ avatar: dataUrl }); } } catch (err) {}

          toast({ title: 'Profile photo updated', description: 'Your profile photo was updated.' });
        } catch (err: any) {
          console.error(err);
          toast({ title: 'Upload failed', description: err?.message || 'Could not process image' });
        } finally {
          // reset input so same file can be re-selected
          el.value = '';
        }
      };
      input.addEventListener('change', onChange);
      return () => input.removeEventListener('change', onChange);
    }, [employee, updateEmployee, updateUser, user, toast]);

  // Allow deep linking to specific tab via ?tab= query param
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab) setActiveTab(tab);
  }, [location.search]);

  // Check if current user can access this profile
  // Managers can view/edit their own profile and direct reports
  const canonical = mapRole(user?.role);
  const isManager = canonical === 'manager';
  // Only show full personal info to HR/admin or the owner; managers do not see personal info for reports
  const showPersonalInfo = (!isManager && canonical !== 'unknown') || isMyProfile || user?.role === 'hr_manager' || user?.role === 'admin';

  // If Personal info is not allowed, ensure the active tab is not 'personal'
  useEffect(() => {
    if (!showPersonalInfo && activeTab === 'personal') {
      setActiveTab('performance');
    }
  }, [showPersonalInfo, activeTab]);

  // Robust direct-report check: compare IDs as strings (handles number/string mismatches)
  const isDirectReport = !!(employee && String(employee.managerId || '') === String(user?.id || ''));
  const isManagerByName = !!(employee && employee.manager && user?.name && String(employee.manager).toLowerCase() === String(user.name).toLowerCase());

  // Only admin/hr or the profile owner may view a full profile. Managers are limited to the directory only.
  const canAccessProfile = isMyProfile ||
    canonical === 'admin' || canonical === 'hr';
    const { trainings } = useTraining();
    const employeeTrainings = trainings.filter(training => training.employeeId === targetEmployeeId);
    const { reviews } = usePerformance();
    const employeeReviews = reviews.filter(review => review.employeeId === targetEmployeeId);
    const { leaveRequests } = useLeave();
    const employeeLeaves = leaveRequests.filter(leave => leave.employeeId === targetEmployeeId);

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
    // If there's an admin user (pure admin) matching the target, show admin account page
    if (adminUser && adminUser.role === 'admin') {
      return (
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <Avatar className="w-24 h-24">
                  <AvatarImage src={undefined} />
                  <AvatarFallback className="text-2xl font-bold">A</AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="text-3xl font-bold mb-1">Admin Account</h1>
                  <p className="text-muted-foreground">{adminUser.email}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <h3 className="text-lg font-semibold mb-4">Account</h3>
              <p className="mb-4 text-sm text-muted-foreground">This is a pure admin account without an employee profile. You can change the account password below.</p>
              <form onSubmit={(e) => {
                e.preventDefault();
                const form = e.target as HTMLFormElement & { newPassword: HTMLInputElement };
                const newPassword = form.newPassword.value;
                changePassword(adminUser.id, newPassword || null);
                toast({ title: 'Password changed', description: 'Admin password updated in demo storage.' });
                form.reset();
              }} className="space-y-3 max-w-md">
                <div>
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input id="newPassword" name="newPassword" type="password" placeholder="Enter new password" />
                </div>
                <Button type="submit">Change Password</Button>
              </form>
            </CardContent>
          </Card>
        </div>
      );
    }

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
              {/* Avatar upload (only for own profile or HR) */}
              <div className="mt-3 text-center md:text-left">
                <input id="avatarUpload" name="avatarUpload" type="file" accept="image/*" className="hidden" />
                {(isMyProfile || mapRole(user?.role) === 'hr') && (
                  <div className="mt-2">
                    <label htmlFor="avatarUpload" className="inline-flex items-center gap-2 text-sm text-blue-700 cursor-pointer">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V8.414A2 2 0 0016.586 7L13 3.414A2 2 0 0011.586 3H4z"/></svg>
                      Upload photo
                    </label>
                  </div>
                )}
              </div>
              <div className="text-center md:text-left">
                <h1 className="text-3xl font-bold mb-2">{employee.name}</h1>
                <p className="text-xl text-muted-foreground mb-1">{employee.position}</p>
                <p className="text-muted-foreground mb-4">{employee.department}</p>
                <div className="flex flex-wrap gap-2 justify-center md:justify-start mb-4">
                  <Badge variant={employee.status === 'active' ? 'default' : 'secondary'}>
                    {employee.status}
                  </Badge>
                  <Badge variant="outline">Employee No: {(employee as any).employeeNumber || '—'}</Badge>
                  {employee.cadre && (
                    <Badge variant="outline" className="capitalize">{employee.cadre}</Badge>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                    <>
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
                    </>
                
                  {employee.manager && (
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span>Reports to {employee.manager}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            {(mapRole(user?.role) === 'hr') && (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => navigate(`/employees/${employee.id}/edit`)}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>

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
        <TabsList className="grid w-full grid-cols-4 gap-4">
         {showPersonalInfo && (
          <TabsTrigger value="personal" className="flex items-center gap-2">
            <User className="w-4 h-4" />
            Personal
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
        {showPersonalInfo && (
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
                  {showPersonalInfo && (
                    <>
                      <div>
                        <label className="text-sm font-medium text-foreground mb-1 block">Emergency Contact</label>
                        <div className="bg-muted px-3 py-2 rounded-md text-sm font-medium">
                          {employee.emergencyContact || 'Not specified'}
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
                    </>
                  )}
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1 block">Employment Type</label>
                    <div className="bg-muted px-3 py-2 rounded-md text-sm">
                      {employee.employmentType || 'Permanent'}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground mb-1 block">Engagement Type</label>
                    <div className="bg-muted px-3 py-2 rounded-md text-sm">
                      {(employee as any).engagementType || employee.employmentType || 'Permanent'}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground mb-1 block">Cadre</label>
                    <div className="bg-muted px-3 py-2 rounded-md text-sm capitalize">
                      {employee.cadre || 'Not specified'}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground mb-1 block">Job Group</label>
                    <div className="bg-muted px-3 py-2 rounded-md text-sm">
                      {(employee as any).jobGroup || '—'}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground mb-1 block">Employee Number</label>
                    <div className="bg-muted px-3 py-2 rounded-md text-sm font-mono">
                      {(employee as any).employeeNumber || '—'}
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
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                <div>
                    <label className="text-sm font-medium text-foreground mb-1 block">Children</label>
                    <div className="bg-muted px-3 py-2 rounded-md text-sm">
                      {employee.children || '0'}
                    </div>
                  </div>
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
                    <label className="text-sm font-medium text-foreground mb-1 block">Ethnicity</label>
                    <div className="bg-muted px-3 py-2 rounded-md text-sm">
                      {(employee as any).ethnicity || '—'}
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
        )}

        {/* Documents */}
  {(isMyProfile || mapRole(user?.role) === 'admin' || mapRole(user?.role) === 'hr') && (
        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Employee Documents</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
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

                            {/* HR Comments */}
                            {review.hrComments && (
                              <div>
                                <p className="font-medium mb-1">HR Comments</p>
                                <div className="p-3 border rounded">
                                  <p className="text-sm">{review.hrComments}</p>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })()}
                      {(review as any).feedback && (
                        <p className="text-sm text-muted-foreground mb-2">{(review as any).feedback}</p>
                      )}
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
                {employeeReviews.length > 0 && (employeeReviews[0] as any).goals ? (
                  <div className="space-y-3">
                    {(employeeReviews[0] as any).goals.map((goal: any, index: number) => (
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