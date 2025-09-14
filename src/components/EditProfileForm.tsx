import React from "react"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type ProfileFormData = {
  name: string
  email: string
  phone?: string
  position: string
  department: string
}

export function EditProfileForm({ defaultValues, onSave }: { 
  defaultValues: ProfileFormData
  onSave: (data: ProfileFormData) => void
}) {
  const { register, handleSubmit, formState: { errors } } = useForm<ProfileFormData>({
    defaultValues,
  })

  return (
    <form onSubmit={handleSubmit(onSave)} className="space-y-4">
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
        <Input id="position" {...register("position")} />
      </div>

      <div>
        <Label htmlFor="department">Department</Label>
        <Input id="department" {...register("department")} />
      </div>

      <Button type="submit" className="w-full">Save Changes</Button>
    </form>
  )
}
