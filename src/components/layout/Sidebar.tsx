import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  UserPlus, 
  GraduationCap, 
  Calendar, 
  TrendingUp, 
  FileText, 
  BarChart3, 
  Settings,
  Search,
  Building2,
  User,
  Briefcase,
  MapPin,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';



interface NavItem {
  path: string;
  label: string;
  icon: React.ReactNode;
  roles?: string[];
}

const navItems: NavItem[] = [
  {
    path: '/',
    label: 'Dashboard',
    icon: <LayoutDashboard className="w-5 h-5" />,
  },
  {
    path: '/search',
    label: 'Global Search',
    icon: <Search className="w-5 h-5" />,
  },
  {
    path: '/employees',
    label: 'Employee Directory',
    icon: <Users className="w-5 h-5" />,
    roles: ['admin', 'hr_manager', 'hr_staff', 'manager']
  },
  {
  path: '/employees-by-county',
  label: 'Employees by County',
  icon: <MapPin className="w-5 h-5" />, // import { MapPin } from "lucide-react"
  roles: ['admin', 'hr_manager', 'hr_staff', 'manager']
  },

  {
    path: '/designation',
    label: 'Designations',
    icon: <Briefcase className="w-5 h-5" />,
    roles: ['admin', 'hr_manager', 'hr_staff'] // adjust roles as needed
  },
  {
    path: '/profile',
    label: 'My Profile',
    icon: <User className="w-5 h-5" />,
    roles: ['employee']
  },
  {
    path: '/recruitment',
    label: 'Recruitment',
    icon: <UserPlus className="w-5 h-5" />,
    roles: ['admin', 'hr_manager', 'hr_staff']
  },
  {
  path: '/disciplinary',
  label: 'Disciplinary Cases',
  icon: <AlertTriangle className="w-5 h-5" />, // import { AlertTriangle } from "lucide-react"
  roles: ['admin', 'hr_manager', 'hr_staff'] 
 },

  {
    path: '/training',
    label: 'Training & CPD',
    icon: <GraduationCap className="w-5 h-5" />,
  },
  {
    path: '/leave',
    label: 'Leave Management',
    icon: <Calendar className="w-5 h-5" />,
  },
  {
    path: '/performance',
    label: 'Performance Reviews',
    icon: <TrendingUp className="w-5 h-5" />,
  },
  {
    path: '/documents',
    label: 'Document Registry',
    icon: <FileText className="w-5 h-5" />,
  },
  {
    path: '/reports',
    label: 'Reports & Analytics',
    icon: <BarChart3 className="w-5 h-5" />,
    roles: ['admin', 'hr_manager', 'hr_staff']
  },
  {
    path: '/admin',
    label: 'Admin Panel',
    icon: <Settings className="w-5 h-5" />,
    roles: ['admin']
  }
];

export const Sidebar: React.FC = () => {
  const { user } = useAuth();

  const filteredNavItems = navItems.filter(item => 
    !item.roles || item.roles.includes(user?.role || '')
  );

  return (
    <aside className="w-64 min-h-screen bg-sidebar-background border-r border-sidebar-border">
      <div className="p-6">
        <div className="flex items-center gap-2 mb-8">
          <Building2 className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-xl font-bold text-sidebar-foreground">MWSI HRIS</h1>
            <p className="text-xs text-sidebar-foreground/60">HR Management System</p>
          </div>
        </div>

        <nav className="space-y-2">
          {filteredNavItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-sidebar-accent text-sidebar-primary-foreground bg-primary'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                )
              }
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </aside>
  );
};