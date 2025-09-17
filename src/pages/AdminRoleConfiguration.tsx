import { useMemo, useState } from 'react';
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
  const [message, setMessage] = useState<string | null>(null);

  const allPermissions: Permission[] = ['View', 'Edit', 'Delete', 'Create'];

  const togglePermission = (role: Role, permission: Permission) => {
    // Admin is locked to full permissions in this UI
    if (role === 'Admin') return;
    setRoles(prev => {
      const hasPermission = prev[role].includes(permission);
      const updated = hasPermission
        ? prev[role].filter(p => p !== permission)
        : [...prev[role], permission];
      return { ...prev, [role]: updated };
    });
  };

  const handleReset = () => {
    setRoles(defaultRoles);
    setMessage(null);
  };

  const handleSave = () => {
    // Here you would call an API; we just show an inline message
    setMessage('Role permissions updated successfully.');
  };

  return (
    <div className="p-6">
      <button
        onClick={() => navigate('/admin')}
        className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800 transition"
      >
        ← Back to Admin Panel
      </button>

      <h1 className="text-2xl font-semibold mb-2">Role Configuration</h1>
      <p className="text-sm text-muted-foreground mb-4">Configure permissions for each role. Admin has full access and cannot be reduced here.</p>

      {message && (
        <div className="mb-4 p-3 rounded bg-green-50 text-green-700 text-sm">{message}</div>
      )}

      <div className="overflow-x-auto border rounded">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-4 py-2">Role</th>
              {allPermissions.map(p => (
                <th key={p} className="text-left px-4 py-2">{p}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(['Admin', 'HR', 'Employee'] as Role[]).map((role) => {
              const permissions = roles[role];
              const locked = role === 'Admin';
              return (
                <tr key={role} className="border-t">
                  <td className="px-4 py-2 font-medium">{role}</td>
                  {allPermissions.map((p) => (
                    <td key={p} className="px-4 py-2">
                      <label className={`inline-flex items-center gap-2 ${locked ? 'opacity-60' : ''}`}>
                        <input
                          type="checkbox"
                          checked={locked ? true : permissions.includes(p)}
                          disabled={locked}
                          onChange={() => togglePermission(role, p)}
                        />
                        <span className="sr-only">{p}</span>
                      </label>
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex gap-2 mt-4">
        <button onClick={handleReset} className="px-4 py-2 rounded border">Reset to Defaults</button>
        <button onClick={handleSave} className="px-4 py-2 rounded bg-blue-600 text-white">Save Changes</button>
      </div>
    </div>
  );
}
