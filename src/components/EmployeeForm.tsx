import React from "react"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export type EmployeeFormData = {
  name: string
  email: string
  phone?: string
  position: string
  department: string
}

export function EmployeeForm({
  defaultValues,
  onSave,
  mode = "add", // 🔹 "add" or "edit"
}: {
  defaultValues: EmployeeFormData
  onSave: (data: EmployeeFormData) => void
  mode?: "add" | "edit"
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<EmployeeFormData>({
    defaultValues,
  })

  const handleSave = (data: EmployeeFormData) => {
    onSave(data)
    if (mode === "add") reset() // only reset on add
  }

  return (
    <form onSubmit={handleSubmit(handleSave)} className="space-y-4">
      <div>
        <Label htmlFor="name">Full Name</Label>
        <Input id="name" {...register("name", { required: "Name is required" })} />
        {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
      </div>

      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" {...register("email", { required: "Email is required" })} />
        {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
      </div>

      <div>
        <Label htmlFor="phone">Phone</Label>
        <Input id="phone" {...register("phone")} />
      </div>

      <div>
        <Label htmlFor="position">Position</Label>
        <Input id="position" {...register("position", { required: "Position is required" })} />
        {errors.position && <p className="text-red-500 text-sm">{errors.position.message}</p>}
      </div>

      <div>
        <Label htmlFor="department">Department</Label>
        <Input id="department" {...register("department", { required: "Department is required" })} />
        {errors.department && <p className="text-red-500 text-sm">{errors.department.message}</p>}
      </div>

      <Button type="submit" className="w-full">
        {mode === "add" ? "Save Employee" : "Update Employee"}
      </Button>
    </form>
  )
}
