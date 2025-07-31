import { defineTable } from "convex/server";
import { v } from "convex/values";

export default defineTable({
  // Core audit info
  eventType: v.string(), // "create", "update", "delete", "login", "logout", "export", "import", "view"
  entityType: v.string(), // "user", "module", "allocation", "report", "system", etc.
  entityId: v.optional(v.string()), // ID of the affected entity
  
  // User context
  userId: v.optional(v.string()), // Clerk user ID
  userProfileId: v.optional(v.id("user_profiles")),
  sessionId: v.optional(v.string()),
  
  // Action details
  action: v.string(), // Human-readable action description
  description: v.optional(v.string()),
  category: v.string(), // "security", "data", "system", "user", "admin"
  severity: v.string(), // "low", "medium", "high", "critical"
  
  // Changes and data
  oldValues: v.optional(v.any()), // Previous state
  newValues: v.optional(v.any()), // New state
  changes: v.optional(v.array(v.object({
    field: v.string(),
    oldValue: v.optional(v.any()),
    newValue: v.optional(v.any()),
  }))),
  
  // Context and metadata
  context: v.optional(v.object({
    ipAddress: v.optional(v.string()),
    userAgent: v.optional(v.string()),
    url: v.optional(v.string()),
    method: v.optional(v.string()),
    referrer: v.optional(v.string()),
    parameters: v.optional(v.any()),
  })),
  
  // Related entities
  relatedEntities: v.optional(v.array(v.object({
    entityType: v.string(),
    entityId: v.string(),
    relationship: v.string(), // "parent", "child", "related", "affected"
  }))),
  
  // System info
  source: v.string(), // "api", "web", "mobile", "system", "import"
  subsystem: v.optional(v.string()), // "auth", "workload", "reports", "admin"
  
  // Timing
  timestamp: v.number(),
  duration: v.optional(v.number()), // Action duration in milliseconds
  
  // Status and outcome
  status: v.string(), // "success", "failure", "partial", "pending"
  errorMessage: v.optional(v.string()),
  errorCode: v.optional(v.string()),
  
  // Compliance
  complianceTags: v.optional(v.array(v.string())), // "gdpr", "ferpa", "sox", etc.
  retentionPeriod: v.optional(v.number()), // Days to retain this log
  
  // Metadata
  organisationId: v.id("organisations"),
  tags: v.optional(v.array(v.string())),
  
  // Timestamps
  createdAt: v.number(),
  updatedAt: v.number(),
  deletedAt: v.optional(v.number()),
}); 