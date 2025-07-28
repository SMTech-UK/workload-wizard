/**
 * Academic Workload Management Module
 * 
 * Provides comprehensive functions for FTE calculations, workload validation,
 * academic year management, and workload distribution algorithms.
 * 
 * Based on WorkloadWizard PRD requirements and academic workload standards.
 */

import { Id } from "../../convex/_generated/dataModel";

// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

export interface Lecturer {
  _id: Id<"lecturers">;
  fullName: string;
  email: string;
  contract: string;
  fte: number;
  team: string;
  role: string;
  status: "active" | "inactive";
  totalContract: number;
  maxTeachingHours: number;
  allocatedTeachingHours: number;
  allocatedAdminHours: number;
  capacity: number;
  teachingAvailability: number;
  totalAllocated: number;
  specialism?: string;
}

export interface Module {
  _id: Id<"modules">;
  code: string;
  title: string;
  credits: number;
  level: number;
  moduleLeader: string;
  defaultTeachingHours: number;
  defaultMarkingHours: number;
}

export interface ModuleIteration {
  _id: Id<"module_iterations">;
  module_id: Id<"modules">;
  cohort_id: Id<"cohorts">;
  semester: string;
  sites: string[];
  hours: {
    teaching: number;
    marking: number;
    cpd: number;
    leadership: number;
  };
  assessments: {
    internal: boolean;
    external_examiner: boolean;
    requirements: string;
  };
}

export interface ModuleAllocation {
  _id: Id<"module_allocations">;
  module_iteration_id: Id<"module_iterations">;
  lecturer_id: Id<"lecturers">;
  group: string;
  site: string;
  hours: {
    teaching: number;
    marking: number;
    cpd: number;
    leadership: number;
  };
  notes?: string;
  created_at: number;
  updated_at: number;
}

export interface AdminAllocation {
  _id: Id<"admin_allocations">;
  lecturer_id: Id<"lecturers">;
  academic_year: string;
  category: "leadership" | "research" | "admin" | "other";
  hours: number;
  description: string;
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
    cpd: number;
    leadership: number;
    admin: number;
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
  totalHours: number;
  breakdown: {
    teaching: number;
    marking: number;
    cpd: number;
    leadership: number;
    admin: number;
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
  MIN_LEVEL: 4, // Undergraduate level 4
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
  cpd: number;
  leadership: number;
  admin: number;
  total: number;
} {
  const workload = {
    teaching: 0,
    marking: 0,
    cpd: 0,
    leadership: 0,
    admin: 0,
    total: 0,
  };

  // Sum up module allocation hours
  for (const allocation of allocations) {
    workload.teaching += allocation.hours.teaching || 0;
    workload.marking += allocation.hours.marking || 0;
    workload.cpd += allocation.hours.cpd || 0;
    workload.leadership += allocation.hours.leadership || 0;
  }

  // Sum up administrative allocation hours
  for (const adminAlloc of adminAllocations) {
    workload.admin += adminAlloc.hours || 0;
  }

  workload.total = workload.teaching + workload.marking + workload.cpd + 
                   workload.leadership + workload.admin;

  return workload;
}

/**
 * Calculate comprehensive FTE breakdown for a lecturer
 * @param lecturer - Lecturer data
 * @param allocations - Module allocations for the lecturer
 * @param adminAllocations - Administrative allocations for the lecturer
 * @returns Detailed FTE calculation result
 */
export function calculateLecturerFTE(
  lecturer: Lecturer,
  allocations: ModuleAllocation[],
  adminAllocations: AdminAllocation[] = []
): FTECalculationResult {
  const workload = calculateTotalWorkloadHours(allocations, adminAllocations);
  const fte = calculateFTE(workload.total);
  const utilization = workload.total / lecturer.totalContract;
  const capacity = lecturer.totalContract - workload.total;

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
    throw new Error("Contract hours must be greater than 0");
  }
  
  return (allocatedHours / contractHours) * 100;
}

// ============================================================================
// WORKLOAD VALIDATION RULES AND BUSINESS LOGIC
// ============================================================================

/**
 * Validate lecturer workload against academic standards
 * @param lecturer - Lecturer data
 * @param allocations - Module allocations
 * @param adminAllocations - Administrative allocations
 * @returns Validation result with errors, warnings, and recommendations
 */
export function validateLecturerWorkload(
  lecturer: Lecturer,
  allocations: ModuleAllocation[],
  adminAllocations: AdminAllocation[] = []
): WorkloadValidationResult {
  const result: WorkloadValidationResult = {
    isValid: true,
    errors: [],
    warnings: [],
    recommendations: [],
  };

  const fteResult = calculateLecturerFTE(lecturer, allocations, adminAllocations);
  const workload = fteResult.breakdown;

  // Check for critical overload
  if (fteResult.utilization > ACADEMIC_CONSTANTS.CRITICAL_OVERLOAD) {
    result.isValid = false;
    result.errors.push(
      `Critical overload: ${fteResult.utilization.toFixed(1)}% utilization exceeds ${ACADEMIC_CONSTANTS.CRITICAL_OVERLOAD * 100}%`
    );
  }

  // Check for overload warning
  if (fteResult.utilization > ACADEMIC_CONSTANTS.OVERLOAD_THRESHOLD) {
    result.warnings.push(
      `High utilization: ${fteResult.utilization.toFixed(1)}% utilization exceeds ${ACADEMIC_CONSTANTS.OVERLOAD_THRESHOLD * 100}%`
    );
  }

  // Check for underload
  if (fteResult.utilization < ACADEMIC_CONSTANTS.UNDERLOAD_THRESHOLD) {
    result.warnings.push(
      `Low utilization: ${fteResult.utilization.toFixed(1)}% utilization below ${ACADEMIC_CONSTANTS.UNDERLOAD_THRESHOLD * 100}%`
    );
  }

  // Validate teaching ratio
  const teachingRatio = workload.teaching / lecturer.totalContract;
  if (teachingRatio > ACADEMIC_CONSTANTS.MAX_TEACHING_RATIO) {
    result.errors.push(
      `Teaching hours (${workload.teaching}) exceed maximum ratio of ${ACADEMIC_CONSTANTS.MAX_TEACHING_RATIO * 100}%`
    );
    result.isValid = false;
  }

  // Validate marking ratio
  const markingRatio = workload.marking / lecturer.totalContract;
  if (markingRatio > ACADEMIC_CONSTANTS.MAX_MARKING_RATIO) {
    result.errors.push(
      `Marking hours (${workload.marking}) exceed maximum ratio of ${ACADEMIC_CONSTANTS.MAX_MARKING_RATIO * 100}%`
    );
    result.isValid = false;
  }

  // Validate CPD minimum
  if (workload.cpd < ACADEMIC_CONSTANTS.MIN_CPD_HOURS) {
    result.warnings.push(
      `CPD hours (${workload.cpd}) below minimum requirement of ${ACADEMIC_CONSTANTS.MIN_CPD_HOURS} hours`
    );
  }

  // Validate leadership ratio
  const leadershipRatio = workload.leadership / lecturer.totalContract;
  if (leadershipRatio > ACADEMIC_CONSTANTS.MAX_LEADERSHIP_RATIO) {
    result.errors.push(
      `Leadership hours (${workload.leadership}) exceed maximum ratio of ${ACADEMIC_CONSTANTS.MAX_LEADERSHIP_RATIO * 100}%`
    );
    result.isValid = false;
  }

  // Validate admin ratio
  const adminRatio = workload.admin / lecturer.totalContract;
  if (adminRatio > ACADEMIC_CONSTANTS.MAX_ADMIN_RATIO) {
    result.errors.push(
      `Administrative hours (${workload.admin}) exceed maximum ratio of ${ACADEMIC_CONSTANTS.MAX_ADMIN_RATIO * 100}%`
    );
    result.isValid = false;
  }

  // Generate recommendations
  if (fteResult.utilization > ACADEMIC_CONSTANTS.OVERLOAD_THRESHOLD) {
    result.recommendations.push(
      "Consider redistributing workload or reducing teaching commitments"
    );
  }

  if (workload.cpd < ACADEMIC_CONSTANTS.MIN_CPD_HOURS) {
    result.recommendations.push(
      "Increase CPD allocation to meet minimum requirements"
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
 * @param allocation - Module allocation
 * @param lecturer - Lecturer data
 * @param existingAllocations - Existing allocations for the lecturer
 * @returns Validation result
 */
export function validateModuleAllocation(
  allocation: ModuleAllocation,
  lecturer: Lecturer,
  existingAllocations: ModuleAllocation[] = []
): WorkloadValidationResult {
  const result: WorkloadValidationResult = {
    isValid: true,
    errors: [],
    warnings: [],
    recommendations: [],
  };

  // Calculate total hours for this allocation
  const allocationHours = 
    allocation.hours.teaching + 
    allocation.hours.marking + 
    allocation.hours.cpd + 
    allocation.hours.leadership;

  // Check if allocation exceeds lecturer capacity
  if (allocationHours > lecturer.capacity) {
    result.errors.push(
      `Allocation hours (${allocationHours}) exceed lecturer capacity (${lecturer.capacity})`
    );
    result.isValid = false;
  }

  // Check if allocation exceeds teaching availability
  if (allocation.hours.teaching > lecturer.teachingAvailability) {
    result.errors.push(
      `Teaching hours (${allocation.hours.teaching}) exceed teaching availability (${lecturer.teachingAvailability})`
    );
    result.isValid = false;
  }

  // Simulate adding this allocation to existing workload
  const simulatedAllocations = [...existingAllocations, allocation];
  const fteResult = calculateLecturerFTE(lecturer, simulatedAllocations);

  // Check for overload after allocation
  if (fteResult.utilization > ACADEMIC_CONSTANTS.OVERLOAD_THRESHOLD) {
    result.warnings.push(
      `Allocation would result in ${fteResult.utilization.toFixed(1)}% utilization`
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
 * @param lecturers - Available lecturers
 * @param moduleIterations - Module iterations to allocate
 * @param existingAllocations - Existing allocations
 * @returns Distribution result for each lecturer
 */
export function distributeWorkload(
  lecturers: Lecturer[],
  moduleIterations: ModuleIteration[],
  existingAllocations: ModuleAllocation[] = []
): WorkloadDistributionResult[] {
  const results: WorkloadDistributionResult[] = [];
  
  // Group existing allocations by lecturer
  const allocationsByLecturer = new Map<Id<"lecturers">, ModuleAllocation[]>();
  for (const allocation of existingAllocations) {
    const lecturerAllocations = allocationsByLecturer.get(allocation.lecturer_id) || [];
    lecturerAllocations.push(allocation);
    allocationsByLecturer.set(allocation.lecturer_id, lecturerAllocations);
  }

  // Calculate current workload for each lecturer
  for (const lecturer of lecturers) {
    const currentAllocations = allocationsByLecturer.get(lecturer._id) || [];
    const fteResult = calculateLecturerFTE(lecturer, currentAllocations);
    
    const result: WorkloadDistributionResult = {
      lecturerId: lecturer._id,
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

    if (fteResult.breakdown.cpd < ACADEMIC_CONSTANTS.MIN_CPD_HOURS) {
      result.recommendations.push("CPD allocation below minimum requirements");
    }

    results.push(result);
  }

  return results;
}

/**
 * Optimize workload distribution using a greedy algorithm
 * @param lecturers - Available lecturers
 * @param moduleIterations - Module iterations to allocate
 * @param existingAllocations - Existing allocations
 * @returns Optimized allocation suggestions
 */
export function optimizeWorkloadDistribution(
  lecturers: Lecturer[],
  moduleIterations: ModuleIteration[],
  existingAllocations: ModuleAllocation[] = []
): {
  suggestions: Array<{
    lecturerId: Id<"lecturers">;
    moduleIterationId: Id<"module_iterations">;
    hours: { teaching: number; marking: number; cpd: number; leadership: number };
    priority: "high" | "medium" | "low";
  }>;
  totalUtilization: number;
  balanceScore: number;
} {
  const suggestions: Array<{
    lecturerId: Id<"lecturers">;
    moduleIterationId: Id<"module_iterations">;
    hours: { teaching: number; marking: number; cpd: number; leadership: number };
    priority: "high" | "medium" | "low";
  }> = [];

  // Calculate current utilization for each lecturer
  const currentUtilization = new Map<Id<"lecturers">, number>();
  const allocationsByLecturer = new Map<Id<"lecturers">, ModuleAllocation[]>();
  
  for (const allocation of existingAllocations) {
    const lecturerAllocations = allocationsByLecturer.get(allocation.lecturer_id) || [];
    lecturerAllocations.push(allocation);
    allocationsByLecturer.set(allocation.lecturer_id, lecturerAllocations);
  }

  for (const lecturer of lecturers) {
    const currentAllocations = allocationsByLecturer.get(lecturer._id) || [];
    const fteResult = calculateLecturerFTE(lecturer, currentAllocations);
    currentUtilization.set(lecturer._id, fteResult.utilization);
  }

  // Sort lecturers by utilization (ascending - least utilized first)
  const sortedLecturers = [...lecturers].sort((a, b) => {
    const utilA = currentUtilization.get(a._id) || 0;
    const utilB = currentUtilization.get(b._id) || 0;
    return utilA - utilB;
  });

  // Sort module iterations by total hours (descending - largest first)
  const sortedModuleIterations = [...moduleIterations].sort((a, b) => {
    const hoursA = a.hours.teaching + a.hours.marking + a.hours.cpd + a.hours.leadership;
    const hoursB = b.hours.teaching + b.hours.marking + b.hours.cpd + b.hours.leadership;
    return hoursB - hoursA;
  });

  // Distribute modules to lecturers
  for (const moduleIteration of sortedModuleIterations) {
    let allocated = false;
    
    for (const lecturer of sortedLecturers) {
      const currentUtil = currentUtilization.get(lecturer._id) || 0;
      const moduleHours = moduleIteration.hours.teaching + moduleIteration.hours.marking + 
                         moduleIteration.hours.cpd + moduleIteration.hours.leadership;
      
      // Check if lecturer can take this module
      if (currentUtil + (moduleHours / lecturer.totalContract) <= ACADEMIC_CONSTANTS.OVERLOAD_THRESHOLD) {
        suggestions.push({
          lecturerId: lecturer._id,
          moduleIterationId: moduleIteration._id,
          hours: moduleIteration.hours,
          priority: currentUtil < ACADEMIC_CONSTANTS.UNDERLOAD_THRESHOLD ? "high" : "medium",
        });
        
        // Update utilization
        currentUtilization.set(lecturer._id, currentUtil + (moduleHours / lecturer.totalContract));
        allocated = true;
        break;
      }
    }
    
    if (!allocated) {
      // If no lecturer can take it without overload, assign to least utilized
      const leastUtilized = sortedLecturers[0];
      suggestions.push({
        lecturerId: leastUtilized._id,
        moduleIterationId: moduleIteration._id,
        hours: moduleIteration.hours,
        priority: "low", // This will cause overload
      });
    }
  }

  // Calculate overall metrics
  const totalUtilization = Array.from(currentUtilization.values()).reduce((sum, util) => sum + util, 0) / lecturers.length;
  
  // Calculate balance score (lower is better - closer to 1.0)
  const utilizations = Array.from(currentUtilization.values());
  const meanUtilization = utilizations.reduce((sum, util) => sum + util, 0) / utilizations.length;
  const variance = utilizations.reduce((sum, util) => sum + Math.pow(util - meanUtilization, 2), 0) / utilizations.length;
  const balanceScore = Math.sqrt(variance);

  return {
    suggestions,
    totalUtilization,
    balanceScore,
  };
}

/**
 * Calculate workload balance metrics for a department
 * @param lecturers - Department lecturers
 * @param allocations - All allocations
 * @param adminAllocations - Administrative allocations
 * @returns Balance metrics
 */
export function calculateDepartmentBalance(
  lecturers: Lecturer[],
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

  // Group allocations by lecturer
  const allocationsByLecturer = new Map<Id<"lecturers">, ModuleAllocation[]>();
  for (const allocation of allocations) {
    const lecturerAllocations = allocationsByLecturer.get(allocation.lecturer_id) || [];
    lecturerAllocations.push(allocation);
    allocationsByLecturer.set(allocation.lecturer_id, lecturerAllocations);
  }

  // Group admin allocations by lecturer
  const adminAllocationsByLecturer = new Map<Id<"lecturers">, AdminAllocation[]>();
  for (const adminAlloc of adminAllocations) {
    const lecturerAdminAllocs = adminAllocationsByLecturer.get(adminAlloc.lecturer_id) || [];
    lecturerAdminAllocs.push(adminAlloc);
    adminAllocationsByLecturer.set(adminAlloc.lecturer_id, lecturerAdminAllocs);
  }

  // Calculate utilization for each lecturer
  for (const lecturer of lecturers) {
    const lecturerAllocations = allocationsByLecturer.get(lecturer._id) || [];
    const lecturerAdminAllocs = adminAllocationsByLecturer.get(lecturer._id) || [];
    const fteResult = calculateLecturerFTE(lecturer, lecturerAllocations, lecturerAdminAllocs);
    
    utilizations.push(fteResult.utilization);

    if (fteResult.utilization > ACADEMIC_CONSTANTS.OVERLOAD_THRESHOLD) {
      overloadedCount++;
    } else if (fteResult.utilization < ACADEMIC_CONSTANTS.UNDERLOAD_THRESHOLD) {
      underloadedCount++;
    } else {
      balancedCount++;
    }
  }

  const averageUtilization = utilizations.reduce((sum, util) => sum + util, 0) / utilizations.length;
  const variance = utilizations.reduce((sum, util) => sum + Math.pow(util - averageUtilization, 2), 0) / utilizations.length;
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
  optimizeWorkloadDistribution,
  calculateDepartmentBalance,
  
  // Utilities
  formatAcademicYear,
  calculateHoursPerCredit,
  isValidAcademicYear,
  
  // Constants
  ACADEMIC_CONSTANTS,
};

export default AcademicWorkload; 