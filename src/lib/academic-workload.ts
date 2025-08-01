/**
 * Academic Workload Management Module
 * 
 * Provides comprehensive functions for FTE calculations, workload validation,
 * academic year management, and workload distribution algorithms.
 * 
 * Updated for new profile-based database schema.
 */

import { Id } from "../../convex/_generated/dataModel";

// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

export interface LecturerProfile {
  _id: Id<"lecturer_profiles">;
  fullName: string;
  email: string;
  family: string;
  fte: number;
  capacity: number;
  maxTeachingHours: number;
  totalContract: number;
  isActive: boolean;
  organisationId: Id<"organisations">;
  createdAt: number;
  updatedAt: number;
}

export interface Lecturer {
  _id: Id<"lecturers">;
  profileId: Id<"lecturer_profiles">;
  academicYearId: Id<"academic_years">;
  teachingAvailability: number;
  totalAllocated: number;
  allocatedTeachingHours: number;
  allocatedAdminHours: number;
  allocatedResearchHours: number;
  allocatedOtherHours: number;
  team?: string;
  isActive: boolean;
  organisationId: Id<"organisations">;
  createdAt: number;
  updatedAt: number;
}

export interface Module {
  _id: Id<"modules">;
  code: string;
  title: string;
  description?: string;
  credits: number;
  level: number;
  moduleLeaderId?: Id<"lecturer_profiles">;
  defaultTeachingHours: number;
  defaultMarkingHours: number;
  isActive: boolean;
  organisationId: Id<"organisations">;
  createdAt: number;
  updatedAt: number;
}

export interface ModuleIteration {
  _id: Id<"module_iterations">;
  moduleId: Id<"modules">;
  academicYearId: Id<"academic_years">;
  semester: string;
  year: number;
  assignedLecturerIds: string[];
  assignedStatus: string;
  isActive: boolean;
  organisationId: Id<"organisations">;
  createdAt: number;
  updatedAt: number;
}

export interface ModuleAllocation {
  _id: Id<"module_allocations">;
  moduleIterationId: Id<"module_iterations">;
  lecturerId: Id<"lecturers">;
  allocationTypeId?: Id<"allocation_types">;
  teachingHours: number;
  markingHours: number;
  isActive: boolean;
  organisationId: Id<"organisations">;
  createdAt: number;
  updatedAt: number;
}

export interface AdminAllocation {
  _id: Id<"admin_allocations">;
  lecturerId: Id<"lecturers">;
  academicYearId: Id<"academic_years">;
  categoryId: Id<"admin_allocation_categories">;
  hours: number;
  description: string;
  isActive: boolean;
  organisationId: Id<"organisations">;
  createdAt: number;
  updatedAt: number;
}

export interface AcademicYear {
  _id: Id<"academic_years">;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export interface WorkloadValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  recommendations: string[];
}

export interface FTECalculationResult {
  fte: number;
  totalHours: number;
  breakdown: {
    teaching: number;
    marking: number;
    admin: number;
    research: number;
    other: number;
  };
  utilization: number;
  capacity: number;
}

export interface AcademicYearInfo {
  year: string;
  startDate: Date;
  endDate: Date;
  semesters: {
    autumn: { start: Date; end: Date };
    spring: { start: Date; end: Date };
    summer: { start: Date; end: Date };
  };
  weeks: number;
  teachingWeeks: number;
}

export interface WorkloadDistributionResult {
  lecturerId: Id<"lecturers">;
  profileId: Id<"lecturer_profiles">;
  totalHours: number;
  breakdown: {
    teaching: number;
    marking: number;
    admin: number;
    research: number;
    other: number;
  };
  utilization: number;
  capacity: number;
  isBalanced: boolean;
  recommendations: string[];
}

// ============================================================================
// CONSTANTS AND CONFIGURATION
// ============================================================================

export const ACADEMIC_CONSTANTS = {
  // Standard academic year configuration
  STANDARD_FTE_HOURS: 1650, // Standard full-time equivalent hours per year
  MAX_TEACHING_RATIO: 0.6, // Maximum 60% of FTE can be teaching
  MAX_MARKING_RATIO: 0.2, // Maximum 20% of FTE can be marking
  MIN_CPD_HOURS: 40, // Minimum CPD hours per year
  MAX_LEADERSHIP_RATIO: 0.3, // Maximum 30% of FTE can be leadership
  MAX_ADMIN_RATIO: 0.4, // Maximum 40% of FTE can be administrative
  
  // Academic year structure
  AUTUMN_SEMESTER_START: 9, // September
  SPRING_SEMESTER_START: 1, // January
  SUMMER_SEMESTER_START: 5, // May
  
  // Teaching week configuration
  TEACHING_WEEKS_PER_SEMESTER: 12,
  ASSESSMENT_WEEKS_PER_SEMESTER: 3,
  
  // Workload thresholds
  OVERLOAD_THRESHOLD: 0.95, // 95% utilization triggers overload warning
  UNDERLOAD_THRESHOLD: 0.7, // Below 70% utilization triggers underload warning
  CRITICAL_OVERLOAD: 1.1, // 110% utilization triggers critical overload
  
  // Validation rules
  MIN_CREDITS: 10,
  MAX_CREDITS: 60,
  MIN_LEVEL: 3, // Undergraduate level 3
  MAX_LEVEL: 7, // Postgraduate level 7
} as const;

// ============================================================================
// FTE CALCULATION FUNCTIONS
// ============================================================================

/**
 * Calculate FTE (Full Time Equivalent) based on contract hours
 * @param contractHours - Total contracted hours per year
 * @param standardFTEHours - Standard FTE hours (default: 1650)
 * @returns FTE value (0.0 to 1.0+)
 */
export function calculateFTE(
  contractHours: number,
  standardFTEHours: number = ACADEMIC_CONSTANTS.STANDARD_FTE_HOURS
): number {
  if (standardFTEHours <= 0) {
    throw new Error("Standard FTE hours must be greater than 0");
  }
  
  return contractHours / standardFTEHours;
}

/**
 * Calculate total workload hours from various allocations
 * Updated for new schema structure
 * @param allocations - Array of module allocations
 * @param adminAllocations - Array of administrative allocations
 * @returns Total hours breakdown
 */
export function calculateTotalWorkloadHours(
  allocations: ModuleAllocation[],
  adminAllocations: AdminAllocation[] = []
): {
  teaching: number;
  marking: number;
  admin: number;
  research: number;
  other: number;
  total: number;
} {
  const workload = {
    teaching: 0,
    marking: 0,
    admin: 0,
    research: 0,
    other: 0,
    total: 0,
  };

  // Sum up module allocation hours
  for (const allocation of allocations) {
    workload.teaching += allocation.teachingHours || 0;
    workload.marking += allocation.markingHours || 0;
  }

  // Sum up administrative allocation hours
  for (const adminAlloc of adminAllocations) {
    workload.admin += adminAlloc.hours || 0;
  }

  workload.total = workload.teaching + workload.marking + workload.admin + 
                   workload.research + workload.other;

  return workload;
}

/**
 * Calculate comprehensive FTE breakdown for a lecturer
 * Updated for profile-based schema
 * @param lecturer - Lecturer data
 * @param profile - Lecturer profile data
 * @param allocations - Module allocations for the lecturer
 * @param adminAllocations - Administrative allocations for the lecturer
 * @returns Detailed FTE calculation result
 */
export function calculateLecturerFTE(
  lecturer: Lecturer,
  profile: LecturerProfile,
  allocations: ModuleAllocation[],
  adminAllocations: AdminAllocation[] = []
): FTECalculationResult {
  const workload = calculateTotalWorkloadHours(allocations, adminAllocations);
  const fte = calculateFTE(workload.total);
  const totalContract = profile.totalContract || lecturer.totalAllocated;
  const utilization = totalContract > 0 ? workload.total / totalContract : 0;
  const capacity = totalContract - workload.total;

  return {
    fte,
    totalHours: workload.total,
    breakdown: workload,
    utilization,
    capacity,
  };
}

/**
 * Calculate workload utilization percentage
 * @param allocatedHours - Total allocated hours
 * @param contractHours - Total contract hours
 * @returns Utilization percentage (0-100+)
 */
export function calculateUtilization(
  allocatedHours: number,
  contractHours: number
): number {
  if (contractHours <= 0) {
    return 0;
  }
  
  return (allocatedHours / contractHours) * 100;
}

// ============================================================================
// WORKLOAD VALIDATION RULES AND BUSINESS LOGIC
// ============================================================================

/**
 * Validate lecturer workload against academic standards
 * Updated for profile-based schema
 * @param lecturer - Lecturer data
 * @param profile - Lecturer profile data
 * @param allocations - Module allocations
 * @param adminAllocations - Administrative allocations
 * @returns Validation result with errors, warnings, and recommendations
 */
export function validateLecturerWorkload(
  lecturer: Lecturer,
  profile: LecturerProfile,
  allocations: ModuleAllocation[],
  adminAllocations: AdminAllocation[] = []
): WorkloadValidationResult {
  const result: WorkloadValidationResult = {
    isValid: true,
    errors: [],
    warnings: [],
    recommendations: [],
  };

  const fteResult = calculateLecturerFTE(lecturer, profile, allocations, adminAllocations);
  const workload = fteResult.breakdown;
  const totalContract = profile.totalContract;

  // Check for critical overload
  if (fteResult.utilization > ACADEMIC_CONSTANTS.CRITICAL_OVERLOAD) {
    result.isValid = false;
    result.errors.push(
      `Critical overload: ${(fteResult.utilization * 100).toFixed(1)}% utilization exceeds ${ACADEMIC_CONSTANTS.CRITICAL_OVERLOAD * 100}%`
    );
  }

  // Check for overload warning
  if (fteResult.utilization > ACADEMIC_CONSTANTS.OVERLOAD_THRESHOLD) {
    result.warnings.push(
      `High utilization: ${(fteResult.utilization * 100).toFixed(1)}% utilization exceeds ${ACADEMIC_CONSTANTS.OVERLOAD_THRESHOLD * 100}%`
    );
  }

  // Check for underload
  if (fteResult.utilization < ACADEMIC_CONSTANTS.UNDERLOAD_THRESHOLD) {
    result.warnings.push(
      `Low utilization: ${(fteResult.utilization * 100).toFixed(1)}% utilization below ${ACADEMIC_CONSTANTS.UNDERLOAD_THRESHOLD * 100}%`
    );
  }

  // Validate teaching ratio
  if (totalContract > 0) {
    const teachingRatio = workload.teaching / totalContract;
    if (teachingRatio > ACADEMIC_CONSTANTS.MAX_TEACHING_RATIO) {
      result.errors.push(
        `Teaching hours (${workload.teaching}) exceed maximum ratio of ${ACADEMIC_CONSTANTS.MAX_TEACHING_RATIO * 100}%`
      );
      result.isValid = false;
    }

    // Validate marking ratio
    const markingRatio = workload.marking / totalContract;
    if (markingRatio > ACADEMIC_CONSTANTS.MAX_MARKING_RATIO) {
      result.errors.push(
        `Marking hours (${workload.marking}) exceed maximum ratio of ${ACADEMIC_CONSTANTS.MAX_MARKING_RATIO * 100}%`
      );
      result.isValid = false;
    }

    // Validate admin ratio
    const adminRatio = workload.admin / totalContract;
    if (adminRatio > ACADEMIC_CONSTANTS.MAX_ADMIN_RATIO) {
      result.errors.push(
        `Administrative hours (${workload.admin}) exceed maximum ratio of ${ACADEMIC_CONSTANTS.MAX_ADMIN_RATIO * 100}%`
      );
      result.isValid = false;
    }
  }

  // Generate recommendations
  if (fteResult.utilization > ACADEMIC_CONSTANTS.OVERLOAD_THRESHOLD) {
    result.recommendations.push(
      "Consider redistributing workload or reducing teaching commitments"
    );
  }

  if (fteResult.utilization < ACADEMIC_CONSTANTS.UNDERLOAD_THRESHOLD) {
    result.recommendations.push(
      "Consider additional teaching or administrative responsibilities"
    );
  }

  return result;
}

/**
 * Validate module data against academic standards
 * Updated for new schema
 * @param module - Module data
 * @returns Validation result
 */
export function validateModule(module: Module): WorkloadValidationResult {
  const result: WorkloadValidationResult = {
    isValid: true,
    errors: [],
    warnings: [],
    recommendations: [],
  };

  // Validate credits
  if (module.credits < ACADEMIC_CONSTANTS.MIN_CREDITS) {
    result.errors.push(
      `Credits (${module.credits}) below minimum of ${ACADEMIC_CONSTANTS.MIN_CREDITS}`
    );
    result.isValid = false;
  }

  if (module.credits > ACADEMIC_CONSTANTS.MAX_CREDITS) {
    result.errors.push(
      `Credits (${module.credits}) exceed maximum of ${ACADEMIC_CONSTANTS.MAX_CREDITS}`
    );
    result.isValid = false;
  }

  // Validate academic level
  if (module.level < ACADEMIC_CONSTANTS.MIN_LEVEL) {
    result.errors.push(
      `Academic level (${module.level}) below minimum of ${ACADEMIC_CONSTANTS.MIN_LEVEL}`
    );
    result.isValid = false;
  }

  if (module.level > ACADEMIC_CONSTANTS.MAX_LEVEL) {
    result.errors.push(
      `Academic level (${module.level}) exceed maximum of ${ACADEMIC_CONSTANTS.MAX_LEVEL}`
    );
    result.isValid = false;
  }

  // Validate teaching hours
  if (module.defaultTeachingHours <= 0) {
    result.errors.push("Default teaching hours must be greater than 0");
    result.isValid = false;
  }

  if (module.defaultMarkingHours < 0) {
    result.errors.push("Default marking hours cannot be negative");
    result.isValid = false;
  }

  // Validate module code format (basic validation)
  if (!module.code || module.code.trim().length === 0) {
    result.errors.push("Module code is required");
    result.isValid = false;
  }

  if (!module.title || module.title.trim().length === 0) {
    result.errors.push("Module title is required");
    result.isValid = false;
  }

  return result;
}

/**
 * Validate module allocation against lecturer capacity
 * Updated for new schema
 * @param allocation - Module allocation
 * @param lecturer - Lecturer data
 * @param profile - Lecturer profile data
 * @param existingAllocations - Existing allocations for the lecturer
 * @returns Validation result
 */
export function validateModuleAllocation(
  allocation: ModuleAllocation,
  lecturer: Lecturer,
  profile: LecturerProfile,
  existingAllocations: ModuleAllocation[] = []
): WorkloadValidationResult {
  const result: WorkloadValidationResult = {
    isValid: true,
    errors: [],
    warnings: [],
    recommendations: [],
  };

  // Calculate total hours for this allocation
  const allocationHours = allocation.teachingHours + allocation.markingHours;

  // Check if allocation exceeds lecturer capacity
  if (allocationHours > profile.capacity) {
    result.errors.push(
      `Allocation hours (${allocationHours}) exceed lecturer capacity (${profile.capacity})`
    );
    result.isValid = false;
  }

  // Check if allocation exceeds teaching availability
  if (allocation.teachingHours > lecturer.teachingAvailability) {
    result.errors.push(
      `Teaching hours (${allocation.teachingHours}) exceed teaching availability (${lecturer.teachingAvailability})`
    );
    result.isValid = false;
  }

  // Simulate adding this allocation to existing workload
  const simulatedAllocations = [...existingAllocations, allocation];
  const fteResult = calculateLecturerFTE(lecturer, profile, simulatedAllocations);

  // Check for overload after allocation
  if (fteResult.utilization > ACADEMIC_CONSTANTS.OVERLOAD_THRESHOLD) {
    result.warnings.push(
      `Allocation would result in ${(fteResult.utilization * 100).toFixed(1)}% utilization`
    );
  }

  return result;
}

// ============================================================================
// ACADEMIC YEAR CALCULATION FUNCTIONS
// ============================================================================

/**
 * Get current academic year information
 * @param referenceDate - Reference date (defaults to current date)
 * @returns Academic year information
 */
export function getCurrentAcademicYear(referenceDate: Date = new Date()): AcademicYearInfo {
  const currentYear = referenceDate.getFullYear();
  const currentMonth = referenceDate.getMonth() + 1; // getMonth() returns 0-11

  // Academic year typically runs from September to August
  let academicYear: string;
  if (currentMonth >= ACADEMIC_CONSTANTS.AUTUMN_SEMESTER_START) {
    // Current year to next year (e.g., 2024-25)
    academicYear = `${currentYear}-${(currentYear + 1).toString().slice(-2)}`;
  } else {
    // Previous year to current year (e.g., 2023-24)
    academicYear = `${currentYear - 1}-${currentYear.toString().slice(-2)}`;
  }

  return getAcademicYearInfo(academicYear);
}

/**
 * Get academic year information for a specific year
 * @param academicYear - Academic year string (e.g., "2024-25")
 * @returns Academic year information
 */
export function getAcademicYearInfo(academicYear: string): AcademicYearInfo {
  const [startYearStr] = academicYear.split('-');
  const startYear = parseInt(startYearStr, 10);
  
  if (isNaN(startYear)) {
    throw new Error(`Invalid academic year format: ${academicYear}`);
  }

  const startDate = new Date(startYear, ACADEMIC_CONSTANTS.AUTUMN_SEMESTER_START - 1, 1);
  const endDate = new Date(startYear + 1, ACADEMIC_CONSTANTS.AUTUMN_SEMESTER_START - 1, 0);

  const autumnStart = new Date(startYear, ACADEMIC_CONSTANTS.AUTUMN_SEMESTER_START - 1, 1);
  const autumnEnd = new Date(startYear, 11, 31); // December 31st

  const springStart = new Date(startYear + 1, ACADEMIC_CONSTANTS.SPRING_SEMESTER_START - 1, 1);
  const springEnd = new Date(startYear + 1, 4, 30); // April 30th

  const summerStart = new Date(startYear + 1, ACADEMIC_CONSTANTS.SUMMER_SEMESTER_START - 1, 1);
  const summerEnd = new Date(startYear + 1, 7, 31); // August 31st

  const totalWeeks = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 7));
  const teachingWeeks = ACADEMIC_CONSTANTS.TEACHING_WEEKS_PER_SEMESTER * 3;

  return {
    year: academicYear,
    startDate,
    endDate,
    semesters: {
      autumn: { start: autumnStart, end: autumnEnd },
      spring: { start: springStart, end: springEnd },
      summer: { start: summerStart, end: summerEnd },
    },
    weeks: totalWeeks,
    teachingWeeks,
  };
}

/**
 * Get semester information for a given date
 * @param date - Date to check
 * @param academicYear - Academic year (optional, defaults to current)
 * @returns Semester name or null if outside academic year
 */
export function getSemesterForDate(
  date: Date,
  academicYear?: string
): "autumn" | "spring" | "summer" | null {
  const yearInfo = academicYear ? getAcademicYearInfo(academicYear) : getCurrentAcademicYear(date);
  
  if (date >= yearInfo.semesters.autumn.start && date <= yearInfo.semesters.autumn.end) {
    return "autumn";
  } else if (date >= yearInfo.semesters.spring.start && date <= yearInfo.semesters.spring.end) {
    return "spring";
  } else if (date >= yearInfo.semesters.summer.start && date <= yearInfo.semesters.summer.end) {
    return "summer";
  }
  
  return null;
}

/**
 * Calculate teaching weeks for a semester
 * @param semester - Semester name
 * @param academicYear - Academic year
 * @returns Number of teaching weeks
 */
export function getTeachingWeeksForSemester(
  semester: "autumn" | "spring" | "summer",
  academicYear: string
): number {
  const yearInfo = getAcademicYearInfo(academicYear);
  
  switch (semester) {
    case "autumn":
    case "spring":
    case "summer":
      return ACADEMIC_CONSTANTS.TEACHING_WEEKS_PER_SEMESTER;
    default:
      throw new Error(`Invalid semester: ${semester}`);
  }
}

// ============================================================================
// WORKLOAD DISTRIBUTION ALGORITHMS
// ============================================================================

/**
 * Distribute workload across lecturers based on capacity and preferences
 * Updated for profile-based schema
 * @param lecturers - Available lecturers
 * @param profiles - Lecturer profiles
 * @param moduleIterations - Module iterations to allocate
 * @param existingAllocations - Existing allocations
 * @returns Distribution result for each lecturer
 */
export function distributeWorkload(
  lecturers: Lecturer[],
  profiles: LecturerProfile[],
  moduleIterations: ModuleIteration[],
  existingAllocations: ModuleAllocation[] = []
): WorkloadDistributionResult[] {
  const results: WorkloadDistributionResult[] = [];
  
  // Create profile lookup map
  const profileMap = new Map<Id<"lecturer_profiles">, LecturerProfile>();
  for (const profile of profiles) {
    profileMap.set(profile._id, profile);
  }
  
  // Group existing allocations by lecturer
  const allocationsByLecturer = new Map<Id<"lecturers">, ModuleAllocation[]>();
  for (const allocation of existingAllocations) {
    const lecturerAllocations = allocationsByLecturer.get(allocation.lecturerId) || [];
    lecturerAllocations.push(allocation);
    allocationsByLecturer.set(allocation.lecturerId, lecturerAllocations);
  }

  // Calculate current workload for each lecturer
  for (const lecturer of lecturers) {
    const profile = profileMap.get(lecturer.profileId);
    if (!profile) continue;
    
    const currentAllocations = allocationsByLecturer.get(lecturer._id) || [];
    const fteResult = calculateLecturerFTE(lecturer, profile, currentAllocations);
    
    const result: WorkloadDistributionResult = {
      lecturerId: lecturer._id,
      profileId: lecturer.profileId,
      totalHours: fteResult.totalHours,
      breakdown: fteResult.breakdown,
      utilization: fteResult.utilization,
      capacity: fteResult.capacity,
      isBalanced: fteResult.utilization >= ACADEMIC_CONSTANTS.UNDERLOAD_THRESHOLD && 
                  fteResult.utilization <= ACADEMIC_CONSTANTS.OVERLOAD_THRESHOLD,
      recommendations: [],
    };

    // Generate recommendations based on current workload
    if (fteResult.utilization > ACADEMIC_CONSTANTS.OVERLOAD_THRESHOLD) {
      result.recommendations.push("Consider reducing workload to prevent overload");
    } else if (fteResult.utilization < ACADEMIC_CONSTANTS.UNDERLOAD_THRESHOLD) {
      result.recommendations.push("Available for additional teaching responsibilities");
    }

    results.push(result);
  }

  return results;
}



/**
 * Calculate workload balance metrics for a department
 * Updated for profile-based schema
 * @param lecturers - Department lecturers
 * @param profiles - Lecturer profiles
 * @param allocations - All allocations
 * @param adminAllocations - Administrative allocations
 * @returns Balance metrics
 */
export function calculateDepartmentBalance(
  lecturers: Lecturer[],
  profiles: LecturerProfile[],
  allocations: ModuleAllocation[],
  adminAllocations: AdminAllocation[] = []
): {
  averageUtilization: number;
  utilizationVariance: number;
  balanceScore: number;
  overloadedCount: number;
  underloadedCount: number;
  balancedCount: number;
  recommendations: string[];
} {
  const utilizations: number[] = [];
  let overloadedCount = 0;
  let underloadedCount = 0;
  let balancedCount = 0;

  // Create profile lookup map
  const profileMap = new Map<Id<"lecturer_profiles">, LecturerProfile>();
  for (const profile of profiles) {
    profileMap.set(profile._id, profile);
  }

  // Group allocations by lecturer
  const allocationsByLecturer = new Map<Id<"lecturers">, ModuleAllocation[]>();
  for (const allocation of allocations) {
    const lecturerAllocations = allocationsByLecturer.get(allocation.lecturerId) || [];
    lecturerAllocations.push(allocation);
    allocationsByLecturer.set(allocation.lecturerId, lecturerAllocations);
  }

  // Group admin allocations by lecturer
  const adminAllocationsByLecturer = new Map<Id<"lecturers">, AdminAllocation[]>();
  for (const adminAlloc of adminAllocations) {
    const lecturerAdminAllocs = adminAllocationsByLecturer.get(adminAlloc.lecturerId) || [];
    lecturerAdminAllocs.push(adminAlloc);
    adminAllocationsByLecturer.set(adminAlloc.lecturerId, lecturerAdminAllocs);
  }

  // Calculate utilization for each lecturer
  for (const lecturer of lecturers) {
    const profile = profileMap.get(lecturer.profileId);
    if (!profile) continue;
    
    const lecturerAllocations = allocationsByLecturer.get(lecturer._id) || [];
    const lecturerAdminAllocs = adminAllocationsByLecturer.get(lecturer._id) || [];
    const fteResult = calculateLecturerFTE(lecturer, profile, lecturerAllocations, lecturerAdminAllocs);
    
    utilizations.push(fteResult.utilization);

    if (fteResult.utilization > ACADEMIC_CONSTANTS.OVERLOAD_THRESHOLD) {
      overloadedCount++;
    } else if (fteResult.utilization < ACADEMIC_CONSTANTS.UNDERLOAD_THRESHOLD) {
      underloadedCount++;
    } else {
      balancedCount++;
    }
  }

  const averageUtilization = utilizations.length > 0 
    ? utilizations.reduce((sum, util) => sum + util, 0) / utilizations.length 
    : 0;
    
  const variance = utilizations.length > 0 
    ? utilizations.reduce((sum, util) => sum + Math.pow(util - averageUtilization, 2), 0) / utilizations.length 
    : 0;
    
  const balanceScore = Math.sqrt(variance);

  const recommendations: string[] = [];
  
  if (overloadedCount > 0) {
    recommendations.push(`${overloadedCount} lecturer(s) are overloaded - consider redistributing workload`);
  }
  
  if (underloadedCount > 0) {
    recommendations.push(`${underloadedCount} lecturer(s) are underloaded - consider additional responsibilities`);
  }
  
  if (balanceScore > 0.2) {
    recommendations.push("High workload variance detected - consider rebalancing across the department");
  }

  return {
    averageUtilization,
    utilizationVariance: variance,
    balanceScore,
    overloadedCount,
    underloadedCount,
    balancedCount,
    recommendations,
  };
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Format academic year for display
 * @param academicYear - Academic year string
 * @returns Formatted string
 */
export function formatAcademicYear(academicYear: string): string {
  return `Academic Year ${academicYear}`;
}

/**
 * Calculate hours per credit based on module data
 * @param credits - Number of credits
 * @param teachingHours - Teaching hours
 * @param markingHours - Marking hours
 * @returns Hours per credit
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
 * Get lecturer profile by lecturer ID
 * @param lecturerId - Lecturer ID
 * @param lecturers - Array of lecturers
 * @param profiles - Array of profiles
 * @returns Lecturer profile or null
 */
export function getLecturerProfile(
  lecturerId: Id<"lecturers">,
  lecturers: Lecturer[],
  profiles: LecturerProfile[]
): LecturerProfile | null {
  const lecturer = lecturers.find(l => l._id === lecturerId);
  if (!lecturer) return null;
  
  return profiles.find(p => p._id === lecturer.profileId) || null;
}

/**
 * Get lecturer by profile ID
 * @param profileId - Profile ID
 * @param lecturers - Array of lecturers
 * @param academicYearId - Academic year ID (optional)
 * @returns Lecturer or null
 */
export function getLecturerByProfile(
  profileId: Id<"lecturer_profiles">,
  lecturers: Lecturer[],
  academicYearId?: Id<"academic_years">
): Lecturer | null {
  if (academicYearId) {
    return lecturers.find(l => l.profileId === profileId && l.academicYearId === academicYearId) || null;
  }
  
  return lecturers.find(l => l.profileId === profileId) || null;
}

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

const AcademicWorkload = {
  // FTE Calculations
  calculateFTE,
  calculateTotalWorkloadHours,
  calculateLecturerFTE,
  calculateUtilization,
  
  // Validation
  validateLecturerWorkload,
  validateModule,
  validateModuleAllocation,
  
  // Academic Year
  getCurrentAcademicYear,
  getAcademicYearInfo,
  getSemesterForDate,
  getTeachingWeeksForSemester,
  
  // Distribution
  distributeWorkload,
  calculateDepartmentBalance,
  
  // Utilities
  formatAcademicYear,
  calculateHoursPerCredit,
  isValidAcademicYear,
  getLecturerProfile,
  getLecturerByProfile,
  
  // Constants
  ACADEMIC_CONSTANTS,
};

export default AcademicWorkload; 