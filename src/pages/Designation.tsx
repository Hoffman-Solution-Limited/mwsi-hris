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
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { mockEmployees } from "@/data/mockData"
import { useSystemCatalog } from "@/contexts/SystemCatalogContext"
import { useEmployees } from "@/contexts/EmployeesContext"


// --- Types ---
type Designation = {
  id: string
  name: string
  employeeCount: number
}

export const DesignationPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("")
  const [newDesignation, setNewDesignation] = useState("")
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editingKey, setEditingKey] = useState<string | null>(null)
  const [editingValue, setEditingValue] = useState("")
  const { designations, addDesignation, editDesignation } = useSystemCatalog()
  const { renameDesignationAcrossEmployees } = useEmployees()

  // 🔹 Build list with counts from mock employees for display
  const allDesignations: Designation[] = useMemo(() => {
    const counts: Record<string, number> = {}
    mockEmployees.forEach((emp) => {
      const pos = emp.position || "Unassigned"
      counts[pos] = (counts[pos] || 0) + 1
    })
    return designations.map((item, index) => ({
      id: `sys-${index + 1}`,
      name: item.value,
      employeeCount: counts[item.value] || 0,
    }))
  }, [designations])

  // 🔹 Filter by search
  const filteredDesignations = allDesignations.filter((d) =>
    d.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // 🔹 Add new designation (starts with 0 employees)
  const handleAddDesignation = () => {
    if (!newDesignation.trim()) return
    addDesignation(newDesignation.trim())
    setNewDesignation("")
    setIsAddOpen(false)
  }

  const openEdit = (value: string) => {
    setEditingKey(value)
    setEditingValue(value)
    setIsEditOpen(true)
  }

  const handleSaveEdit = () => {
    if (!editingKey) return
    const next = editingValue.trim()
    if (!next || next === editingKey) {
      setIsEditOpen(false)
      return
    }
    editDesignation(editingKey, next)
    try { renameDesignationAcrossEmployees?.(editingKey, next) } catch {}
    setIsEditOpen(false)
    setEditingKey(null)
    setEditingValue("")
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold mb-2">Designations</h1>
          <p className="text-muted-foreground">
            Manage employee designations and view employee counts
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>

          {/* Add Designation Dialog */}
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Designation
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Designation</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input placeholder="Enter designation name..." value={newDesignation} onChange={(e) => setNewDesignation(e.target.value)} />
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
                </DialogClose>
                <Button onClick={handleAddDesignation}>Save</Button>
              </DialogFooter>
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
              placeholder="Search designations..."
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
          Showing {filteredDesignations.length} of {allDesignations.length} designations
        </p>
      </div>

      {/* Designation List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <List className="w-4 h-4" /> Designation List
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="data-table w-full">
              <thead>
                <tr>
                  <th>Designation</th>
                  <th>Employee Count</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDesignations.map((d) => (
                  <tr key={d.id}>
                    <td>{d.name}</td>
                    <td>{d.employeeCount}</td>
                    <td>
                      <Badge variant={d.employeeCount > 0 ? "default" : "secondary"}>
                        {d.employeeCount > 0 ? "Active" : "Vacant"}
                      </Badge>
                    </td>
                    <td className="flex gap-2">
                      <Button size="sm" variant="ghost" onClick={() => openEdit(d.name)}>Edit</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      {/* Edit Dialog for designation */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Designation</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input value={editingValue} onChange={(e) => setEditingValue(e.target.value)} />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
            </DialogClose>
            <Button onClick={handleSaveEdit}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
