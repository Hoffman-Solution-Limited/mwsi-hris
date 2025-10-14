import React, { useEffect } from "react"
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
import { Copy } from "lucide-react"
import { useRoles } from '@/contexts/RolesContext'

export type UserFormData = {
  firstName?: string
  middleName?: string
  lastName?: string
  name?: string
  employeeNumber?: string
  email: string
  role: string
  sendInvite?: boolean
  tempPassword?: string
}

type UserFormProps = {
  defaultValues: UserFormData
  onSave: (data: UserFormData) => void
  mode?: "add" | "edit"
  onCancel?: () => void
  onEmployeeNumberBlur?: (employeeNumber: string) => void
}

export function UserForm({ defaultValues, onSave, mode = "add", onCancel, onEmployeeNumberBlur }: UserFormProps) {
  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting }, reset } = useForm<UserFormData>({ defaultValues })
  const watchedRole = watch('role')
  const watchedInvite = watch('sendInvite')
  const watchedPassword = watch('tempPassword')
  const { roles } = useRoles()

  function generateTempPassword(len = 12) {
    const upper = "ABCDEFGHJKLMNPQRSTUVWXYZ"
    const lower = "abcdefghijkmnopqrstuvwxyz"
    const digits = "23456789"
    const symbols = "!@#$%^&*"
    const all = upper + lower + digits + symbols
    let pwd = ""
    pwd += upper[Math.floor(Math.random() * upper.length)]
    pwd += lower[Math.floor(Math.random() * lower.length)]
    pwd += digits[Math.floor(Math.random() * digits.length)]
    pwd += symbols[Math.floor(Math.random() * symbols.length)]
    for (let i = pwd.length; i < len; i++) pwd += all[Math.floor(Math.random() * all.length)]
    return pwd
  }

  useEffect(() => {
    reset(defaultValues)
  }, [defaultValues, reset])

  useEffect(() => {
    if (watchedInvite && !watchedPassword) setValue('tempPassword', generateTempPassword())
  }, [watchedInvite])

  function handleSave(data: UserFormData) {
    const parts = [data.firstName, data.middleName, data.lastName].filter(Boolean).map(s => String(s).trim())
    const full = parts.join(' ')
    onSave({ ...data, name: data.name || full })
  }

  return (
    <ScrollArea className="h-[600px] px-6">
      <form onSubmit={handleSubmit(handleSave)} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <h3 className="text-lg font-semibold mb-2">Personal Information</h3>
            <p className="text-sm text-muted-foreground mb-4">Provide the user's basic details. Fields marked with * are required.</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <Label htmlFor="firstName">First name {watchedRole !== 'admin' ? '*' : ''}</Label>
                <Input id="firstName" {...register('firstName', watchedRole === 'admin' ? {} : { required: 'First name is required' })} />
                {errors.firstName && <p className="text-destructive text-sm">{(errors as any).firstName?.message}</p>}
              </div>

              <div>
                <Label htmlFor="middleName">Middle name</Label>
                <Input id="middleName" {...register('middleName')} />
              </div>

              <div>
                <Label htmlFor="lastName">Last name {watchedRole !== 'admin' ? '*' : ''}</Label>
                <Input id="lastName" {...register('lastName', watchedRole === 'admin' ? {} : { required: 'Last name is required' })} />
                {errors.lastName && <p className="text-destructive text-sm">{(errors as any).lastName?.message}</p>}
              </div>
            </div>

            <div>
              <Label htmlFor="employeeNumber">Employee Number (optional)</Label>
              <Input
                id="employeeNumber"
                {...register('employeeNumber')}
                placeholder="e.g., EMP-0001"
                onBlur={(e) => {
                  if (onEmployeeNumberBlur) {
                    onEmployeeNumberBlur(e.target.value)
                  }
                }}
              />
            </div>

            <div>
              <Label htmlFor="email">Email *</Label>
              <Input id="email" type="email" {...register('email', { required: 'Email is required', pattern: { value: /[^\s@]+@[^\s@]+\.[^\s@]+/, message: 'Enter a valid email address' } })} />
              {errors.email && <p className="text-destructive text-sm">{(errors as any).email?.message}</p>}
              {!errors.email && <p className="text-xs text-muted-foreground mt-1">We'll use this to send account invitations and notifications.</p>}
            </div>

            <div>
              <Label htmlFor="role">Role *</Label>
              <Select value={watch('role')} onValueChange={(v: string) => setValue('role', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map(r => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}
                </SelectContent>
              </Select>
              {errors.role && <p className="text-destructive text-sm">{(errors as any).role?.message}</p>}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {mode === 'add' && <h3 className="text-lg font-semibold mb-2">Account Setup</h3>}

          {mode === 'add' && (
            <>
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <p className="font-medium">Send invitation email</p>
                  <p className="text-sm text-muted-foreground">Email the user a link to set up their account using a temporary password.</p>
                </div>
                <Switch checked={!!watchedInvite} onCheckedChange={(c) => setValue('sendInvite', c)} />
              </div>

              {watchedInvite && (
                <div>
                  <Label htmlFor="tempPassword">Temporary Password</Label>
                  <div className="flex gap-2">
                    <Input id="tempPassword" value={watchedPassword || ''} readOnly />
                    <Button type="button" variant="outline" onClick={() => setValue('tempPassword', generateTempPassword())}>Regenerate</Button>
                    <Button type="button" variant="secondary" onClick={() => { if (watchedPassword) navigator.clipboard.writeText(watchedPassword) }} className="inline-flex items-center gap-2"><Copy className="h-4 w-4" /> Copy</Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Share this with the user if they don't receive the invite email.</p>
                </div>
              )}
            </>
          )}
        </div>

        <div className="flex flex-col-reverse sm:flex-row gap-3 sm:justify-end mt-6">
          {onCancel && <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>Cancel</Button>}
          <Button type="submit" className="sm:min-w-[160px]" disabled={isSubmitting}>
            {isSubmitting ? <span className="inline-flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" />{mode === 'add' ? 'Saving...' : 'Updating...'}</span> : <span>{mode === 'add' ? 'Save Employee' : 'Update Employee'}</span>}
          </Button>
        </div>
      </form>
    </ScrollArea>
  )
}
