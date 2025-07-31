import { defineTable } from "convex/server";
import { v } from "convex/values";

export default defineTable({
  // Core template info
  name: v.string(),
  code: v.string(),
  description: v.optional(v.string()),
  category: v.string(), // "workload", "allocation", "academic", "financial", "custom"
  
  // Template configuration
  templateType: v.string(), // "table", "chart", "dashboard", "document", "spreadsheet"
  format: v.string(), // "pdf", "excel", "csv", "html", "json"
  orientation: v.optional(v.string()), // "portrait", "landscape"
  pageSize: v.optional(v.string()), // "a4", "letter", "legal"
  
  // Data source
  dataSource: v.object({
    type: v.string(), // "query", "table", "custom"
    query: v.optional(v.string()),
    tableName: v.optional(v.string()),
    filters: v.optional(v.any()),
    parameters: v.optional(v.array(v.object({
      name: v.string(),
      type: v.string(), // "string", "number", "date", "boolean"
      defaultValue: v.optional(v.any()),
      required: v.optional(v.boolean()),
    }))),
  }),
  
  // Layout and styling
  layout: v.optional(v.object({
    header: v.optional(v.any()),
    footer: v.optional(v.any()),
    sections: v.optional(v.array(v.any())),
    styling: v.optional(v.any()),
  })),
  
  // Access control
  isPublic: v.boolean(),
  isSystem: v.boolean(),
  isActive: v.boolean(),
  accessLevel: v.string(), // "public", "department", "faculty", "admin", "custom"
  
  // Versioning
  version: v.string(),
  isLatest: v.boolean(),
  parentTemplateId: v.optional(v.id("report_templates")),
  
  // Metadata
  tags: v.optional(v.array(v.string())),
  author: v.optional(v.string()), // User ID
  organisationId: v.id("organisations"),
  
  // Timestamps
  createdAt: v.number(),
  updatedAt: v.number(),
  deletedAt: v.optional(v.number()),
}); 