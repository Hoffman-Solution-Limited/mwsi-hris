import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Plus, User, Mail, RefreshCw, Edit as EditIcon } from 'lucide-react'
import {UserForm} from '@/components/UserForm'
import { useUsers, AppUser } from '@/contexts/UsersContext'
import { useEmployees } from '@/contexts/EmployeesContext'
import { useToast } from '@/hooks/use-toast'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function AdminUserManagement() {
  const navigate = useNavigate()
  const { users, addUser, toggleStatus, updateUser, changePassword } = useUsers()
  const { employees, addEmployee } = useEmployees()
  const { toast } = useToast()

  // Local helper to generate a temporary password for invites
  const generateTempPassword = (len = 12) => {
    const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ'
    const lower = 'abcdefghijkmnopqrstuvwxyz'
    const digits = '23456789'
    const symbols = '!@#$%^&*'
    const all = upper + lower + digits + symbols
    let pwd = ''
    pwd += upper[Math.floor(Math.random() * upper.length)]
    pwd += lower[Math.floor(Math.random() * lower.length)]
    pwd += digits[Math.floor(Math.random() * digits.length)]
    pwd += symbols[Math.floor(Math.random() * symbols.length)]
    for (let i = pwd.length; i < len; i++) pwd += all[Math.floor(Math.random() * all.length)]
    return pwd
  }

  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'hr_manager' | 'employee' | 'manager'>('all')
  const [editingUser, setEditingUser] = useState<AppUser | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [addOpen, setAddOpen] = useState(false)
  const [importOpen, setImportOpen] = useState(false)
  const [importRows, setImportRows] = useState<Array<{ id: number; cols: string[]; name?: string; email?: string; role?: string; error?: string }>>([])
  const [headers, setHeaders] = useState<string[]>([])
  const usersPerPage = 5

  const filteredUsers = users.filter(user => {
    const matchesSearch =
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase())
    const matchesRole = roleFilter === 'all' || user.role === roleFilter
    return matchesSearch && matchesRole
  })

  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * usersPerPage,
    currentPage * usersPerPage
  )

  const handleEdit = (user: AppUser) => setEditingUser(user)
  const handleSave = () => setEditingUser(null)

  const handleAddEmployee = (data: Omit<AppUser, 'id' | 'status'>) => {
    const existsInHR = employees.some(e => e.email.toLowerCase() === (data.email || '').toLowerCase())
    if (!existsInHR) {
      alert('This email does not match any employee record. Please ask HR to create the employee record first.')
      return
    }
    addUser({ ...data, hireDate: new Date().toISOString() })
  }

  const handleResendInvite = (user: AppUser) => {
    // Confirmation
    if (!window.confirm(`Resend invitation to ${user.email}?`)) return
    // Simulation: in a real app we'd call backend to resend invite email
    toast({ title: 'Invite resent', description: `Resent invitation to ${user.email}.` })
    console.log('Resend invite for', user.email, 'temp password (if any):', user.password)
  }

  const handleSendInvite = (user: AppUser) => {
    // Create a temp password and persist it on the user (demo-only)
    const pwd = generateTempPassword()
    updateUser(user.id, { password: pwd })
    toast({ title: 'Invite sent', description: `Invitation sent to ${user.email}.` })
    console.log('Sent invite to', user.email, 'temp password:', pwd)
  }

  return (
    <div className="p-6">
      {/* Back Button */}

      <h1 className="text-2xl font-semibold mb-4">User Management</h1>

      {/* Filters & Add Employee Dialog */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 w-full">
          <input
            type="text"
            placeholder="Search by name or email"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="border px-3 py-2 rounded w-full sm:w-1/2"
          />
          <select
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value as any)}
            className="border px-3 py-2 rounded w-full sm:w-1/4"
          >
            <option value="all">All Roles</option>
            <option value="admin">Admin</option>
            <option value="hr_manager">HR</option>
            <option value="employee">Employee</option>
            <option value="manager">Manager</option>
          </select>
        </div>

        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="bg-blue-600 text-white hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Add New User
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-xl md:max-w-2xl lg:max-w-3xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <User className="w-4 h-4" /> Add New User
              </DialogTitle>
              <DialogDescription>
                Note: Users can only be created for emails that exist in HR employee records.
              </DialogDescription>
            </DialogHeader>
            <UserForm
              defaultValues={{
                name: '',
                email: '',
                role: 'employee',
              }}
              onSave={data => {
                const userData = { 
                  ...data, 
                  name: data.name || data.email, // Use email as name if not provided
                  position: 'N/A', 
                  department: 'N/A', 
                  hireDate: new Date().toISOString() 
                };
                handleAddEmployee(userData)
                // TODO: integrate with backend to send invitation email using temp password
                if (data.sendInvite) {
                  console.log('Send invite enabled. Temp password:', data.tempPassword)
                }
                setAddOpen(false)
              }}
              onCancel={() => setAddOpen(false)}
            />
          </DialogContent>
        </Dialog>
        {/* Import Users Dialog */}
        <Dialog open={importOpen} onOpenChange={setImportOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline" onClick={() => setImportOpen(true)}>Import Users</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-xl md:max-w-2xl lg:max-w-3xl">
            <DialogHeader>
              <DialogTitle>Import Users from CSV</DialogTitle>
              <DialogDescription>Upload a CSV with columns: name,email,role. Roles: Admin,HR,Manager,Employee.</DialogDescription>
            </DialogHeader>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => {
                    // CSV template
                    const headers = ['name','email','role'];
                    const sample = ['Jane Manager','jane.manager@example.com','Manager'];
                    const csv = '\uFEFF' + [headers.join(','), sample.join(',')].join('\n');
                    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'user-import-template.csv';
                    document.body.appendChild(a);
                    a.click();
                    a.remove();
                    URL.revokeObjectURL(url);
                  }}>Download CSV Template</Button>
                  <Button size="sm" variant="outline" onClick={async () => {
                    // XLSX template (dynamic import)
                    try {
                      const XLSX = await import('xlsx');
                      const aoa = [
                        ['name','email','role'],
                        ['Jane Manager','jane.manager@example.com','Manager']
                      ];
                      const ws = XLSX.utils.aoa_to_sheet(aoa as any);
                      const wb = XLSX.utils.book_new();
                      XLSX.utils.book_append_sheet(wb, ws, 'Template');
                      // writeFile triggers download in browser
                      XLSX.writeFile(wb, 'user-import-template.xlsx');
                    } catch (err) {
                      console.error('Failed to generate xlsx template', err);
                      toast({ title: 'Download error', description: 'Failed to generate XLSX template.' });
                    }
                  }}>Download XLSX Template</Button>
                </div>
              <input type="file" accept=".csv,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel" onChange={async (e) => {
                const f = e.target.files?.[0];
                if (!f) return;
                const name = (f.name || '').toLowerCase();
                let text = '';
                let parsedRows: string[][] = [];
                try {
                  if (name.endsWith('.xls') || name.endsWith('.xlsx')) {
                    // dynamic import of xlsx
                    const XLSX = await import('xlsx');
                    const data = await f.arrayBuffer();
                    const wb = XLSX.read(data, { type: 'array' });
                    const ws = wb.Sheets[wb.SheetNames[0]];
                    const csv = XLSX.utils.sheet_to_csv(ws);
                    text = csv;
                  } else {
                    text = await f.text();
                  }
                } catch (err) {
                  console.error('Failed to parse file', err);
                  toast({ title: 'Import error', description: 'Failed to parse file.' });
                  return;
                }
                const lines = text.split(/\r?\n/).map(l => l).filter(Boolean);
                // csv splitter that handles quoted commas
                const splitCSV = (line: string) => line.split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/).map(s => s.replace(/^"|"$/g, '').trim());
                if (lines.length === 0) return;
                const first = splitCSV(lines[0]);
                const hasHeader = first.some(h => /email/i.test(h)) && (first.some(h => /name/i.test(h)) || first.some(h => /role/i.test(h)));
                const rawHeaders = hasHeader ? first : first.map((_, idx) => `Column ${idx+1}`);
                setHeaders(rawHeaders);
                // default mapping (internal only)
                const mapping: Record<string, 'name'|'email'|'role'|'skip'> = {};
                rawHeaders.forEach(h => {
                  const lower = h.toLowerCase();
                  if (lower.includes('email')) mapping[h] = 'email';
                  else if (lower.includes('name')) mapping[h] = 'name';
                  else if (lower.includes('role')) mapping[h] = 'role';
                  else mapping[h] = 'skip';
                });
                const start = hasHeader ? 1 : 0;
                const out: any[] = [];
                for (let i = start; i < lines.length; i++) {
                  const parts = splitCSV(lines[i]);
                  out.push(parts);
                }
                // build importRows
                const rows = out.map((cols, idx) => {
                  const r: any = { id: idx, cols };
                  // apply mapping
                  rawHeaders.forEach((h, j) => {
                    const map = mapping[h];
                    const v = cols[j] || '';
                    if (map === 'name') r.name = v || r.name;
                    if (map === 'email') r.email = v || r.email;
                    if (map === 'role') r.role = v || r.role;
                  });
                  // validations
                  if (!r.email || !r.role) r.error = 'Missing email or role';
                  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(r.email)) r.error = 'Invalid email';
                  else if (!['Admin','HR','Manager','Employee'].includes((r.role || '').toString())) r.error = 'Invalid role';
                  return r;
                });
                setImportRows(rows);
              }} />

              {/* Mapping UI removed: headers are inferred automatically */}

              {importRows.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Preview</h4>
                  <div className="max-h-48 overflow-auto border rounded">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-100"><tr><th className="p-2">Name</th><th className="p-2">Email</th><th className="p-2">Role</th><th className="p-2">Status</th></tr></thead>
                      <tbody>
                        {importRows.map((r, idx) => (
                          <tr key={r.id} className={r.error ? 'bg-red-50' : ''}>
                            <td className="p-2">
                              <input className="border px-2 py-1 rounded w-full" value={r.name || ''} onChange={(e) => setImportRows(prev => prev.map(p => p.id === r.id ? { ...p, name: e.target.value } : p))} />
                            </td>
                            <td className="p-2">
                              <input className="border px-2 py-1 rounded w-full" value={r.email || ''} onChange={(e) => setImportRows(prev => prev.map(p => p.id === r.id ? { ...p, email: e.target.value } : p))} />
                            </td>
                            <td className="p-2">
                              <select className="border px-2 py-1 rounded w-full" value={r.role || ''} onChange={(e) => setImportRows(prev => prev.map(p => p.id === r.id ? { ...p, role: e.target.value } : p))}>
                                <option value="">-- select --</option>
                                <option>Admin</option>
                                <option>HR</option>
                                <option>Manager</option>
                                <option>Employee</option>
                              </select>
                            </td>
                            <td className="p-2 text-xs text-muted-foreground">{r.error || 'OK'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="flex justify-end gap-2 mt-3">
                    <Button variant="outline" onClick={() => setImportRows([])}>Clear</Button>
                    <Button onClick={() => {
                      // revalidate and create
                      const revalidated = importRows.map(r => {
                        const copy = { ...r };
                        if (!copy.email || !copy.role) copy.error = 'Missing email or role';
                        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(copy.email)) copy.error = 'Invalid email';
                        else if (!['Admin','HR','Manager','Employee'].includes((copy.role || '').toString())) copy.error = 'Invalid role';
                        else delete copy.error;
                        return copy;
                      });
                      setImportRows(revalidated);
                      const good = revalidated.filter(r => !r.error);
                      good.forEach(r => {
                        addUser({ name: r.name, email: r.email, role: r.role as any, position: 'Imported', department: 'Imported', hireDate: new Date().toISOString() });
                        if (r.role === 'Manager') {
                          // create minimal employee record for manager
                          addEmployee({ name: r.name || (r.email || ''), email: r.email, position: 'Manager', department: 'Unassigned' } as any)
                        }
                      });
                      toast({ title: 'Import complete', description: `${good.length} users created.` });
                      setImportOpen(false);
                      setImportRows([]);
                    }} disabled={importRows.length === 0}>Create Users</Button>
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* User Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left">Name</th>
              <th className="px-4 py-2 text-left">Email</th>
              <th className="px-4 py-2 text-left">Role</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedUsers.map(user => (
              <tr key={user.id} className="border-t">
                <td className="px-4 py-2">{user.name}</td>
                <td className="px-4 py-2">{user.email}</td>
                <td className="px-4 py-2">{user.role}</td>
                <td className="px-4 py-2">
                  <span
                    className={`px-2 py-1 rounded text-sm ${
                      user.status === 'active'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {user.status}
                  </span>
                </td>
                <td className="px-4 py-2">
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleEdit(user)}>
                      <EditIcon className="w-4 h-4 mr-1" /> Edit
                    </Button>
                    <Button size="sm" variant={user.status === 'active' ? 'secondary' : 'default'} onClick={() => toggleStatus(user.id)}>
                      {user.status === 'active' ? 'Deactivate' : 'Activate'}
                    </Button>
                    {user.password ? (
                      <Button size="sm" variant="ghost" onClick={() => handleResendInvite(user)}>
                        <Mail className="w-4 h-4 mr-1" /> Resend Invite
                      </Button>
                    ) : (
                      <Button size="sm" variant="ghost" onClick={() => handleSendInvite(user)}>
                        <RefreshCw className="w-4 h-4 mr-1" /> Send Invite
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-4 flex justify-center gap-2">
        {Array.from({ length: Math.ceil(filteredUsers.length / usersPerPage) }, (_, i) => (
          <button
            key={i}
            onClick={() => setCurrentPage(i + 1)}
            className={`px-3 py-1 rounded ${
              currentPage === i + 1 ? 'bg-blue-600 text-white' : 'bg-gray-200'
            }`}
          >
            {i + 1}
          </button>
        ))}
      </div>

      {/* Edit User Dialog (reuses UserForm to match Add UI) */}
      <Dialog open={!!editingUser} onOpenChange={(open) => { if (!open) setEditingUser(null) }}>
        <DialogContent className="sm:max-w-xl md:max-w-2xl lg:max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="w-4 h-4" /> Edit User
            </DialogTitle>
            <DialogDescription>
              Update user information or change account password for Admins.
            </DialogDescription>
          </DialogHeader>
          {editingUser && editingUser.role === 'admin' ? (
            <div className="space-y-4">
              <p className="mb-2">This is a pure Admin account. You can only change the password here.</p>
              <form onSubmit={(e) => {
                e.preventDefault();
                const form = e.target as HTMLFormElement & { newPassword: HTMLInputElement };
                changePassword(editingUser.id, form.newPassword.value || null);
                setEditingUser(null);
              }}>
                <div>
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input id="newPassword" name="newPassword" type="password" />
                </div>
                <div className="flex gap-2 justify-end mt-4">
                  <Button variant="outline" onClick={() => setEditingUser(null)}>Cancel</Button>
                  <Button type="submit">Change Password</Button>
                </div>
              </form>
            </div>
          ) : editingUser ? (
            <UserForm
              defaultValues={{
                name: editingUser.name || '',
                email: editingUser.email,
                role: editingUser.role as any,
              }}
              mode="edit"
              onSave={(data) => {
                updateUser(editingUser.id, { name: data.name, email: data.email, role: data.role as any });
                setEditingUser(null);
              }}
              onCancel={() => setEditingUser(null)}
            />
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  )
}
