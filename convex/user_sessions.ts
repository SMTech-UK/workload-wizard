import { defineTable } from "convex/server";
import { v } from "convex/values";

export default defineTable({
  // Core session info
  sessionId: v.string(),
  userId: v.string(), // Clerk user ID
  userProfileId: v.optional(v.id("user_profiles")),
  
  // Session details
  sessionType: v.string(), // "web", "mobile", "api", "admin"
  status: v.string(), // "active", "expired", "terminated", "suspended"
  
  // Authentication
  authMethod: v.string(), // "password", "oauth", "sso", "api_key", "magic_link"
  authProvider: v.optional(v.string()), // "clerk", "google", "microsoft", etc.
  mfaVerified: v.optional(v.boolean()),
  
  // Timing
  startedAt: v.number(),
  lastActivityAt: v.number(),
  expiresAt: v.number(),
  terminatedAt: v.optional(v.number()),
  
  // Device and location
  deviceInfo: v.optional(v.object({
    userAgent: v.optional(v.string()),
    browser: v.optional(v.string()),
    os: v.optional(v.string()),
    device: v.optional(v.string()),
    ipAddress: v.optional(v.string()),
    location: v.optional(v.object({
      country: v.optional(v.string()),
      region: v.optional(v.string()),
      city: v.optional(v.string()),
      timezone: v.optional(v.string()),
    })),
  })),
  
  // Security
  isSecure: v.boolean(), // HTTPS connection
  isTrusted: v.boolean(), // Trusted device/location
  riskScore: v.optional(v.number()), // 0-100 security risk assessment
  
  // Activity tracking
  pageViews: v.optional(v.number()),
  actions: v.optional(v.array(v.object({
    action: v.string(),
    timestamp: v.number(),
    details: v.optional(v.any()),
  }))),
  
  // Session management
  refreshToken: v.optional(v.string()),
  accessToken: v.optional(v.string()),
  permissions: v.optional(v.array(v.string())),
  
  // Metadata
  organisationId: v.id("organisations"),
  notes: v.optional(v.string()),
  
  // Timestamps
  createdAt: v.number(),
  updatedAt: v.number(),
  deletedAt: v.optional(v.number()),
}); 