/**
 * Central calculator module for hour allocations
 *
 * Provides pure functions to compute capacities and availabilities
 * based on teaching and administrative allocations.
 */

/**
 * Calculate the total allocated hours.
 * @param {number} teachingHours - Allocated teaching hours
 * @param {number} adminHours - Allocated administrative hours
 * @returns {number} Total allocated hours
 */
export function totalAllocated(teachingHours: number, adminHours: number): number {
  return teachingHours + adminHours;
}

/**
 * Calculate remaining capacity.
 * capacity = totalContract - totalAllocated
 * @param {number} totalContract - Total contracted hours
 * @param {number} totalAllocated - Total allocated hours
 * @returns {number} Remaining capacity hours
 */
export function capacity(totalContract: number, totalAllocated: number): number {
  return totalContract - totalAllocated;
}

/**
 * Calculate teaching availability.
 * teachingAvailability = maximum teaching hours - allocated teaching hours
 * @param {number} maxTeachingHours - Maximum allowed teaching hours
 * @param {number} teachingHours - Allocated teaching hours
 * @returns {number} Remaining teaching availability hours
 */
export function teachingAvailability(maxTeachingHours: number, teachingHours: number): number {
  return maxTeachingHours - teachingHours;
}

/**
 * Calculate administrative availability.
 * administrativeAvailability = maximum administrative hours - allocated administrative hours
 * @param {number} maxAdminHours - Maximum allowed administrative hours
 * @param {number} adminHours - Allocated administrative hours
 * @returns {number} Remaining administrative availability hours
 */
export function adminAvailability(maxAdminHours: number, adminHours: number): number {
  return maxAdminHours - adminHours;
}

// Example usage:
// import { totalAllocated, capacity, teachingAvailability, adminAvailability } from './calculator';
// const allocatedTeach = 20;
// const allocatedAdmin = 10;
// const totalAlloc = totalAllocated(allocatedTeach, allocatedAdmin); // 30
// const remainCapacity = capacity(40, totalAlloc); // 10
// const teachAvail = teachingAvailability(25, allocatedTeach); // 5
// const adminAvail = adminAvailability(15, allocatedAdmin); // 5

/**
 * Optionally, you can encapsulate into a default export object:
 */
const Calculator = {
  totalAllocated,
  capacity,
  teachingAvailability,
  adminAvailability,
};

export default Calculator; 