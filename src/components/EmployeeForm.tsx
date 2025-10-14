import React from "react"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useSystemCatalog } from "@/contexts/SystemCatalogContext"
import { KENYA_COUNTIES, KENYA_SUBCOUNTIES } from "@/lib/kenya-admin"
import { useUsers } from "@/contexts/UsersContext"
import { useToast } from '@/hooks/use-toast'
import { Textarea } from "@/components/ui/textarea"

export type EmployeeFormData = {
  firstName: string
  middleName?: string
  surname: string
  name?: string // This will be constructed from the parts
  email: string
  phone?: string
  position: string
  // department removed; use stationName (work station) instead
  gender?: 'male' | 'female' | 'other'
  employmentType?: string
  jobGroup?: string
  engagementType?: string
  ethnicity?: string
  employeeNumber: string
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
  salary?: number
  status?: 'active' | 'inactive' | 'terminated' | 'retired'
  cadre?: 'Support' | 'Technical' | 'Management'
  managerId?: string
  maritalStatus?: 'single' | 'married' | 'divorced' | 'widowed'
  // Next of kin details
  nextOfKinName?: string
  nextOfKinRelationship?: string
  nextOfKinPhone?: string
  nextOfKinEmail?: string
  // Special needs
  hasSpecialNeeds?: boolean
  specialNeedsDescription?: string
  // Address details
  homeSubcounty?: string
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
  const { designations, skillLevels, stations, stationNames, jobGroups, engagementTypes, ethnicities } = useSystemCatalog()
  const designationOptions = designations.map(d => d.value)
  const jobGroupOptions = jobGroups.map(j => j.value)
  const engagementOptions = engagementTypes.map(e => e.value)
  const skillLevelOptions = skillLevels.map(s => s.value)
  const { findByEmail } = useUsers()
  const { users } = useUsers()
  const [managerQuery, setManagerQuery] = React.useState('')
  const [initialisedManager, setInitialisedManager] = React.useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
    setError
  } = useForm<EmployeeFormData>({
    defaultValues: {
      company: "Ministry of Water, Sanitation and Irrigation",
      status: "active",
      employmentType: "Permanent",
      ...defaultValues
    },
  })

  const watchedGender = watch("gender")
  const watchedEmploymentType = watch("employmentType")
  const watchedJobGroup = watch("jobGroup")
  const watchedEngagementType = watch("engagementType")
  const watchedEthnicity = watch("ethnicity")
  const watchedStatus = watch("status")
  const watchedCadre = watch("cadre")
  const watchedStationName = watch("stationName")
  const watchedHasSpecialNeeds = watch("hasSpecialNeeds")
  const { toast } = useToast();

  // Kenyan counties list (47)
  const counties = KENYA_COUNTIES

  // Basic county -> subcounty mapping (expandable). Used by Home subcounty select.
  const subcountyMap: Record<string, string[]> = KENYA_SUBCOUNTIES

  // Phone dial code selection - default to Kenya (+254) regardless of current phone value
  const [phoneDial, setPhoneDial] = React.useState<string>("+254")

  const handleSave = (data: EmployeeFormData) => {
    // Normalize Next of Kin phone to E.164 (+254...) if entered in local format
    const normalizeKinPhone = (raw?: string) => {
      if (!raw) return raw
      const s = String(raw).replace(/\s+/g, '')
      if (/^\+[1-9]\d{6,14}$/.test(s)) return s
      const m = s.match(/^(?:\+?254|0)?(7\d{8}|1\d{8})$/)
      if (m) return `+254${m[1]}`
      return s
    }
    if ((data as any).nextOfKinPhone) {
      ;(data as any).nextOfKinPhone = normalizeKinPhone((data as any).nextOfKinPhone)
    }
    // Required validations for system-selected fields
    if (!data.position) {
      setError("position", { type: "required", message: "Position is required" });
      return;
    }
    if (!data.skillLevel) {
      setError("skillLevel", { type: "required", message: "Skill level is required" });
      return;
    }
    if (!data.stationName) {
      setError("stationName", { type: "required", message: "Station is required" });
      return;
    }
    // If Home County selected, require Home Subcounty
    if (data.homeCounty && !data.homeSubcounty) {
      setError("homeSubcounty" as any, { type: "required", message: "Select a Home Subcounty" } as any);
      return;
    }
    // Enforce mapping: email should ideally exist in system users (created by Admin)
    const u = findByEmail(data.email || '')
    if (!u) {
      // Don't block save outright — confirm with the user so the form doesn't appear to do nothing
      const proceed = window.confirm('No matching user account was found for this email. It is recommended to create the user account first, but do you want to create the employee anyway?');
      if (!proceed) return;
    }
    // If a managerId was chosen, set the manager name from employees or users list
    if (data.managerId) {
      // Try to find manager name from users first
      const managerUser = users.find(u => u.id === data.managerId || u.email === data.managerId)
      if (managerUser && managerUser.name) (data as any).manager = managerUser.name
    }
    // Construct full name
    const fullName = [data.firstName, data.middleName, data.surname].filter(Boolean).join(' ')
    onSave({ ...data, name: fullName })
    if (mode === "add") reset() // only reset on add
  }

  // When validation errors change, scroll to first error and show a toast summary
  React.useEffect(() => {
    const errKeys = Object.keys(errors || {});
    if (errKeys.length === 0) return;
    // find first field element and scroll into view
    const first = errKeys[0];
    const el = document.querySelector(`#${first}`) as HTMLElement | null;
    if (el && typeof el.scrollIntoView === 'function') {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.focus?.();
    }

    // build a compact message
    const msgs = errKeys.map(k => {
      const m = (errors as any)[k]?.message;
      return m ? `${k}: ${m}` : k;
    }).slice(0,5).join('\n');

    toast({ title: 'Fix form errors', description: msgs });
  }, [errors]);

  // Initialize managerQuery from defaultValues (managerId or manager name)
  React.useEffect(() => {
    if (initialisedManager) return
    const mv = (defaultValues as any)?.managerId || (defaultValues as any)?.manager
    if (mv) {
      const str = String(mv).toLowerCase()
      const u = users.find(u => (u.id && u.id.toLowerCase() === str) || (u.email && u.email.toLowerCase() === str) || (u.name && u.name.toLowerCase() === str))
      if (u) setManagerQuery(u.name || u.email || '')
      else setManagerQuery(String(mv))
    }
    setInitialisedManager(true)
  }, [defaultValues, users, initialisedManager])

  return (
    <ScrollArea className="h-[600px] pr-4">
      <form onSubmit={handleSubmit(handleSave)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Personal Information */}
          <div className="space-y-4 rounded-lg border p-4">
            <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
            
            <div>
              <Label htmlFor="employeeNumber">Employee Number *</Label>
              <Input id="employeeNumber" {...register("employeeNumber", { required: "Employee Number is required" })} />
              {errors.employeeNumber && <p className="text-destructive text-sm">{errors.employeeNumber.message}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <Label htmlFor="firstName">First Name *</Label>
                <Input id="firstName" {...register("firstName", { required: "First name is required" })} />
                {errors.firstName && <p className="text-destructive text-sm">{errors.firstName.message}</p>}
              </div>
              <div>
                <Label htmlFor="middleName">Middle Name</Label>
                <Input id="middleName" {...register("middleName")} />
              </div>
              <div>
                <Label htmlFor="surname">Surname *</Label>
                <Input id="surname" {...register("surname", { required: "Surname is required" })} />
                {errors.surname && <p className="text-destructive text-sm">{errors.surname.message}</p>}
              </div>
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
                // Lightweight country list with dial codes and flags
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
              {errors.gender && <p className="text-destructive text-sm">{errors.gender.message}</p>}
            </div>

            <div>
              <Label htmlFor="ethnicity">Ethnicity</Label>
              <Select value={watchedEthnicity} onValueChange={(value) => setValue("ethnicity", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select ethnicity" />
                </SelectTrigger>
                <SelectContent>
                    {ethnicities.map((e) => (
                      <SelectItem key={e.value} value={e.value}>{e.value}</SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="maritalStatus">Marital Status</Label>
              <Select value={watch('maritalStatus') as any} onValueChange={(value: any) => setValue('maritalStatus', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="single">Single</SelectItem>
                  <SelectItem value="married">Married</SelectItem>
                  <SelectItem value="divorced">Divorced</SelectItem>
                  <SelectItem value="widowed">Widowed</SelectItem>
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

            {/* Emergency Contact removed; using Next of Kin section instead */}

            {/* Home address details moved under Personal Information */}
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

            {/* Home Subcounty dropdown dependent on Home County */}
            {(() => {
              const county = watch('homeCounty') || ''
              const subcounty = watch('homeSubcounty')
              const list = subcountyMap[county] || []
              const disabled = !county
              
              // If the form is in edit mode and a subcounty is set,
              // but it's not in the list for the selected county, add it to the list.
              // This handles the initial load where the list might not be ready yet.
              if (mode === 'edit' && subcounty && !list.includes(subcounty)) {
                list.push(subcounty);
              }

              return (
                <div>
                  <Label htmlFor="homeSubcounty">Home Subcounty</Label>
                  <Select value={subcounty || ''} onValueChange={(v) => setValue('homeSubcounty', v)}>
                    <SelectTrigger disabled={disabled}>
                      <SelectValue placeholder={disabled ? 'Select county first' : 'Select subcounty'} />
                    </SelectTrigger>
                    <SelectContent>
                      {list.map(sc => (<SelectItem key={sc} value={sc}>{sc}</SelectItem>))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">{disabled ? 'Select Home County to enable subcounty list' : 'Choose the subcounty where the employee resides'}</p>
                  {(errors as any).homeSubcounty && <p className="text-destructive text-sm">{(errors as any).homeSubcounty?.message}</p>}
                </div>
              )
            })()}

            <div>
              <Label htmlFor="postalAddress">Postal Address</Label>
              <Input id="postalAddress" {...register("postalAddress")} />
            </div>

            <div>
              <Label htmlFor="postalCode">Postal Code</Label>
              <Input id="postalCode" {...register("postalCode")} />
            </div>
          </div>

          {/* Employment Information */}
          <div className="space-y-4 rounded-lg border p-4">
            <h3 className="text-lg font-semibold mb-4">Employment Information</h3>

            <div>
              <Label htmlFor="cadre">Cadre *</Label>
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
              {errors.cadre && <p className="text-destructive text-sm">{(errors as any).cadre?.message}</p>}
            </div>

            <div>
              <Label htmlFor="position">Position *</Label>
              <Select
                value={watch("position")}
                onValueChange={(value) => setValue("position", value, { shouldValidate: true })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select position" />
                </SelectTrigger>
                <SelectContent>
                  {designationOptions.map((d) => (
                    <SelectItem key={d} value={d}>{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.position && <p className="text-destructive text-sm">{errors.position.message}</p>}
            </div>

            {/* Role selection removed: Admin assigns roles when creating users */}

            <div>
              <Label htmlFor="managerId">Manager</Label>
              <div className="mt-1 space-y-2">
                {/* Visible text input for manager name (autocomplete) */}
                <input
                  className="w-full px-2 py-2 border rounded"
                  placeholder="Type manager name or email..."
                  value={managerQuery}
                  onChange={(e) => setManagerQuery(e.target.value)}
                  onBlur={() => {
                    const q = managerQuery.trim().toLowerCase();
                    if (!q) return;
                    const userMatch = users.find(u => (u.email && u.email.toLowerCase() === q) || (u.name && u.name.toLowerCase() === q));
                    if (userMatch) {
                      setValue('managerId', userMatch.id || userMatch.email || '')
                    }
                  }}
                />

                {/* Select control to explicitly pick manager which also updates query */}
                <Select value={watch('managerId') || ''} onValueChange={(v) => {
                  const val = v === '__none' ? '' : v
                  setValue('managerId', val)
                  const u = users.find(u => u.id === val || u.email === val)
                  setManagerQuery(u ? (u.name || u.email || '') : '')
                }}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="(or pick from list)" />
                  </SelectTrigger>
                  <SelectContent>
                    <div className="p-2">
                      <div className="text-xs text-muted-foreground">Choose from registered managers</div>
                    </div>
                    <SelectItem value="__none">— None —</SelectItem>
                    {users.filter(u => u.role === 'manager' || u.role === 'hr_manager').map(u => (
                      <SelectItem key={u.id} value={u.id}>{u.name || u.email}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="stationName">Work Station *</Label>
              <Select
                value={watchedStationName}
                onValueChange={(value) => setValue("stationName", value, { shouldValidate: true })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Work Station" />
                </SelectTrigger>
                <SelectContent>
                  {stationNames.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.stationName && <p className="text-destructive text-sm">{errors.stationName.message}</p>}
            </div>

            <div>
              <Label htmlFor="employmentType">Employment Type *</Label>
              <Select value={watchedEmploymentType} onValueChange={(value) => setValue("employmentType", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select employment type" />
                </SelectTrigger>
                <SelectContent>
                  {engagementOptions.map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.employmentType && <p className="text-destructive text-sm">{errors.employmentType.message}</p>}
            </div>

            <div>
              <Label htmlFor="jobGroup">Job Group</Label>
              <Select value={watchedJobGroup} onValueChange={(value) => setValue("jobGroup", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select job group" />
                </SelectTrigger>
                <SelectContent>
                  {jobGroupOptions.map((g) => (
                    <SelectItem key={g} value={g}>{g}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

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


            {/* Removed Staff Number for consistency with Employee Number */}

            <div>
              <Label htmlFor="hireDate">Date of Joining *</Label>
              <Input id="hireDate" type="date" {...register("hireDate", { required: "Date of joining is required" })} />
              {errors.hireDate && <p className="text-destructive text-sm">{errors.hireDate.message}</p>}
            </div>

            <div>
              <Label htmlFor="salary">Salary</Label>
              <Input id="salary" type="number" {...register("salary")} />
            </div>

            <div>
              <Label htmlFor="status">Status *</Label>
              <Select value={watchedStatus} onValueChange={(value: 'active' | 'inactive' | 'terminated' | 'retired') => setValue("status", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="terminated">Terminated</SelectItem>
                  <SelectItem value="retired">Retired</SelectItem>
                </SelectContent>
              </Select>
              {errors.status && <p className="text-destructive text-sm">{errors.status.message}</p>}
            </div>

            <div>
              <Label htmlFor="company">Company *</Label>
              <Input id="company" {...register("company", { required: "Company is required" })} />
              {errors.company && <p className="text-destructive text-sm">{errors.company.message}</p>}
            </div>

            <div>
              <Label htmlFor="skillLevel">Skill Level</Label>
              <Select
                value={watch("skillLevel")}
                onValueChange={(value) => setValue("skillLevel", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select skill level" />
                </SelectTrigger>
                <SelectContent>
                  {skillLevelOptions.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.skillLevel && <p className="text-destructive text-sm">{errors.skillLevel.message}</p>}
            </div>
          </div>
        </div>

        {/* Address Information section removed; fields relocated above */}

  {/* Next of Kin */}
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 rounded-lg border p-4">
          <div className="md:col-span-2">
            <h3 className="text-lg font-semibold mb-2">Next of Kin</h3>
            <p className="text-sm text-muted-foreground mb-3">Provide details for the person to contact in case of emergency.</p>
          </div>
          <div>
            <Label htmlFor="nextOfKinName">Full Name</Label>
            <Input id="nextOfKinName" {...register('nextOfKinName')} />
          </div>
          <div>
            <Label htmlFor="nextOfKinRelationship">Relationship</Label>
            <Input id="nextOfKinRelationship" placeholder="e.g., Spouse, Parent, Sibling" {...register('nextOfKinRelationship')} />
          </div>
          <div>
            <Label htmlFor="nextOfKinPhone">Phone</Label>
            <Input id="nextOfKinPhone" placeholder="e.g., +2547XXXXXXXX or 07XXXXXXXX" {...register('nextOfKinPhone', {
              validate: (v) => {
                if (!v) return true
                const s = String(v).replace(/\s+/g, '')
                const e164 = /^\+[1-9]\d{6,14}$/
                const keLocal = /^(?:\+?254|0)?(7\d{8}|1\d{8})$/
                return (e164.test(s) || keLocal.test(s)) || 'Enter a valid phone (e.g., +2547XXXXXXXX or 07XXXXXXXX)'
              }
            })} />
            {(errors as any).nextOfKinPhone && <p className="text-destructive text-sm">{(errors as any).nextOfKinPhone?.message}</p>}
          </div>
          <div>
            <Label htmlFor="nextOfKinEmail">Email</Label>
            <Input id="nextOfKinEmail" type="email" placeholder="name@example.com" {...register('nextOfKinEmail', {
              validate: (v) => {
                if (!v) return true
                const email = /[^\s@]+@[^\s@]+\.[^\s@]+/
                return email.test(v) || 'Enter a valid email address'
              }
            })} />
            {(errors as any).nextOfKinEmail && <p className="text-destructive text-sm">{(errors as any).nextOfKinEmail?.message}</p>}
          </div>
        </div>

  {/* Special Needs */}
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 rounded-lg border p-4">
          <div className="md:col-span-2">
            <h3 className="text-lg font-semibold mb-2">Special Needs</h3>
            <p className="text-sm text-muted-foreground mb-3">Indicate if the employee has any special needs for accommodation.</p>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="hasSpecialNeeds" {...register('hasSpecialNeeds')} />
            <Label htmlFor="hasSpecialNeeds">Employee has special needs</Label>
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="specialNeedsDescription">Details</Label>
            <Textarea id="specialNeedsDescription" rows={3} placeholder="Specify the nature of special needs or required accommodations" {...register('specialNeedsDescription', {
              validate: (v) => {
                const has = watchedHasSpecialNeeds;
                if (has && !v) return 'Please describe the special needs.'
                return true
              }
            })} />
            {(errors as any).specialNeedsDescription && (<p className="text-destructive text-sm">{(errors as any).specialNeedsDescription?.message}</p>)}
          </div>
        </div>

        <Button type="submit" className="w-full mt-6">
          {mode === "add" ? "Save Employee" : "Update Employee"}
        </Button>
      </form>
    </ScrollArea>
  )
}
