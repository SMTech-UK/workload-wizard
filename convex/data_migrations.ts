import { defineTable } from "convex/server";
import { v } from "convex/values";

export default defineTable({
  // Core migration info
  name: v.string(),
  version: v.string(),
  description: v.optional(v.string()),
  
  // Migration type and scope
  migrationType: v.string(), // "schema", "data", "index", "cleanup", "rollback"
  scope: v.string(), // "global", "organisation", "department", "user"
  targetOrganisationId: v.optional(v.id("organisations")),
  
  // Execution details
  status: v.string(), // "pending", "running", "completed", "failed", "rolled_back"
  startedAt: v.optional(v.number()),
  completedAt: v.optional(v.number()),
  duration: v.optional(v.number()), // in seconds
  
  // Progress tracking
  progress: v.optional(v.object({
    currentStep: v.optional(v.string()),
    totalSteps: v.optional(v.number()),
    currentStepNumber: v.optional(v.number()),
    percentComplete: v.optional(v.number()),
    recordsProcessed: v.optional(v.number()),
    totalRecords: v.optional(v.number()),
  })),
  
  // Results
  recordsAffected: v.optional(v.number()),
  tablesAffected: v.optional(v.array(v.string())),
  errors: v.optional(v.array(v.object({
    step: v.string(),
    error: v.string(),
    details: v.optional(v.any()),
  }))),
  
  // Migration script
  script: v.optional(v.object({
    type: v.string(), // "sql", "javascript", "convex"
    content: v.optional(v.string()),
    filePath: v.optional(v.string()),
    checksum: v.optional(v.string()),
  })),
  
  // Dependencies and ordering
  dependencies: v.optional(v.array(v.string())), // Other migration versions that must run first
  order: v.optional(v.number()), // Execution order within the same version
  
  // Rollback support
  canRollback: v.boolean(),
  rollbackScript: v.optional(v.object({
    type: v.string(),
    content: v.optional(v.string()),
    filePath: v.optional(v.string()),
  })),
  rolledBackAt: v.optional(v.number()),
  rolledBackBy: v.optional(v.string()), // User ID
  
  // Validation
  validationRules: v.optional(v.array(v.object({
    type: v.string(), // "count", "sum", "exists", "custom"
    table: v.optional(v.string()),
    field: v.optional(v.string()),
    expectedValue: v.optional(v.any()),
    customQuery: v.optional(v.string()),
  }))),
  validationResults: v.optional(v.array(v.object({
    rule: v.string(),
    passed: v.boolean(),
    actualValue: v.optional(v.any()),
    message: v.optional(v.string()),
  }))),
  
  // Metadata
  executedBy: v.optional(v.string()), // User ID
  environment: v.optional(v.string()), // "development", "staging", "production"
  
  // Timestamps
  createdAt: v.number(),
  updatedAt: v.number(),
  deletedAt: v.optional(v.number()),
}); 