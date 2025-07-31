import { defineTable } from "convex/server";
import { v } from "convex/values";

export default defineTable({
  // Core settings
  userId: v.optional(v.string()), // Clerk user ID, null for org-wide settings
  organisationId: v.id("organisations"),
  notificationType: v.string(), // "email", "push", "sms", "in_app"
  channel: v.string(), // "workload_alerts", "allocation_updates", "report_ready", "system_notifications"
  
  // Preferences
  isEnabled: v.boolean(),
  frequency: v.string(), // "immediate", "daily", "weekly", "never"
  quietHours: v.optional(v.object({
    startTime: v.string(), // "HH:MM" format
    endTime: v.string(), // "HH:MM" format
    timezone: v.string(),
  })),
  
  // Delivery settings
  recipients: v.optional(v.array(v.string())), // Email addresses or user IDs
  template: v.optional(v.string()), // Template ID or name
  customMessage: v.optional(v.string()),
  
  // Advanced settings
  priority: v.string(), // "low", "normal", "high", "urgent"
  grouping: v.optional(v.string()), // "individual", "daily_digest", "weekly_summary"
  retentionDays: v.optional(v.number()),
  
  // Metadata
  description: v.optional(v.string()),
  isSystem: v.boolean(),
  isActive: v.boolean(),
  
  // Timestamps
  createdAt: v.number(),
  updatedAt: v.number(),
  deletedAt: v.optional(v.number()),
}); 