import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { usePermissions, PermissionKey } from '@/contexts/PermissionsContext';

interface Props {
  permission: PermissionKey;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

const RequirePermission: React.FC<Props> = ({ permission, fallback = null, children }) => {
  const { user } = useAuth();
  const { can } = usePermissions();

  if (!can(user?.role, permission)) {
    return (
      fallback ?? (
        <div className="p-6 text-sm text-muted-foreground">
          You do not have permission to view this page.
        </div>
      )
    );
  }

  return <>{children}</>;
};

export default RequirePermission;
