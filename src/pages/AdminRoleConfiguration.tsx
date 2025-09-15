import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

type Role = 'Admin' | 'HR' | 'Employee';
type Permission = 'View' | 'Edit' | 'Delete' | 'Create';

const defaultRoles: Record<Role, Permission[]> = {
  Admin: ['View', 'Edit', 'Delete', 'Create'],
  HR: ['View', 'Edit', 'Create'],
  Employee: ['View'],
};

export default function RoleConfiguration() {
  const navigate = useNavigate();
  const [roles, setRoles] = useState(defaultRoles);

  const togglePermission = (role: Role, permission: Permission) => {
    setRoles(prev => {
      const hasPermission = prev[role].includes(permission);
      const updated = hasPermission
        ? prev[role].filter(p => p !== permission)
        : [...prev[role], permission];
      return { ...prev, [role]: updated };
    });
  };

  return (
    <div className="p-6">
      <button
        onClick={() => navigate('/admin')}
        className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800 transition"
      >
        ← Back to Admin Panel
      </button>

      <h1 className="text-2xl font-semibold mb-4">Role Configuration</h1>
      <div className="space-y-6">
        {Object.entries(roles).map(([role, permissions]) => (
          <div key={role} className="border rounded p-4 shadow-sm">
            <h2 className="text-lg font-bold mb-2">{role}</h2>
            <div className="flex gap-4 flex-wrap">
              {(['View', 'Edit', 'Delete', 'Create'] as Permission[]).map(p => (
                <label key={p} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={permissions.includes(p)}
                    onChange={() => togglePermission(role as Role, p)}
                  />
                  <span>{p}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
