import React from "react"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"

export type UserFormData = {
  name: string
  email: string
  phone?: string
  role: "Admin" | "HR" | "Employee"
}

type UserFormProps = {
  defaultValues: UserFormData
  onSave: (data: UserFormData) => void
  mode?: "add" | "edit"
}

export function UserForm({
  defaultValues,
  onSave,
  mode = "add",
}: UserFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<UserFormData>({
    defaultValues,
  })

  const watchedRole = watch("role")

  function handleSave(data: UserFormData) {
    onSave(data)
  }

  return (
    <ScrollArea className="h-[600px] pr-4">
      <form onSubmit={handleSubmit(handleSave)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-4">
              Personal Information
            </h3>

            <div>
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                {...register("name", { required: "Name is required" })}
              />
              {errors.name && (
                <p className="text-destructive text-sm">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                {...register("email", { required: "Email is required" })}
              />
              {errors.email && (
                <p className="text-destructive text-sm">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" {...register("phone")} />
            </div>

            <div>
              <Label htmlFor="role">Role *</Label>
              <Select
                value={watchedRole}
                onValueChange={(value) =>
                  setValue("role", value as UserFormData["role"])
                }
              >
                <SelectTrigger id="role" className="w-full">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Admin">Admin</SelectItem>
                  <SelectItem value="HR">HR</SelectItem>
                  <SelectItem value="Employee">Employee</SelectItem>
                </SelectContent>
              </Select>
              {errors.role && (
                <p className="text-destructive text-sm">
                  {errors.role.message}
                </p>
              )}
            </div>
          </div>
        </div>

        <Button type="submit" className="w-full mt-6">
          {mode === "add" ? "Save Employee" : "Update Employee"}
        </Button>
      </form>
    </ScrollArea>
  )
}
