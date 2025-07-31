import { defineTable } from "convex/server";
import { v } from "convex/values";

export default defineTable({
  // Core file info
  filename: v.string(),
  originalName: v.string(),
  displayName: v.optional(v.string()),
  description: v.optional(v.string()),
  
  // File properties
  mimeType: v.string(),
  size: v.number(), // File size in bytes
  extension: v.optional(v.string()),
  
  // Storage details
  storageProvider: v.string(), // "convex", "s3", "gcs", "azure", "local"
  storagePath: v.string(),
  storageUrl: v.optional(v.string()),
  storageMetadata: v.optional(v.any()),
  
  // File content
  content: v.optional(v.string()), // For small files stored directly
  checksum: v.optional(v.string()), // MD5, SHA256, etc.
  encoding: v.optional(v.string()), // "utf-8", "base64", etc.
  
  // File classification
  category: v.string(), // "document", "image", "spreadsheet", "presentation", "archive", "other"
  subcategory: v.optional(v.string()),
  tags: v.optional(v.array(v.string())),
  
  // Entity association
  entityType: v.optional(v.string()), // "user", "module", "allocation", "report", etc.
  entityId: v.optional(v.string()), // ID of the associated entity
  attachmentType: v.optional(v.string()), // "profile_picture", "syllabus", "report", "template", etc.
  
  // Access control
  isPublic: v.boolean(),
  isActive: v.boolean(),
  accessLevel: v.string(), // "public", "organisation", "department", "user", "private"
  permissions: v.optional(v.array(v.object({
    userId: v.optional(v.string()),
    role: v.optional(v.string()),
    permission: v.string(), // "read", "write", "delete", "share"
  }))),
  
  // Versioning
  version: v.optional(v.number()),
  isLatest: v.optional(v.boolean()),
  parentFileId: v.optional(v.id("file_attachments")),
  versionHistory: v.optional(v.array(v.object({
    version: v.number(),
    fileId: v.id("file_attachments"),
    changedAt: v.number(),
    changedBy: v.string(),
    changeReason: v.optional(v.string()),
  }))),
  
  // Processing
  processingStatus: v.optional(v.string()), // "pending", "processing", "completed", "failed"
  processingMetadata: v.optional(v.object({
    thumbnailGenerated: v.optional(v.boolean()),
    textExtracted: v.optional(v.boolean()),
    ocrCompleted: v.optional(v.boolean()),
    virusScanned: v.optional(v.boolean()),
  })),
  
  // Derived files
  derivedFiles: v.optional(v.array(v.object({
    type: v.string(), // "thumbnail", "preview", "converted", "compressed"
    fileId: v.id("file_attachments"),
    metadata: v.optional(v.any()),
  }))),
  
  // Usage tracking
  downloadCount: v.optional(v.number()),
  lastDownloadedAt: v.optional(v.number()),
  lastViewedAt: v.optional(v.number()),
  
  // Security
  isEncrypted: v.optional(v.boolean()),
  encryptionKey: v.optional(v.string()),
  virusScanResult: v.optional(v.string()), // "clean", "infected", "suspicious", "unknown"
  
  // Metadata
  uploadedBy: v.string(), // User ID
  organisationId: v.id("organisations"),
  
  // Timestamps
  createdAt: v.number(),
  updatedAt: v.number(),
  deletedAt: v.optional(v.number()),
}); 