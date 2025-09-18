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
import { Loader2 } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { useEffect } from "react"
import { Copy } from "lucide-react"

export type UserFormData = {
  name: string
  email: string
  phone?: string
  role: "Admin" | "HR" | "Employee"
  sendInvite?: boolean
  tempPassword?: string
}

type UserFormProps = {
  defaultValues: UserFormData
  onSave: (data: UserFormData) => void
  mode?: "add" | "edit"
  onCancel?: () => void
}

export function UserForm({
  defaultValues,
  onSave,
  mode = "add",
  onCancel,
}: UserFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<UserFormData>({
    defaultValues,
  })

  const watchedRole = watch("role")
  const watchedInvite = watch("sendInvite")
  const watchedPassword = watch("tempPassword")

  function handleSave(data: UserFormData) {
    onSave(data)
  }

  function generateTempPassword(len = 12) {
    const upper = "ABCDEFGHJKLMNPQRSTUVWXYZ"
    const lower = "abcdefghijkmnopqrstuvwxyz"
    const digits = "23456789"
    const symbols = "!@#$%^&*"
    const all = upper + lower + digits + symbols
    let pwd = ""
    // Guarantee at least one of each major set
    pwd += upper[Math.floor(Math.random() * upper.length)]
    pwd += lower[Math.floor(Math.random() * lower.length)]
    pwd += digits[Math.floor(Math.random() * digits.length)]
    pwd += symbols[Math.floor(Math.random() * symbols.length)]
    for (let i = pwd.length; i < len; i++) {
      pwd += all[Math.floor(Math.random() * all.length)]
    }
    return pwd
  }

  useEffect(() => {
    if (watchedInvite && !watchedPassword) {
      setValue("tempPassword", generateTempPassword())
    }
  }, [watchedInvite])

  return (
    <ScrollArea className="h-[600px] pr-4">
      <form onSubmit={handleSubmit(handleSave)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-2">
              Personal Information
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Provide the user's basic details. Fields marked with * are required.
            </p>

            <div>
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                placeholder="e.g., Jane Doe"
                disabled={isSubmitting}
                {...register("name", { required: "Name is required" })}
              />
              {errors.name && (
                <p className="text-destructive text-sm">
                  {errors.name.message}
                </p>
              )}
              {!errors.name && (
                <p className="text-xs text-muted-foreground mt-1">Enter the full legal name as it appears on records.</p>
              )}
            </div>

            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@company.com"
                disabled={isSubmitting}
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /[^\s@]+@[^\s@]+\.[^\s@]+/,
                    message: "Enter a valid email address",
                  },
                })}
              />
              {errors.email && (
                <p className="text-destructive text-sm">
                  {errors.email.message}
                </p>
              )}
              {!errors.email && (
                <p className="text-xs text-muted-foreground mt-1">We'll use this to send account invitations and notifications.</p>
              )}
            </div>

            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                placeholder="e.g., +254 712 345 678"
                disabled={isSubmitting}
                {...register("phone", {
                  pattern: {
                    value: /^[+()\d\s-]{7,}$/,
                    message: "Enter a valid phone number",
                  },
                })}
              />
              {errors.phone && (
                <p className="text-destructive text-sm">{errors.phone.message}</p>
              )}
              {!errors.phone && (
                <p className="text-xs text-muted-foreground mt-1">Optional. Include country code for external numbers.</p>
              )}
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
              {!errors.role && (
                <p className="text-xs text-muted-foreground mt-1">Choose the minimum required role for this user.</p>
              )}
            </div>
          </div>
        </div>

        {/* Account Setup */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold mb-2">Account Setup</h3>
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <p className="font-medium">Send invitation email</p>
              <p className="text-sm text-muted-foreground">Email the user a link to set up their account using a temporary password.</p>
            </div>
            <Switch
              checked={!!watchedInvite}
              onCheckedChange={(checked) => setValue("sendInvite", checked)}
            />
          </div>

          {watchedInvite && (
            <div>
              <Label htmlFor="tempPassword">Temporary Password</Label>
              <div className="flex gap-2">
                <Input
                  id="tempPassword"
                  value={watchedPassword || ""}
                  readOnly
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setValue("tempPassword", generateTempPassword())}
                >
                  Regenerate
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    if (watchedPassword) navigator.clipboard.writeText(watchedPassword)
                  }}
                  className="inline-flex items-center gap-2"
                >
                  <Copy className="h-4 w-4" /> Copy
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Share this with the user if they don't receive the invite email.</p>
            </div>
          )}
        </div>

        <div className="flex flex-col-reverse sm:flex-row gap-3 sm:justify-end mt-6">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
              Cancel
            </Button>
          )}
          <Button type="submit" className="sm:min-w-[160px]" disabled={isSubmitting}>
            {isSubmitting ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                {mode === "add" ? "Saving..." : "Updating..."}
              </span>
            ) : (
              <span>{mode === "add" ? "Save Employee" : "Update Employee"}</span>
            )}
          </Button>
        </div>
      </form>
    </ScrollArea>
  )
}
