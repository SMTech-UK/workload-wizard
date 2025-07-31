import { defineTable } from "convex/server";
import { v } from "convex/values";

export default defineTable({
  // Core tag info
  name: v.string(),
  slug: v.string(), // URL-friendly version of name
  description: v.optional(v.string()),
  
  // Tag classification
  category: v.string(), // "academic", "workload", "department", "status", "priority", "custom"
  type: v.string(), // "text", "color", "icon", "badge", "category"
  
  // Visual properties
  color: v.optional(v.string()), // Hex color code
  backgroundColor: v.optional(v.string()), // Hex color code
  icon: v.optional(v.string()), // Icon name or URL
  emoji: v.optional(v.string()), // Unicode emoji
  
  // Tag hierarchy
  parentTagId: v.optional(v.id("tags")),
  level: v.optional(v.number()), // Hierarchy level (0 = root)
  path: v.optional(v.string()), // Full path from root (e.g., "academic/undergraduate/core")
  
  // Usage and scope
  isSystem: v.boolean(), // System-defined tag
  isActive: v.boolean(),
  isPublic: v.boolean(), // Can be used by all users
  isRequired: v.optional(v.boolean()), // Required for certain entities
  
  // Entity associations
  applicableEntities: v.optional(v.array(v.string())), // ["users", "modules", "allocations", "reports"]
  maxUsage: v.optional(v.number()), // Maximum number of entities that can use this tag
  currentUsage: v.optional(v.number()), // Current number of entities using this tag
  
  // Validation rules
  validationRules: v.optional(v.object({
    pattern: v.optional(v.string()), // Regex pattern for tag values
    minLength: v.optional(v.number()),
    maxLength: v.optional(v.number()),
    allowedValues: v.optional(v.array(v.string())),
    required: v.optional(v.boolean()),
  })),
  
  // Metadata and organization
  sortOrder: v.optional(v.number()), // Display order
  weight: v.optional(v.number()), // Importance weight for sorting/filtering
  synonyms: v.optional(v.array(v.string())), // Alternative names for the tag
  
  // Access control
  accessLevel: v.string(), // "public", "organisation", "department", "user"
  createdBy: v.optional(v.string()), // User ID
  organisationId: v.id("organisations"),
  
  // Usage statistics
  usageCount: v.optional(v.number()),
  lastUsedAt: v.optional(v.number()),
  popularEntities: v.optional(v.array(v.object({
    entityType: v.string(),
    entityId: v.string(),
    usageCount: v.number(),
  }))),
  
  // Timestamps
  createdAt: v.number(),
  updatedAt: v.number(),
  deletedAt: v.optional(v.number()),
}); 