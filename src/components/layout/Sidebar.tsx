import React from 'react';
import { NavLink } from 'react-router-dom';
import logo from '@/assets/logo.png';
import {
  LayoutDashboard, Users, UserPlus, GraduationCap, Calendar,
  TrendingUp, FileText, BarChart3, Settings, Search,
  Building2, User, Briefcase, MapPin, AlertTriangle, List
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
    { path: '/profile', label: 'My Profile', icon: <User className="w-5 h-5" />, roles: ['employee','manager'] },
  { path: '/manager-apply-leave', label: 'Apply for Leave', icon: (<Calendar className='w-5 h-5' />), roles: ['manager'] },
    ]
  },
  {
    title: "HR Management",
    items: [
      { path: '/employees', label: 'Employee Directory', icon: <Users className="w-5 h-5" />, roles: ['admin','hr_manager','hr_staff','manager'] },
      { path: '/recruitment', label: 'Recruitment', icon: <UserPlus className="w-5 h-5" />, roles: ['admin','hr_manager','hr_staff'] },
      { path: '/disciplinary', label: 'Disciplinary Cases', icon: <AlertTriangle className="w-5 h-5" />, roles: ['admin','hr_manager','hr_staff'] },
      { path: '/training', label: 'Training & CPD', icon: <GraduationCap className="w-5 h-5" /> },
      { path: '/leave', label: 'Leave Management', icon: <Calendar className="w-5 h-5" /> },
  { path: '/performance', label: 'Performance Reviews', icon: <TrendingUp className="w-5 h-5" /> },
  { path: '/hr-performance-filled', label: 'Filled Performance Reviews', icon: <BarChart3 className="w-5 h-5" />, roles: ['admin','hr_manager','hr_staff'] },
      { path: '/designation', label: 'Designations', icon: <Briefcase className="w-5 h-5" />, roles: ['admin','hr_manager','hr_staff'] },
      { path: '/Skills', label: 'Skills', icon: <List className="w-5 h-5" />, roles: ['admin','hr_manager','hr_staff'] },

    ]
  },
  {
    title: "Reports & Admin",
    items: [
      { path: '/documents', label: 'Document Registry', icon: <FileText className="w-5 h-5" /> },
  { path: '/employees-by-county', label: 'Employees by County', icon: <MapPin className="w-5 h-5" />, roles: ['admin','hr_manager','hr_staff'] },
      { path: '/reports', label: 'Reports & Analytics', icon: <BarChart3 className="w-5 h-5" />, roles: ['admin','hr_manager','hr_staff'] },
      { path: '/admin', label: 'Admin Panel', icon: <Settings className="w-5 h-5" />, roles: ['admin'] }
    ]
  }
];

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

      <nav className="flex-1 overflow-y-auto sidebar-scroll p-2">
        {navGroups.map((group) => (
          <div key={group.title} className="mb-4">
            {!collapsed && (
              <h2 className="px-3 text-xs font-semibold text-white/60 uppercase tracking-wider mb-1">
                {group.title}
              </h2>
            )}
            <div className="space-y-1">
              {group.items
                .filter(item => !item.roles || item.roles.includes(user?.role || ''))
                .map(item => (
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
        ))}
      </nav>
    </aside>
  );
};
