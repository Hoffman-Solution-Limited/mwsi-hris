import React, { useState, useMemo } from "react"
import { Search, Plus, Download, List } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { mockEmployees } from "@/data/mockData"
import { useSystemCatalog } from "@/contexts/SystemCatalogContext"

// --- Types ---
type Skill = {
  id: string
  name: string
  employeeCount: number
}

export const SkillsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("")
  const [newSkill, setNewSkill] = useState("")
  const { skillLevels, addSkillLevel } = useSystemCatalog()

  // 🔹 Build list with counts from mock employees for display
  const allSkills: Skill[] = useMemo(() => {
    const counts: Record<string, number> = {}
    mockEmployees.forEach((emp) => {
      const level = emp.skillLevel || "Unassigned"
      counts[level] = (counts[level] || 0) + 1
    })
    return skillLevels.map((name, index) => ({
      id: `sys-skill-${index + 1}`,
      name,
      employeeCount: counts[name] || 0,
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
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold mb-2">Skills Level</h1>
          <p className="text-muted-foreground">
            Manage employee skills level and view employee counts
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>

          {/* Add Skill Modal */}
          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Skill Level
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Skill Level</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="Enter skill level name..."
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                />
                <Button onClick={handleAddSkill}>Save</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-6">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search skills level..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Results Summary */}
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          Showing {filteredSkills.length} of {allSkills.length} skills levels
        </p>
      </div>

      {/* Skills List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <List className="w-4 h-4" /> Skills Level List
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="data-table w-full">
              <thead>
                <tr>
                  <th>Skill Level</th>
                  <th>Employee Count</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredSkills.map((s) => (
                  <tr key={s.id}>
                    <td>{s.name}</td>
                    <td>{s.employeeCount}</td>
                    <td>
                      <Badge variant={s.employeeCount > 0 ? "default" : "secondary"}>
                        {s.employeeCount > 0 ? "Active" : "Unassigned"}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
