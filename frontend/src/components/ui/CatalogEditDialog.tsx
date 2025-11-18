import React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"

type Item = { value: string; active?: boolean }

export default function CatalogEditDialog<T extends Item>({
  open,
  onOpenChange,
  title,
  addLabel = "Add",
  initialValue = "",
  items = [],
  onAdd,
  onSave,
  onDelete,
  onToggleActive,
  canDelete = true,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  title: string
  addLabel?: string
  initialValue?: string
  items?: T[]
  onAdd?: (value: string) => void
  onSave?: (oldValue: string, newValue: string) => void
  onDelete?: (value: string) => void
  onToggleActive?: (value: string, active: boolean) => void
  canDelete?: boolean
}) {
  const [value, setValue] = React.useState(initialValue)
  const [mode, setMode] = React.useState<'add' | 'edit'>(() => (initialValue ? 'edit' : 'add'))
  const [editingKey, setEditingKey] = React.useState<string | null>(initialValue || null)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    setValue(initialValue || '')
    setEditingKey(initialValue || null)
    setMode(initialValue ? 'edit' : 'add')
    setError(null)
  }, [initialValue, open])

  const isDuplicate = (v: string) => {
    const normalized = v.trim().toLowerCase()
    if (!normalized) return false
    return items.some((it) => it.value.trim().toLowerCase() === normalized && it.value !== editingKey)
  }

  const handleSave = () => {
    const next = value.trim()
    if (!next) {
      setError('Name is required')
      return
    }
    if (isDuplicate(next)) {
      setError('An item with this name already exists')
      return
    }
    setError(null)
    if (mode === 'add') {
      onAdd?.(next)
      onOpenChange(false)
      setValue('')
    } else if (mode === 'edit' && editingKey) {
      onSave?.(editingKey, next)
      onOpenChange(false)
    }
  }

  const handleDelete = () => {
    if (!editingKey) return
    if (!canDelete) {
      setError('Cannot delete item while it has assigned employees. Deactivate instead.')
      return
    }
    if (!window.confirm(`Delete ${editingKey}? This action cannot be undone.`)) return
    onDelete?.(editingKey)
    onOpenChange(false)
  }

  const handleToggle = () => {
    if (!editingKey || !onToggleActive) return
    const it = items.find(i => i.value === editingKey)
    const nextActive = !(it?.active ?? true)
    const confirmMsg = nextActive ? `Reactivate ${editingKey}?` : `Deactivate ${editingKey}?`
    if (!window.confirm(confirmMsg)) return
    onToggleActive(editingKey, nextActive)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        {/* Consumers may render their own trigger; keep this for compatibility */}
        <span />
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Input value={value} onChange={(e) => setValue(e.target.value)} />
          {error && <p className="text-destructive text-sm">{error}</p>}
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          </DialogClose>
          <div className="flex items-center gap-2">
            {mode === 'edit' && (
              <>
                <Button variant="ghost" onClick={handleToggle}>{/* label will be dynamic via confirm */}Toggle Active</Button>
                <Button variant="destructive" onClick={handleDelete}>Delete</Button>
              </>
            )}
            <Button onClick={handleSave}>{mode === 'add' ? addLabel : 'Save'}</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
