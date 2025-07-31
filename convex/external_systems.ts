import { defineTable } from "convex/server";
import { v } from "convex/values";

export default defineTable({
  // Core system info
  name: v.string(),
  code: v.string(),
  systemType: v.string(), // "sis", "hr", "lms", "finance", "library", "other"
  vendor: v.optional(v.string()),
  version: v.optional(v.string()),
  
  // Connection details
  connectionType: v.string(), // "api", "database", "file_import", "webhook"
  endpoint: v.optional(v.string()),
  credentials: v.optional(v.object({
    apiKey: v.optional(v.string()),
    username: v.optional(v.string()),
    password: v.optional(v.string()),
    token: v.optional(v.string()),
    certificate: v.optional(v.string()),
  })),
  
  // Configuration
  isActive: v.boolean(),
  isTestMode: v.boolean(),
  syncEnabled: v.boolean(),
  syncFrequency: v.optional(v.string()), // "hourly", "daily", "weekly", "manual"
  lastSyncAt: v.optional(v.number()),
  nextSyncAt: v.optional(v.number()),
  
  // Data mapping
  dataMapping: v.optional(v.object({
    users: v.optional(v.object({
      externalIdField: v.optional(v.string()),
      emailField: v.optional(v.string()),
      nameField: v.optional(v.string()),
    })),
    courses: v.optional(v.object({
      externalIdField: v.optional(v.string()),
      codeField: v.optional(v.string()),
      nameField: v.optional(v.string()),
    })),
    modules: v.optional(v.object({
      externalIdField: v.optional(v.string()),
      codeField: v.optional(v.string()),
      nameField: v.optional(v.string()),
    })),
  })),
  
  // Error handling
  retryAttempts: v.optional(v.number()),
  retryDelay: v.optional(v.number()), // in seconds
  errorThreshold: v.optional(v.number()),
  
  // Metadata
  description: v.optional(v.string()),
  documentation: v.optional(v.string()),
  organisationId: v.id("organisations"),
  
  // Timestamps
  createdAt: v.number(),
  updatedAt: v.number(),
  deletedAt: v.optional(v.number()),
}); 