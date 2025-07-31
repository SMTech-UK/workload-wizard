import { defineTable } from "convex/server";
import { v } from "convex/values";

export default defineTable({
  // Core sync info
  externalSystemId: v.id("external_systems"),
  syncType: v.string(), // "full", "incremental", "manual", "scheduled"
  entityType: v.string(), // "users", "courses", "modules", "allocations", "all"
  
  // Status and timing
  status: v.string(), // "pending", "running", "completed", "failed", "cancelled"
  startedAt: v.number(),
  completedAt: v.optional(v.number()),
  duration: v.optional(v.number()), // in seconds
  
  // Results
  recordsProcessed: v.optional(v.number()),
  recordsCreated: v.optional(v.number()),
  recordsUpdated: v.optional(v.number()),
  recordsDeleted: v.optional(v.number()),
  recordsFailed: v.optional(v.number()),
  
  // Error handling
  errorMessage: v.optional(v.string()),
  errorCode: v.optional(v.string()),
  errorDetails: v.optional(v.object({
    stackTrace: v.optional(v.string()),
    httpStatus: v.optional(v.number()),
    responseBody: v.optional(v.string()),
  })),
  
  // Retry info
  retryCount: v.optional(v.number()),
  maxRetries: v.optional(v.number()),
  nextRetryAt: v.optional(v.number()),
  
  // Configuration
  syncConfig: v.optional(v.object({
    batchSize: v.optional(v.number()),
    timeout: v.optional(v.number()),
    filters: v.optional(v.any()),
    options: v.optional(v.any()),
  })),
  
  // Progress tracking
  progress: v.optional(v.object({
    currentStep: v.optional(v.string()),
    totalSteps: v.optional(v.number()),
    currentStepNumber: v.optional(v.number()),
    percentComplete: v.optional(v.number()),
  })),
  
  // Metadata
  initiatedBy: v.optional(v.string()), // User ID who triggered the sync
  organisationId: v.id("organisations"),
  
  // Timestamps
  createdAt: v.number(),
  updatedAt: v.number(),
  deletedAt: v.optional(v.number()),
}); 