import { defineTable } from "convex/server";
import { v } from "convex/values";

export default defineTable({
  // Core settings
  organisationId: v.id("organisations"),
  settingKey: v.string(),
  settingValue: v.any(),
  settingType: v.string(), // "string", "number", "boolean", "object", "array"
  category: v.string(), // "general", "academic", "workload", "reporting", "notifications", "integrations"
  isSystem: v.boolean(),
  isActive: v.boolean(),
  
  // Metadata
  description: v.optional(v.string()),
  validationRules: v.optional(v.object({
    minValue: v.optional(v.number()),
    maxValue: v.optional(v.number()),
    allowedValues: v.optional(v.array(v.any())),
    required: v.optional(v.boolean()),
    pattern: v.optional(v.string()),
  })),
  
  // Timestamps
  createdAt: v.number(),
  updatedAt: v.number(),
  deletedAt: v.optional(v.number()),
}); 