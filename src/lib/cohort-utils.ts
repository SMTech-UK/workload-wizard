/**
 * Cohort-related utility functions
 * 
 * Provides functions for cohort management, validation, and calculations
 * based on the new profile-based database schema.
 */

import type { Id } from "../../convex/_generated/dataModel";

// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

export interface Cohort {
  _id: Id<"cohorts">;
  name: string;
  code: string;
  courseId: Id<"courses">;
  academicYearId: Id<"academic_years">;
  startDate: string;
  endDate: string;
  expectedGraduationDate: string;
  studentCount: number;
  maxStudentCount: number;
  isActive: boolean;
  organisationId: Id<"organisations">;
  createdAt: number;
  updatedAt: number;
}

export interface CohortModulePlan {
  _id: Id<"cohort_module_plans">;
  cohortId: Id<"cohorts">;
  moduleId: Id<"modules">;
  academicYearId: Id<"academic_years">;
  semester: number;
  isCore: boolean;
  isActive: boolean;
  organisationId: Id<"organisations">;
  createdAt: number;
  updatedAt: number;
}

export interface Course {
  _id: Id<"courses">;
  code: string;
  title: string;
  level: number;
  credits: number;
  duration: number;
  isActive: boolean;
}

export interface AcademicYear {
  _id: Id<"academic_years">;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export interface CohortValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  recommendations: string[];
}

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

/**
 * Validate cohort data against academic standards
 * @param cohort - Cohort data to validate
 * @returns Validation result
 */
export function validateCohort(cohort: Partial<Cohort>): CohortValidationResult {
  const result: CohortValidationResult = {
    isValid: true,
    errors: [],
    warnings: [],
    recommendations: [],
  };

  // Validate required fields
  if (!cohort.name || cohort.name.trim().length === 0) {
    result.errors.push("Cohort name is required");
    result.isValid = false;
  }

  if (!cohort.code || cohort.code.trim().length === 0) {
    result.errors.push("Cohort code is required");
    result.isValid = false;
  }

  if (!cohort.courseId) {
    result.errors.push("Course is required");
    result.isValid = false;
  }

  if (!cohort.academicYearId) {
    result.errors.push("Academic year is required");
    result.isValid = false;
  }

  // Validate dates
  if (cohort.startDate && cohort.endDate) {
    const startDate = new Date(cohort.startDate);
    const endDate = new Date(cohort.endDate);
    
    if (startDate >= endDate) {
      result.errors.push("End date must be after start date");
      result.isValid = false;
    }
  }

  if (cohort.expectedGraduationDate) {
    const graduationDate = new Date(cohort.expectedGraduationDate);
    const now = new Date();
    
    if (graduationDate < now) {
      result.warnings.push("Expected graduation date is in the past");
    }
  }

  // Validate student counts
  if (cohort.studentCount !== undefined && cohort.studentCount < 0) {
    result.errors.push("Student count cannot be negative");
    result.isValid = false;
  }

  if (cohort.maxStudentCount !== undefined && cohort.maxStudentCount < 0) {
    result.errors.push("Maximum student count cannot be negative");
    result.isValid = false;
  }

  if (cohort.studentCount !== undefined && cohort.maxStudentCount !== undefined) {
    if (cohort.studentCount > cohort.maxStudentCount) {
      result.errors.push("Student count cannot exceed maximum student count");
      result.isValid = false;
    }
  }

  // Validate cohort code format
  if (cohort.code && !/^[A-Z]{2,4}\d{4}[A-Z]?$/.test(cohort.code.toUpperCase())) {
    result.warnings.push("Cohort code format may not follow standard conventions");
  }

  return result;
}

/**
 * Validate cohort module plan
 * @param cohortModulePlan - Cohort module plan data to validate
 * @returns Validation result
 */
export function validateCohortModulePlan(
  cohortModulePlan: Partial<CohortModulePlan>
): CohortValidationResult {
  const result: CohortValidationResult = {
    isValid: true,
    errors: [],
    warnings: [],
    recommendations: [],
  };

  // Validate required fields
  if (!cohortModulePlan.cohortId) {
    result.errors.push("Cohort is required");
    result.isValid = false;
  }

  if (!cohortModulePlan.moduleId) {
    result.errors.push("Module is required");
    result.isValid = false;
  }

  if (!cohortModulePlan.academicYearId) {
    result.errors.push("Academic year is required");
    result.isValid = false;
  }

  // Validate semester
  if (cohortModulePlan.semester !== undefined) {
    if (cohortModulePlan.semester < 1 || cohortModulePlan.semester > 3) {
      result.errors.push("Semester must be between 1 and 3");
      result.isValid = false;
    }
  }

  return result;
}

// ============================================================================
// CALCULATION FUNCTIONS
// ============================================================================

/**
 * Calculate cohort progression status
 * @param cohort - Cohort data
 * @param cohortModulePlans - Array of cohort module plans
 * @param modules - Array of modules
 * @returns Progression status
 */
export function calculateCohortProgression(
  cohort: Cohort,
  cohortModulePlans: CohortModulePlan[],
  modules: any[]
): {
  totalCredits: number;
  completedCredits: number;
  progressionPercentage: number;
  remainingCredits: number;
  estimatedCompletionDate: string | null;
} {
  let totalCredits = 0;
  let completedCredits = 0;

  // Calculate total credits from module plans
  for (const plan of cohortModulePlans) {
    const module = modules.find(m => m._id === plan.moduleId);
    if (module && module.credits) {
      totalCredits += module.credits;
      
      // Assume modules are completed if they're in the past
      const moduleEndDate = new Date(plan.academicYearId); // Simplified - would need actual module end dates
      if (moduleEndDate < new Date()) {
        completedCredits += module.credits;
      }
    }
  }

  const progressionPercentage = totalCredits > 0 ? (completedCredits / totalCredits) * 100 : 0;
  const remainingCredits = totalCredits - completedCredits;

  // Estimate completion date based on progression
  let estimatedCompletionDate: string | null = null;
  if (cohort.expectedGraduationDate && progressionPercentage < 100) {
    const graduationDate = new Date(cohort.expectedGraduationDate);
    const now = new Date();
    const remainingPercentage = 100 - progressionPercentage;
    const daysRemaining = (graduationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    const estimatedDays = (daysRemaining / remainingPercentage) * 100;
    
    estimatedCompletionDate = new Date(now.getTime() + estimatedDays * 24 * 60 * 60 * 1000).toISOString();
  }

  return {
    totalCredits,
    completedCredits,
    progressionPercentage: Math.round(progressionPercentage),
    remainingCredits,
    estimatedCompletionDate,
  };
}

/**
 * Calculate cohort workload requirements
 * @param cohortModulePlans - Array of cohort module plans
 * @param modules - Array of modules
 * @returns Workload requirements
 */
export function calculateCohortWorkload(
  cohortModulePlans: CohortModulePlan[],
  modules: any[]
): {
  totalTeachingHours: number;
  totalMarkingHours: number;
  totalCredits: number;
  moduleCount: number;
  averageWorkloadPerStudent: number;
} {
  let totalTeachingHours = 0;
  let totalMarkingHours = 0;
  let totalCredits = 0;
  let moduleCount = 0;

  for (const plan of cohortModulePlans) {
    const module = modules.find(m => m._id === plan.moduleId);
    if (module) {
      totalTeachingHours += module.defaultTeachingHours || 0;
      totalMarkingHours += module.defaultMarkingHours || 0;
      totalCredits += module.credits || 0;
      moduleCount++;
    }
  }

  const totalWorkload = totalTeachingHours + totalMarkingHours;
  const averageWorkloadPerStudent = moduleCount > 0 ? totalWorkload / moduleCount : 0;

  return {
    totalTeachingHours,
    totalMarkingHours,
    totalCredits,
    moduleCount,
    averageWorkloadPerStudent: Math.round(averageWorkloadPerStudent),
  };
}

/**
 * Calculate cohort capacity utilization
 * @param cohort - Cohort data
 * @returns Capacity utilization
 */
export function calculateCohortCapacityUtilization(cohort: Cohort): {
  utilizationPercentage: number;
  availableSpaces: number;
  isAtCapacity: boolean;
  isOverCapacity: boolean;
} {
  if (cohort.maxStudentCount <= 0) {
    return {
      utilizationPercentage: 0,
      availableSpaces: 0,
      isAtCapacity: false,
      isOverCapacity: false,
    };
  }

  const utilizationPercentage = (cohort.studentCount / cohort.maxStudentCount) * 100;
  const availableSpaces = Math.max(0, cohort.maxStudentCount - cohort.studentCount);
  const isAtCapacity = utilizationPercentage >= 95;
  const isOverCapacity = cohort.studentCount > cohort.maxStudentCount;

  return {
    utilizationPercentage: Math.round(utilizationPercentage),
    availableSpaces,
    isAtCapacity,
    isOverCapacity,
  };
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get cohort status based on dates and student count
 * @param cohort - Cohort data
 * @returns Cohort status
 */
export function getCohortStatus(cohort: Cohort): 'upcoming' | 'active' | 'graduating' | 'completed' {
  const now = new Date();
  const startDate = new Date(cohort.startDate);
  const endDate = new Date(cohort.endDate);
  const graduationDate = new Date(cohort.expectedGraduationDate);

  if (now < startDate) {
    return 'upcoming';
  } else if (now >= startDate && now <= endDate) {
    return 'active';
  } else if (now > endDate && now <= graduationDate) {
    return 'graduating';
  } else {
    return 'completed';
  }
}

/**
 * Get cohort modules by semester
 * @param cohortModulePlans - Array of cohort module plans
 * @param semester - Semester number
 * @returns Filtered cohort module plans
 */
export function getCohortModulesBySemester(
  cohortModulePlans: CohortModulePlan[],
  semester: number
): CohortModulePlan[] {
  return cohortModulePlans.filter(plan => plan.semester === semester);
}

/**
 * Get core modules for a cohort
 * @param cohortModulePlans - Array of cohort module plans
 * @returns Core cohort module plans
 */
export function getCohortCoreModules(cohortModulePlans: CohortModulePlan[]): CohortModulePlan[] {
  return cohortModulePlans.filter(plan => plan.isCore);
}

/**
 * Get optional modules for a cohort
 * @param cohortModulePlans - Array of cohort module plans
 * @returns Optional cohort module plans
 */
export function getCohortOptionalModules(cohortModulePlans: CohortModulePlan[]): CohortModulePlan[] {
  return cohortModulePlans.filter(plan => !plan.isCore);
}

/**
 * Format cohort code for display
 * @param code - Cohort code
 * @returns Formatted cohort code
 */
export function formatCohortCode(code: string): string {
  return code.toUpperCase().replace(/([A-Z]+)(\d{4})([A-Z]?)/, '$1 $2$3');
}

/**
 * Generate cohort code suggestions
 * @param courseCode - Course code
 * @param academicYear - Academic year
 * @returns Array of suggested cohort codes
 */
export function generateCohortCodeSuggestions(
  courseCode: string,
  academicYear: string
): string[] {
  const suggestions: string[] = [];
  
  // Format: CCYYYY (Course Code + Year)
  const year = academicYear.split('-')[0]; // Extract start year
  const baseCode = `${courseCode}${year}`;
  
  // Add variations
  suggestions.push(baseCode);
  suggestions.push(`${baseCode}A`);
  suggestions.push(`${baseCode}B`);
  suggestions.push(`${baseCode}1`);
  suggestions.push(`${baseCode}2`);
  
  return suggestions;
}

/**
 * Validate cohort code format
 * @param code - Cohort code to validate
 * @returns True if valid format
 */
export function isValidCohortCode(code: string): boolean {
  // Basic validation: 6-8 characters, alphanumeric
  return /^[A-Z0-9]{6,8}$/.test(code.toUpperCase());
}

/**
 * Calculate cohort age in years
 * @param startDate - Cohort start date
 * @returns Age in years
 */
export function calculateCohortAge(startDate: string): number {
  const start = new Date(startDate);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - start.getTime());
  const diffYears = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 365));
  return diffYears;
}

/**
 * Get cohort academic year
 * @param cohort - Cohort data
 * @param academicYears - Array of academic years
 * @returns Academic year name or null
 */
export function getCohortAcademicYear(
  cohort: Cohort,
  academicYears: AcademicYear[]
): string | null {
  const academicYear = academicYears.find(ay => ay._id === cohort.academicYearId);
  return academicYear ? academicYear.name : null;
}

/**
 * Calculate cohort retention rate
 * @param initialCount - Initial student count
 * @param currentCount - Current student count
 * @returns Retention rate percentage
 */
export function calculateRetentionRate(initialCount: number, currentCount: number): number {
  if (initialCount <= 0) return 0;
  return Math.round((currentCount / initialCount) * 100);
}

/**
 * Get cohort timeline events
 * @param cohort - Cohort data
 * @returns Timeline events
 */
export function getCohortTimeline(cohort: Cohort): Array<{
  date: string;
  event: string;
  description: string;
  isPast: boolean;
}> {
  const now = new Date();
  const timeline = [];

  // Start date
  timeline.push({
    date: cohort.startDate,
    event: 'Cohort Start',
    description: 'Cohort begins',
    isPast: new Date(cohort.startDate) <= now,
  });

  // End date
  timeline.push({
    date: cohort.endDate,
    event: 'Cohort End',
    description: 'Cohort ends',
    isPast: new Date(cohort.endDate) <= now,
  });

  // Expected graduation
  timeline.push({
    date: cohort.expectedGraduationDate,
    event: 'Expected Graduation',
    description: 'Expected graduation date',
    isPast: new Date(cohort.expectedGraduationDate) <= now,
  });

  return timeline.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

/**
 * Calculate cohort completion prediction
 * @param cohort - Cohort data
 * @param progressionPercentage - Current progression percentage
 * @returns Completion prediction
 */
export function predictCohortCompletion(
  cohort: Cohort,
  progressionPercentage: number
): {
  predictedCompletionDate: string | null;
  confidence: 'high' | 'medium' | 'low';
  factors: string[];
} {
  const factors: string[] = [];
  let confidence: 'high' | 'medium' | 'low' = 'medium';

  if (progressionPercentage >= 80) {
    confidence = 'high';
    factors.push('High progression rate');
  } else if (progressionPercentage >= 60) {
    confidence = 'medium';
    factors.push('Moderate progression rate');
  } else {
    confidence = 'low';
    factors.push('Low progression rate');
  }

  // Calculate predicted completion date
  let predictedCompletionDate: string | null = null;
  if (progressionPercentage > 0 && progressionPercentage < 100) {
    const graduationDate = new Date(cohort.expectedGraduationDate);
    const now = new Date();
    const remainingPercentage = 100 - progressionPercentage;
    const daysRemaining = (graduationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    const estimatedDays = (daysRemaining / remainingPercentage) * 100;
    
    predictedCompletionDate = new Date(now.getTime() + estimatedDays * 24 * 60 * 60 * 1000).toISOString();
  }

  // Add additional factors
  if (cohort.studentCount > 0) {
    factors.push(`${cohort.studentCount} students enrolled`);
  }

  const capacityUtilization = calculateCohortCapacityUtilization(cohort);
  if (capacityUtilization.isAtCapacity) {
    factors.push('At capacity');
  }

  return {
    predictedCompletionDate,
    confidence,
    factors,
  };
}

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

const CohortUtils = {
  // Validation
  validateCohort,
  validateCohortModulePlan,
  
  // Calculations
  calculateCohortProgression,
  calculateCohortWorkload,
  calculateCohortCapacityUtilization,
  calculateRetentionRate,
  predictCohortCompletion,
  
  // Utilities
  getCohortStatus,
  getCohortModulesBySemester,
  getCohortCoreModules,
  getCohortOptionalModules,
  formatCohortCode,
  generateCohortCodeSuggestions,
  isValidCohortCode,
  calculateCohortAge,
  getCohortAcademicYear,
  getCohortTimeline,
};

export default CohortUtils; 