/**
 * Central calculator module for hour allocations
 *
 * Provides pure functions to compute capacities and availabilities
 * based on teaching and administrative allocations.
 * 
 * Updated for new profile-based database schema.
 */

/**
 * Calculate the total allocated hours.
 * @param {number} teachingHours - Allocated teaching hours
 * @param {number} adminHours - Allocated administrative hours
 * @param {number} researchHours - Allocated research hours
 * @param {number} otherHours - Allocated other hours
 * @returns {number} Total allocated hours
 */
export function totalAllocated(
  teachingHours: number, 
  adminHours: number, 
  researchHours: number = 0, 
  otherHours: number = 0
): number {
  return teachingHours + adminHours + researchHours + otherHours;
}

/**
 * Calculate remaining capacity.
 * capacity = totalContract - totalAllocated
 * @param {number} totalContract - Total contracted hours
 * @param {number} totalAllocated - Total allocated hours
 * @returns {number} Remaining capacity hours
 */
export function capacity(totalContract: number, totalAllocated: number): number {
  return Math.max(0, totalContract - totalAllocated);
}

/**
 * Calculate teaching availability.
 * teachingAvailability = maximum teaching hours - allocated teaching hours
 * @param {number} maxTeachingHours - Maximum allowed teaching hours
 * @param {number} teachingHours - Allocated teaching hours
 * @returns {number} Remaining teaching availability hours
 */
export function teachingAvailability(maxTeachingHours: number, teachingHours: number): number {
  return Math.max(0, maxTeachingHours - teachingHours);
}

/**
 * Calculate administrative availability.
 * administrativeAvailability = maximum administrative hours - allocated administrative hours
 * @param {number} maxAdminHours - Maximum allowed administrative hours
 * @param {number} adminHours - Allocated administrative hours
 * @returns {number} Remaining administrative availability hours
 */
export function adminAvailability(maxAdminHours: number, adminHours: number): number {
  return Math.max(0, maxAdminHours - adminHours);
}

/**
 * Calculate utilization percentage
 * @param {number} allocatedHours - Total allocated hours
 * @param {number} contractHours - Total contract hours
 * @returns {number} Utilization percentage (0-100+)
 */
export function calculateUtilization(allocatedHours: number, contractHours: number): number {
  if (contractHours <= 0) return 0;
  return Math.round((allocatedHours / contractHours) * 100);
}

/**
 * Get utilization status based on percentage
 * @param {number} utilization - Utilization percentage
 * @returns {string} Status string
 */
export function getUtilizationStatus(utilization: number): 'overloaded' | 'near-capacity' | 'good' | 'available' {
  if (utilization > 100) return 'overloaded';
  if (utilization >= 90) return 'near-capacity';
  if (utilization >= 70) return 'good';
  return 'available';
}

/**
 * Calculate FTE (Full Time Equivalent) based on contract hours
 * @param {number} contractHours - Total contracted hours per year
 * @param {number} standardFTEHours - Standard FTE hours (default: 1650)
 * @returns {number} FTE value (0.0 to 1.0+)
 */
export function calculateFTE(
  contractHours: number,
  standardFTEHours: number = 1650
): number {
  if (standardFTEHours <= 0) {
    throw new Error("Standard FTE hours must be greater than 0");
  }
  
  return contractHours / standardFTEHours;
}

/**
 * Calculate hours per credit based on module data
 * @param {number} credits - Number of credits
 * @param {number} teachingHours - Teaching hours
 * @param {number} markingHours - Marking hours
 * @returns {number} Hours per credit
 */
export function calculateHoursPerCredit(
  credits: number,
  teachingHours: number,
  markingHours: number
): number {
  if (credits <= 0) {
    throw new Error("Credits must be greater than 0");
  }
  
  return (teachingHours + markingHours) / credits;
}

/**
 * Calculate workload breakdown percentages
 * @param {number} teachingHours - Teaching hours
 * @param {number} adminHours - Administrative hours
 * @param {number} researchHours - Research hours
 * @param {number} otherHours - Other hours
 * @param {number} totalContract - Total contract hours
 * @returns {object} Breakdown percentages
 */
export function calculateWorkloadBreakdown(
  teachingHours: number,
  adminHours: number,
  researchHours: number,
  otherHours: number,
  totalContract: number
): {
  teaching: number;
  admin: number;
  research: number;
  other: number;
  available: number;
} {
  if (totalContract <= 0) {
    return {
      teaching: 0,
      admin: 0,
      research: 0,
      other: 0,
      available: 0,
    };
  }

  const totalAllocated = teachingHours + adminHours + researchHours + otherHours;
  const available = Math.max(0, totalContract - totalAllocated);

  return {
    teaching: Math.round((teachingHours / totalContract) * 100),
    admin: Math.round((adminHours / totalContract) * 100),
    research: Math.round((researchHours / totalContract) * 100),
    other: Math.round((otherHours / totalContract) * 100),
    available: Math.round((available / totalContract) * 100),
  };
}

/**
 * Validate workload allocation against limits
 * @param {number} teachingHours - Teaching hours
 * @param {number} adminHours - Administrative hours
 * @param {number} researchHours - Research hours
 * @param {number} otherHours - Other hours
 * @param {number} totalContract - Total contract hours
 * @returns {object} Validation result
 */
export function validateWorkloadAllocation(
  teachingHours: number,
  adminHours: number,
  researchHours: number,
  otherHours: number,
  totalContract: number
): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const result = {
    isValid: true,
    errors: [] as string[],
    warnings: [] as string[],
  };

  const totalAllocated = teachingHours + adminHours + researchHours + otherHours;

  // Check for negative hours
  if (teachingHours < 0) {
    result.errors.push("Teaching hours cannot be negative");
    result.isValid = false;
  }
  if (adminHours < 0) {
    result.errors.push("Administrative hours cannot be negative");
    result.isValid = false;
  }
  if (researchHours < 0) {
    result.errors.push("Research hours cannot be negative");
    result.isValid = false;
  }
  if (otherHours < 0) {
    result.errors.push("Other hours cannot be negative");
    result.isValid = false;
  }

  // Check for over-allocation
  if (totalAllocated > totalContract) {
    result.errors.push(`Total allocated hours (${totalAllocated}) exceed contract hours (${totalContract})`);
    result.isValid = false;
  }

  // Check utilization thresholds
  const utilization = calculateUtilization(totalAllocated, totalContract);
  if (utilization > 100) {
    result.errors.push(`Utilization (${utilization}%) exceeds 100%`);
    result.isValid = false;
  } else if (utilization > 95) {
    result.warnings.push(`High utilization: ${utilization}%`);
  } else if (utilization < 70) {
    result.warnings.push(`Low utilization: ${utilization}%`);
  }

  // Check teaching ratio (max 60%)
  const teachingRatio = (teachingHours / totalContract) * 100;
  if (teachingRatio > 60) {
    result.warnings.push(`Teaching ratio (${Math.round(teachingRatio)}%) exceeds recommended 60%`);
  }

  // Check admin ratio (max 40%)
  const adminRatio = (adminHours / totalContract) * 100;
  if (adminRatio > 40) {
    result.warnings.push(`Administrative ratio (${Math.round(adminRatio)}%) exceeds recommended 40%`);
  }

  return result;
}

/**
 * Calculate recommended hours based on FTE and family
 * @param {number} fte - Full Time Equivalent
 * @param {string} family - Academic family (Teaching Academic, Research Academic, Academic Practitioner)
 * @param {number} standardContractHours - Standard contract hours (default: 1650)
 * @returns {object} Recommended hours breakdown
 */
export function calculateRecommendedHours(
  fte: number,
  family: string,
  standardContractHours: number = 1650
): {
  totalContract: number;
  maxTeaching: number;
  maxAdmin: number;
  recommendedResearch: number;
  recommendedOther: number;
} {
  const totalContract = Math.round(fte * standardContractHours);

  // Define ratios based on academic family
  let teachingRatio: number;
  let adminRatio: number;
  let researchRatio: number;

  switch (family) {
    case 'Research Academic':
      teachingRatio = 0.3;
      adminRatio = 0.2;
      researchRatio = 0.4;
      break;
    case 'Teaching Academic':
      teachingRatio = 0.6;
      adminRatio = 0.3;
      researchRatio = 0.1;
      break;
    case 'Academic Practitioner':
      teachingRatio = 0.8;
      adminRatio = 0.2;
      researchRatio = 0.0;
      break;
    default:
      teachingRatio = 0.6;
      adminRatio = 0.3;
      researchRatio = 0.1;
  }

  return {
    totalContract,
    maxTeaching: Math.round(totalContract * teachingRatio),
    maxAdmin: Math.round(totalContract * adminRatio),
    recommendedResearch: Math.round(totalContract * researchRatio),
    recommendedOther: Math.round(totalContract * (1 - teachingRatio - adminRatio - researchRatio)),
  };
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
 * Default export object with all calculator functions
 */
const Calculator = {
  totalAllocated,
  capacity,
  teachingAvailability,
  adminAvailability,
  calculateUtilization,
  getUtilizationStatus,
  calculateFTE,
  calculateHoursPerCredit,
  calculateWorkloadBreakdown,
  validateWorkloadAllocation,
  calculateRecommendedHours,
};

export default Calculator; 