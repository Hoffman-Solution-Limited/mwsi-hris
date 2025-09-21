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
  cadre?: 'Support' | 'Technical' | 'Management'
}

export function EditProfileForm({ defaultValues, onSave }: { 
  defaultValues: ProfileFormData
  onSave: (data: ProfileFormData) => void
}) {
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<ProfileFormData>({
    defaultValues,
  })
  const { designations, skillLevels, stations } = useSystemCatalog()

  // Kenyan counties list (47)
  const counties = [
    "Mombasa","Kwale","Kilifi","Tana River","Lamu","Taita-Taveta",
    "Garissa","Wajir","Mandera","Marsabit","Isiolo","Meru","Tharaka-Nithi",
    "Embu","Kitui","Machakos","Makueni","Nyandarua","Nyeri","Kirinyaga",
    "Murang'a","Kiambu","Turkana","West Pokot","Samburu","Trans Nzoia",
    "Uasin Gishu","Elgeyo-Marakwet","Nandi","Baringo","Laikipia","Nakuru",
    "Narok","Kajiado","Kericho","Bomet","Kakamega","Vihiga","Bungoma",
    "Busia","Siaya","Kisumu","Homa Bay","Migori","Kisii","Nyamira",
    "Nairobi"
  ]

  // Phone dial code selection - default to Kenya (+254) regardless of current phone value
  const [phoneDial, setPhoneDial] = React.useState<string>("+254")

  const watchedGender = watch("gender")
  const watchedEmploymentType = watch("employmentType")
  const watchedStatus = watch("status")
  const watchedCadre = watch("cadre")

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
              {/* Hidden input holds the composed E.164 value for validation and submission */}
              <input
                type="hidden"
                id="phone"
                {...register("phone", {
                  validate: (v) => {
                    if (!v) return true
                    const e164 = /^\+[1-9]\d{6,14}$/
                    return e164.test(v) || "Enter a valid phone in international format"
                  },
                })}
              />
              {(() => {
                const countries = [
                  { code: 'KE', name: 'Kenya', dial: '+254', flag: '🇰🇪' },
                  { code: 'UG', name: 'Uganda', dial: '+256', flag: '🇺🇬' },
                  { code: 'TZ', name: 'Tanzania', dial: '+255', flag: '🇹🇿' },
                  { code: 'RW', name: 'Rwanda', dial: '+250', flag: '🇷🇼' },
                  { code: 'SS', name: 'South Sudan', dial: '+211', flag: '🇸🇸' },
                  { code: 'ET', name: 'Ethiopia', dial: '+251', flag: '🇪🇹' },
                  { code: 'SO', name: 'Somalia', dial: '+252', flag: '🇸🇴' },
                  { code: 'BI', name: 'Burundi', dial: '+257', flag: '🇧🇮' },
                  { code: 'US', name: 'United States', dial: '+1', flag: '🇺🇸' },
                  { code: 'GB', name: 'United Kingdom', dial: '+44', flag: '🇬🇧' },
                  { code: 'IN', name: 'India', dial: '+91', flag: '🇮🇳' },
                ]
                const raw = watch('phone') || ''
                const digitsOnly = raw.replace(/\D/g, '')
                const dialDigits = phoneDial.replace('+','')
                const local = digitsOnly.startsWith(dialDigits) ? digitsOnly.slice(dialDigits.length) : digitsOnly
                const setPhone = (dial: string, localDigits: string) => {
                  const digits = (localDigits || '').replace(/\D/g, '')
                  setPhoneDial(dial)
                  setValue('phone', digits ? `${dial}${digits}` : dial, { shouldValidate: true })
                }
                return (
                  <div className="flex gap-2">
                    <Select value={phoneDial} onValueChange={(dial) => setPhone(dial, local)}>
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {countries.map((c) => (
                          <SelectItem key={c.code} value={c.dial}>
                            {c.flag} {c.name} ({c.dial})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      inputMode="numeric"
                      pattern="[0-9]*"
                      placeholder="7XXXXXXXX"
                      value={local}
                      onChange={(e) => setPhone(phoneDial, e.target.value)}
                    />
                  </div>
                )
              })()}
              {errors.phone && <p className="text-destructive text-sm">{errors.phone.message as any}</p>}
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
              <Label htmlFor="cadre">Cadre</Label>
              <Select value={watchedCadre} onValueChange={(value: 'Support' | 'Technical' | 'Management') => setValue("cadre", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select cadre" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Support">Support</SelectItem>
                  <SelectItem value="Technical">Technical</SelectItem>
                  <SelectItem value="Management">Management</SelectItem>
                </SelectContent>
              </Select>
            </div>

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
            <Select value={watch("workCounty")} onValueChange={(value) => setValue("workCounty", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select county" />
              </SelectTrigger>
              <SelectContent>
                {counties.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="homeCounty">Home County</Label>
            <Select value={watch("homeCounty")} onValueChange={(value) => setValue("homeCounty", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select county" />
              </SelectTrigger>
              <SelectContent>
                {counties.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
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
