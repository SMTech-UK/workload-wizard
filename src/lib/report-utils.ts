/**
 * Reporting utility functions
 * 
 * Provides functions for report generation, data aggregation, and analytics
 * based on the new profile-based database schema.
 */

import type { Id } from "../../convex/_generated/dataModel";

// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

export interface ReportTemplate {
  _id: Id<"report_templates">;
  name: string;
  description?: string;
  type: 'workload' | 'utilization' | 'allocation' | 'team' | 'course' | 'cohort' | 'custom';
  parameters: Record<string, any>;
  isActive: boolean;
  organisationId: Id<"organisations">;
  createdAt: number;
  updatedAt: number;
}

export interface ScheduledReport {
  _id: Id<"scheduled_reports">;
  templateId: Id<"report_templates">;
  name: string;
  schedule: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  recipients: string[];
  parameters: Record<string, any>;
  isActive: boolean;
  organisationId: Id<"organisations">;
  createdAt: number;
  updatedAt: number;
}

export interface WorkloadReport {
  _id: Id<"workload_reports">;
  name: string;
  academicYearId: Id<"academic_years">;
  reportData: Record<string, any>;
  generatedBy: string;
  isActive: boolean;
  organisationId: Id<"organisations">;
  createdAt: number;
  updatedAt: number;
}

export interface ReportData {
  summary: {
    totalLecturers: number;
    totalModules: number;
    totalAllocations: number;
    averageUtilization: number;
    totalTeachingHours: number;
    totalAdminHours: number;
    totalResearchHours: number;
  };
  breakdowns: {
    byDepartment: Array<{
      department: string;
      lecturers: number;
      modules: number;
      utilization: number;
      teachingHours: number;
      adminHours: number;
      researchHours: number;
    }>;
    byFaculty: Array<{
      faculty: string;
      lecturers: number;
      modules: number;
      utilization: number;
      teachingHours: number;
      adminHours: number;
      researchHours: number;
    }>;
    byTeam: Array<{
      team: string;
      lecturers: number;
      modules: number;
      utilization: number;
      teachingHours: number;
      adminHours: number;
      researchHours: number;
    }>;
  };
  trends: Array<{
    period: string;
    utilization: number;
    teachingHours: number;
    adminHours: number;
    researchHours: number;
  }>;
  alerts: Array<{
    type: 'overload' | 'underload' | 'unbalanced' | 'capacity';
    message: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    affectedEntities: string[];
  }>;
}

export interface ReportValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  recommendations: string[];
}

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

/**
 * Validate report template data
 * @param template - Report template data to validate
 * @returns Validation result
 */
export function validateReportTemplate(template: Partial<ReportTemplate>): ReportValidationResult {
  const result: ReportValidationResult = {
    isValid: true,
    errors: [],
    warnings: [],
    recommendations: [],
  };

  // Validate required fields
  if (!template.name || template.name.trim().length === 0) {
    result.errors.push("Template name is required");
    result.isValid = false;
  }

  if (!template.type) {
    result.errors.push("Report type is required");
    result.isValid = false;
  }

  // Validate report type
  const validTypes = ['workload', 'utilization', 'allocation', 'team', 'course', 'cohort', 'custom'];
  if (template.type && !validTypes.includes(template.type)) {
    result.errors.push(`Invalid report type. Must be one of: ${validTypes.join(', ')}`);
    result.isValid = false;
  }

  // Validate parameters
  if (template.parameters && typeof template.parameters !== 'object') {
    result.errors.push("Parameters must be an object");
    result.isValid = false;
  }

  // Validate name length
  if (template.name && template.name.length > 100) {
    result.warnings.push("Template name is quite long - consider a shorter name");
  }

  return result;
}

/**
 * Validate scheduled report data
 * @param scheduledReport - Scheduled report data to validate
 * @returns Validation result
 */
export function validateScheduledReport(scheduledReport: Partial<ScheduledReport>): ReportValidationResult {
  const result: ReportValidationResult = {
    isValid: true,
    errors: [],
    warnings: [],
    recommendations: [],
  };

  // Validate required fields
  if (!scheduledReport.name || scheduledReport.name.trim().length === 0) {
    result.errors.push("Report name is required");
    result.isValid = false;
  }

  if (!scheduledReport.templateId) {
    result.errors.push("Report template is required");
    result.isValid = false;
  }

  if (!scheduledReport.schedule) {
    result.errors.push("Schedule is required");
    result.isValid = false;
  }

  // Validate schedule
  const validSchedules = ['daily', 'weekly', 'monthly', 'quarterly', 'yearly'];
  if (scheduledReport.schedule && !validSchedules.includes(scheduledReport.schedule)) {
    result.errors.push(`Invalid schedule. Must be one of: ${validSchedules.join(', ')}`);
    result.isValid = false;
  }

  // Validate recipients
  if (scheduledReport.recipients && (!Array.isArray(scheduledReport.recipients) || scheduledReport.recipients.length === 0)) {
    result.errors.push("At least one recipient is required");
    result.isValid = false;
  }

  if (scheduledReport.recipients) {
    for (const recipient of scheduledReport.recipients) {
      if (!recipient || typeof recipient !== 'string') {
        result.errors.push("All recipients must be valid strings");
        result.isValid = false;
        break;
      }
    }
  }

  return result;
}

// ============================================================================
// DATA AGGREGATION FUNCTIONS
// ============================================================================

/**
 * Aggregate workload data for reporting
 * @param lecturers - Array of lecturers
 * @param modules - Array of modules
 * @param allocations - Array of allocations
 * @param academicYearId - Academic year ID
 * @returns Aggregated workload data
 */
export function aggregateWorkloadData(
  lecturers: any[],
  modules: any[],
  allocations: any[],
  academicYearId: Id<"academic_years">
): ReportData {
  // Filter data by academic year
  const yearLecturers = lecturers.filter(l => l.academicYearId === academicYearId);
  const yearModules = modules.filter(m => m.isActive);
  const yearAllocations = allocations.filter(a => a.isActive);

  // Calculate summary metrics
  const summary = {
    totalLecturers: yearLecturers.length,
    totalModules: yearModules.length,
    totalAllocations: yearAllocations.length,
    averageUtilization: 0,
    totalTeachingHours: 0,
    totalAdminHours: 0,
    totalResearchHours: 0,
  };

  // Calculate utilization and hours
  let totalUtilization = 0;
  let lecturerCount = 0;

  for (const lecturer of yearLecturers) {
    const lecturerAllocations = yearAllocations.filter(a => a.lecturerId === lecturer._id);
    
    let teachingHours = 0;
    let adminHours = 0;
    let researchHours = 0;

    for (const allocation of lecturerAllocations) {
      teachingHours += allocation.teachingHours || 0;
      // Note: Admin and research hours would come from admin_allocations table
    }

    summary.totalTeachingHours += teachingHours;
    summary.totalAdminHours += adminHours;
    summary.totalResearchHours += researchHours;

    // Calculate utilization (simplified)
    const totalHours = teachingHours + adminHours + researchHours;
    const contractHours = lecturer.totalContract || 1650;
    const utilization = contractHours > 0 ? (totalHours / contractHours) * 100 : 0;
    
    totalUtilization += utilization;
    lecturerCount++;
  }

  summary.averageUtilization = lecturerCount > 0 ? totalUtilization / lecturerCount : 0;

  // Generate breakdowns (simplified - would need department/faculty/team data)
  const breakdowns = {
    byDepartment: [],
    byFaculty: [],
    byTeam: [],
  };

  // Generate trends (simplified - would need historical data)
  const trends: Array<{
    period: string;
    utilization: number;
    teachingHours: number;
    adminHours: number;
    researchHours: number;
  }> = [];

  // Generate alerts
  const alerts = generateWorkloadAlerts(summary, breakdowns);

  return {
    summary,
    breakdowns,
    trends,
    alerts,
  };
}

/**
 * Generate workload alerts based on data
 * @param summary - Summary data
 * @param breakdowns - Breakdown data
 * @returns Array of alerts
 */
export function generateWorkloadAlerts(
  summary: any,
  breakdowns: any
): Array<{
  type: 'overload' | 'underload' | 'unbalanced' | 'capacity';
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  affectedEntities: string[];
}> {
  const alerts: Array<{
    type: 'overload' | 'underload' | 'unbalanced' | 'capacity';
    message: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    affectedEntities: string[];
  }> = [];

  // Check for high utilization
  if (summary.averageUtilization > 100) {
    alerts.push({
      type: 'overload',
      message: `High average utilization: ${summary.averageUtilization.toFixed(1)}%`,
      severity: summary.averageUtilization > 120 ? 'critical' : 'high',
      affectedEntities: ['Overall'],
    });
  }

  // Check for low utilization
  if (summary.averageUtilization < 70) {
    alerts.push({
      type: 'underload',
      message: `Low average utilization: ${summary.averageUtilization.toFixed(1)}%`,
      severity: summary.averageUtilization < 50 ? 'high' : 'medium',
      affectedEntities: ['Overall'],
    });
  }

  // Check for unbalanced workload distribution
  const totalHours = summary.totalTeachingHours + summary.totalAdminHours + summary.totalResearchHours;
  if (totalHours > 0) {
    const teachingRatio = (summary.totalTeachingHours / totalHours) * 100;
    if (teachingRatio > 80) {
      alerts.push({
        type: 'unbalanced',
        message: `High teaching workload ratio: ${teachingRatio.toFixed(1)}%`,
        severity: 'medium',
        affectedEntities: ['Overall'],
      });
    }
  }

  return alerts;
}

/**
 * Calculate report metrics
 * @param data - Report data
 * @returns Calculated metrics
 */
export function calculateReportMetrics(data: ReportData): {
  efficiencyScore: number;
  balanceScore: number;
  coverageScore: number;
  recommendations: string[];
} {
  let efficiencyScore = 5; // Base score
  let balanceScore = 5; // Base score
  let coverageScore = 5; // Base score
  const recommendations: string[] = [];

  // Calculate efficiency score based on utilization
  if (data.summary.averageUtilization >= 85 && data.summary.averageUtilization <= 95) {
    efficiencyScore = 10;
  } else if (data.summary.averageUtilization >= 70 && data.summary.averageUtilization < 85) {
    efficiencyScore = 8;
  } else if (data.summary.averageUtilization > 95) {
    efficiencyScore = 6;
    recommendations.push("High utilization detected - consider redistributing workload");
  } else {
    efficiencyScore = 4;
    recommendations.push("Low utilization detected - consider additional responsibilities");
  }

  // Calculate balance score based on workload distribution
  const totalHours = data.summary.totalTeachingHours + data.summary.totalAdminHours + data.summary.totalResearchHours;
  if (totalHours > 0) {
    const teachingRatio = (data.summary.totalTeachingHours / totalHours) * 100;
    const adminRatio = (data.summary.totalAdminHours / totalHours) * 100;
    const researchRatio = (data.summary.totalResearchHours / totalHours) * 100;

    if (teachingRatio >= 40 && teachingRatio <= 70 && adminRatio <= 30 && researchRatio >= 10) {
      balanceScore = 10;
    } else if (teachingRatio >= 30 && teachingRatio <= 80 && adminRatio <= 40) {
      balanceScore = 7;
    } else {
      balanceScore = 4;
      recommendations.push("Workload distribution needs review");
    }
  }

  // Calculate coverage score based on allocation coverage
  if (data.summary.totalModules > 0 && data.summary.totalAllocations > 0) {
    const coverageRatio = data.summary.totalAllocations / data.summary.totalModules;
    if (coverageRatio >= 1.5) {
      coverageScore = 10;
    } else if (coverageRatio >= 1.0) {
      coverageScore = 7;
    } else {
      coverageScore = 4;
      recommendations.push("Module coverage is limited - consider increasing allocations");
    }
  }

  return {
    efficiencyScore,
    balanceScore,
    coverageScore,
    recommendations,
  };
}

// ============================================================================
// REPORT GENERATION FUNCTIONS
// ============================================================================

/**
 * Generate workload report
 * @param data - Report data
 * @param format - Output format
 * @returns Formatted report
 */
export function generateWorkloadReport(
  data: ReportData,
  format: 'json' | 'csv' | 'html' | 'pdf' = 'json'
): string | object {
  const metrics = calculateReportMetrics(data);

  const report = {
    metadata: {
      generatedAt: new Date().toISOString(),
      type: 'workload',
      format,
    },
    summary: data.summary,
    metrics,
    breakdowns: data.breakdowns,
    trends: data.trends,
    alerts: data.alerts,
    recommendations: metrics.recommendations,
  };

  switch (format) {
    case 'json':
      return report;
    case 'csv':
      return convertToCSV(report);
    case 'html':
      return convertToHTML(report);
    case 'pdf':
      return convertToPDF(report);
    default:
      return report;
  }
}

/**
 * Generate utilization report
 * @param data - Report data
 * @param format - Output format
 * @returns Formatted report
 */
export function generateUtilizationReport(
  data: ReportData,
  format: 'json' | 'csv' | 'html' | 'pdf' = 'json'
): string | object {
  const utilizationData = {
    metadata: {
      generatedAt: new Date().toISOString(),
      type: 'utilization',
      format,
    },
    utilization: {
      average: data.summary.averageUtilization,
      breakdown: data.breakdowns,
      trends: data.trends,
    },
    alerts: data.alerts.filter(alert => alert.type === 'overload' || alert.type === 'underload'),
  };

  switch (format) {
    case 'json':
      return utilizationData;
    case 'csv':
      return convertToCSV(utilizationData);
    case 'html':
      return convertToHTML(utilizationData);
    case 'pdf':
      return convertToPDF(utilizationData);
    default:
      return utilizationData;
  }
}

/**
 * Generate allocation report
 * @param data - Report data
 * @param format - Output format
 * @returns Formatted report
 */
export function generateAllocationReport(
  data: ReportData,
  format: 'json' | 'csv' | 'html' | 'pdf' = 'json'
): string | object {
  const allocationData = {
    metadata: {
      generatedAt: new Date().toISOString(),
      type: 'allocation',
      format,
    },
    allocations: {
      total: data.summary.totalAllocations,
      breakdown: data.breakdowns,
      coverage: data.summary.totalAllocations / data.summary.totalModules,
    },
    alerts: data.alerts.filter(alert => alert.type === 'capacity'),
  };

  switch (format) {
    case 'json':
      return allocationData;
    case 'csv':
      return convertToCSV(allocationData);
    case 'html':
      return convertToHTML(allocationData);
    case 'pdf':
      return convertToPDF(allocationData);
    default:
      return allocationData;
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Convert report data to CSV format
 * @param data - Report data
 * @returns CSV string
 */
export function convertToCSV(data: any): string {
  // Simplified CSV conversion - would need more sophisticated implementation
  const lines: string[] = [];
  
  // Add headers
  lines.push('Metric,Value');
  
  // Add summary data
  if (data.summary) {
    Object.entries(data.summary).forEach(([key, value]) => {
      lines.push(`${key},${value}`);
    });
  }
  
  return lines.join('\n');
}

/**
 * Convert report data to HTML format
 * @param data - Report data
 * @returns HTML string
 */
export function convertToHTML(data: any): string {
  // Simplified HTML conversion - would need more sophisticated implementation
  return `
    <html>
      <head>
        <title>${data.metadata?.type || 'Report'}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .summary { margin-bottom: 20px; }
          .metric { margin: 10px 0; }
        </style>
      </head>
      <body>
        <h1>${data.metadata?.type || 'Report'}</h1>
        <div class="summary">
          ${data.summary ? Object.entries(data.summary).map(([key, value]) => 
            `<div class="metric"><strong>${key}:</strong> ${value}</div>`
          ).join('') : ''}
        </div>
      </body>
    </html>
  `;
}

/**
 * Convert report data to PDF format
 * @param data - Report data
 * @returns PDF data (placeholder)
 */
export function convertToPDF(data: any): any {
  // Placeholder for PDF conversion - would need PDF library
  return {
    type: 'pdf',
    data: data,
    message: 'PDF conversion not implemented',
  };
}

/**
 * Format report date
 * @param date - Date to format
 * @returns Formatted date string
 */
export function formatReportDate(date: string | Date): string {
  const dateObj = new Date(date);
  return dateObj.toLocaleDateString('en-GB', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Get report type label
 * @param type - Report type
 * @returns Human-readable label
 */
export function getReportTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    workload: 'Workload Report',
    utilization: 'Utilization Report',
    allocation: 'Allocation Report',
    team: 'Team Report',
    course: 'Course Report',
    cohort: 'Cohort Report',
    custom: 'Custom Report',
  };
  
  return labels[type] || type;
}

/**
 * Get schedule label
 * @param schedule - Schedule type
 * @returns Human-readable label
 */
export function getScheduleLabel(schedule: string): string {
  const labels: Record<string, string> = {
    daily: 'Daily',
    weekly: 'Weekly',
    monthly: 'Monthly',
    quarterly: 'Quarterly',
    yearly: 'Yearly',
  };
  
  return labels[schedule] || schedule;
}

/**
 * Calculate report file size estimate
 * @param data - Report data
 * @param format - Output format
 * @returns Estimated file size in bytes
 */
export function estimateReportFileSize(data: any, format: string): number {
  const jsonSize = JSON.stringify(data).length;
  
  switch (format) {
    case 'csv':
      return Math.round(jsonSize * 0.7); // CSV is typically smaller
    case 'html':
      return Math.round(jsonSize * 1.5); // HTML has markup overhead
    case 'pdf':
      return Math.round(jsonSize * 2.0); // PDF has additional overhead
    default:
      return jsonSize;
  }
}

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

const ReportUtils = {
  // Validation
  validateReportTemplate,
  validateScheduledReport,
  
  // Data Aggregation
  aggregateWorkloadData,
  generateWorkloadAlerts,
  calculateReportMetrics,
  
  // Report Generation
  generateWorkloadReport,
  generateUtilizationReport,
  generateAllocationReport,
  
  // Utilities
  convertToCSV,
  convertToHTML,
  convertToPDF,
  formatReportDate,
  getReportTypeLabel,
  getScheduleLabel,
  estimateReportFileSize,
};

export default ReportUtils; 