import { api } from "../convex/_generated/api";
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
  if (args.type === "lecturer_created" && args.fullName) {
    const by = args.modifiedBy && args.modifiedBy.length > 0 ? args.modifiedBy[0].name : undefined;
    return `Lecturer ${args.fullName} created${by ? ` by ${by}` : ''}`;
  }
  if (args.type === "lecturer_deleted" && args.fullName) {
    const by = args.modifiedBy && args.modifiedBy.length > 0 ? args.modifiedBy[0].name : undefined;
    return `Lecturer ${args.fullName} deleted${by ? ` by ${by}` : ''}`;
  }
  if (args.type === "lecturer_edited" && args.fullName && args.details && args.details.lecturerId) {
    const by = args.modifiedBy && args.modifiedBy.length > 0 ? args.modifiedBy[0].name : undefined;
    const section = args.details.section ? ` (${args.details.section})` : '';
    return `Lecturer ${args.fullName} edited${section}${by ? ` by ${by}` : ''}`;
  }
  const entityLabel = args.entity.charAt(0).toUpperCase() + args.entity.slice(1);
  return `${entityLabel} ${args.entityId} ${args.changeType}${args.action ? ` (${args.action})` : ''}`;
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