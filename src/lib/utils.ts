import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import isDeepEqual from "fast-deep-equal";
import type { Id } from "../../convex/_generated/dataModel";

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
 * Format duration in milliseconds to human-readable string
 */
export function formatDuration(ms: number): string {
  if (ms < 0) {
    return `-${formatDuration(Math.abs(ms))}`;
  }
  
  if (ms < 1000) {
    return `${ms}ms`;
  }
  
  if (ms < 60000) {
    return `${(ms / 1000).toFixed(1)}s`;
  }
  
  if (ms < 3600000) {
    return `${(ms / 60000).toFixed(1)}m`;
  }
  
  if (ms < 86400000) {
    return `${(ms / 3600000).toFixed(1)}h`;
  }
  
  return `${(ms / 86400000).toFixed(1)}d`;
}

/**
 * Format decimal value as percentage
 */
export function formatPercentage(value: number): string {
  const percentage = value * 100;
  // Remove .0 for whole numbers
  return percentage % 1 === 0 ? `${percentage}%` : `${percentage.toFixed(1)}%`;
}

/**
 * Format date to readable string
 */
export function formatDate(date: Date | string | number | null | undefined): string {
  if (!date) {
    return 'Invalid Date';
  }
  
  try {
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      return 'Invalid Date';
    }
    return dateObj.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  } catch {
    return 'Invalid Date';
  }
}

/**
 * Format timestamp to readable string with time
 */
export function formatDateTime(date: Date | string | number | null | undefined): string {
  if (!date) {
    return 'Invalid Date';
  }
  
  try {
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      return 'Invalid Date';
    }
    return dateObj.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return 'Invalid Date';
  }
}

/**
 * Debounce function calls
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

/**
 * Throttle function calls
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let lastCall = 0;
  
  return (...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      func(...args);
    }
  };
}

/**
 * Generate contract string (e.g., 1AP, 0.6TA) and total contract hours based on FTE and family.
 * Updated for new profile-based schema.
 */
export function generateContractAndHours({ 
  fte, 
  family, 
  standardContractHours = 1650 
}: { 
  fte: number; 
  family: string; 
  standardContractHours?: number;
}) {
  const roundedFte = Math.round(fte * 100) / 100;
  const fteStr = Number.isInteger(roundedFte) ? String(roundedFte) : String(roundedFte);
  const familyInitials = getFamilyInitialsForContract(family);
  const contract = `${fteStr}${familyInitials}`;
  const totalContract = Math.round(fte * standardContractHours);
  return { contract, totalContract };
}

/**
 * Calculate max teaching hours and teaching availability.
 * Updated for new profile-based schema.
 */
export function calculateTeachingHours({ 
  totalContract, 
  family, 
  allocatedTeachingHours = 0 
}: { 
  totalContract: number; 
  family: string; 
  allocatedTeachingHours?: number;
}) {
  const teachingPct = getTeachingPercentage(family);
  const maxTeachingHours = Math.round(totalContract * teachingPct);
  const teachingAvailability = maxTeachingHours - allocatedTeachingHours;
  return { maxTeachingHours, teachingAvailability };
}

/**
 * Calculate utilization percentage for a lecturer
 * @param allocatedHours - Total allocated hours
 * @param contractHours - Total contract hours
 * @returns Utilization percentage (0-100+)
 */
export function calculateUtilization(allocatedHours: number, contractHours: number): number {
  if (contractHours <= 0) return 0;
  return Math.round((allocatedHours / contractHours) * 100);
}

/**
 * Get utilization status based on percentage
 * @param utilization - Utilization percentage
 * @returns Status string
 */
export function getUtilizationStatus(utilization: number): 'overloaded' | 'near-capacity' | 'good' | 'available' {
  if (utilization > 100) return 'overloaded';
  if (utilization >= 90) return 'near-capacity';
  if (utilization >= 70) return 'good';
  return 'available';
}

/**
 * Validate academic year format
 * @param academicYear - Academic year string to validate
 * @returns True if valid format
 */
export function isValidAcademicYear(academicYear: string): boolean {
  const pattern = /^\d{4}-\d{2}$/;
  if (!pattern.test(academicYear)) {
    return false;
  }
  
  const [startYear, endYear] = academicYear.split('-');
  const start = parseInt(startYear, 10);
  const end = parseInt(endYear, 10);
  
  return end === start + 1;
}

/**
 * Format academic year for display
 * @param academicYear - Academic year string
 * @returns Formatted string
 */
export function formatAcademicYear(academicYear: string): string {
  return `Academic Year ${academicYear}`;
}

/**
 * Get semester label from semester number
 * @param semester - Semester number (1, 2, 3)
 * @returns Semester label
 */
export function getSemesterLabel(semester: string | number): string {
  switch (String(semester)) {
    case "1":
      return "Semester 1";
    case "2":
      return "Semester 2";
    case "3":
      return "Summer";
    default:
      return `Semester ${semester}`;
  }
}

/**
 * Deep equality check for objects (uses fast-deep-equal).
 */
export function deepEqual(a: any, b: any) {
  return isDeepEqual(a, b);
}

/**
 * Generate a unique ID for temporary use
 * @returns Temporary ID string
 */
export function generateTempId(): string {
  return `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Validate email format
 * @param email - Email string to validate
 * @returns True if valid email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Capitalize first letter of each word
 * @param str - String to capitalize
 * @returns Capitalized string
 */
export function capitalizeWords(str: string): string {
  return str.replace(/\b\w/g, (char) => char.toUpperCase());
}

/**
 * Format file size in human readable format
 * @param bytes - File size in bytes
 * @returns Formatted file size string
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Check if a value is a valid ID
 * @param value - Value to check
 * @returns True if valid ID format
 */
export function isValidId(value: any): boolean {
  return typeof value === 'string' && value.length > 0 && value !== 'undefined' && value !== 'null';
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
