import React, { useState, useMemo } from "react"
import { Search, Plus, Download, List } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import CatalogEditDialog from "@/components/ui/CatalogEditDialog"
import { mockEmployees } from "@/data/mockData"
import { useSystemCatalog } from "@/contexts/SystemCatalogContext"
import { useEmployees } from "@/contexts/EmployeesContext"

// --- Types ---
type Skill = {
  id: string
  name: string
  employeeCount: number
  active: boolean
}

export const SkillsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("")
  const [newSkill, setNewSkill] = useState("")
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editingSkill, setEditingSkill] = useState<string | null>(null)
  const { skillLevels, addSkillLevel, editSkillLevel, deactivateSkillLevel, reactivateSkillLevel, removeSkillLevel } = useSystemCatalog()
  const { renameSkillLevelAcrossEmployees } = useEmployees()

  // 🔹 Build list with counts from mock employees for display
  const allSkills: Skill[] = useMemo(() => {
    const counts: Record<string, number> = {}
    mockEmployees.forEach((emp) => {
      const level = emp.skillLevel || "Unassigned"
      counts[level] = (counts[level] || 0) + 1
    })
    return skillLevels.map((item, index) => ({
      id: `sys-skill-${index + 1}`,
      name: item.value,
      employeeCount: counts[item.value] || 0,
      active: item.active,
    }))
  }, [skillLevels])

  // 🔹 Filter by search
  const filteredSkills = allSkills.filter((s) =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // 🔹 Add new skill (starts with 0 employees)
  const handleAddSkill = () => {
    if (!newSkill.trim()) return
    addSkillLevel(newSkill.trim())
    setNewSkill("")
    setIsAddOpen(false)
  }

  // 🔹 Edit flow using Dialog
  const openEditDialog = (name: string) => {
    setEditingSkill(name)
    setIsEditOpen(true)
  }

  const handleSaveEdit = () => {
    // handled in shared dialog via onSave
  }

  const handleToggleActive = (name: string, active: boolean) => {
    if (active) reactivateSkillLevel(name)
    else deactivateSkillLevel(name)
  }

  const handleDeleteSkill = (name: string, count: number) => {
    if (count > 0) {
      alert('Cannot delete a skill level that has employees assigned. Deactivate instead.')
      return
    }
    removeSkillLevel(name)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold mb-2">Skills Level</h1>
          <p className="text-muted-foreground">Manage employee skills level and view employee counts</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>

          {/* Add Skill Dialog (shared) */}
          <CatalogEditDialog
            open={isAddOpen}
            onOpenChange={setIsAddOpen}
            title="Add New Skill Level"
            addLabel="Add Skill Level"
            items={skillLevels}
            initialValue={""}
            onAdd={(v) => { addSkillLevel(v) }}
          />
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-6">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search skills level..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
          </div>
        </CardContent>
      </Card>

      {/* Results Summary */}
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">Showing {filteredSkills.length} of {allSkills.length} skills levels</p>
      </div>

      {/* Skills List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><List className="w-4 h-4" /> Skills Level List</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="data-table w-full">
              <thead>
                <tr>
                  <th>Skill Level</th>
                  <th>Employee Count</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSkills.map((s) => (
                  <tr key={s.id}>
                    <td>{s.name}</td>
                    <td>{s.employeeCount}</td>
                    <td>
                      <Badge variant={s.active ? (s.employeeCount > 0 ? "default" : "secondary") : "outline"}>
                        {s.active ? (s.employeeCount > 0 ? "Active" : "Unassigned") : "Inactive"}
                      </Badge>
                    </td>
                    <td className="flex items-center gap-2">
                      <Button size="sm" variant="ghost" onClick={() => openEditDialog(s.name)}>Edit</Button>
                      <Button size="sm" variant="ghost" onClick={() => handleToggleActive(s.name, !s.active)}>{s.active ? 'Deactivate' : 'Reactivate'}</Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDeleteSkill(s.name, s.employeeCount)}>Delete</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog (shared) */}
      <CatalogEditDialog
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        title={editingSkill ? `Edit Skill Level: ${editingSkill}` : 'Edit Skill Level'}
        initialValue={editingSkill || ''}
        items={skillLevels}
        canDelete={true}
        onSave={(oldV, newV) => {
          if (oldV === newV) return
          editSkillLevel(oldV, newV)
          try { renameSkillLevelAcrossEmployees?.(oldV, newV) } catch {}
          setEditingSkill(null)
        }}
        onDelete={(v) => {
          const s = allSkills.find(x => x.name === v)
          handleDeleteSkill(v, s?.employeeCount || 0)
        }}
        onToggleActive={(v, next) => {
          if (next) reactivateSkillLevel(v)
          else deactivateSkillLevel(v)
        }}
      />
    </div>
  )
}
