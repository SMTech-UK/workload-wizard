import { defineTable } from "convex/server";
import { v } from "convex/values";

export default defineTable({
  // Core role info
  name: v.string(),
  code: v.string(),
  description: v.optional(v.string()),
  
  // Role classification
  roleType: v.string(), // "system", "custom", "inherited", "temporary"
  category: v.string(), // "admin", "academic", "management", "viewer", "limited"
  level: v.string(), // "global", "organisation", "faculty", "department", "module"
  
  // Permissions
  permissions: v.array(v.object({
    resource: v.string(), // "users", "modules", "allocations", "reports", "settings"
    action: v.string(), // "create", "read", "update", "delete", "export", "import"
    conditions: v.optional(v.any()), // Additional conditions for the permission
    scope: v.optional(v.string()), // "own", "department", "faculty", "all"
  })),
  
  // Access control
  isActive: v.boolean(),
  isSystem: v.boolean(),
  isDefault: v.boolean(), // Default role for new users
  isInheritable: v.boolean(), // Can be inherited by other roles
  
  // Inheritance
  parentRoleId: v.optional(v.id("roles")),
  inheritedPermissions: v.optional(v.array(v.string())), // Permission IDs inherited from parent
  
  // Scope and restrictions
  scope: v.optional(v.object({
    organisationId: v.optional(v.id("organisations")),
    facultyId: v.optional(v.id("faculties")),
    departmentId: v.optional(v.id("departments")),
    moduleId: v.optional(v.id("modules")),
  })),
  
  // Time-based restrictions
  validFrom: v.optional(v.number()),
  validTo: v.optional(v.number()),
  maxSessionDuration: v.optional(v.number()), // in minutes
  
  // Advanced settings
  requiresApproval: v.optional(v.boolean()),
  approvalWorkflow: v.optional(v.array(v.object({
    step: v.number(),
    approverRole: v.string(),
    timeout: v.optional(v.number()), // in hours
  }))),
  
  // Audit and compliance
  auditLevel: v.string(), // "none", "basic", "detailed", "full"
  complianceTags: v.optional(v.array(v.string())), // "ferpa", "gdpr", "sox", etc.
  
  // Metadata
  tags: v.optional(v.array(v.string())),
  createdBy: v.optional(v.string()), // User ID
  organisationId: v.id("organisations"),
  
  // Timestamps
  createdAt: v.number(),
  updatedAt: v.number(),
  deletedAt: v.optional(v.number()),
}); 