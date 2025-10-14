import React, { useMemo, useState } from 'react'
import { useEmployees } from '@/contexts/EmployeesContext'
import { useUsers } from '@/contexts/UsersContext'
import { mapRole } from '@/lib/roles'
import { getWorkStation } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { useNavigate } from 'react-router-dom'

// Minimal Collapse component fallback if not available in the UI kit
// The project has small UI components; if Collapse exists use it, otherwise a simple inline implementation
const SimpleCollapse: React.FC<{ open: boolean, children: React.ReactNode }> = ({ open, children }) => (
  <div className={open ? 'mt-3' : 'hidden'}>{children}</div>
)

// TreeItem: renders a node (manager or employee). If node has children it becomes expandable.
const TreeItem: React.FC<{
  node: any
  childrenNodes?: any[]
  depth?: number
  onOpenProfile: (n: any) => void
}> = ({ node, childrenNodes = [], depth = 0, onOpenProfile }) => {
  const [open, setOpen] = useState(false)
  const safeChildren = Array.isArray(childrenNodes) ? childrenNodes : []
  const hasChildren = safeChildren.length > 0

  return (
    <div className="pl-" style={{ paddingLeft: depth * 12 }}>
      <div className="flex items-center justify-between py-2 px-1 rounded hover:bg-muted/50">
        <div className="flex items-center gap-3">
          {hasChildren ? (
            <button
              aria-expanded={open}
              onClick={() => setOpen(v => !v)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  setOpen(v => !v)
                }
              }}
              className="w-6 h-6 inline-flex items-center justify-center rounded text-sm"
              title={open ? 'Collapse' : 'Expand'}
            >
              {open ? '▾' : '▸'}
            </button>
          ) : (
            <div className="w-6" />
          )}

          <button onClick={() => onOpenProfile(node)} className="flex items-center gap-3 text-left">
            <Avatar className={`${depth === 0 ? 'w-10 h-10' : 'w-8 h-8'}`}>
              <AvatarImage src={node.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(node.name || node.email || 'EMP')}`} />
              <AvatarFallback>{(node.name || node.email || '').split(' ').map((s: string) => s[0]).join('')}</AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium">{node.name}</div>
              <div className="text-xs text-muted-foreground">{node.position || getWorkStation(node) || ''}</div>
            </div>
          </button>
        </div>

  <div className="text-sm text-muted-foreground">{hasChildren ? safeChildren.length + ' reports' : ''}</div>
      </div>

      {hasChildren && (
        <SimpleCollapse open={open}>
          <div className="ml-4 border-l pl-3">
            {safeChildren.map(c => (
              <TreeItem key={c.id} node={c} childrenNodes={c.children} depth={depth + 1} onOpenProfile={onOpenProfile} />
            ))}
          </div>
        </SimpleCollapse>
      )}
    </div>
  )
}

// Note: ErrorBoundary removed — use global error handling or add a small wrapper if needed.

const ManagersOverview: React.FC = () => {
  const { employees } = useEmployees()
  const { users } = useUsers()
  const navigate = useNavigate()
  React.useEffect(() => {
    // eslint-disable-next-line no-console
    console.log('ManagersOverview mounted')
  }, [])
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})
  const [query, setQuery] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogEmployee, setDialogEmployee] = useState<any | null>(null)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(8)

  // Build managers list from users with role Manager OR employees whose position contains 'manager'
  const managers = useMemo(() => {
  const mgrUsers = users.filter(u => mapRole(u.role) === 'manager' || (u.role || '').toLowerCase() === 'registry_manager')

    // Also include managers detected from employee records (position contains 'manager') that might not have a user
    const mgrFromEmployees = employees
      .filter(e => /manager/i.test(e.position || ''))
      .map(e => ({ id: e.id, name: e.name, email: e.email, position: e.position, department: e.department, avatar: e.avatar }))

    // Combine by unique name/email/id (prefer users)
    const combined: any[] = []
    const seen = new Set<string>()

    mgrUsers.forEach(u => {
      const key = u.email || u.id || u.name
      if (!seen.has(key)) {
        seen.add(key)
        combined.push({ id: u.id, name: u.name || u.email, email: u.email, position: 'Manager', department: 'Unassigned', avatar: u.avatar })
      }
    })

    mgrFromEmployees.forEach(e => {
      const key = e.email || e.id || e.name
      if (!seen.has(key)) {
        seen.add(key)
        combined.push({ id: e.id, name: e.name, email: e.email, position: e.position, department: e.department, avatar: e.avatar })
      }
    })

    return combined
  }, [users, employees])

  const reportsFor = (m: any) => {
    // Prefer managerId when available, otherwise fall back to stored manager name/email
    return employees.filter(e => (m.id && e.managerId === m.id) || e.manager === m.name || e.manager === m.email)
  }

  // Build a tree structure for a manager: include direct reports and optionally nested reports
  // Fully recursive tree builder: attach children for any employee that has reports.
  const buildTree = (rootManager: any) => {
    const mapById = new Map(employees.map((e: any) => [e.id, { ...e }]))

    // helper: find children of a given node (by id/name/email)
    const findChildren = (node: any) => {
      return employees
        .filter((e: any) => e.managerId === node.id || e.manager === node.name || e.manager === node.email)
        .map((e: any) => ({ ...e }))
    }

    const attachRecursively = (nodes: any[]) => {
      return nodes.map(n => {
        const children = findChildren(n)
        if (children.length) {
          n.children = attachRecursively(children)
        }
        return n
      })
    }

    const direct = findChildren(rootManager)
    return attachRecursively(direct)
  }

  const openProfile = (m: any) => {
    // If the clicked node is an employee (has id in employees list) open the quick dialog. Otherwise fallback to navigation
    const asEmployee = employees.find(e => e.id === m.id || e.email === m.email || e.name === m.name)
    if (asEmployee) {
      // Prefer any avatar present on the user's account (users context)
      const matchedUser = users.find(u => u.id === asEmployee.id || u.email === asEmployee.email || u.name === asEmployee.name)
      const payload = { ...asEmployee, ...(matchedUser ? { userAvatar: matchedUser.avatar } : {}) }
      setDialogEmployee(payload)
      setDialogOpen(true)
      return
    }

    // Fallback: try to navigate to employee profile if we can find a related employee record
    const byManagerId = employees.find(e => e.managerId === m.id || e.manager === m.name || e.manager === m.email)
    if (byManagerId) {
      navigate(`/employees/${byManagerId.id}`)
      return
    }

    navigate('/employees')
  }

  // Filter managers/employees by search query (search name, email, position, department)
  const matchesQuery = (item: any, q: string) => {
    if (!q) return true
    const s = q.toLowerCase()
    return (item.name || '').toLowerCase().includes(s) || (item.email || '').toLowerCase().includes(s) || (item.position || '').toLowerCase().includes(s) || (item.department || '').toLowerCase().includes(s)
  }

  return (
    <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Managers Overview</h1>
          <p className="text-muted-foreground">View all managers, their department/workstation and direct reports.</p>
        </div>

        <div className="flex items-center gap-3">
          <Input placeholder="Search managers or employees" value={query} onChange={(e:any) => setQuery(e.target.value)} />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Managers</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {managers.length === 0 && <div className="text-sm text-muted-foreground">No managers found.</div>}

            {(() => {
              const filteredManagers = managers.filter(m => matchesQuery(m, query) || buildTree(m).some((r:any) => matchesQuery(r, query) || (r.children || []).some((c:any)=>matchesQuery(c, query))))
              const total = filteredManagers.length
              const totalPages = Math.max(1, Math.ceil(total / pageSize))
              const current = Math.min(page, totalPages)
              const start = (current - 1) * pageSize
              const pageItems = filteredManagers.slice(start, start + pageSize)

              return pageItems.map((m) => {
                const tree = buildTree(m)
                const key = m.email || m.id || m.name
                return (
                  <div key={key} className="border rounded-md p-4">
                    <TreeItem node={m} childrenNodes={tree.filter((n:any)=>matchesQuery(n, query) || (n.children||[]).some((c:any)=>matchesQuery(c, query)))} onOpenProfile={openProfile} />
                    {tree.length === 0 && <div className="mt-3 text-sm text-muted-foreground">No direct reports found for this manager.</div>}
                  </div>
                )
              })
            })()}
          </CardContent>
          <div className="flex items-center justify-between px-4 pb-4">
            {(() => {
              const filteredManagers = managers.filter(m => matchesQuery(m, query) || buildTree(m).some((r:any) => matchesQuery(r, query) || (r.children || []).some((c:any)=>matchesQuery(c, query))))
              const total = filteredManagers.length
              const totalPages = Math.max(1, Math.ceil(total / pageSize))
              const current = Math.min(page, totalPages)
              return (
                <>
                  <div className="text-sm text-muted-foreground">Page {current} of {totalPages} — {total} managers</div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}>Prev</Button>
                    <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages}>Next</Button>
                    <select className="ml-2 rounded border px-2 py-1" value={pageSize} onChange={(e:any) => { setPageSize(Number(e.target.value)); setPage(1) }}>
                      <option value={5}>5</option>
                      <option value={8}>8</option>
                      <option value={12}>12</option>
                      <option value={20}>20</option>
                    </select>
                  </div>
                </>
              )
            })()}
          </div>
        </Card>

        {/* Quick profile dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Employee details</DialogTitle>
            </DialogHeader>
            {dialogEmployee ? (
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <Avatar className="w-20 h-20">
                    <AvatarImage src={dialogEmployee.avatar || dialogEmployee.userAvatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(dialogEmployee.name || dialogEmployee.email)}`} />
                    <AvatarFallback className="text-xl">{(dialogEmployee.name || '').split(' ').map((s:any)=>s[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="text-xl font-semibold">{dialogEmployee.name}</div>
                    <div className="text-sm text-muted-foreground">{dialogEmployee.position || '—'} • {getWorkStation(dialogEmployee) || '—'}</div>
                    <div className="mt-2 text-sm"><strong>Email:</strong> {dialogEmployee.email || '—'}</div>
                    {dialogEmployee.phone && <div className="text-sm"><strong>Phone:</strong> {dialogEmployee.phone}</div>}
                    {dialogEmployee.hireDate && <div className="text-sm"><strong>Hired:</strong> {dialogEmployee.hireDate}</div>}
                  </div>
                </div>
                {dialogEmployee.notes && (
                  <div>
                    <div className="text-sm text-muted-foreground">Notes</div>
                    <div className="mt-1 text-sm">{dialogEmployee.notes}</div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">No employee selected.</div>
            )}
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="ghost">Close</Button>
              </DialogClose>
              <Button onClick={() => { if (dialogEmployee) navigate(`/employees/${dialogEmployee.id}`) }}>Open full profile</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
  )
}

export default ManagersOverview
