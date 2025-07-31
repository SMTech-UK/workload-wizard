import { defineTable } from "convex/server";
import { v } from "convex/values";

export default defineTable({
  // Core tagging info
  tagId: v.id("tags"),
  entityType: v.string(), // "user", "module", "allocation", "report", "file", etc.
  entityId: v.string(), // ID of the tagged entity
  
  // Tagging context
  taggedBy: v.string(), // User ID who applied the tag
  taggedAt: v.number(),
  
  // Tag value and metadata
  value: v.optional(v.string()), // Custom value for the tag (if applicable)
  metadata: v.optional(v.object({
    confidence: v.optional(v.number()), // 0-1 confidence score for auto-tagging
    source: v.optional(v.string()), // "manual", "auto", "import", "suggestion"
    context: v.optional(v.any()), // Additional context about the tagging
  })),
  
  // Tagging scope and validity
  scope: v.optional(v.object({
    organisationId: v.optional(v.id("organisations")),
    facultyId: v.optional(v.id("faculties")),
    departmentId: v.optional(v.id("departments")),
    academicYearId: v.optional(v.id("academic_years")),
  })),
  
  // Temporal validity
  validFrom: v.optional(v.number()),
  validTo: v.optional(v.number()),
  isActive: v.boolean(),
  
  // Tagging relationships
  parentTaggingId: v.optional(v.id("taggables")), // For hierarchical tag relationships
  relatedTaggings: v.optional(v.array(v.id("taggables"))), // Related tag assignments
  
  // Usage tracking
  usageCount: v.optional(v.number()), // How often this tag is used on this entity
  lastUsedAt: v.optional(v.number()),
  firstUsedAt: v.optional(v.number()),
  
  // Tagging workflow
  status: v.optional(v.string()), // "pending", "approved", "rejected", "expired"
  approvedBy: v.optional(v.string()), // User ID who approved the tag
  approvedAt: v.optional(v.number()),
  rejectionReason: v.optional(v.string()),
  
  // Tagging rules and validation
  ruleId: v.optional(v.string()), // ID of the rule that created this tagging
  validationStatus: v.optional(v.string()), // "valid", "invalid", "pending_validation"
  validationErrors: v.optional(v.array(v.string())),
  
  // Integration and sync
  externalId: v.optional(v.string()), // ID from external system
  syncStatus: v.optional(v.string()), // "synced", "pending_sync", "sync_failed"
  lastSyncedAt: v.optional(v.number()),
  
  // Audit trail
  changeHistory: v.optional(v.array(v.object({
    action: v.string(), // "added", "removed", "modified", "approved", "rejected"
    timestamp: v.number(),
    userId: v.string(),
    oldValue: v.optional(v.any()),
    newValue: v.optional(v.any()),
    reason: v.optional(v.string()),
  }))),
  
  // Performance and analytics
  relevanceScore: v.optional(v.number()), // 0-1 relevance score
  popularityScore: v.optional(v.number()), // 0-1 popularity score
  trendingScore: v.optional(v.number()), // 0-1 trending score
  
  // Metadata
  notes: v.optional(v.string()),
  organisationId: v.id("organisations"),
  
  // Timestamps
  createdAt: v.number(),
  updatedAt: v.number(),
  deletedAt: v.optional(v.number()),
}); 