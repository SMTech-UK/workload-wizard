import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

import isDeepEqual from "fast-deep-equal";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function updateSettings<T extends Record<string, any>>(
  prev: T,
  category: keyof T,
  key: string,
  value: any
): T {
  return {
    ...prev,
    [category]: {
      ...prev[category],
      [key]: value,
    },
  };
}

/**
 * Generate contract string (e.g., 1AP, 0.6TA) and total contract hours based on FTE and family.
 * Uses Math.round for all rounding.
 */
export function generateContractAndHours({ fte, family, standardContractHours }: { fte: number; family: string; standardContractHours: number }) {
  const roundedFte = Math.round(fte * 100) / 100;
  const fteStr = Number.isInteger(roundedFte) ? String(roundedFte) : String(roundedFte);
  const familyInitials = getFamilyInitialsForContract(family);
  const contract = `${fteStr}${familyInitials}`;
  const totalContract = Math.round(fte * standardContractHours);
  return { contract, totalContract };
}

/**
 * Calculate max teaching hours and teaching availability.
 * Uses Math.round for all rounding.
 */
export function calculateTeachingHours({ totalContract, family, allocatedTeachingHours = 0 }: { totalContract: number; family: string; allocatedTeachingHours?: number }) {
  const teachingPct = getTeachingPercentage(family);
  const maxTeachingHours = Math.round(totalContract * teachingPct);
  const teachingAvailability = maxTeachingHours - allocatedTeachingHours;
  return { maxTeachingHours, teachingAvailability };
}

/**
 * Deep equality check for objects (uses fast-deep-equal).
 */
export function deepEqual(a: any, b: any) {
  return isDeepEqual(a, b);
}

// These helpers are copied from staff-edit-modal for reuse
function getFamilyInitialsForContract(family: string) {
  const map: Record<string, string> = {
    'Academic Practitioner': 'AP',
    'Teaching Academic': 'TA',
    'Research Academic': 'RA',
  };
  return map[family] || family;
}

function getTeachingPercentage(family: string) {
  switch (family) {
    case 'Research Academic':
      return 0.3;
    case 'Teaching Academic':
      return 0.6;
    case 'Academic Practitioner':
      return 0.8;
    default:
      return 0.6; // fallback
  }
}
