import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRoles } from '@/contexts/RolesContext';
import { usePermissions, ALL_PERMISSIONS, DEFAULT_ROLE_PERMISSIONS } from '@/contexts/PermissionsContext';

export default function RoleConfiguration() {
  const navigate = useNavigate();
  const { roles, addRole, updateRole, deleteRole, resetDefaults: resetRoles } = useRoles();
  const { rolePermissions, setRolePermissions, resetDefaults: resetPermissions } = usePermissions();
  const [message, setMessage] = useState<string | null>(null);
  const [newRoleName, setNewRoleName] = useState('');

  const allPermissions = ALL_PERMISSIONS;

  const togglePermission = (roleId: string, permission: string) => {
    // admin is always full access
    if (roleId === 'admin') return;
    const current = rolePermissions[roleId] || [];
    const has = current.includes(permission as any);
    const updated = has ? current.filter(p => p !== permission) : [...current, permission as any];
    setRolePermissions(roleId as any, updated as any);
  };

  const handleAddRole = () => {
    if (!newRoleName.trim()) return;
    const r = addRole(newRoleName.trim());
    // initialize permissions empty
    setRolePermissions(r.id as any, []);
    setNewRoleName('');
    setMessage('Role added');
  };

  const handleDelete = (id: string) => {
    const role = roles.find(r => r.id === id);
    if (!role || role.locked) return;
    deleteRole(id);
    setRolePermissions(id as any, []);
    setMessage('Role deleted');
  };

  const handleReset = () => {
    resetRoles();
    resetPermissions();
    setMessage(null);
  };

  const handleSave = () => {
    setMessage('Role permissions updated successfully.');
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-2">Role Configuration</h1>
      <p className="text-sm text-muted-foreground mb-4">Configure permissions for each role. Admin has full access and cannot be reduced here.</p>

      {message && (
        <div className="mb-4 p-3 rounded bg-green-50 text-green-700 text-sm">{message}</div>
      )}

      <div className="mb-4 flex gap-2">
        <input value={newRoleName} onChange={(e) => setNewRoleName(e.target.value)} className="border px-2 py-1 rounded" placeholder="New role name" />
        <button onClick={handleAddRole} className="px-3 py-1 rounded bg-green-600 text-white">Add Role</button>
        <button onClick={handleReset} className="px-3 py-1 rounded border">Reset to Defaults</button>
      </div>

      <div className="overflow-x-auto border rounded">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-4 py-2">Role</th>
              {allPermissions.map(p => (
                <th key={p} className="text-left px-4 py-2">{p}</th>
              ))}
              <th className="text-left px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {roles.map((role) => {
              const permissions = rolePermissions[role.id] || DEFAULT_ROLE_PERMISSIONS[role.id as any] || [];
              const locked = role.locked || role.id === 'admin';
              return (
                <tr key={role.id} className="border-t">
                  <td className="px-4 py-2 font-medium">{role.name}</td>
                  {allPermissions.map((p) => (
                    <td key={p} className="px-4 py-2">
                      <label className={`inline-flex items-center gap-2 ${locked ? 'opacity-60' : ''}`}>
                        <input
                          type="checkbox"
                          checked={locked ? true : permissions.includes(p as any)}
                          disabled={locked}
                          onChange={() => togglePermission(role.id, p)}
                        />
                        <span className="sr-only">{p}</span>
                      </label>
                    </td>
                  ))}
                  <td className="px-4 py-2">
                    {!locked && (
                      <button onClick={() => handleDelete(role.id)} className="text-sm text-red-600">Delete</button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex gap-2 mt-4">
        <button onClick={handleSave} className="px-4 py-2 rounded bg-blue-600 text-white">Save Changes</button>
      </div>
    </div>
  );
}
