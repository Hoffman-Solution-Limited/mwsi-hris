// Canonical roles used across the app
export type CanonicalRole = 'admin' | 'hr' | 'employee' | 'manager' | 'registry' | 'unknown'

// Map different role strings from various contexts to canonical roles
export function mapRole(role?: string | null): CanonicalRole {
  if (!role) return 'unknown'
  const r = role.toLowerCase()
  if (r === 'admin' || r === 'administrator') return 'admin'
  if (r === 'hr' || r === 'hr_manager' || r === 'hr_staff') return 'hr'
  if (r === 'employee') return 'employee'
  if (r === 'manager') return 'manager'
  if (r === 'registry' || r === 'registry_manager' || r === 'registry_staff') return 'registry'
  return 'unknown'
}

// Helpers for different user shapes
export const isAuthManager = (user?: { role?: string | null } | null) => mapRole(user?.role ?? undefined) === 'manager'
export const isAuthEmployee = (user?: { role?: string | null } | null) => mapRole(user?.role ?? undefined) === 'employee'

// AppUser (UsersContext) uses different casing; these helpers accept AppUser-like objects
export const isAppUserAdmin = (u?: { role?: string | null } | null) => mapRole(u?.role ?? undefined) === 'admin'
export const isAppUserEmployee = (u?: { role?: string | null } | null) => mapRole(u?.role ?? undefined) === 'employee'

// Registry manager acts like a manager for workflow approvals
export const isRegistryManager = (u?: { role?: string | null } | null) => (u?.role ?? '').toLowerCase() === 'registry_manager'
export const isRegistryStaff = (u?: { role?: string | null } | null) => (u?.role ?? '').toLowerCase() === 'registry_staff'

export default { mapRole, isAuthManager, isAuthEmployee, isAppUserAdmin, isAppUserEmployee, isRegistryManager, isRegistryStaff }
