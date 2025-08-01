/**
 * Team-related utility functions
 * 
 * Provides functions for team management, validation, and calculations
 * based on the new profile-based database schema.
 */

import type { Id } from "../../convex/_generated/dataModel";

// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

export interface Team {
  _id: Id<"teams">;
  name: string;
  code: string;
  description?: string;
  departmentId: Id<"departments">;
  facultyId: Id<"faculties">;
  teamLeaderId?: Id<"lecturer_profiles">;
  memberCount: number;
  maxMemberCount: number;
  isActive: boolean;
  organisationId: Id<"organisations">;
  createdAt: number;
  updatedAt: number;
}

export interface TeamSummary {
  _id: Id<"team_summaries">;
  teamId: Id<"teams">;
  academicYearId: Id<"academic_years">;
  totalLecturers: number;
  totalModules: number;
  totalAllocations: number;
  averageUtilization: number;
  totalTeachingHours: number;
  totalAdminHours: number;
  totalResearchHours: number;
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
}

export interface Faculty {
  _id: Id<"faculties">;
  name: string;
  code: string;
  isActive: boolean;
}

export interface LecturerProfile {
  _id: Id<"lecturer_profiles">;
  fullName: string;
  email: string;
  family: string;
  fte: number;
  isActive: boolean;
}

export interface TeamValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  recommendations: string[];
}

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

/**
 * Validate team data against academic standards
 * @param team - Team data to validate
 * @returns Validation result
 */
export function validateTeam(team: Partial<Team>): TeamValidationResult {
  const result: TeamValidationResult = {
    isValid: true,
    errors: [],
    warnings: [],
    recommendations: [],
  };

  // Validate required fields
  if (!team.name || team.name.trim().length === 0) {
    result.errors.push("Team name is required");
    result.isValid = false;
  }

  if (!team.code || team.code.trim().length === 0) {
    result.errors.push("Team code is required");
    result.isValid = false;
  }

  if (!team.departmentId) {
    result.errors.push("Department is required");
    result.isValid = false;
  }

  if (!team.facultyId) {
    result.errors.push("Faculty is required");
    result.isValid = false;
  }

  // Validate member counts
  if (team.memberCount !== undefined && team.memberCount < 0) {
    result.errors.push("Member count cannot be negative");
    result.isValid = false;
  }

  if (team.maxMemberCount !== undefined && team.maxMemberCount < 0) {
    result.errors.push("Maximum member count cannot be negative");
    result.isValid = false;
  }

  if (team.memberCount !== undefined && team.maxMemberCount !== undefined) {
    if (team.memberCount > team.maxMemberCount) {
      result.errors.push("Member count cannot exceed maximum member count");
      result.isValid = false;
    }
  }

  // Validate team code format
  if (team.code && !/^[A-Z]{2,4}\d{2,3}$/.test(team.code.toUpperCase())) {
    result.warnings.push("Team code format may not follow standard conventions");
  }

  // Validate name length
  if (team.name && team.name.length > 100) {
    result.warnings.push("Team name is quite long - consider a shorter name");
  }

  return result;
}

/**
 * Validate team summary data
 * @param teamSummary - Team summary data to validate
 * @returns Validation result
 */
export function validateTeamSummary(
  teamSummary: Partial<TeamSummary>
): TeamValidationResult {
  const result: TeamValidationResult = {
    isValid: true,
    errors: [],
    warnings: [],
    recommendations: [],
  };

  // Validate required fields
  if (!teamSummary.teamId) {
    result.errors.push("Team is required");
    result.isValid = false;
  }

  if (!teamSummary.academicYearId) {
    result.errors.push("Academic year is required");
    result.isValid = false;
  }

  // Validate counts
  if (teamSummary.totalLecturers !== undefined && teamSummary.totalLecturers < 0) {
    result.errors.push("Total lecturers cannot be negative");
    result.isValid = false;
  }

  if (teamSummary.totalModules !== undefined && teamSummary.totalModules < 0) {
    result.errors.push("Total modules cannot be negative");
    result.isValid = false;
  }

  if (teamSummary.totalAllocations !== undefined && teamSummary.totalAllocations < 0) {
    result.errors.push("Total allocations cannot be negative");
    result.isValid = false;
  }

  // Validate utilization
  if (teamSummary.averageUtilization !== undefined) {
    if (teamSummary.averageUtilization < 0) {
      result.errors.push("Average utilization cannot be negative");
      result.isValid = false;
    }
    if (teamSummary.averageUtilization > 200) {
      result.warnings.push("Average utilization is very high - may indicate overload");
    }
  }

  return result;
}

// ============================================================================
// CALCULATION FUNCTIONS
// ============================================================================

/**
 * Calculate team workload metrics
 * @param teamSummary - Team summary data
 * @returns Workload metrics
 */
export function calculateTeamWorkloadMetrics(teamSummary: TeamSummary): {
  totalWorkloadHours: number;
  averageWorkloadPerLecturer: number;
  workloadDistribution: {
    teaching: number;
    admin: number;
    research: number;
  };
  utilizationStatus: 'underutilized' | 'balanced' | 'overloaded';
} {
  const totalWorkloadHours = 
    teamSummary.totalTeachingHours + 
    teamSummary.totalAdminHours + 
    teamSummary.totalResearchHours;

  const averageWorkloadPerLecturer = teamSummary.totalLecturers > 0 
    ? totalWorkloadHours / teamSummary.totalLecturers 
    : 0;

  const totalHours = totalWorkloadHours || 1; // Avoid division by zero
  const workloadDistribution = {
    teaching: Math.round((teamSummary.totalTeachingHours / totalHours) * 100),
    admin: Math.round((teamSummary.totalAdminHours / totalHours) * 100),
    research: Math.round((teamSummary.totalResearchHours / totalHours) * 100),
  };

  let utilizationStatus: 'underutilized' | 'balanced' | 'overloaded';
  if (teamSummary.averageUtilization < 70) {
    utilizationStatus = 'underutilized';
  } else if (teamSummary.averageUtilization > 100) {
    utilizationStatus = 'overloaded';
  } else {
    utilizationStatus = 'balanced';
  }

  return {
    totalWorkloadHours,
    averageWorkloadPerLecturer: Math.round(averageWorkloadPerLecturer),
    workloadDistribution,
    utilizationStatus,
  };
}

/**
 * Calculate team capacity utilization
 * @param team - Team data
 * @returns Capacity utilization
 */
export function calculateTeamCapacityUtilization(team: Team): {
  utilizationPercentage: number;
  availableSpaces: number;
  isAtCapacity: boolean;
  isOverCapacity: boolean;
} {
  if (team.maxMemberCount <= 0) {
    return {
      utilizationPercentage: 0,
      availableSpaces: 0,
      isAtCapacity: false,
      isOverCapacity: false,
    };
  }

  const utilizationPercentage = (team.memberCount / team.maxMemberCount) * 100;
  const availableSpaces = Math.max(0, team.maxMemberCount - team.memberCount);
  const isAtCapacity = utilizationPercentage >= 95;
  const isOverCapacity = team.memberCount > team.maxMemberCount;

  return {
    utilizationPercentage: Math.round(utilizationPercentage),
    availableSpaces,
    isAtCapacity,
    isOverCapacity,
  };
}

/**
 * Calculate team efficiency score
 * @param teamSummary - Team summary data
 * @param team - Team data
 * @returns Efficiency score (1-10)
 */
export function calculateTeamEfficiency(
  teamSummary: TeamSummary,
  team: Team
): {
  score: number;
  factors: string[];
  recommendations: string[];
} {
  let score = 5; // Base score
  const factors: string[] = [];
  const recommendations: string[] = [];

  // Factor 1: Utilization balance (0-3 points)
  if (teamSummary.averageUtilization >= 85 && teamSummary.averageUtilization <= 95) {
    score += 3;
    factors.push("Optimal utilization");
  } else if (teamSummary.averageUtilization >= 70 && teamSummary.averageUtilization < 85) {
    score += 2;
    factors.push("Good utilization");
  } else if (teamSummary.averageUtilization > 95) {
    score += 1;
    factors.push("High utilization");
    recommendations.push("Consider redistributing workload to prevent overload");
  } else {
    factors.push("Low utilization");
    recommendations.push("Consider additional responsibilities or team restructuring");
  }

  // Factor 2: Workload distribution (0-2 points)
  const workloadMetrics = calculateTeamWorkloadMetrics(teamSummary);
  if (workloadMetrics.workloadDistribution.teaching >= 40 && 
      workloadMetrics.workloadDistribution.teaching <= 70) {
    score += 1;
    factors.push("Balanced teaching load");
  } else {
    recommendations.push("Review teaching workload distribution");
  }

  if (workloadMetrics.workloadDistribution.admin <= 30) {
    score += 1;
    factors.push("Reasonable admin load");
  } else {
    recommendations.push("Consider reducing administrative workload");
  }

  // Factor 3: Team size (0-2 points)
  if (team.memberCount >= 3 && team.memberCount <= 8) {
    score += 2;
    factors.push("Optimal team size");
  } else if (team.memberCount > 8) {
    score += 1;
    factors.push("Large team");
    recommendations.push("Consider splitting into smaller teams for better management");
  } else {
    factors.push("Small team");
    recommendations.push("Consider team expansion for better coverage");
  }

  // Factor 4: Module coverage (0-2 points)
  if (teamSummary.totalModules > 0 && teamSummary.totalAllocations > 0) {
    const coverageRatio = teamSummary.totalAllocations / teamSummary.totalModules;
    if (coverageRatio >= 1.5) {
      score += 2;
      factors.push("Good module coverage");
    } else if (coverageRatio >= 1.0) {
      score += 1;
      factors.push("Adequate module coverage");
    } else {
      factors.push("Limited module coverage");
      recommendations.push("Increase module coverage and allocation diversity");
    }
  }

  // Factor 5: Team leader presence (0-1 point)
  if (team.teamLeaderId) {
    score += 1;
    factors.push("Has team leader");
  } else {
    recommendations.push("Appoint a team leader for better coordination");
  }

  // Normalize score to 1-10 range
  score = Math.min(Math.max(score, 1), 10);

  return {
    score,
    factors,
    recommendations,
  };
}

/**
 * Calculate team workload balance
 * @param teamSummaries - Array of team summaries
 * @returns Workload balance metrics
 */
export function calculateTeamWorkloadBalance(
  teamSummaries: TeamSummary[]
): {
  averageUtilization: number;
  utilizationVariance: number;
  balanceScore: number;
  overloadedTeams: number;
  underloadedTeams: number;
  balancedTeams: number;
  recommendations: string[];
} {
  const utilizations = teamSummaries.map(ts => ts.averageUtilization);
  
  if (utilizations.length === 0) {
    return {
      averageUtilization: 0,
      utilizationVariance: 0,
      balanceScore: 0,
      overloadedTeams: 0,
      underloadedTeams: 0,
      balancedTeams: 0,
      recommendations: [],
    };
  }

  const averageUtilization = utilizations.reduce((sum, util) => sum + util, 0) / utilizations.length;
  const variance = utilizations.reduce((sum, util) => sum + Math.pow(util - averageUtilization, 2), 0) / utilizations.length;
  const balanceScore = Math.sqrt(variance);

  let overloadedTeams = 0;
  let underloadedTeams = 0;
  let balancedTeams = 0;

  utilizations.forEach(util => {
    if (util > 100) {
      overloadedTeams++;
    } else if (util < 70) {
      underloadedTeams++;
    } else {
      balancedTeams++;
    }
  });

  const recommendations: string[] = [];
  
  if (overloadedTeams > 0) {
    recommendations.push(`${overloadedTeams} team(s) are overloaded - consider redistributing workload`);
  }
  
  if (underloadedTeams > 0) {
    recommendations.push(`${underloadedTeams} team(s) are underloaded - consider additional responsibilities`);
  }
  
  if (balanceScore > 20) {
    recommendations.push("High workload variance detected - consider rebalancing across teams");
  }

  return {
    averageUtilization: Math.round(averageUtilization),
    utilizationVariance: Math.round(variance),
    balanceScore: Math.round(balanceScore),
    overloadedTeams,
    underloadedTeams,
    balancedTeams,
    recommendations,
  };
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get team status based on member count and activity
 * @param team - Team data
 * @returns Team status
 */
export function getTeamStatus(team: Team): 'active' | 'inactive' | 'understaffed' | 'overstaffed' {
  if (!team.isActive) return 'inactive';
  
  const capacityUtilization = calculateTeamCapacityUtilization(team);
  
  if (capacityUtilization.isOverCapacity) return 'overstaffed';
  if (team.memberCount < 2) return 'understaffed';
  return 'active';
}

/**
 * Format team code for display
 * @param code - Team code
 * @returns Formatted team code
 */
export function formatTeamCode(code: string): string {
  return code.toUpperCase().replace(/([A-Z]+)(\d+)/, '$1 $2');
}

/**
 * Generate team code suggestions
 * @param departmentCode - Department code
 * @param facultyCode - Faculty code
 * @returns Array of suggested team codes
 */
export function generateTeamCodeSuggestions(
  departmentCode: string,
  facultyCode: string
): string[] {
  const suggestions: string[] = [];
  
  // Format: DDDTT (Department + Team Type + Number)
  const teamTypes = ['TE', 'RE', 'AD', 'SP'];
  
  teamTypes.forEach(type => {
    for (let i = 1; i <= 3; i++) {
      suggestions.push(`${departmentCode}${type}${i.toString().padStart(2, '0')}`);
    }
  });
  
  return suggestions;
}

/**
 * Validate team code format
 * @param code - Team code to validate
 * @returns True if valid format
 */
export function isValidTeamCode(code: string): boolean {
  // Basic validation: 5-6 characters, alphanumeric
  return /^[A-Z0-9]{5,6}$/.test(code.toUpperCase());
}

/**
 * Get team size category
 * @param memberCount - Number of team members
 * @returns Team size category
 */
export function getTeamSizeCategory(memberCount: number): 'small' | 'medium' | 'large' | 'very-large' {
  if (memberCount <= 3) return 'small';
  if (memberCount <= 6) return 'medium';
  if (memberCount <= 10) return 'large';
  return 'very-large';
}

/**
 * Calculate team diversity score
 * @param lecturers - Array of lecturer profiles in the team
 * @returns Diversity score (1-10)
 */
export function calculateTeamDiversity(lecturers: LecturerProfile[]): {
  score: number;
  factors: string[];
} {
  let score = 5; // Base score
  const factors: string[] = [];

  if (lecturers.length === 0) {
    return { score: 0, factors: ['No team members'] };
  }

  // Factor 1: Academic family diversity
  const families = new Set(lecturers.map(l => l.family));
  if (families.size >= 3) {
    score += 2;
    factors.push("High academic family diversity");
  } else if (families.size === 2) {
    score += 1;
    factors.push("Moderate academic family diversity");
  } else {
    factors.push("Low academic family diversity");
  }

  // Factor 2: FTE diversity
  const fteValues = lecturers.map(l => l.fte);
  const fteVariance = Math.sqrt(
    fteValues.reduce((sum, fte) => sum + Math.pow(fte - (fteValues.reduce((a, b) => a + b, 0) / fteValues.length), 2), 0) / fteValues.length
  );
  
  if (fteVariance > 0.3) {
    score += 1;
    factors.push("Good FTE diversity");
  } else {
    factors.push("Limited FTE diversity");
  }

  // Factor 3: Team size (diversity increases with size)
  if (lecturers.length >= 5) {
    score += 1;
    factors.push("Large team size");
  } else if (lecturers.length >= 3) {
    score += 0.5;
    factors.push("Medium team size");
  }

  // Factor 4: Experience level diversity (simplified)
  const avgFte = fteValues.reduce((sum, fte) => sum + fte, 0) / fteValues.length;
  const hasVariedExperience = fteValues.some(fte => Math.abs(fte - avgFte) > 0.2);
  
  if (hasVariedExperience) {
    score += 1;
    factors.push("Varied experience levels");
  } else {
    factors.push("Similar experience levels");
  }

  // Normalize score to 1-10 range
  score = Math.min(Math.max(Math.round(score), 1), 10);

  return {
    score,
    factors,
  };
}

/**
 * Get team workload recommendations
 * @param teamSummary - Team summary data
 * @param team - Team data
 * @returns Workload recommendations
 */
export function getTeamWorkloadRecommendations(
  teamSummary: TeamSummary,
  team: Team
): string[] {
  const recommendations: string[] = [];
  const workloadMetrics = calculateTeamWorkloadMetrics(teamSummary);

  // Utilization recommendations
  if (teamSummary.averageUtilization > 100) {
    recommendations.push("Team is overloaded - consider redistributing workload or adding members");
  } else if (teamSummary.averageUtilization < 70) {
    recommendations.push("Team is underutilized - consider additional responsibilities or reducing team size");
  }

  // Workload distribution recommendations
  if (workloadMetrics.workloadDistribution.teaching > 70) {
    recommendations.push("Teaching workload is high - consider reducing teaching commitments");
  }

  if (workloadMetrics.workloadDistribution.admin > 30) {
    recommendations.push("Administrative workload is high - consider reducing admin tasks");
  }

  // Team size recommendations
  if (team.memberCount < 3) {
    recommendations.push("Team is small - consider adding members for better coverage");
  } else if (team.memberCount > 10) {
    recommendations.push("Team is large - consider splitting into smaller teams");
  }

  // Module coverage recommendations
  if (teamSummary.totalModules > 0 && teamSummary.totalAllocations / teamSummary.totalModules < 1.0) {
    recommendations.push("Module coverage is limited - consider increasing allocations");
  }

  return recommendations;
}

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

const TeamUtils = {
  // Validation
  validateTeam,
  validateTeamSummary,
  
  // Calculations
  calculateTeamWorkloadMetrics,
  calculateTeamCapacityUtilization,
  calculateTeamEfficiency,
  calculateTeamWorkloadBalance,
  calculateTeamDiversity,
  
  // Utilities
  getTeamStatus,
  formatTeamCode,
  generateTeamCodeSuggestions,
  isValidTeamCode,
  getTeamSizeCategory,
  getTeamWorkloadRecommendations,
};

export default TeamUtils; 