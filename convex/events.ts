import { defineTable } from "convex/server";
import { v } from "convex/values";

export default defineTable({
  // Core event info
  eventId: v.string(), // Unique event identifier
  eventType: v.string(), // Domain event type
  eventName: v.string(), // Human-readable event name
  
  // Event classification
  category: v.string(), // "domain", "system", "integration", "audit", "notification"
  source: v.string(), // "api", "web", "mobile", "system", "external"
  priority: v.string(), // "low", "normal", "high", "urgent", "critical"
  
  // Event data
  payload: v.any(), // Event data
  metadata: v.optional(v.object({
    version: v.optional(v.string()),
    correlationId: v.optional(v.string()),
    causationId: v.optional(v.string()),
    userId: v.optional(v.string()),
    sessionId: v.optional(v.string()),
    requestId: v.optional(v.string()),
  })),
  
  // Entity context
  entityType: v.optional(v.string()), // Type of entity this event relates to
  entityId: v.optional(v.string()), // ID of the entity
  aggregateId: v.optional(v.string()), // Aggregate root ID for domain events
  
  // Event sequence
  sequenceNumber: v.optional(v.number()), // Sequence number within the aggregate
  version: v.optional(v.number()), // Event version for optimistic concurrency
  
  // Timing
  occurredAt: v.number(),
  processedAt: v.optional(v.number()),
  scheduledAt: v.optional(v.number()),
  
  // Processing status
  status: v.string(), // "pending", "processing", "processed", "failed", "retry"
  retryCount: v.optional(v.number()),
  maxRetries: v.optional(v.number()),
  nextRetryAt: v.optional(v.number()),
  
  // Error handling
  errorMessage: v.optional(v.string()),
  errorCode: v.optional(v.string()),
  errorDetails: v.optional(v.any()),
  
  // Event handlers
  handlers: v.optional(v.array(v.object({
    name: v.string(),
    status: v.string(), // "pending", "success", "failed", "skipped"
    executedAt: v.optional(v.number()),
    duration: v.optional(v.number()),
    error: v.optional(v.string()),
  }))),
  
  // Integration
  externalSystems: v.optional(v.array(v.object({
    systemId: v.string(),
    status: v.string(), // "pending", "sent", "acknowledged", "failed"
    sentAt: v.optional(v.number()),
    acknowledgedAt: v.optional(v.number()),
    response: v.optional(v.any()),
  }))),
  
  // Event routing
  routing: v.optional(v.object({
    queues: v.optional(v.array(v.string())),
    topics: v.optional(v.array(v.string())),
    subscribers: v.optional(v.array(v.string())),
  })),
  
  // Retention and archiving
  retentionPolicy: v.optional(v.string()), // "short", "medium", "long", "permanent"
  archivedAt: v.optional(v.number()),
  archiveLocation: v.optional(v.string()),
  
  // Metadata
  organisationId: v.id("organisations"),
  tags: v.optional(v.array(v.string())),
  
  // Timestamps
  createdAt: v.number(),
  updatedAt: v.number(),
  deletedAt: v.optional(v.number()),
}); 