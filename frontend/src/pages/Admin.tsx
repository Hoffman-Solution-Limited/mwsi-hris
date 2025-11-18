import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, Users, Shield, Database, Award, BookOpen, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const Admin: React.FC = () => {
  const navigate = useNavigate();

  const cards = [
      {
        title: 'User Management',
        icon: Users,
        description: 'Manage user accounts and permissions',
        onClick: () => navigate('/admin/users'),
      },
      {
        title: 'Role Configuration',
        icon: Shield,
        description: 'Configure roles and access controls',
        onClick: () => navigate('/admin/roles'),
      },
      {
        title: 'Performance Templates',
        icon: Award,
        description: 'Create and manage performance review templates',
        onClick: () => navigate('/admin/performance-templates'),
      },
      {
        title: 'Training Management',
        icon: BookOpen,
        description: 'Create training programs and assign employees',
        onClick: () => navigate('/admin/training-management'),
      },
      {
        title: 'System Logs',
        icon: Activity,
        description: 'View system activity logs and audit trails',
        onClick: () => navigate('/admin/system-logs'),
      },
      {
        title: 'System Settings',
        icon: Settings,
        description: 'General system configuration',
        onClick: () => navigate('/admin/settings'),
      },
      {
        title: 'Data Management',
        icon: Database,
        description: 'Database and data management tools',
        onClick: () => navigate('/admin/data'),
      },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Admin Panel</h1>
        <p className="text-muted-foreground">
          System administration and configuration settings
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((item, index) => (
          <Card
            key={index}
            onClick={item.onClick}
            className="cursor-pointer hover:shadow-md transition-shadow"
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <item.icon className="w-5 h-5" />
                {item.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{item.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
