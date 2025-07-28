import { api } from "../../convex/_generated/api";
import { useMutation } from "convex/react";

export type RecentActivityArgs = {
  action: string;
  changeType: string;
  entity: string;
  entityId: string;
  modifiedBy: { name: string; email: string }[];
  timestamp?: string;
  permission: string;
  fullName?: string; // Optional, for special formatting
  type?: string;
  details?: any;
};

// Formats the activity for the 'formatted' field
export function formatRecentActivity(args: RecentActivityArgs): string {
  const by = args.modifiedBy && args.modifiedBy.length > 0 ? args.modifiedBy[0].name : undefined;
  const entityLabel = args.entity.charAt(0).toUpperCase() + args.entity.slice(1);
  
  // Handle lecturer-specific formatting with fullName
  if (args.fullName && args.type && (args.type === "lecturer_created" || args.type === "lecturer_deleted" || args.type === "lecturer_edited")) {
    if (args.type === "lecturer_created") {
      return `Lecturer ${args.fullName} created${by ? ` by ${by}` : ''}`;
    }
    
    if (args.type === "lecturer_deleted") {
      return `Lecturer ${args.fullName} deleted${by ? ` by ${by}` : ''}`;
    }
    
    if (args.type === "lecturer_edited" && args.details && args.details.section) {
      return `Lecturer ${args.fullName} edited (${args.details.section})${by ? ` by ${by}` : ''}`;
    }
  }
  
  // Handle generic entity activities
  const actionPart = args.action ? ` (${args.action})` : '';
  return `${entityLabel} ${args.entityId} ${args.changeType}${actionPart}${by ? ` by ${by}` : ''}`;
}

// React hook to get a logger function
export function useLogRecentActivity() {
  const logActivity = useMutation(api.recent_activity.logActivity);
  return async (args: RecentActivityArgs) => {
    const now = args.timestamp || new Date().toISOString();
    let type = args.type;
    let details = args.details;
    // Auto-structure for known types
    if (!type && args.entity === "lecturer" && args.changeType === "create") {
      type = "lecturer_created";
      details = {
        lecturerId: args.entityId,
        fullName: args.fullName,
      };
    }
    const formatted = formatRecentActivity({ ...args, type });
    // Omit fullName before sending to mutation
    const { fullName, ...rest } = args;
    await logActivity({
      ...rest,
      timestamp: now,
      formatted,
      type,
      details,
    });
  };
} 