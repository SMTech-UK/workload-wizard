import { defineTable } from "convex/server";
import { v } from "convex/values";

export default defineTable({
  // Core schedule info
  name: v.string(),
  description: v.optional(v.string()),
  reportTemplateId: v.id("report_templates"),
  
  // Schedule configuration
  scheduleType: v.string(), // "daily", "weekly", "monthly", "quarterly", "yearly", "custom"
  cronExpression: v.optional(v.string()),
  timezone: v.string(),
  
  // Timing details
  startDate: v.number(),
  endDate: v.optional(v.number()),
  nextRunAt: v.optional(v.number()),
  lastRunAt: v.optional(v.number()),
  
  // Frequency settings
  frequency: v.object({
    interval: v.number(), // 1, 7, 30, etc.
    unit: v.string(), // "days", "weeks", "months", "years"
    dayOfWeek: v.optional(v.number()), // 0-6 for weekly
    dayOfMonth: v.optional(v.number()), // 1-31 for monthly
    monthOfYear: v.optional(v.number()), // 1-12 for yearly
  }),
  
  // Report parameters
  parameters: v.optional(v.any()), // Dynamic parameters for the report
  filters: v.optional(v.any()), // Additional filters to apply
  
  // Delivery settings
  delivery: v.object({
    method: v.string(), // "email", "file_download", "webhook", "storage"
    recipients: v.optional(v.array(v.string())), // Email addresses or user IDs
    subject: v.optional(v.string()),
    message: v.optional(v.string()),
    webhookUrl: v.optional(v.string()),
    storagePath: v.optional(v.string()),
  }),
  
  // Status and control
  isActive: v.boolean(),
  isPaused: v.boolean(),
  status: v.string(), // "active", "paused", "completed", "error"
  
  // Error handling
  errorCount: v.optional(v.number()),
  lastError: v.optional(v.string()),
  maxRetries: v.optional(v.number()),
  
  // Metadata
  createdBy: v.string(), // User ID
  organisationId: v.id("organisations"),
  
  // Timestamps
  createdAt: v.number(),
  updatedAt: v.number(),
  deletedAt: v.optional(v.number()),
}); 