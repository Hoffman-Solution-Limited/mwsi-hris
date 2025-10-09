import React, { useMemo, useState } from 'react'
import { useEmployees } from '@/contexts/EmployeesContext'
import { useUsers } from '@/contexts/UsersContext'
import { mapRole } from '@/lib/roles'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router-dom'

// Minimal Collapse component fallback if not available in the UI kit
// The project has small UI components; if Collapse exists use it, otherwise a simple inline implementation
const SimpleCollapse: React.FC<{ open: boolean, children: React.ReactNode }> = ({ open, children }) => (
  <div className={open ? 'mt-3' : 'hidden'}>{children}</div>
)

const ManagersOverview: React.FC = () => {
  const { employees } = useEmployees()
  const { users } = useUsers()
  const navigate = useNavigate()
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})

  // Build managers list from users with role Manager OR employees whose position contains 'manager'
  const managers = useMemo(() => {
    const mgrUsers = users.filter(u => mapRole(u.role) === 'manager')

    // Also include managers detected from employee records (position contains 'manager') that might not have a user
    const mgrFromEmployees = employees
      .filter(e => /manager/i.test(e.position || ''))
      .map(e => ({ id: e.id, name: e.name, email: e.email, position: e.position, department: e.department }))

    // Combine by unique name/email/id (prefer users)
    const combined: any[] = []
    const seen = new Set<string>()

    mgrUsers.forEach(u => {
      const key = u.email || u.id || u.name
      if (!seen.has(key)) {
        seen.add(key)
        combined.push({ id: u.id, name: u.name || u.email, email: u.email, position: 'Manager', department: 'Unassigned' })
      }
    })

    mgrFromEmployees.forEach(e => {
      const key = e.email || e.id || e.name
      if (!seen.has(key)) {
        seen.add(key)
        combined.push({ id: e.id, name: e.name, email: e.email, position: e.position, department: e.department })
      }
    })

    return combined
  }, [users, employees])

  const reportsFor = (m: any) => {
    // Prefer managerId when available, otherwise fall back to stored manager name/email
    return employees.filter(e => (m.id && e.managerId === m.id) || e.manager === m.name || e.manager === m.email)
  }

  const openProfile = (m: any) => {
    // Try to find an employee record first by managerId (if manager is a user) or by email or name
    const byManagerId = employees.find(e => e.id === m.id || e.managerId === m.id || e.managerId === m.email)
    if (byManagerId) {
      navigate(`/employees/${byManagerId.id}`)
      return
    }

    // Try match by email
    const byEmail = employees.find(e => e.email === m.email)
    if (byEmail) {
      navigate(`/employees/${byEmail.id}`)
      return
    }

    // Try match by name
    const byName = employees.find(e => e.name === m.name)
    if (byName) {
      navigate(`/employees/${byName.id}`)
      return
    }

    // Fallback: open employee directory
    navigate('/employees')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Managers Overview</h1>
        <p className="text-muted-foreground">View all managers, their department/workstation and direct reports.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Managers</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {managers.length === 0 && <div className="text-sm text-muted-foreground">No managers found.</div>}

          {managers.map((m) => {
            const reports = reportsFor(m)
            const key = m.email || m.id || m.name
            const isOpen = !!expanded[key]
            return (
              <div key={key} className="border rounded-md p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button onClick={() => openProfile(m)} className="rounded-full overflow-hidden">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(m.name || m.email || 'MGR')}`} />
                        <AvatarFallback>{(m.name || m.email || '').split(' ').map((s: string) => s[0]).join('')}</AvatarFallback>
                      </Avatar>
                    </button>
                    <div>
                      <div className="font-medium"><button onClick={() => openProfile(m)} className="text-left">{m.name}</button></div>
                      <div className="text-sm text-muted-foreground">{m.department || m.position || '—'}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-sm text-muted-foreground">{reports.length} direct reports</div>
                    <Button variant="ghost" size="sm" onClick={() => setExpanded(prev => ({ ...prev, [key]: !prev[key] }))}>
                      {isOpen ? 'Hide' : 'View'} reports
                    </Button>
                  </div>
                </div>

                <SimpleCollapse open={isOpen}>
                  {reports.length === 0 ? (
                    <div className="mt-3 text-sm text-muted-foreground">No direct reports found for this manager.</div>
                  ) : (
                    <div className="mt-3 space-y-2">
                      {reports.map(r => (
                        <div key={r.id} className="flex items-center gap-3 p-2 rounded hover:bg-muted/50">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={r.avatar} />
                            <AvatarFallback>{r.name.split(' ').map((s:any)=>s[0]).join('')}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{r.name}</div>
                            <div className="text-xs text-muted-foreground">{r.position} • {r.department}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </SimpleCollapse>
              </div>
            )
          })}
        </CardContent>
      </Card>
    </div>
  )
}

export default ManagersOverview
