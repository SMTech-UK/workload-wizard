import { defineTable } from "convex/server";
import { v } from "convex/values";

export default defineTable({
  // Core assignment info
  userId: v.string(), // Clerk user ID
  userProfileId: v.optional(v.id("user_profiles")),
  roleId: v.id("roles"),
  
  // Assignment details
  assignmentType: v.string(), // "direct", "inherited", "temporary", "delegated"
  status: v.string(), // "active", "inactive", "pending", "expired", "revoked"
  
  // Temporal validity
  assignedAt: v.number(),
  validFrom: v.number(),
  validTo: v.optional(v.number()),
  expiresAt: v.optional(v.number()),
  
  // Assignment context
  assignedBy: v.optional(v.string()), // User ID who made the assignment
  approvedBy: v.optional(v.string()), // User ID who approved the assignment
  approvalDate: v.optional(v.number()),
  
  // Scope and context
  scope: v.optional(v.object({
    organisationId: v.optional(v.id("organisations")),
    facultyId: v.optional(v.id("faculties")),
    departmentId: v.optional(v.id("departments")),
    moduleId: v.optional(v.id("modules")),
    academicYearId: v.optional(v.id("academic_years")),
  })),
  
  // Delegation info
  delegatedFrom: v.optional(v.string()), // User ID who delegated this role
  delegationReason: v.optional(v.string()),
  delegationExpiresAt: v.optional(v.number()),
  
  // Conditions and restrictions
  conditions: v.optional(v.array(v.object({
    type: v.string(), // "time", "location", "device", "custom"
    value: v.any(),
    operator: v.string(), // "equals", "contains", "greater_than", etc.
  }))),
  
  // Override permissions
  permissionOverrides: v.optional(v.array(v.object({
    permission: v.string(),
    action: v.string(), // "grant", "deny", "modify"
    value: v.any(),
  }))),
  
  // Audit trail
  assignmentReason: v.optional(v.string()),
  notes: v.optional(v.string()),
  reviewDate: v.optional(v.number()),
  reviewedBy: v.optional(v.string()), // User ID
  
  // Status tracking
  lastUsedAt: v.optional(v.number()),
  usageCount: v.optional(v.number()),
  isPrimary: v.optional(v.boolean()), // Primary role for the user
  
  // Metadata
  tags: v.optional(v.array(v.string())),
  organisationId: v.id("organisations"),
  
  // Timestamps
  createdAt: v.number(),
  updatedAt: v.number(),
  deletedAt: v.optional(v.number()),
}); 