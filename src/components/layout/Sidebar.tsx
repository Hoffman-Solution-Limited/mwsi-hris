import React from 'react';
import { NavLink } from 'react-router-dom';
import logo from '@/assets/logo.png';
import {
  LayoutDashboard, Users, UserPlus, GraduationCap, Calendar,
  TrendingUp, FileText, BarChart3, Settings, Search, ShieldPlus, UserCog2, LogsIcon,
  Building2, User, Briefcase, MapPin, AlertTriangle, List, Activity, DatabaseBackup, UserCheck2, Settings2
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

interface NavItem {
  path: string;
  label: string;
  icon: React.ReactNode;
  roles?: string[];
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

interface SidebarProps extends React.HTMLAttributes<HTMLElement> {
  collapsed?: boolean;
  bgColor?: string;
}

const navGroups: NavGroup[] = [
  {
    title: "Core",
    items: [
      { path: '/', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
      { path: '/search', label: 'Global Search', icon: <Search className="w-5 h-5" /> },
      { path: '/profile', label: 'My Profile', icon: <User className="w-5 h-5" />, roles: ['employee', 'manager'] },
      { path: '/my-files', label: 'My Files', icon: <FileText className="w-5 h-5" />, roles: ['employee'] },
      { path: '/manager-apply-leave', label: 'Apply for Leave', icon: (<Calendar className='w-5 h-5' />), roles: ['manager' ,'employee']},
      { path: '/training', label: 'Training & CPD', icon: <GraduationCap className="w-5 h-5" />, roles: [ 'manager'] },

    ]
  },
  {
    title: "HR Management",
    items: [
      { path: '/employees', label: 'Employee Directory', icon: <Users className="w-5 h-5" />, roles: ['hr_manager', 'hr_staff', 'manager'] },
      { path: '/recruitment', label: 'Recruitment', icon: <UserPlus className="w-5 h-5" />, roles: ['hr_manager', 'hr_staff'] },
      { path: '/disciplinary', label: 'Disciplinary Cases', icon: <AlertTriangle className="w-5 h-5" />, roles: ['hr_manager', 'hr_staff'] },
      { path: '/training', label: 'Training & CPD', icon: <GraduationCap className="w-5 h-5" />, roles: ['hr_manager', 'hr_staff', 'employee'] },
      { path: '/leave', label: 'Leave Management', icon: <Calendar className="w-5 h-5" />, roles: ['hr_manager', 'hr_staff', 'manager'] },
      { path: '/performance', label: 'Performance Reviews', icon: <TrendingUp className="w-5 h-5" />, roles: ['hr_manager', 'hr_staff', 'manager', 'employee'] },
      { path: '/hr-performance-filled', label: 'Filled Performance Reviews', icon: <BarChart3 className="w-5 h-5" />, roles: ['hr_manager', 'hr_staff'] },
      { path: '/designation', label: 'Designations', icon: <Briefcase className="w-5 h-5" />, roles: ['hr_manager', 'hr_staff'] },
      { path: '/Skills', label: 'Skills', icon: <List className="w-5 h-5" />, roles: ['hr_manager', 'hr_staff'] },
      { path: '/employment-attributes', label: 'Employment Attributes', icon: <Settings className="w-5 h-5" />, roles: ['hr_manager', 'hr_staff'] },
      { path: '/work-stations', label: 'Work Stations', icon: <Building2 className="w-5 h-5" />, roles: ['hr_manager', 'hr_staff'] },
      { path: '/documents', label: 'Document Registry', icon: <FileText className="w-5 h-5" />, roles: ['hr_manager', 'hr_staff', 'employee', 'manager'] },
      { path: '/employee-files', label: 'Employee File Tracking', icon: <FileText className="w-5 h-5" />, roles: ['admin', 'hr_manager', 'hr_staff', 'manager'] },

    ]
  },
  {
    title: "Reports & Admin",
    items: [
      { path: '/reports', label: 'Reports & Analytics', icon: <BarChart3 className="w-5 h-5" />, roles: ['hr_manager', 'hr_staff'] },
      { path: '/admin/users', label: 'User Management', icon: <UserCog2 className="w-5 h-5" />, roles: ['admin'] },
      { path: '/admin/performance-templates', label: 'Performance Template', icon: <TrendingUp className="w-5 h-5" />, roles: ['admin'] },
      { path: '/admin/training-management', label: 'Training Management', icon: <GraduationCap className="w-5 h-5" />, roles: ['admin'] },
      { path: '/admin/system-logs', label: 'System Logs', icon: <LogsIcon className="w-5 h-5" />, roles: ['admin'] },
      { path: '/admin/data', label: 'Data Management', icon: <DatabaseBackup className="w-5 h-5" />, roles: ['admin'] },
      { path: '/admin/roles', label: 'Role Configuration', icon: <UserCheck2 className="w-5 h-5" />, roles: ['admin'] },
      { path: '/admin/settings', label: 'System Settings', icon: <Settings2 className="w-5 h-5" />, roles: ['admin'] },
      { path: '/admin/requests', label: 'Requests Management', icon: <Activity className="w-5 h-5" />, roles: ['admin'] },
    ]
  }
];

/**
 * Role-based subtitle mapping for nav groups
 */
const groupTitleMap: Record<string, Record<string, string>> = {
  "Core": {
    employee: "My Workspace",
    manager: "Team Workspace",
    hr_manager: "HR Workspace",
    hr_staff: "HR Workspace",
    admin: "System Overview"
  },
  "HR Management": {
    employee: "Employee Services",
    manager: "My Team Management",
    hr_manager: "HR Management",
    hr_staff: "HR Management",
    admin: "HR Oversight"
  },
  "Reports & Admin": {
    employee: "My Reports",
    manager: "Analytics",
    hr_manager: "Reports",
    hr_staff: "Reports",
    admin: "System Administration"
  }
};

export const Sidebar: React.FC<SidebarProps> = ({ collapsed = false, bgColor = 'bg-brand', className, ...rest }) => {
  const { user } = useAuth();

  return (
    <aside
      {...rest}
      className={cn(
        'h-screen border-r flex flex-col transition-all duration-300',
        collapsed ? 'w-20' : 'w-64',
        bgColor,
        className
      )}
    >
      {/* Logo and Branding */}
      <div className="p-4 flex items-center gap-2">
        <img
          src={logo}
          alt="MWSI Logo"
          className={cn(
            'h-8 w-auto object-contain transition-all duration-300',
            collapsed ? 'mx-auto' : ''
          )}
        />
        {!collapsed && (
          <div>
            <h1 className="text-xl font-bold text-white">MWSI HRIS</h1>
            <p className="text-xs text-white/60">HR Management System</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto sidebar-scroll p-2">
        {navGroups.map((group) => {
          // Filter out groups that have no visible items for this role
          const visibleItems = group.items.filter(item =>
            !item.roles || item.roles.includes(user?.role || '')
          );
          if (visibleItems.length === 0) return null;

          return (
            <div key={group.title} className="mb-4">
              {!collapsed && (
                <h2 className="px-3 text-xs font-semibold text-white/60 uppercase tracking-wider mb-1">
                  {groupTitleMap[group.title]?.[user?.role || ""] || group.title}
                </h2>
              )}
              <div className="space-y-1">
                {visibleItems.map(item => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-primary text-primary-foreground'
                          : 'text-white/80 hover:bg-blue-800 hover:text-white'
                      )
                    }
                  >
                    {item.icon}
                    {!collapsed && <span>{item.label}</span>}
                  </NavLink>
                ))}
              </div>
            </div>
          );
        })}
      </nav>
    </aside>
  );
};
