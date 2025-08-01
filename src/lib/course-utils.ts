/**
 * Course-related utility functions
 * 
 * Provides functions for course management, validation, and calculations
 * based on the new profile-based database schema.
 */

import type { Id } from "../../convex/_generated/dataModel";

// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

export interface Course {
  _id: Id<"courses">;
  code: string;
  title: string;
  description?: string;
  facultyId: Id<"faculties">;
  departmentId: Id<"departments">;
  level: number;
  credits: number;
  duration: number; // in years
  isActive: boolean;
  organisationId: Id<"organisations">;
  createdAt: number;
  updatedAt: number;
}

export interface Faculty {
  _id: Id<"faculties">;
  name: string;
  code: string;
  isActive: boolean;
  organisationId: Id<"organisations">;
  createdAt: number;
  updatedAt: number;
}

export interface Department {
  _id: Id<"departments">;
  name: string;
  code: string;
  facultyId: Id<"faculties">;
  isActive: boolean;
  organisationId: Id<"organisations">;
  createdAt: number;
  updatedAt: number;
}

export interface CourseModule {
  _id: Id<"course_modules">;
  courseId: Id<"courses">;
  moduleId: Id<"modules">;
  academicYearId: Id<"academic_years">;
  semester: number;
  isCore: boolean;
  isActive: boolean;
  organisationId: Id<"organisations">;
  createdAt: number;
  updatedAt: number;
}

export interface CourseValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  recommendations: string[];
}

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

/**
 * Validate course data against academic standards
 * @param course - Course data to validate
 * @returns Validation result
 */
export function validateCourse(course: Partial<Course>): CourseValidationResult {
  const result: CourseValidationResult = {
    isValid: true,
    errors: [],
    warnings: [],
    recommendations: [],
  };

  // Validate required fields
  if (!course.code || course.code.trim().length === 0) {
    result.errors.push("Course code is required");
    result.isValid = false;
  } else if (course.code.length < 3) {
    result.errors.push("Course code must be at least 3 characters long");
    result.isValid = false;
  }

  if (!course.title || course.title.trim().length === 0) {
    result.errors.push("Course title is required");
    result.isValid = false;
  }

  if (!course.facultyId) {
    result.errors.push("Faculty is required");
    result.isValid = false;
  }

  if (!course.departmentId) {
    result.errors.push("Department is required");
    result.isValid = false;
  }

  // Validate academic level
  if (course.level !== undefined) {
    if (course.level < 3 || course.level > 7) {
      result.errors.push("Academic level must be between 3 and 7");
      result.isValid = false;
    }
  }

  // Validate credits
  if (course.credits !== undefined) {
    if (course.credits < 10 || course.credits > 600) {
      result.errors.push("Credits must be between 10 and 600");
      result.isValid = false;
    }
  }

  // Validate duration
  if (course.duration !== undefined) {
    if (course.duration < 1 || course.duration > 6) {
      result.errors.push("Duration must be between 1 and 6 years");
      result.isValid = false;
    }
  }

  // Validate course code format (basic validation)
  if (course.code && !/^[A-Z]{2,4}\d{3,4}[A-Z]?$/.test(course.code.toUpperCase())) {
    result.warnings.push("Course code format may not follow standard conventions");
  }

  return result;
}

/**
 * Validate course module assignment
 * @param courseModule - Course module data to validate
 * @param course - Course data
 * @param module - Module data
 * @returns Validation result
 */
export function validateCourseModule(
  courseModule: Partial<CourseModule>,
  course?: Course,
  module?: any
): CourseValidationResult {
  const result: CourseValidationResult = {
    isValid: true,
    errors: [],
    warnings: [],
    recommendations: [],
  };

  // Validate required fields
  if (!courseModule.courseId) {
    result.errors.push("Course is required");
    result.isValid = false;
  }

  if (!courseModule.moduleId) {
    result.errors.push("Module is required");
    result.isValid = false;
  }

  if (!courseModule.academicYearId) {
    result.errors.push("Academic year is required");
    result.isValid = false;
  }

  // Validate semester
  if (courseModule.semester !== undefined) {
    if (courseModule.semester < 1 || courseModule.semester > 3) {
      result.errors.push("Semester must be between 1 and 3");
      result.isValid = false;
    }
  }

  // Validate level compatibility
  if (course && module && course.level !== module.level) {
    result.warnings.push(`Course level (${course.level}) differs from module level (${module.level})`);
  }

  return result;
}

// ============================================================================
// CALCULATION FUNCTIONS
// ============================================================================

/**
 * Calculate total credits for a course
 * @param courseModules - Array of course modules
 * @param modules - Array of modules
 * @returns Total credits
 */
export function calculateCourseCredits(
  courseModules: CourseModule[],
  modules: any[]
): number {
  let totalCredits = 0;

  for (const courseModule of courseModules) {
    const moduleData = modules.find(m => m._id === courseModule.moduleId);
    if (moduleData && moduleData.credits) {
      totalCredits += moduleData.credits;
    }
  }

  return totalCredits;
}

/**
 * Calculate course workload hours
 * @param courseModules - Array of course modules
 * @param modules - Array of modules
 * @returns Workload breakdown
 */
export function calculateCourseWorkload(
  courseModules: CourseModule[],
  modules: any[]
): {
  totalTeachingHours: number;
  totalMarkingHours: number;
  totalCredits: number;
  moduleCount: number;
} {
  let totalTeachingHours = 0;
  let totalMarkingHours = 0;
  let totalCredits = 0;
  let moduleCount = 0;

  for (const courseModule of courseModules) {
    const moduleData = modules.find(m => m._id === courseModule.moduleId);
    if (moduleData) {
      totalTeachingHours += moduleData.defaultTeachingHours || 0;
      totalMarkingHours += moduleData.defaultMarkingHours || 0;
      totalCredits += moduleData.credits || 0;
      moduleCount++;
    }
  }

  return {
    totalTeachingHours,
    totalMarkingHours,
    totalCredits,
    moduleCount,
  };
}

/**
 * Calculate course complexity score
 * @param course - Course data
 * @param courseModules - Array of course modules
 * @param modules - Array of modules
 * @returns Complexity score (1-10)
 */
export function calculateCourseComplexity(
  course: Course,
  courseModules: CourseModule[],
  modules: any[]
): number {
  let complexityScore = 0;

  // Base score from course level
  complexityScore += course.level * 1.5;

  // Add complexity based on number of modules
  complexityScore += Math.min(courseModules.length * 0.5, 3);

  // Add complexity based on module levels
  for (const courseModule of courseModules) {
    const moduleData = modules.find(m => m._id === courseModule.moduleId);
    if (moduleData) {
      complexityScore += moduleData.level * 0.3;
    }
  }

  // Normalize to 1-10 scale
  return Math.min(Math.max(Math.round(complexityScore / 2), 1), 10);
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get course status based on active modules
 * @param courseModules - Array of course modules
 * @returns Course status
 */
export function getCourseStatus(courseModules: CourseModule[]): 'active' | 'inactive' | 'partial' {
  if (courseModules.length === 0) return 'inactive';
  
  const activeModules = courseModules.filter(cm => cm.isActive);
  
  if (activeModules.length === 0) return 'inactive';
  if (activeModules.length === courseModules.length) return 'active';
  return 'partial';
}

/**
 * Get course modules by semester
 * @param courseModules - Array of course modules
 * @param semester - Semester number
 * @returns Filtered course modules
 */
export function getCourseModulesBySemester(
  courseModules: CourseModule[],
  semester: number
): CourseModule[] {
  return courseModules.filter(cm => cm.semester === semester);
}

/**
 * Get core modules for a course
 * @param courseModules - Array of course modules
 * @returns Core course modules
 */
export function getCoreModules(courseModules: CourseModule[]): CourseModule[] {
  return courseModules.filter(cm => cm.isCore);
}

/**
 * Get optional modules for a course
 * @param courseModules - Array of course modules
 * @returns Optional course modules
 */
export function getOptionalModules(courseModules: CourseModule[]): CourseModule[] {
  return courseModules.filter(cm => !cm.isCore);
}

/**
 * Format course code for display
 * @param code - Course code
 * @returns Formatted course code
 */
export function formatCourseCode(code: string): string {
  return code.toUpperCase().replace(/([A-Z]+)(\d+)([A-Z]?)/, '$1 $2$3');
}

/**
 * Generate course code suggestions
 * @param facultyCode - Faculty code
 * @param departmentCode - Department code
 * @param level - Academic level
 * @returns Array of suggested course codes
 */
export function generateCourseCodeSuggestions(
  facultyCode: string,
  departmentCode: string,
  level: number
): string[] {
  const suggestions: string[] = [];
  
  // Format: FDDLLL (Faculty + Department + Level + 3 digits)
  const baseCode = `${facultyCode}${departmentCode}${level}`;
  
  for (let i = 1; i <= 5; i++) {
    suggestions.push(`${baseCode}${i.toString().padStart(3, '0')}`);
  }
  
  return suggestions;
}

/**
 * Validate course code format
 * @param code - Course code to validate
 * @returns True if valid format
 */
export function isValidCourseCode(code: string): boolean {
  // Basic validation: 6-8 characters, alphanumeric
  return /^[A-Z0-9]{6,8}$/.test(code.toUpperCase());
}

/**
 * Get course level label
 * @param level - Academic level
 * @returns Level label
 */
export function getCourseLevelLabel(level: number): string {
  switch (level) {
    case 3:
      return "Foundation";
    case 4:
      return "Level 4 (First Year)";
    case 5:
      return "Level 5 (Second Year)";
    case 6:
      return "Level 6 (Third Year)";
    case 7:
      return "Level 7 (Masters)";
    default:
      return `Level ${level}`;
  }
}

/**
 * Calculate course progression requirements
 * @param courseModules - Array of course modules
 * @param modules - Array of modules
 * @returns Progression requirements
 */
export function calculateProgressionRequirements(
  courseModules: CourseModule[],
  modules: any[]
): {
  totalCredits: number;
  requiredCredits: number;
  coreCredits: number;
  optionalCredits: number;
  progressionPercentage: number;
} {
  let totalCredits = 0;
  let coreCredits = 0;
  let optionalCredits = 0;

  for (const courseModule of courseModules) {
    const moduleData = modules.find(m => m._id === courseModule.moduleId);
    if (moduleData && moduleData.credits) {
      totalCredits += moduleData.credits;
      if (courseModule.isCore) {
        coreCredits += moduleData.credits;
      } else {
        optionalCredits += moduleData.credits;
      }
    }
  }

  const requiredCredits = coreCredits; // Core modules are required
  const progressionPercentage = totalCredits > 0 ? (requiredCredits / totalCredits) * 100 : 0;

  return {
    totalCredits,
    requiredCredits,
    coreCredits,
    optionalCredits,
    progressionPercentage: Math.round(progressionPercentage),
  };
}

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

const CourseUtils = {
  // Validation
  validateCourse,
  validateCourseModule,
  
  // Calculations
  calculateCourseCredits,
  calculateCourseWorkload,
  calculateCourseComplexity,
  calculateProgressionRequirements,
  
  // Utilities
  getCourseStatus,
  getCourseModulesBySemester,
  getCoreModules,
  getOptionalModules,
  formatCourseCode,
  generateCourseCodeSuggestions,
  isValidCourseCode,
  getCourseLevelLabel,
};

export default CourseUtils; 