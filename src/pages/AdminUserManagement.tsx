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
import { Plus, User } from 'lucide-react'
import {UserForm} from '@/components/UserForm'
import { useUsers, AppUser } from '@/contexts/UsersContext'
import { useEmployees } from '@/contexts/EmployeesContext'

export default function AdminUserManagement() {
  const navigate = useNavigate()
  const { users, addUser, toggleStatus, updateUser } = useUsers()
  const { employees } = useEmployees()

  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<'All' | 'Admin' | 'HR' | 'Employee'>('All')
  const [editingUser, setEditingUser] = useState<AppUser | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [addOpen, setAddOpen] = useState(false)
  const usersPerPage = 5

  const filteredUsers = users.filter(user => {
    const matchesSearch =
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase())
    const matchesRole = roleFilter === 'All' || user.role === roleFilter
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
    addUser({ name: data.name, email: data.email, role: data.role as any })
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
            <option value="All">All Roles</option>
            <option value="Admin">Admin</option>
            <option value="HR">HR</option>
            <option value="Employee">Employee</option>
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
                phone: '',
                role: 'Employee',
              }}
              onSave={data => {
                handleAddEmployee({ name: data.name, email: data.email, role: data.role as any })
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
                      user.status === 'Active'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {user.status}
                  </span>
                </td>
                <td className="px-4 py-2 space-x-2">
                  <button
                    onClick={() => toggleStatus(user.id)}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    {user.status === 'Active' ? 'Deactivate' : 'Activate'}
                  </button>
                  <button
                    onClick={() => handleEdit(user)}
                    className="text-sm text-indigo-600 hover:underline"
                  >
                    Edit
                  </button>
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

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Edit User</h2>
            <label className="block mb-2">
              Name:
              <input
                type="text"
                value={editingUser.name}
                onChange={e => setEditingUser({ ...editingUser, name: e.target.value })}
                className="border px-3 py-2 rounded w-full mt-1"
              />
            </label>
            <label className="block mb-2">
              Email:
              <input
                type="email"
                value={editingUser.email}
                onChange={e => setEditingUser({ ...editingUser, email: e.target.value })}
                className="border px-3 py-2 rounded w-full mt-1"
              />
            </label>
            <label className="block mb-4">
              Role:
              <select
                value={editingUser.role}
                onChange={e => setEditingUser({ ...editingUser, role: e.target.value as any })}
                className="border px-3 py-2 rounded w-full mt-1"
              >
                <option value="Admin">Admin</option>
                <option value="HR">HR</option>
                <option value="Employee">Employee</option>
              </select>
            </label>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setEditingUser(null)}
                className="px-4 py-2 bg-gray-300 rounded"
              >
                Cancel
              </button>
              <button
                onClick={() => { if (editingUser) { updateUser(editingUser.id, { name: editingUser.name, email: editingUser.email, role: editingUser.role }); handleSave(); } }}
                className="px-4 py-2 bg-blue-600 text-white rounded"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
