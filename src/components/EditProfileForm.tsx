import React from "react"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useSystemCatalog } from "@/contexts/SystemCatalogContext"

type ProfileFormData = {
  name: string
  email: string
  phone?: string
  position: string
  department: string
  gender?: 'male' | 'female' | 'other'
  employmentType?: string
  staffNumber?: string
  nationalId?: string
  kraPin?: string
  children?: string
  workCounty?: string
  homeCounty?: string
  postalAddress?: string
  postalCode?: string
  stationName?: string
  skillLevel?: string
  company?: string
  dateOfBirth?: string
  hireDate?: string
  emergencyContact?: string
  salary?: number
  status?: 'active' | 'inactive' | 'terminated'
}

export function EditProfileForm({ defaultValues, onSave }: { 
  defaultValues: ProfileFormData
  onSave: (data: ProfileFormData) => void
}) {
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<ProfileFormData>({
    defaultValues,
  })
  const { designations, skillLevels, stations } = useSystemCatalog()

  const watchedGender = watch("gender")
  const watchedEmploymentType = watch("employmentType")
  const watchedStatus = watch("status")

  return (
    <ScrollArea className="h-[600px] pr-4">
      <form onSubmit={handleSubmit(onSave)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
            
            <div>
              <Label htmlFor="name">Full Name *</Label>
              <Input id="name" {...register("name", { required: "Name is required" })} />
              {errors.name && <p className="text-destructive text-sm">{errors.name.message}</p>}
            </div>

            <div>
              <Label htmlFor="email">Email *</Label>
              <Input id="email" type="email" {...register("email", { required: "Email is required" })} />
              {errors.email && <p className="text-destructive text-sm">{errors.email.message}</p>}
            </div>

            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" {...register("phone")} />
            </div>

            <div>
              <Label htmlFor="gender">Gender *</Label>
              <Select value={watchedGender} onValueChange={(value: 'male' | 'female' | 'other') => setValue("gender", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="dateOfBirth">Date of Birth *</Label>
              <Input id="dateOfBirth" type="date" {...register("dateOfBirth", { required: "Date of birth is required" })} />
              {errors.dateOfBirth && <p className="text-destructive text-sm">{errors.dateOfBirth.message}</p>}
            </div>

            <div>
              <Label htmlFor="nationalId">National ID</Label>
              <Input id="nationalId" {...register("nationalId")} />
            </div>

            <div>
              <Label htmlFor="kraPin">KRA PIN</Label>
              <Input id="kraPin" {...register("kraPin")} />
            </div>

            <div>
              <Label htmlFor="children">Children</Label>
              <Input id="children" type="number" {...register("children")} />
            </div>

            <div>
              <Label htmlFor="emergencyContact">Emergency Contact</Label>
              <Input id="emergencyContact" {...register("emergencyContact")} />
            </div>
          </div>

          {/* Employment Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-4">Employment Information</h3>

            <div>
              <Label htmlFor="position">Position *</Label>
              <Select value={watch("position")} onValueChange={(value) => setValue("position", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select position" />
                </SelectTrigger>
                <SelectContent>
                  {designations.map((d) => (
                    <SelectItem key={d} value={d}>{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.position && <p className="text-destructive text-sm">{errors.position.message}</p>}
            </div>

            <div>
              <Label htmlFor="department">Department *</Label>
              <Input id="department" {...register("department", { required: "Department is required" })} />
              {errors.department && <p className="text-destructive text-sm">{errors.department.message}</p>}
            </div>

            <div>
              <Label htmlFor="employmentType">Employment Type</Label>
              <Select value={watchedEmploymentType} onValueChange={(value) => setValue("employmentType", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select employment type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Permanent">Permanent</SelectItem>
                  <SelectItem value="Contract">Contract</SelectItem>
                  <SelectItem value="Temporary">Temporary</SelectItem>
                  <SelectItem value="Internship">Internship</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="staffNumber">Staff Number</Label>
              <Input id="staffNumber" {...register("staffNumber")} />
            </div>

            <div>
              <Label htmlFor="hireDate">Date of Joining</Label>
              <Input id="hireDate" type="date" {...register("hireDate")} />
            </div>

            <div>
              <Label htmlFor="salary">Salary</Label>
              <Input id="salary" type="number" {...register("salary")} />
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={watchedStatus} onValueChange={(value: 'active' | 'inactive' | 'terminated') => setValue("status", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="terminated">Terminated</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="company">Company</Label>
              <Input id="company" {...register("company")} defaultValue="Ministry of Water, Sanitation and Irrigation" />
            </div>

            <div>
              <Label htmlFor="skillLevel">Skill Level</Label>
              <Select value={watch("skillLevel")} onValueChange={(value) => setValue("skillLevel", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select skill level" />
                </SelectTrigger>
                <SelectContent>
                  {skillLevels.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="stationName">Station Name</Label>
              <Select value={watch("stationName")} onValueChange={(value) => setValue("stationName", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select station" />
                </SelectTrigger>
                <SelectContent>
                  {stations.map((st) => (
                    <SelectItem key={st} value={st}>{st}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Address Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
          <div>
            <Label htmlFor="workCounty">Work County</Label>
            <Input id="workCounty" {...register("workCounty")} />
          </div>

          <div>
            <Label htmlFor="homeCounty">Home County</Label>
            <Input id="homeCounty" {...register("homeCounty")} />
          </div>

          <div>
            <Label htmlFor="postalAddress">Postal Address</Label>
            <Input id="postalAddress" {...register("postalAddress")} />
          </div>

          <div>
            <Label htmlFor="postalCode">Postal Code</Label>
            <Input id="postalCode" {...register("postalCode")} />
          </div>
        </div>

        <Button type="submit" className="w-full mt-6">Save Changes</Button>
      </form>
    </ScrollArea>
  )
}
