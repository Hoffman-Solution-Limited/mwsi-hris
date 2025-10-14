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
