import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Prefer workstation name (stationName) but fall back to department for backward compatibility
export type EmployeeLike = { stationName?: string | null; department?: string | null } & Record<string, any>;

export function getWorkStation(emp?: EmployeeLike): string {
  if (!emp) return 'Unassigned';
  return (emp.stationName && String(emp.stationName).trim()) || (emp.department && String(emp.department).trim()) || 'Unassigned';
}

// Return first and last initials from a full name
export function getInitialsParts(name?: string | null): [string, string?] {
  const n = (name || '').trim().split(/\s+/).filter(Boolean);
  if (n.length === 0) return ['?'];
  if (n.length === 1) return [n[0][0]?.toUpperCase() || '?'];
  const first = n[0][0]?.toUpperCase() || '?';
  const last = n[n.length - 1][0]?.toUpperCase() || '?';
  return [first, last];
}
