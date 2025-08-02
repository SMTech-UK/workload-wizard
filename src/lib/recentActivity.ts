
import { useMutation } from "convex/react";
import type { Id } from "../../convex/_generated/dataModel";

export type RecentActivityArgs = {
  type: "create" | "edit" | "delete" | "view" | "import" | "export";
  entity: string;
  description: string;
  userId: string;
  organisationId: string;
  entityId?: string;
  details?: Record<string, any>;
  timestamp?: string;
};

// Formats the activity for the 'formatted' field
export function formatRecentActivity(args: RecentActivityArgs): string {
  const { type, entity, description } = args;
  
  // Capitalize entity name
  const entityLabel = entity.charAt(0).toUpperCase() + entity.slice(1).replace(/_/g, ' ');
  
  // Format based on type
  switch (type) {
    case "create":
      return `${entityLabel} created: ${description}`;
    case "edit":
      return `${entityLabel} updated: ${description}`;
    case "delete":
      return `${entityLabel} deleted: ${description}`;
    case "view":
      return `${entityLabel} viewed: ${description}`;
    case "import":
      return `Data imported: ${description}`;
    case "export":
      return `Data exported: ${description}`;
    default:
      return `${entityLabel} ${type}: ${description}`;
  }
}

// React hook to get a logger function
export function useLogRecentActivity() {
  const logActivity = useMutation('audit_logs:create' as any);
  
  return async (args: RecentActivityArgs) => {
    const now = args.timestamp || new Date().toISOString();
    const formatted = formatRecentActivity(args);
    
    try {
      await logActivity({
        type: args.type,
        entity: args.entity,
        description: args.description,
        userId: args.userId,
        organisationId: args.organisationId,
        entityId: args.entityId,
        details: args.details || {},
        timestamp: now,
        formatted,
      });
    } catch (error) {
      console.error("Failed to log recent activity:", error);
    }
  };
}

// Helper functions for common activity types
export const ActivityLoggers = {
  // Lecturer activities
  lecturerCreated: (userId: string, organisationId: string, lecturerName: string) => ({
    type: "create" as const,
    entity: "lecturer_profile",
    description: `Created lecturer profile: ${lecturerName}`,
    userId,
    organisationId,
  }),

  lecturerUpdated: (userId: string, organisationId: string, lecturerName: string, section?: string) => ({
    type: "edit" as const,
    entity: "lecturer_profile",
    description: `Updated lecturer profile: ${lecturerName}${section ? ` (${section})` : ''}`,
    userId,
    organisationId,
  }),

  lecturerDeleted: (userId: string, organisationId: string, lecturerName: string) => ({
    type: "delete" as const,
    entity: "lecturer_profile",
    description: `Deleted lecturer profile: ${lecturerName}`,
    userId,
    organisationId,
  }),

  // Module activities
  moduleCreated: (userId: string, organisationId: string, moduleCode: string, moduleTitle: string) => ({
    type: "create" as const,
    entity: "module",
    description: `Created module: ${moduleCode} - ${moduleTitle}`,
    userId,
    organisationId,
  }),

  moduleUpdated: (userId: string, organisationId: string, moduleCode: string, moduleTitle: string) => ({
    type: "edit" as const,
    entity: "module",
    description: `Updated module: ${moduleCode} - ${moduleTitle}`,
    userId,
    organisationId,
  }),

  moduleDeleted: (userId: string, organisationId: string, moduleCode: string, moduleTitle: string) => ({
    type: "delete" as const,
    entity: "module",
    description: `Deleted module: ${moduleCode} - ${moduleTitle}`,
    userId,
    organisationId,
  }),

  // Allocation activities
  allocationCreated: (userId: string, organisationId: string, lecturerName: string, moduleCode: string) => ({
    type: "create" as const,
    entity: "module_allocation",
    description: `Assigned ${lecturerName} to ${moduleCode}`,
    userId,
    organisationId,
  }),

  allocationUpdated: (userId: string, organisationId: string, lecturerName: string, moduleCode: string) => ({
    type: "edit" as const,
    entity: "module_allocation",
    description: `Updated allocation for ${lecturerName} on ${moduleCode}`,
    userId,
    organisationId,
  }),

  allocationDeleted: (userId: string, organisationId: string, lecturerName: string, moduleCode: string) => ({
    type: "delete" as const,
    entity: "module_allocation",
    description: `Removed ${lecturerName} from ${moduleCode}`,
    userId,
    organisationId,
  }),

  // Course activities
  courseCreated: (userId: string, organisationId: string, courseName: string) => ({
    type: "create" as const,
    entity: "course",
    description: `Created course: ${courseName}`,
    userId,
    organisationId,
  }),

  courseUpdated: (userId: string, organisationId: string, courseName: string) => ({
    type: "edit" as const,
    entity: "course",
    description: `Updated course: ${courseName}`,
    userId,
    organisationId,
  }),

  courseDeleted: (userId: string, organisationId: string, courseName: string) => ({
    type: "delete" as const,
    entity: "course",
    description: `Deleted course: ${courseName}`,
    userId,
    organisationId,
  }),

  // Cohort activities
  cohortCreated: (userId: string, organisationId: string, cohortName: string) => ({
    type: "create" as const,
    entity: "cohort",
    description: `Created cohort: ${cohortName}`,
    userId,
    organisationId,
  }),

  cohortUpdated: (userId: string, organisationId: string, cohortName: string) => ({
    type: "edit" as const,
    entity: "cohort",
    description: `Updated cohort: ${cohortName}`,
    userId,
    organisationId,
  }),

  cohortDeleted: (userId: string, organisationId: string, cohortName: string) => ({
    type: "delete" as const,
    entity: "cohort",
    description: `Deleted cohort: ${cohortName}`,
    userId,
    organisationId,
  }),

  // Team activities
  teamCreated: (userId: string, organisationId: string, teamName: string) => ({
    type: "create" as const,
    entity: "team",
    description: `Created team: ${teamName}`,
    userId,
    organisationId,
  }),

  teamUpdated: (userId: string, organisationId: string, teamName: string) => ({
    type: "edit" as const,
    entity: "team",
    description: `Updated team: ${teamName}`,
    userId,
    organisationId,
  }),

  teamDeleted: (userId: string, organisationId: string, teamName: string) => ({
    type: "delete" as const,
    entity: "team",
    description: `Deleted team: ${teamName}`,
    userId,
    organisationId,
  }),

  // Reference data activities
  referenceDataCreated: (userId: string, organisationId: string, dataType: string, dataName: string) => ({
    type: "create" as const,
    entity: dataType,
    description: `Created ${dataType}: ${dataName}`,
    userId,
    organisationId,
  }),

  referenceDataUpdated: (userId: string, organisationId: string, dataType: string, dataName: string) => ({
    type: "edit" as const,
    entity: dataType,
    description: `Updated ${dataType}: ${dataName}`,
    userId,
    organisationId,
  }),

  referenceDataDeleted: (userId: string, organisationId: string, dataType: string, dataName: string) => ({
    type: "delete" as const,
    entity: dataType,
    description: `Deleted ${dataType}: ${dataName}`,
    userId,
    organisationId,
  }),

  // Import/Export activities
  dataImported: (userId: string, organisationId: string, importType: string, recordCount: number) => ({
    type: "import" as const,
    entity: "data_import",
    description: `Imported ${recordCount} ${importType} records`,
    userId,
    organisationId,
    details: { importType, recordCount },
  }),

  dataExported: (userId: string, organisationId: string, exportType: string, recordCount: number) => ({
    type: "export" as const,
    entity: "data_export",
    description: `Exported ${recordCount} ${exportType} records`,
    userId,
    organisationId,
    details: { exportType, recordCount },
  }),

  // System activities
  systemSettingsUpdated: (userId: string, organisationId: string, settingType: string) => ({
    type: "edit" as const,
    entity: "system_settings",
    description: `Updated ${settingType} settings`,
    userId,
    organisationId,
  }),

  academicYearChanged: (userId: string, organisationId: string, academicYear: string) => ({
    type: "edit" as const,
    entity: "academic_year",
    description: `Changed active academic year to ${academicYear}`,
    userId,
    organisationId,
  }),

  // Report activities
  reportGenerated: (userId: string, organisationId: string, reportType: string) => ({
    type: "view" as const,
    entity: "report",
    description: `Generated ${reportType} report`,
    userId,
    organisationId,
  }),

  reportExported: (userId: string, organisationId: string, reportType: string, format: string) => ({
    type: "export" as const,
    entity: "report",
    description: `Exported ${reportType} report as ${format}`,
    userId,
    organisationId,
    details: { reportType, format },
  }),
};

// Utility function to get activity summary
export function getActivitySummary(activities: Array<{ type: string; entity: string; description: string }>) {
  const summary = {
    total: activities.length,
    byType: {} as Record<string, number>,
    byEntity: {} as Record<string, number>,
    recent: activities.slice(0, 10), // Last 10 activities
  };

  activities.forEach(activity => {
    summary.byType[activity.type] = (summary.byType[activity.type] || 0) + 1;
    summary.byEntity[activity.entity] = (summary.byEntity[activity.entity] || 0) + 1;
  });

  return summary;
}

// Utility function to filter activities
export function filterActivities(
  activities: Array<{ type: string; entity: string; description: string; timestamp: string }>,
  filters: {
    type?: string;
    entity?: string;
    startDate?: string;
    endDate?: string;
    searchTerm?: string;
  }
) {
  return activities.filter(activity => {
    if (filters.type && activity.type !== filters.type) return false;
    if (filters.entity && activity.entity !== filters.entity) return false;
    
    if (filters.startDate && activity.timestamp < filters.startDate) return false;
    if (filters.endDate && activity.timestamp > filters.endDate) return false;
    
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      return activity.description.toLowerCase().includes(searchLower) ||
             activity.entity.toLowerCase().includes(searchLower);
    }
    
    return true;
  });
} 